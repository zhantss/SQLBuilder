/**
 * expression connect relation
 */
export const connects = ['AND', 'OR']
/**
 * expression option operator
 */
export const operators = ['=', '!=', '>', '>=', '<', '<=', 'IN', 'NOT IN', 'LIKE', 'NOT LIKE'/* , 'REGEXP', 'GLOB' */]

export interface Expression {
}

export enum OptionOperator {
    Equal,
    NotEqual,
    MoreThan,
    MoreThanOrEqual,
    LessThan,
    LessThanOrEqual,
    Include,
    NotInclude,
    Like,
    NotLike
}

export function OptionOperatorEnumToSQL(enumValue: OptionOperator): string {
    return operators[enumValue];
}

export class Option implements Expression {
    left: Expression
    operator: OptionOperator
    right: Expression

    constructor(left: Expression, operator: OptionOperator, right: Expression) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    toString() {
        return this.left.toString() + " " + operators[this.operator] + " " + this.right.toString();
    }
}

export enum OptionConnect {
    AND,
    OR
}

export function OptionConncetEnumToSQL(enumValue: OptionConnect): string {
    return OptionConnect[enumValue];
}

export class Connect implements Expression {
    left: Expression
    connect: OptionConnect
    right: Expression

    constructor(left: Expression, connect: OptionConnect, right: Expression) {
        this.left = left;
        this.connect = connect;
        this.right = right;
    }

    toString() {
        return this.left.toString() + " " + connects[this.connect] + " " + this.right.toString();
    }
}

export class Parentheses implements Expression {
    op?: string
    content: Expression

    constructor(content: Expression) {
        this.content = content;
    }

    toString() {
        let s = this.op ? this.op + " " : "";
        s = s + this.content.toString();
        return s;
    }
}

export class AtomExpression {

}

export class Column extends AtomExpression {
    table?: string
    column: string

    constructor(column: string, table?: string) {
        super();
        this.column = column;
        this.table = table;
    }

    toString(): string {
        let str = this.table ? this.table + "." : "";
        str = str + this.column;
        // TODO alias
        return str;
    }
}

export class AllColumn extends Column {
    table?: string
    column: string

    constructor(table?: string) {
        super("*", table);
    }
}

export class Value extends AtomExpression {
    value: string

    constructor(value: string) {
        super();
        this.value = value;
    }

    toString() {
        return this.value;
    }
}

export class Function extends AtomExpression {
    function: string
    props?: Array<string>
}