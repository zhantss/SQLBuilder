import { Statement } from './statement'
import { FromItem } from './fromItem'
import { Expression, Column, AtomExpression } from './expression'

export const modes = ['LEFT', 'RIGHT', 'INNER', 'FULL', 'CROSS', 'NATURAL']

export enum JoinMode {
    LEFT, RIGHT, INNER, FULL, CROSS, NATURAL
    // TODO OUTER, SEMI
}

export enum SetOperationType {
    INTERSECT,
    EXCEPT,
    MINUS,
    UNION
}

export class SetOperation {
    type?: SetOperationType
    statement: Statement
    bracket?: boolean
}


export class Join {
    mode?: JoinMode
    fromItem: FromItem
    on?: Expression
    using?: Array<string>


    constructor(fromItem: FromItem, mode: JoinMode, on: Expression, using: Array<string>) {
        this.fromItem = fromItem;
        this.mode = mode;
        this.on = on;
        this.using = using;
    }

    sql(): string {
        return null;
    }
}

export class SetOperators {
    operations: Array<SetOperation>
    order: Array<Column>
    // TODO Limit
    // TODO Offset
    // TODO Fetch
}