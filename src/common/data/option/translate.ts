import { Expression, Option, Connect, Parentheses, AtomExpression, OptionOperator, OptionConnect } from '../define/expression'

export interface Translate extends Expression {

}

export class AtomOption implements Expression {
    left: AtomExpression
    operator: OptionOperator
    right: AtomExpression

    constructor(left: AtomExpression, operator: OptionOperator, right: AtomExpression) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}

export class ConnectAtomOption implements Translate {
    connect?: OptionConnect
    content: AtomOption
    constructor(content: AtomOption, connect?: OptionConnect) {
        this.content = content;
        this.connect = connect;
    }
}

export class GroupParentheses implements Translate {
    connect?: OptionConnect
    content: Array<Translate>
    constructor(content: Array<Translate>, connect?: OptionConnect) {
        this.content = content;
        this.connect = connect;
        if (this.content == null) {
            this.content = new Array();
        }
    }
}

function NotSupportNow(exp: Expression) { throw 'can not combine this expression now, TYPE IS ' + typeof exp; }

function AtomCopy(atom: AtomOption): Option {
    return new Option(atom.left, atom.operator, atom.right);
}

function AtomPaste(option: Option): AtomOption {
    if (option && option.left instanceof AtomExpression && option.right instanceof AtomExpression) {
        return new AtomOption(option.left, option.operator, option.right);
    }
    return null;
}

function ProcessAtom(top: Expression, atom: ConnectAtomOption): Expression {
    const connect = atom.connect;
    const copy = AtomCopy(atom.content);
    if (top && connect != null) {
        if (top instanceof Connect) {
            return new Connect(top.left, top.connect, new Connect(top.right, connect, copy));
        }
        if (top instanceof Option || top instanceof Parentheses) {
            return new Connect(top, connect, copy);
        }
    }
    return copy;
}

function ProcessGroup(top: Expression, group: GroupParentheses): Expression {
    const connect = group.connect;
    const content = group.content;
    let gtop: Expression = null;
    content.forEach(c => {
        if (c instanceof ConnectAtomOption) {
            gtop = ProcessAtom(gtop, c);
        } else if (c instanceof GroupParentheses) {
            gtop = ProcessGroup(gtop, c);
        } else { NotSupportNow(c); }
    });
    if (top && connect != null) {
        if (top instanceof Connect) {
            return new Connect(top.left, top.connect, new Connect(top.right, connect, new Parentheses(gtop)));
        }
        if (top instanceof Option || top instanceof Parentheses) {
            return new Connect(top, connect, gtop);
        }
    }
    return gtop;
}

/**
 * combine Translate array, Translate Array<Translate> To SQL Where/On Expression
 * @param translates Array<Translate>
 */
export function translateCombine(translates: Array<Translate>): Expression {
    if (translates == null) {
        return null;
    }
    let top: Expression = null;
    translates.forEach(translate => {
        if (translate instanceof ConnectAtomOption) {
            top = ProcessAtom(top, translate);
        } else if (translate instanceof GroupParentheses) {
            top = ProcessGroup(top, translate);
        } else { NotSupportNow(translate); }
    });
    return top;
}

function slice(exp: Expression, connect: OptionConnect): Array<Translate> {
    if (exp instanceof Connect) {
        const left = exp.left;
        const econnect = exp.connect;
        const right = exp.right;
        return []
                .concat(slice(left, connect))
                .concat(slice(right, econnect));
    } else if (exp instanceof Option) {
        return [new ConnectAtomOption(AtomPaste(exp), connect)]
    } else if (exp instanceof Parentheses) {
        return [new GroupParentheses(slice(exp.content, null), connect)]
    }
    NotSupportNow(exp);
}

/**
 * slice Expression, Translate SQL Where/On To Array<Translate>
 * @param expression Expression[SQL Where/On]
 */
export function translateSlice(expression: Expression): Array<Translate> {
    if (expression == null) {
        return null;
    }
    return slice(expression, null);
}