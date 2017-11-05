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
}

export class Parentheses implements Expression {
    op?: string
    content: Expression

    constructor(content: Expression) {
        this.content = content;
    }
}

export class AtomExpression {

}

export class Column extends AtomExpression {
    table?: string
    column: string
}

export class Value extends AtomExpression {
    value: string

    constructor(value: string) {
        super();
        this.value = value;
    }
}

export class Function extends AtomExpression {
    function: string
    props?: Array<string>
}