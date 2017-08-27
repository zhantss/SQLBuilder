import { JoinMode } from '../define/extra';
import { Expression } from '../define/expression';

export class Table {
    items: Array<Expression>

    constructor() {
        this.items = [];
    }
}

export class Join {
    mode?: JoinMode
    on?: Expression
    using?: Array<string>

    constructor() {}
}

export class SetOperators {
    
}