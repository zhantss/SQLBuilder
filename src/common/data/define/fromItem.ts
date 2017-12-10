import { Alias } from './extra'
import { Select, Statement } from './statement';

export interface FromItem {
    getAlias(): Alias
}

export class Table implements FromItem {
    db?: string
    schema?: string
    name: string

    alias?: Alias
    getAlias(): Alias {
        return this.alias;
    }

    toString() {
        return (this.schema ? this.schema + "." : "") + this.name + (this.alias ? " " + this.alias.toString() : "");
    }
}

export class SQLModelSelect implements FromItem {
    sql: string

    alias?: Alias
    getAlias(): Alias {
        return this.alias;
    }

    toString() {
        return "(" + this.sql + ")" + (this.alias ? " " + this.alias.toString() : "");
    }
}

export class SubSelect implements FromItem {
    select: Statement
    alias?: Alias
    getAlias(): Alias {
        return this.alias;
    }

    toString() {
        return "(" + this.select.toString() + ")" + (this.alias ? " " + this.alias.toString() : "");
    }
}