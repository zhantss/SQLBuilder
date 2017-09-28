import { Column } from './../define/expression';
import { JoinMode, SetOperationType } from '../define/extra';
import { Expression } from '../define/expression';

export interface Option {

}

export class Table implements Option {
    items: Array<Expression>

    constructor() {
        this.items = [];
    }
}

export class Join implements Option {
    mode?: JoinMode
    on?: Expression
    using?: Array<string>
    isUsing: boolean

    constructor() {
        this.isUsing = false;
        this.mode = JoinMode.INNER;
    }
}

export class SetOperation {
    type?: SetOperationType
}

export class SetOperators implements Option {
    items: Array<Expression>
    order: Array<Column>
    // TODO Limit
    // TODO Offset
    // TODO Fetch
}