import { Alias } from './extra'

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
}

