import * as immutable from 'immutable'
import { Option, OptionTarget } from '../../../../../common/data/option'
import { SQLParser, GraphicParser } from '../../../../../common/data/utils'
import { TraceSelectItem, TraceField, Creater, DataSource, Trace } from '../../../../../common/data/option/traceability'
import { SelectItem, Alias } from '../../../../../common/data/define/extra'
import { Order, OrderByItem, Group } from '../../../../../common/data/option/option'
import { Translate, translateExtract } from '../../../../../common/data/option/translate';

export class SelectNode {
    id: string
    identity: string
    name: string
    path: immutable.List<string>
    node: any
    nodes: immutable.List<string>
    tfs: immutable.Map<string, TraceField>
    appends: immutable.Map<string, TraceField>
    selects: immutable.Map<string, boolean>
    groupbys: Group
    orderbys: Order
    where: Array<Translate>
    having: Array<Translate>
    named: immutable.Map<string, string>
    anamed: immutable.Map<string, string>

    constructor(node: any, select: Option.Select) {
        this.node = node;
        const key = node.get('key');
        const identity = node.get('identity');
        const name = node.get('name');
        const tfs: immutable.Map<string, TraceField> = node.get('tfs');
        const appends = node.get('appends');
        const nodes = node.get('nodes');
        const path = node.get('path');

        this.id = key;
        this.identity = identity;
        this.name = name;
        this.path = path;
        this.nodes = nodes;
        this.tfs = immutable.Map<string, TraceField>();
        if (tfs) {
            tfs.toSeq().forEach((tf, inx) => {
                const clone = tf.clone();
                // clone.trace.setPath(path.toArray());
                this.tfs = this.tfs.set(inx, clone);
            })
        }
        this.appends = immutable.Map<string, TraceField>();
        if (appends) {
            appends.toSeq().forEach((tf, inx) => {
                const clone = tf.clone();
                /* if(clone.trace.creater.id == key) {
                    clone.trace.setPath(path.toArray());
                } */
                if (tf.trace.creater.id == this.id || this.nodes.findIndex(n => n == tf.trace.creater.id) != -1) {
                    this.appends = this.appends.set(inx, clone);
                }
            })
        }
        this.selects = immutable.Map<string, boolean>();
        select.selects.forEach(s => {
            this.selects = this.selects.set(s, true);
        })
        // this.named = immutable.Map<string, string>(select.named);
        this.named = immutable.Map<string, string>();
        this.anamed = immutable.Map<string, string>();
        this.where = select.where;
        this.having = select.having;
        this.groupbys = select.groupby;
        this.orderbys = select.orderby
    }

    select(id: string, unique?: boolean): string {
        if (this.selects.get(id) != null) {
            const field = this.tfs.get(id);
            if (field && unique) {
                return field.id;
            } else if (field) {
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
                return ntf.id;
            }
        } else {
            const field = this.tfs.get(id);
            if (field) {
                const item = field.trace.current(this.id);
                let name = item.alias ? item.alias.alias : item.content.toString();
                this.selects = this.selects.set(id, true);
                this.named = this.named.set(name, id);
                return id;
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

    groupby(logic: SelectLogic, groupId: string, nodeId: string, id: string): Array<string> {
        let updates = [];
        if (groupId == this.id) {
            if (this.groupbys.has(id)) return null;
            let field = logic.getNode(nodeId).getTraceField(id);
            if (field != null) this.groupbys.push(field);
            if (groupId != nodeId) {
                const node = logic.getNode(nodeId);
                updates = updates.concat(node.groupby(logic, groupId, nodeId, id));
            }
        } else if (nodeId == this.id) {
            const ginx = this.path.indexOf(groupId);
            const ninx = this.path.size - 1;
            let field = this.getTraceField(id);
            for (let i = ninx - 1; i > ginx; i--) {
                const nid = this.path[i];
                const node = logic.getNode(nid);
                if (node) {
                    field = node.extra(field);
                    updates.push(node.id);
                    logic.setNode(nid, node);
                }
            }
        }
        return updates;
    }

    orderby(logic: SelectLogic, orderId: string, nodeId: string, id: string): Array<string> {
        let updates = [];
        if (orderId == this.id) {
            if (this.orderbys.has(id)) return null;
            const field = logic.getNode(nodeId).getTraceField(id);
            if (field != null) this.orderbys.push(new OrderByItem(field));/*  = this.orderbys.set(field.id, field) */  // Update Order By
            if (orderId != nodeId) {
                const node = logic.getNode(nodeId);
                updates = updates.concat(node.orderby(logic, orderId, nodeId, id));
            }
        } else if (nodeId == this.id) {
            const ginx = this.path.indexOf(orderId);
            const ninx = this.path.size - 1;
            let field = this.getTraceField(id);
            for (let i = ninx - 1; i > ginx; i--) {
                const nid = this.path.get(i);
                const node = logic.getNode(nid);
                if (node) {
                    field = node.extra(field);
                    updates.push(node.id);
                    logic.setNode(nid, node);
                }
            }
        }
        return updates;
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

    collect(logic: SelectLogic, selects: immutable.Map<string, boolean>): immutable.Map<string, TraceField> {
        this.clean();
        if (this.nodes) {
            if (selects == null) selects = this.selects;
            this.nodes.forEach(nodeId => {
                const node = logic.getNode(nodeId);
                if (node) {
                    const fields = node.collect(logic, selects);
                    if (fields) {
                        fields.valueSeq().forEach(field => {
                            if (selects.has(field.id)) {
                                this.extra(field);
                            }
                        })
                    }
                }
            })
        }
        return this.submit();
    }

}

export class History {
    need: boolean
    temp: immutable.Map<string, TraceField>
    constructor(temp: immutable.Map<string, TraceField>) {
        this.temp = temp;
        this.need = true;
    }
}

export class SelectLogic {
    topId: string
    nodes: immutable.Map<string, SelectNode>
    cache: immutable.Map<string, History>

    constructor(topId: string, options: any, graphic: any, logic?: SelectLogic) {
        if (logic) {
            this.topId = logic.topId;
            this.nodes = logic.nodes;
            this.cache = logic.cache;
        } else {
            this.topId = topId;
            this.cache = immutable.Map<string, History>();
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
        this.nodes = this.nodes.set(nodeId, node);
        this.cache = this.cache.delete(nodeId);
    }

    /* select(field: TraceField) {
        const nodeId = field.trace.creater.id;
        const traceId = field.id;
        if (this.nodes.has(nodeId)) {
            this.nodes.get(nodeId).select(traceId);
            this.cache = this.cache.delete(nodeId);
        }
    } */

    select(nodeId: string, fields: Array<TraceField>, unique?: boolean) {
        if (nodeId && fields && this.nodes.has(nodeId)) {
            let selects = immutable.Map<string, boolean>();
            fields.forEach(field => {
                const cid = field.trace.creater.id;
                const traceId = field.id;
                if (this.nodes.has(cid)) {
                    const sid = this.nodes.get(cid).select(traceId, unique);
                    selects = selects.set(sid, true);
                }
            })
            this.cache = this.cache.delete(nodeId);
            const node = this.nodes.get(nodeId);
            node.selects = node.selects.merge(selects);
            this.nodes = this.nodes.set(nodeId, node);
        }

    }

    alias(aliasId: string, field: TraceField) {
        if (this.nodes.has(aliasId)) {
            this.nodes.get(field.trace.creater.id).alias(aliasId, field);
            this.cache = this.cache.delete(aliasId);
            this.cache = this.cache.delete(field.trace.creater.id);
        }
    }

    having(havingId: string, having: Array<Translate>) {
        this.translate(havingId, having);
    }

    where(whereId: string, where: Array<Translate>) {
        this.translate(whereId, where);
    }

    private translate(nodeId: string, translates: Array<Translate>) {
        const fields = translateExtract(translates);
        let selects = immutable.Map<string, Array<TraceField>>();
        fields.forEach(f => {
            const cid = f.trace.creater.id;
            const fid = f.id;
            if (nodeId == fid) {
                return false;
            } else {
                const next = f.trace.next(nodeId);
                if (next && next.length > 0) {
                    let ss = selects.get(next[0]);
                    if (ss) {
                        ss.push(f);
                    } else {
                        ss = [f];
                    }
                    selects = selects.set(next[0], ss);
                }
            }
        });
        selects.toSeq().forEach((fields, id) => {
            this.select(id, fields, true);
        })
    }

    groupby(groupId: string, fields: Array<TraceField>) {
        if (this.nodes.has(groupId)) {
            let orders = immutable.Set<string>()
            fields.forEach(field => {
                const os = this.nodes.get(groupId).groupby(this, groupId, field.trace.creater.id, field.id);
                orders = orders.union(immutable.Set(os));
            })
            if (orders) {
                orders.forEach(order => {
                    this.cache = this.cache.delete(order);
                    this.collect(order);
                })
            }
        }
    }

    groups(orderId: string): Group {
        let res = immutable.Map<string, TraceField>();
        if (this.nodes.has(orderId)) {
            const groupbys = this.nodes.get(orderId).groupbys;
            if (groupbys) {
                return groupbys;
            }
        }
        return new Group();
    }

    orderby(orderId: string, fields: Array<TraceField>) {
        if (this.nodes.has(orderId)) {
            let orders = immutable.Set<string>()
            fields.forEach(field => {
                const os = this.nodes.get(orderId).orderby(this, orderId, field.trace.creater.id, field.id);
                orders = orders.union(immutable.Set(os));
            })
            if (orders) {
                orders.forEach(order => {
                    this.cache = this.cache.delete(order);
                    this.collect(order);
                })
            }
        }
    }

    orders(orderId: string): Order {
        if (this.nodes.has(orderId)) {
            const orderbys = this.nodes.get(orderId).orderbys;
            if (orderbys) {
                return orderbys;
            }
        }
        return new Order();
    }

    collect(collectId: string): immutable.Map<string, TraceField> {
        if (collectId == null) {
            collectId = this.topId;
        }
        const history = this.history(collectId);
        if (history) return this.cache.get(collectId).temp;

        if (this.nodes.has(this.topId)) {
            const temp = this.nodes.get(collectId).collect(this, null);
            if (temp) {
                const his = new History(temp);
                this.cache = this.cache.set(collectId, his);
                return this.cache.get(collectId).temp;
            }
        }
        return immutable.Map<string, TraceField>();
    }

    history(historyId: string) {
        const history = this.cache.get(historyId);
        if (history) {
            return history.need;
        }
        return false;
    }

    clone(): SelectLogic {
        return new SelectLogic(null, null, null, this);
    }
}