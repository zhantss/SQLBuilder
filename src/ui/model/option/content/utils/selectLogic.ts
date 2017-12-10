import * as immutable from 'immutable'
import { Option, OptionTarget } from '../../../../../common/data/option'
import { SQLParser, GraphicParser } from '../../../../../common/data/utils'
import { TraceSelectItem, TraceField, Creater, DataSource, Trace } from '../../../../../common/data/option/traceability'
import { SelectItem, Alias } from '../../../../../common/data/define/extra'

export class SelectNode {
    id: string
    identity: string
    path: immutable.List<string>
    nodes: immutable.List<string>
    tfs: immutable.Map<string, TraceField>
    appends: immutable.Map<string, TraceField>
    selects: immutable.Map<string, boolean>
    groupbys: immutable.List<string>
    orderbys: immutable.List<string>
    named: immutable.Map<string, string>
    anamed: immutable.Map<string, string>

    constructor(node: any, select: Option.Select) {
        const key = node.get('key');
        const identity = node.get('identity');
        const tfs: immutable.Map<string, TraceField> = node.get('tfs');
        const appends = node.get('appends');
        const nodes = node.get('nodes');
        const path = node.get('path');

        this.id = key;
        this.identity = identity;
        this.path = path;
        this.nodes = nodes;
        this.tfs = immutable.Map<string, TraceField>();
        if(tfs) {
            tfs.toSeq().forEach((tf, inx) => {
                const clone = tf.clone();
                // clone.trace.setPath(path.toArray());
                this.tfs = this.tfs.set(inx, clone);
            })
        }
        this.appends = immutable.Map<string, TraceField>();
        if(appends) {
            appends.toSeq().forEach((tf, inx) => {
                const clone = tf.clone();
                /* if(clone.trace.creater.id == key) {
                    clone.trace.setPath(path.toArray());
                } */
                this.appends = this.appends.set(inx, clone);
            })
        }
        this.selects = immutable.Map<string, boolean>();
        select.selects.forEach(s => { this.selects = this.selects.set(s, true); })
        // this.named = immutable.Map<string, string>(select.named); ;
        this.named = immutable.Map<string, string>();
        this.anamed = immutable.Map<string, string>();
        this.groupbys = immutable.List<string>(select.groupby);
        this.orderbys = immutable.List<string>(select.orderby);
    }

    select(id: string) {
        if (this.selects.get(id) != null) {
            const field = this.tfs.get(id);
            if (field) {
                const item = field.trace.current(this.id);
                let name = item.alias ? item.alias.alias : item.content.toString();
                while (this.named.get(name) != null) {
                    name = GraphicParser.uniqueDesignation(name);
                }
                const trace = field.trace.clone();
                trace.creater.item.alias = new Alias(name);
                const ntf = new TraceField(field.identity, trace);
                this.appends = this.appends.set(ntf.id, ntf);
                this.named = this.named.set(name, ntf.id);
                this.selects = this.selects.set(ntf.id, true);
            }
        } else {
            const field = this.tfs.get(id);
            if (field) {
                const item = field.trace.current(this.id);
                let name = item.alias ? item.alias.alias : item.content.toString();
                this.selects = this.selects.set(id, true);
                this.named = this.named.set(name, id);
            }
        }
    }

    alias(aliasId: string, field: TraceField) {
        const id = field.id;
        const ofield = this.getTraceField(field.id);
        if (aliasId == this.id) {
            const item = ofield.trace.current(this.id);
            let name = item.alias ? item.alias.alias : item.content.toString();
            this.named = this.named.delete(name);
            ofield.trace.creater.item.alias = field.trace.creater.item.alias;

            const current = ofield.trace.current(this.id);
            let cname = item.alias ? item.alias.alias : item.content.toString();
            let pname = cname;
            while (this.named.get(pname) != null) {
                pname = GraphicParser.uniqueDesignation(pname);
            }
            if (pname != cname) { ofield.trace.creater.item.alias = new Alias(pname); }
            this.named = this.named.set(pname, ofield.id);
            this.tfs = this.tfs.set(ofield.id, ofield);
        } else {
            if (this.tfs.has(field.id)) {
                const des = field.trace.getDesignation(aliasId);
                if (des) {
                    ofield.trace.setDesignation(aliasId, des.name);
                }
                this.tfs = this.tfs.set(ofield.id, ofield);
            } else if (this.appends.has(field.id)) {
                const des = field.trace.getDesignation(aliasId);
                if (des) {
                    ofield.trace.setDesignation(aliasId, des.name);
                }
                this.appends = this.appends.set(ofield.id, ofield);
            }
        }
    }

    groupby(logic: SelectLogic, groupId: string, nodeId: string, id: string): TraceField {
        if (groupId == this.id) {
            if (this.groupbys.indexOf(id) != -1) return null;
            let field = logic.getNode(nodeId).getTraceField(id);
            if (field != null) this.groupbys.push(id);
            if (groupId != nodeId) {
                const node = logic.getNode(nodeId);
                field = node.groupby(logic, groupId, nodeId, id);
            }
            return field;
        } else if (nodeId == this.id) {
            const ginx = this.path.indexOf(groupId);
            const ninx = this.path.size - 1;
            let field = this.getTraceField(id);
            for (let i = ninx - 1; i > ginx; i--) {
                const nid = this.path[i];
                const node = logic.getNode(nid);
                if (node) {
                    field = node.extra(field);
                    logic.setNode(nid, node);
                }
            }
            return field;
        }
        return null;
    }

    orderby(logic: SelectLogic, orderId: string, nodeId: string, id: string): TraceField {
        if (orderId == this.id) {
            if (this.orderbys.indexOf(id) != -1) return null;
            let field = logic.getNode(nodeId).getTraceField(id);
            if (field != null) this.orderbys.push(id);
            if (orderId != nodeId) {
                const node = logic.getNode(nodeId);
                field = node.orderby(logic, orderId, nodeId, id);
            }
            return field;
        } else if (nodeId == this.id) {
            const ginx = this.path.indexOf(orderId);
            const ninx = this.path.size - 1;
            let field = this.getTraceField(id);
            for (let i = ninx - 1; i > ginx; i--) {
                const nid = this.path[i];
                const node = logic.getNode(nid);
                if (node) {
                    field = node.extra(field);
                    logic.setNode(nid, node);
                }
            }
            return field;
        }
        return null;
    }

    getTraceField(id: string) {
        let field = this.tfs.get(id);
        if (field == null) field = this.appends.get(id);
        return field;
    }

    submit(): immutable.Map<string, TraceField> {
        let submits = immutable.Map<string, TraceField>();
        if (this.selects) {
            this.selects.keySeq().forEach(s => {
                let submit = this.getTraceField(s);
                if (submit) submits = submits.set(submit.id, submit);
            })
        }
        return submits;
    }

    extra(field: TraceField): TraceField {
        if (field == null) return;
        const item = field.trace.current(this.id);
        let name = item.alias ? item.alias.alias : item.content.toString();
        let current = name;
        while (this.named.get(current) != null) {
            current = GraphicParser.uniqueDesignation(current);
        }
        if (current != name) field.trace.setDesignation(this.id, current);
        this.appends = this.appends.set(field.id, field);
        this.named = this.named.set(current, field.id);
        this.anamed = this.anamed.set(field.id, current);
        this.selects = this.selects.set(field.id, true);
        return field;
    }

    private clean() {
        this.anamed.toSeq().forEach((name, id) => {
            this.named = this.named.delete(name);
        })
        this.anamed = this.anamed.clear();
    }

    collect(logic: SelectLogic): immutable.Map<string, TraceField> {
        this.clean();
        if (this.nodes) {
            this.nodes.forEach(nodeId => {
                const node = logic.getNode(nodeId);
                if (node) {
                    const fields = node.collect(logic);
                    if (fields) {
                        fields.valueSeq().forEach(field => {
                            this.extra(field);
                        })
                    }
                }
            })
        }
        return this.submit();
    }

}

export class SelectLogic {
    topId: string
    nodes: immutable.Map<string, SelectNode>
    history: boolean
    temp: immutable.Map<string, TraceField>
    constructor(topId: string, options: any, graphic: any, logic?: SelectLogic) {
        if (logic) {
            this.topId = logic.topId;
            this.nodes = logic.nodes;
            this.history = logic.history;
            this.temp = logic.temp;
        } else {
            this.topId = topId;
            this.history = false;
            this.temp = immutable.Map<string, TraceField>();
            this.nodes = immutable.Map<string, SelectNode>();
            this.loadNode(topId, options, graphic);
        }
    }

    private loadNode(nodeId: string, options: any, graphic: any) {
        const node = graphic.get(nodeId);
        if (node) {
            const select: Option.Select = options.get(nodeId + ".SELECT");
            const selectNode = new SelectNode(node, select);
            this.nodes = this.nodes.set(nodeId, selectNode);
            const nodes = node.get('nodes');
            if (nodes) {
                nodes.forEach(cnid => {
                    this.loadNode(cnid, options, graphic);
                })
            }
        }
    }

    getNode(nodeId: string): SelectNode {
        return this.nodes.get(nodeId);
    }

    setNode(nodeId: string, node: SelectNode) {
        this.history = false;
        this.nodes = this.nodes.set(nodeId, node);
    }

    select(nodeId, traceId) {
        if (this.nodes.has(nodeId)) {
            this.history = false;
            this.nodes.get(nodeId).select(traceId);
        }
    }

    alias(aliasId: string, field: TraceField) {
        if (this.nodes.has(aliasId)) {
            this.history = false;
            this.nodes.get(field.trace.creater.id).alias(aliasId, field);
        }
    }

    groupby(groupId: string, field: TraceField) {
        if (this.nodes.has(groupId)) {
            this.history = false;
            return this.nodes.get(groupId).groupby(this, groupId, field.trace.creater.id, field.id);
        }
    }

    orderby(orderId: string, field: TraceField) {
        if (this.nodes.has(orderId)) {
            this.history = false;
            return this.nodes.get(orderId).orderby(this, orderId, field.trace.creater.id, field.id);
        }
    }

    collect(): immutable.Map<string, TraceField> {
        if (this.history) return this.temp;
        this.history = true;
        if (this.nodes.has(this.topId)) {
            this.temp = this.nodes.get(this.topId).collect(this);
        }
        return this.temp;
    }

    clone(): SelectLogic {
        return new SelectLogic(null, null, null, this);
    }
}