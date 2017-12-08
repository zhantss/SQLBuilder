import * as uuid from 'uuid'
import { getSelectItems } from '../utils/sqlparser'

export enum DataType {
    SOURCE, MODEL, SELECT, SETOPERATORS
}

export interface Data {
    type?: DataType
}

export class Field {
    identity: string
    name: string
    alias?: string
    type?: string   //TODO

    constructor(name: string, alias?: string, type?: string) {
        this.name = name;
        this.type = type;
        this.alias = alias;
        this.identity = uuid.v4();
    }
}

export class Source implements Data {
    db?: string
    name: string
    fields: Array<Field>
    type = DataType.SOURCE

    constructor(name: string, db: string, fields: Array<Field>) {
        this.name = name;
        this.db = db;
        if (fields) {
            this.fields = fields;
        } else {
            this.fields = [];
        }
    }
}

export class Model implements Data {
    name: string
    sql: string
    fields: Array<Field>
    type = DataType.MODEL
    // TODO Model JSON ?

    constructor(name: string, sql: string, fields?: Array<Field>) {
        this.name = name;
        this.sql = sql;
        this.fields = fields;
        if (this.fields == null && this.sql) {
            this.fields = getSelectItems(this.sql)
        }
    }
}

export class Select implements Data {
    name: string
    children: string
    type = DataType.SELECT

    constructor(name: string, children: string) {
        this.name = name;
        this.children = children;
    }
}

export class SetOperators implements Data {
    children: string
    type = DataType.SETOPERATORS

    constructor(children: string) {
        this.children = children;
    }
}