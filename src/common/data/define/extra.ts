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

    clone(): Alias {
        return new Alias(this.alias, this.as);
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

    constructor(content: AtomExpression, alias?: Alias) {
        this.content = content;
        this.alias = alias;
    }

    clone() {
        return new SelectItem(this.content.clone(), this.alias ? this.alias.clone() : null);
    }
}