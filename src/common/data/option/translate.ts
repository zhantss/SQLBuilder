import * as immutable from 'immutable'
import { Expression, Option, Connect, Parentheses, AtomExpression, OptionOperator, OptionConnect, Column } from '../define/expression'
import { ExpressionInputState } from '../../../ui/model/option/content/utils/expressionInput';
import { TraceField } from './traceability';

export interface Translate extends Expression {

}

export class TraceTerm {
    nodeId: string
    traceId: string
    term: AtomExpression
    state?: ExpressionInputState
    constructor(nodeId: string, traceId: string, term: AtomExpression, state?: ExpressionInputState) {
        this.nodeId = nodeId;
        this.traceId = traceId;
        this.term = term;
        this.state = state;
    }
}

export class OperatorTerm {
    operator: OptionOperator
    state?: any
    constructor(operator: OptionOperator, state?: any) {
        this.operator = operator;
        this.state = state;
    }
}

export class ConnectTerm {
    connect: OptionConnect
    state?: any
    constructor(connect: OptionConnect, state?: any) {
        this.connect = connect;
        this.state = state;
    }
}

export class Conditional implements Translate {
    connect?: ConnectTerm
    left: TraceTerm
    operator: OperatorTerm
    right: TraceTerm

    constructor(left: TraceTerm, operator: OperatorTerm, right: TraceTerm, connect?: ConnectTerm) {
        this.connect = connect;
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}

export class ConditionalParentheses implements Translate {
    connect?: ConnectTerm
    content: Array<Translate>
    constructor(content: Array<Translate>, connect?: ConnectTerm) {
        this.content = content;
        this.connect = connect;
        if (this.content == null) {
            this.content = new Array();
        }
    }
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

function processItem(term: TraceTerm, nodeId: string, talias: immutable.Map<string, string>) {
    const state = term.state;
    if(state == null) {
        return null;
    }
    if (state && state.customValue) {
        return term.term;
    }

    if (state.dbValue) {
        const db: TraceField = state.dbValue.value;
        const next = db.trace.next(nodeId);
        if (next && term.term instanceof Column) {
            if (next.length == 0) {
                term.term.table = "T";
            } else if (talias.has(next[0])) {
                term.term.table = talias.get(next[0]);
            }
        }
    }
    return term.term;
}

function extractAtomExpression(condintional: Conditional, nodeId: string, talias: immutable.Map<string, string>) {
    return new Option(processItem(condintional.left, nodeId, talias), condintional.operator.operator, processItem(condintional.right, nodeId, talias));
}

function ProcessAtom2(top: Expression, condintional: Conditional, nodeId: string, talias: immutable.Map<string, string>): Expression {
    const connect = condintional.connect ? condintional.connect.connect : null;
    const copy = extractAtomExpression(condintional, nodeId, talias);
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

function ProcessGroup2(top: Expression, parentheses: ConditionalParentheses, nodeId: string, talias: immutable.Map<string, string>): Expression {
    const connect = parentheses.connect ? parentheses.connect.connect : null;
    const content = parentheses.content;
    let gtop: Expression = null;
    content.forEach(c => {
        if (c instanceof Conditional) {
            gtop = ProcessAtom2(gtop, c, nodeId, talias);
        } else if (c instanceof ConditionalParentheses) {
            gtop = ProcessGroup2(gtop, c, nodeId, talias);
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
export function translateCombine2(translates: Array<Translate>, nodeId: string, talias: immutable.Map<string, string>): Expression {
    if (translates == null) {
        return null;
    }
    let top: Expression = null;
    translates.forEach(translate => {
        if (translate instanceof Conditional) {
            top = ProcessAtom2(top, translate, nodeId, talias);
        } else if (translate instanceof ConditionalParentheses) {
            top = ProcessGroup2(top, translate, nodeId, talias);
        } else { NotSupportNow(translate); }
    });
    return top;
}

function extractField(term: TraceTerm): TraceField {
    if(term.state == null) {
        return null;
    }
    if (term.state.customValue) {
        return null;
    }
    return term.state.dbValue.value;
}

function extractTranslate(translate: Translate): Array<TraceField> {
    let fields = [];
    if (translate instanceof ConditionalParentheses) {
        const ts = translate.content;
        ts.forEach(t => {
            fields = fields.concat(extractTranslate(t));
        })
    } else if (translate instanceof Conditional) {
        const left = extractField(translate.left);
        const right = extractField(translate.right);
        if (left) fields.push(left);
        if (right) fields.push(right);
    }
    return fields;
}

export function translateExtract(translates: Array<Translate>): Array<TraceField> {
    if (translates == null) {
        return null;
    }
    let fields = [];
    translates.forEach(translate => {
        fields = fields.concat(extractTranslate(translate));
    });
    return fields;
}