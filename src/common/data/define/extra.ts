import { Statement } from './statement'
import { FromItem } from './fromItem'
import { Expression, Column, AtomExpression } from './expression'

export class Alias {
    alias: string
    as: boolean

    constructor(alias: string, as?: boolean) {
        this.alias = alias;
        this.as = as ? true : false;
    }
}

export enum OrderMode {
    ASC, DESC
}

export class Order {
    item: Expression
    mode?: OrderMode
}

export class SelectItem {
    alias?: Alias
    content: AtomExpression

    constructor(content: AtomExpression, alias?: Alias, as?: boolean) {
        this.content = content;
        this.alias = alias;
    }
}