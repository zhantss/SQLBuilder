import * as uuid from 'uuid'
import * as immutable from 'immutable'
import { SelectItem, Alias } from '../define/extra'
import { Column, AtomExpression } from '../define/expression';

export interface Traceability {

}

export class TraceSelectItem {
    alias: Alias
    item: AtomExpression
    private traceField: TraceField
    constructor(item: AtomExpression, alias: Alias, traceField?: TraceField) {
        this.item = item;
        this.alias = alias;
        this.traceField = traceField;
    }

    datasource(): string {
        return this.traceField.trace.datasource.source();
    }

    from(): string {
        return this.traceField.trace.creater.name;
    }

    getTraceField() {
        return this.traceField;
    }
}

export class Designation {
    namer: string
    name: string

    constructor(namer: string, name: string) {
        this.namer = namer;
        this.name = name;
    }
}

export class Creater {
    id: string                  // unique id    node.key
    identity: string            // data id      node.identity
    name: string                // node.name
    item: SelectItem
    constructor(id: string, identity: string, name: string, item: SelectItem) {
        this.id = id;
        this.identity = identity;
        this.name = name;
        this.item = item;
    }

    clone(): Creater {
        return new Creater(this.id, this.identity, this.name, this.item.clone());
    }
}

export class DataSource {
    id: string                  // unique id    node.key
    identity: string            // data id      node.identity
    name: string                // node.name
    item: SelectItem
    constructor(id: string, identity: string, name: string, item: SelectItem) {
        this.id = id;
        this.identity = identity;
        this.name = name;
        this.item = item;
    }

    source(): string {
        const itemstr = this.item.content.toString();
        const alias = this.item.alias ? this.item.alias.alias : null;
        return "[" + this.name + "]" + itemstr + (alias ? "(" + alias + ")" : "");
    }

    clone(): DataSource {
        return new DataSource(this.id, this.identity, this.name, this.item.clone());
    }
}

export class Trace {
    creater: Creater
    datasource: DataSource
    private path: Array<string>
    private map: immutable.Map<string, Designation>

    constructor(datasource: DataSource, creater: Creater, path: Array<string>) {
        this.datasource = datasource;
        this.creater = creater;
        this.path = path;
        this.map = immutable.Map<string, Designation>();
    }

    update(path: Array<string>) {
        let diff = [];
        path.forEach(p => {
            if (this.path.indexOf(p) == -1 && this.map.get(p)) {
                this.map = this.map.delete(p)
                diff.push(p);
            }
        })
        this.path = [].concat(path);
        return diff;
    }

    current(namer: string): SelectItem {
        if (namer && namer == this.creater.id) {
            return this.creater.item.clone();
        }
        let i = this.path.indexOf(namer);
        if (i >= 0) {
            i = i + 1;
            let des: Designation = null;
            for (; i < this.path.length; i++) {
                des = this.map.get(this.path[i]);
            }
            if (des) {
                return new SelectItem(new Column(des.name));
            }
            return this.creater.item.alias ?
                new SelectItem(new Column(this.creater.item.alias.alias))
                : new SelectItem(this.creater.item.content.clone());
        }
        return null;
    }

    next(namer: string) {
        if (namer && namer == this.creater.id) {
            return [];
        }
        let i = this.path.indexOf(namer);
        if (i >= 0) {
            return this.path.slice(i + 1);
        }
        return null;
    }

    getDesignation(namer: string): Designation {
        return this.map.get(namer);
    }

    setDesignation(namer: string, name: string): boolean {
        if (namer && this.path.indexOf(namer) != -1) {
            this.map = this.map.set(namer, new Designation(namer, name));
            return true;
        }
        return false;
    }

    pushMap(map: immutable.Map<string, Designation>) {
        this.map = this.map.merge(map);
    }

    clone(): Trace {
        const trace = new Trace(this.datasource.clone(), this.creater.clone(), this.path);
        trace.pushMap(this.map);
        return trace;
    }
}

export class TraceField implements Traceability {
    id: string
    identity: string
    trace: Trace

    constructor(identity: string, trace: Trace) {
        this.id = uuid.v4();
        this.identity = identity;
        this.trace = trace;
    }

    clone(): TraceField {
        const tf = new TraceField(this.identity, this.trace.clone());
        tf.id = this.id;
        return tf;
    }
}