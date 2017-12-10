import * as immutable from 'immutable'
import { JoinMode, SetOperationType } from '../define/set'
import { Expression, Column, Value, Function, AtomExpression } from '../define/expression'
import { DataModel } from '../'
import { SQLParser } from '../utils'
import { Translate } from './translate'
import { SelectableExpression } from './selectable'
import { TraceSelectItem } from './traceability'
import { SelectItem } from '../define/extra';

export interface Option {

}

export class Table implements Option {
    items: Array<SelectableExpression>
    //mirros: Array<string>

    constructor(items?: Array<SelectableExpression>) {
        this.items = items ? items : [];
        //this.stringMirror();
    }

    /* stringMirror() {
        const mirros = new Array<string>();
        this.items.forEach(item => {
            if (item instanceof Column) {
                mirros.push(item.column);
            } else {
                mirros.push(item.toString());
            }
        })
        this.mirros = mirros;
    } */
}

export class Select implements Option {
    key: string
    selects?: Array<string>
    named?: immutable.Map<string, string>
    where?: Array<Translate>
    groupby?: Array<string>
    having?: Array<Translate>
    orderby?: Array<string>
    // TODO DISTINCT/EXCEPT/INTERSECT/EXPLAIN
    
    constructor(key: string) {
        this.key = key;
        this.selects = new Array<string>();
        this.named = immutable.Map<string, string>();
        this.where = new Array<Translate>();
        this.groupby = new Array<string>();
        this.orderby = new Array<string>();
    }
}

export class Join implements Option {
    mode?: JoinMode
    on?: Array<Translate>
    using?: Array<string>
    isUsing: boolean

    constructor() {
        this.isUsing = false;
        this.mode = JoinMode.NATURAL;
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

export function tableConstructorByDataModel(data: DataModel.Data.Model) {
    const list = new Array<SelectableExpression>();
    if (data == null || !(data instanceof DataModel.Data.Model)) {
        return list;
    }
    if (data.fields && data.fields.length > 0) {
        data.fields.forEach(f => {
            // TODO Table,Database
            list.push(new SelectableExpression(new Column(f.name)));
        })
    } else if (data.sql != null) {
        const pfs = SQLParser.getSelectItems(data.sql);
        pfs.forEach(pf => {
            // TODO type
            list.push(new SelectableExpression(new Column(pf.name)));
        })
    } else if (data instanceof DataModel.Data.Source) {
        const fields = data.fields;
        fields.forEach(f => {
            // TODO type
            list.push(new SelectableExpression(new Column(f.name)));
        })
    }
    return new Table(list);
}

export function tableConstructorByDataSource(data: DataModel.Data.Source) {
    const list = new Array<SelectableExpression>();
    if (data == null || !(data instanceof DataModel.Data.Source)) {
        return list;
    }
    if (data.fields && data.fields.length > 0) {
        data.fields.forEach(f => {
            // TODO Table,Database
            list.push(new SelectableExpression(new Column(f.name)));
        })
    }
    return new Table(list);
}

export function tableConstructorBySQL(sql: string) {
    const fields = SQLParser.getSelectItems(sql);
    const list = new Array<SelectableExpression>();
    if (fields == null || fields.length <= 0) {
        return list;
    }
    fields.forEach(f => {
        // TODO Table,Database
        list.push(new SelectableExpression(new Column(f.name)));
    })
    return list;
}