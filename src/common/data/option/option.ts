import * as immutable from 'immutable'
import { JoinMode, SetOperationType } from '../define/set'
import { Expression, Column, Value, Function, AtomExpression } from '../define/expression'
import { DataModel } from '../'
import { SQLParser } from '../utils'
import { Translate } from './translate'
import { SelectableExpression } from './selectable'
import { TraceSelectItem, TraceField } from './traceability'
import { SelectItem, OrderMode } from '../define/extra';

export interface Option {

}

//export class TableOption implements Option {
//   items: Array<SelectableExpression>
//mirros: Array<string>

//   constructor(items?: Array<SelectableExpression>) {
//       this.items = items ? items : [];
//this.stringMirror();
//   }

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
//}

export function arrayToOrder(obis: Array<OrderByItem>) {
    const order = new OrderOption();
    obis.forEach(obi => {
        order.push(obi)
    })
    return order;
}

export class OrderOption {
    private items?: immutable.Map<string, OrderByItem>
    private order: immutable.List<string>

    constructor() {
        this.items = immutable.Map<string, OrderByItem>();
        this.order = immutable.List<string>();
    }

    push(item: OrderByItem) {
        if (this.items.has(item.id)) {
            const index = this.order.findIndex(o => { return o == item.id });
            this.order = this.order.delete(index);
        } else {
            this.items = this.items.set(item.id, item);
            this.order = this.order.push(item.id);
        }
    }

    has(id: string): boolean {
        return this.items.has(id);
    }

    sequence(): immutable.List<OrderByItem> {
        const sequence = immutable.List<OrderByItem>();
        return immutable.List<OrderByItem>(this.order.toArray().map(o => {
            return this.items.get(o);
        }))
    }
}

export class OrderByItem {
    id: string
    field: TraceField
    mode: OrderMode
    constructor(field: TraceField, mode?: OrderMode) {
        this.id = field.id;
        this.field = field;
        this.mode = mode == null ? OrderMode.ASC : mode;
    }
}

export class GroupOption {
    private items?: immutable.Map<string, TraceField>
    private group: immutable.List<string>

    constructor() {
        this.items = immutable.Map<string, TraceField>();
        this.group = immutable.List<string>();
    }

    push(item: TraceField) {
        if (this.items.has(item.id)) {
            const index = this.group.findIndex(o => { return o == item.id });
            this.group = this.group.delete(index);
        } else {
            this.items = this.items.set(item.id, item);
            this.group = this.group.push(item.id);
        }
    }

    has(id: string): boolean {
        return this.items.has(id);
    }

    sequence(): immutable.List<TraceField> {
        const sequence = immutable.List<TraceField>();
        return immutable.List<TraceField>(this.group.toArray().map(o => {
            return this.items.get(o);
        }))
    }
}

export class SelectOption implements Option {
    key: string
    selects?: Array<string>
    named?: immutable.Map<string, string>
    where?: Array<Translate>
    groupby?: GroupOption
    having?: Array<Translate>
    orderby?: OrderOption
    // TODO DISTINCT/EXCEPT/INTERSECT/EXPLAIN

    constructor(key: string) {
        this.key = key;
        this.selects = new Array<string>();
        this.named = immutable.Map<string, string>();
        this.where = new Array<Translate>();
        this.groupby = new GroupOption();
        this.orderby = new OrderOption();
    }
}

export class JoinOption implements Option {
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

/* export function tableConstructorByDataModel(data: DataModel.Data.Model) {
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
} */