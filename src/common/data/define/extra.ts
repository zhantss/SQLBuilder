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

    toString() {
        return (this.as ? "AS " : "") + this.alias;
    }

    clone(): Alias {
        return new Alias(this.alias, this.as);
    }
}

export const ordermodes = ['ASC', 'DESC'];

export enum OrderMode {
    ASC, DESC
}

export class Order {
    item: Expression
    mode?: OrderMode

    toString() {
        return this.item.toString() + (this.mode != null ? " " + ordermodes[this.mode] : "");
    }
}

export class SelectItem {
    alias?: Alias
    content: AtomExpression

    constructor(content: AtomExpression, alias?: Alias) {
        this.content = content;
        this.alias = alias;
    }

    toString() {
        return this.content.toString() + (this.alias ? " " + this.alias.toString() : "");
    }

    clone() {
        return new SelectItem(this.content.clone(), this.alias ? this.alias.clone() : null);
    }
}