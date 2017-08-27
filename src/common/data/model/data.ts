export enum DataType {
    SOURCE, MODEL, SELECT, SETOPERATORS
}

export interface Data {
    type?: DataType
}

export class Field {
    name: string
    type?: string   //TODO

    constructor(name: string, type: string) {
        this.name = name;
        this.type = type;
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
    type = DataType.MODEL
    // TODO Model JSON ?

    constructor(name: string, sql: string) {
        this.name = name;
        this.sql = sql;
    }
}

export class Select implements Data {
    children: string
    type = DataType.SELECT

    constructor(children: string) {
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