import * as immutable from 'immutable'
import { DataModel } from "../data";
import { Column, AllColumn, Value, Parentheses, Connect } from "../data/define/expression";
import { AtomOption, Conditional, TraceTerm, OperatorTerm, ConnectTerm, ConditionalParentheses } from "../data/option/translate";
import { Alias, Order, SelectItem } from "../data/define/extra";
import { Creater, DataSource, Designation, Trace, TraceSelectItem, TraceField } from "../data/option/traceability";
import { OrderOption, OrderByItem, GroupOption, SelectOption, JoinOption } from '../data/option/option';

export const INTERFACE = "_INTERFACE";

export function serialize(object: any) {
    return serializeObject(object);
}

function serializeObject(object: any) {
    if (object == null) return null;
    if (!(object instanceof Object)) return object;
    if(object.toJS) {
        object = object.toJS();
    }
    if (object instanceof Array) {
        return object.map(o => {
            return serializeObject(o);
        })
    }
    const result = {};
    Object.keys(object).forEach(ok => {
        result[ok] = serializeObject(object[ok]);
    })
    if (object && object.constructor && object.constructor.name && object.constructor.name != 'Object') {
        result[INTERFACE] = object.constructor.name;
    }
    return result;
}

const deserializes = {};
// DataModel
deserializes["Field"] = (data) => {
    const field = new DataModel.Data.Field(data.name, data.alias, data.type);
    field.identity = data.identity;
    return field;
}
deserializes["Model"] = (data) => {
    const model = new DataModel.Data.Model(data.name, data.sql, []);
    if(data.fields) {
        model.fields = data.fields.map(f => { deserializeObject(f) });
    }
    return model;
}
deserializes["Source"] = (data) => {
    const source = new DataModel.Data.Source(data.name, data.db, []);
    if(data.fields) {
        source.fields = data.fields.map(f => { deserializeObject(f) });
    }
    return source;
}

// Extra
deserializes["Alias"] = (data) => {
    return new Alias(data.alias, data.as);
}
deserializes["Order"] = (data) => {
    const order = new Order();
    if(data.item) { order.item = deserializeObject(data.item); }
    if(data.mode != null) { order.mode = data.mode; }
    return order;
}
deserializes["SelectItem"] = (data) => {
    return new SelectItem(
        deserializeObject(data.content),
        deserializeObject(data.alias)
    );
}

// Exception
deserializes["Column"] = (data) => {
    return new Column(data.column, data.table);
}
deserializes["AllColumn"] = (data) => {
    return new AllColumn(data.table);
}
deserializes["Value"] = (data) => {
    return new Value(data.value);
}
deserializes["Function"] = (data) => {} // // TODO Function
deserializes["AtomExpression"] = (data) => {}   // TODO AtomExpression
deserializes["Parentheses"] = (data) => {
    const parentheses = new Parentheses(deserializeObject(data.content));
    parentheses.op = data.op;
    return parentheses;
}
deserializes["Connect"] = (data) => {
    return new Connect(
        deserializeObject(data.left),
        data.connect,
        deserializeObject(data.right)
    )
}
deserializes["Option"] = (data) => {
    return new Option(
        deserializeObject(data.left),
        data.operator,
        deserializeObject(data.right)
    )
}
deserializes["AtomOption"] = (data) => {
    return new AtomOption(
        deserializeObject(data.left),
        data.operator,
        deserializeObject(data.right)
    )
}

// Translate
deserializes["TraceTerm"] = (data) => {
    const term = new TraceTerm(data.nodeId, data.traceId,
        deserializeObject(data.term)
    )
    if(data.state) {
        const state = {
            limit: data.state.limit,
            groupValue : deserializeObject(data.state.groupValue),
            dbValue : deserializeObject(data.state.dbValue),
            customValue : deserializeObject(data.state.customValue),
        };
        term.state = state;
    }
    return term;
}
deserializes["OperatorTerm"] = (data) => {
    return new OperatorTerm(data.operator, data.state);
}
deserializes["ConnectTerm"] = (data) => {
    return new ConnectTerm(data.connect, data.state);
}
deserializes["Conditional"] = (data) => {
    return new Conditional(
        deserializeObject(data.left),
        data.operator,
        deserializeObject(data.right),
        deserializeObject(data.connect)
    )
}
deserializes["ConditionalParentheses"] = (data) => {
    const gps = new ConditionalParentheses(null, 
        deserializeObject(data.connect)
    )
    if(data.content) {
        gps.content = data.content.map(c => {
            return deserializeObject(c);
        })
    }
}

// Tracebility
deserializes["Creater"] = (data) => {
    return new Creater(data.id, data.identity, data.name, 
        deserializeObject(data.item)
    )
}
deserializes["DataSource"] = (data) => {
    return new DataSource(data.id, data.identity, data.name, 
        deserializeObject(data.item)
    )
}
deserializes["Designation"] = (data) => {
    return new Designation(data.namer, name)
}
deserializes["Trace"] = (data) => {
    const trace = new Trace(
        deserializeObject(data.datasource),
        deserializeObject(data.creater),
        data.path
    )
    if(data.map) {
        let nmap = immutable.Map<string, Designation>();
        Object.keys(data.map).forEach(mk => {
            const d = deserializeObject(data.map[mk]);
            nmap = nmap.set(mk, data.map[mk]);
        })
        trace.pushMap(nmap);
    }
    return trace;
}
deserializes["TraceField"] = (data) => {
    const tf = new TraceField(data.identity, 
        deserializeObject(data.trace)
    )
    tf.id = data.id;
    return tf;
}
deserializes["TraceSelectItem"] = (data) => {
    const tsi = new TraceSelectItem(
        deserializeObject(data.item),
        deserializeObject(data.alias),
        deserializeObject(data.traceField)
    )
    if(data.index != null) {
        tsi.index = data.index;
    }
    return tsi;
}

// Option
deserializes["TableOption"] = (data) => {}  // TODO TableOption
deserializes["OrderByItem"] = (data) => {
    const obi = new OrderByItem(
        deserializeObject(data.field),
        data.mode
    );
    obi.id = data.id;
    return obi;
}
deserializes["OrderOption"] = (data) => {
    const order = new OrderOption();
    if(data.order && data.items) {
        data.order.forEach(oi => {
            if(data.items[oi]) {
                order.push(
                    deserializeObject(data.items[oi])
                )
            }
        })
    }
    return order;
}
deserializes["GroupOption"] = (data) => {
    const group = new GroupOption();
    if(data.group && data.items) {
        data.group.forEach(gi => {
            if(data.items[gi]) {
                group.push(
                    deserializeObject(data.items[gi])
                )
            }
        })
    }
    return group;
}
deserializes["SelectOption"] = (data) => {
    const so = new SelectOption(data.key);
    if(data.selects) { so.selects = data.selects; }
    if(data.named) { so.named = immutable.fromJS(data.named); }
    if(data.where) {
        so.where = data.where.map(w => {
            return deserializeObject(w);
        })
    }
    if(data.groupby) { so.groupby = deserializeObject(data.groupby) }
    if(data.having) {
        so.having = data.having.map(h => {
            return deserializeObject(h);
        })
    }
    if(data.orderby) { so.orderby = deserializeObject(data.orderby) }
    return so;
}
deserializes["JoinOption"] = (data) => {
    const jo = new JoinOption();
    if(data.model != null) { jo.mode = data.mode; }
    if(data.on) {
        jo.on = data.on.map(o => {
            return deserializeObject(o);
        })
    }
    // TODO USING
    if(data.using) {}
    if(data.isUsing != null) { jo.isUsing = data.isUsing; }
    return jo;
}
deserializes["SetOperation"] = (data) => {}     // TODO SetOperation
deserializes["SetOperators"] = (data) => {}     // TODO SetOperators

export function deserialize(object: any) {
    return deserializeObject(object);;
}

function deserializeObject(object: any) {
    if (object == null) return null;
    if (!(object instanceof Object)) return object;
    if (object instanceof Array) {
        return object.map(o => {
            return deserializeObject(o);
        })
    }
    if (object[INTERFACE] && deserializes[object[INTERFACE]]) {
        return deserializes[object[INTERFACE]](object);
    }
    const result = {};
    Object.keys(object).forEach(ok => {
        result[ok] = deserializeObject(object[ok]);
    })
    return result;
}