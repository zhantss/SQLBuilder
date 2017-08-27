/**
 * expression connect relation
 */
export const connects = ['AND', 'OR']
/**
 * expression option relation
 */
export const options = ['=', '!=', '>', '>=', '<', '<=', 'IN', 'NOT IN', 'LIKE', 'NOT LIKE'/* , 'REGEXP', 'GLOB' */]

export interface Expression {

}

export class Option implements Expression {
    left: Expression
    op: string
    right: Expression

    constructor(left, op, right) {
        this.left = left;
        this.op = op;
        this.right = right;
    }
}

export class Parentheses implements Expression {
    op?: string
    content: Expression
}

export class Column implements Expression {
    table?: string
    column: string
}

export class Value implements Expression {
    value: string
}

export class Function implements Expression {
    function: string
    props?: Array<string>
}

export class AtomOption implements Expression {
    connect?: string
    left: Expression
    op: string
    right: Expression

    constructor(left, op, right, connect) {
        this.left = left;
        this.op = op;
        this.right = right;
        this.connect = connect;
    }
}

/**
 * Option Expression Parting, WHERE/ON Parting
 * To Array<AtomOption>
 * @param exp Expression
 */
export function optionParting(exp: Expression, connect: string): Array<AtomOption> {
    if (exp instanceof Option) {
        let left = exp.left;
        let right = exp.right;
        let op = exp.op;

        if (connects.indexOf(op.toLocaleUpperCase()) != -1) {
            return []
                .concat(optionParting(left, connect))
                .concat(optionParting(right, op))
        } else if (options.indexOf(op.toLocaleUpperCase()) != -1) {
            return [new AtomOption(left, op, right, connect)];
        }
    }
    return [];
}

/**
 * combine AtomOption array, Set Option To SQL Model
 * To Expression
 * @param options Array<AtomOption>
 */
export function optionCombine(options: Array<AtomOption>): Expression {
    if (options == null) {
        return null;
    }
    let size = options.length;
    if (size == 1) {
        return options[0];
    }
    let exp = new Option(null, null, null);
    for (let i = 0; i < size; i++) {
        let op = options[i];
        if (exp.left == null && op.connect == null) {
            exp = new Option(new Option(op.left, op.op, op.right), null, null);
            continue;
        }

        if (exp.op == null && op.connect != null) {
            exp = new Option(new Option(exp.left, exp.op, exp.right), op.connect, new Option(op.left, op.op, op.right));
        }
    }
    return exp;
}
