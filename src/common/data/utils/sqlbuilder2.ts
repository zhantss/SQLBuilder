import * as immutable from 'immutable'
import { SelectLogic, SelectNode } from "../../../ui/model/option/content/utils/selectLogic"
import { Select, Statement } from "../define/statement"
import * as DataModel from "../model"
import { SQLModelSelect, Table, SubSelect } from "../define/fromItem";
import { translateCombine } from "../option/translate";
import { Join } from '../define/set';
import { Column } from '../define/expression';
import { Alias, Order } from '../define/extra';
import { Option } from '../option/index';
import { TraceField } from '../option/traceability';

export class SQLBuilder {

    private options: any
    private graphic: any
    private logic: SelectLogic

    constructor(entrance: string, options: any, graphic: any) {
        this.logic = new SelectLogic(entrance, options, graphic);
        this.options = options;
        this.graphic = graphic;
    }

    build(): Statement {
        const top = this.logic.topId;
        const logicNode: SelectNode = this.logic.getNode(top);
        return this.processNode(logicNode);
    }

    build2(): {
        statement: Statement,
        graphics: any,
        options: any
    } {
        const top = this.logic.topId;
        const logicNode: SelectNode = this.logic.getNode(top);
        return this.processNode2(logicNode);
    }

    collectTopItems(): Array<TraceField> {
        const top = this.logic.topId;
        const items = this.logic.collect(top);
        return items.valueSeq().toArray();
    }

    private processNode2(node: SelectNode) : {
        statement: Statement,
        graphics: any,
        options: any
    } {
        const select: Select = new Select();
        let graphics = immutable.Map<string, any>();
        graphics = graphics.set(node.id, this.graphic.get(node.id));
        let options = immutable.Map<string, any>();
        options = options.set(node.id + ".SELECT", this.options.get(node.id + ".SELECT"));

        const datanode = node.node;
        const data = datanode.get('data');

        // fromItem
        let fromItem = null;
        if (data instanceof DataModel.Data.Model) {
            fromItem = new SQLModelSelect();
            fromItem.sql = data.sql;
            fromItem.alias = new Alias("T");
        } else if (data instanceof DataModel.Data.Source) {
            fromItem = new Table();
            // TODO db, schema
            fromItem.name = data.name;
            fromItem.alias = new Alias("T");
        }
        select.fromItem = fromItem;

        // define alias
        let talias = immutable.Map<string, string>();

        // joins
        let joins = [];
        const nodes = node.nodes;
        if (nodes) {
            nodes.forEach(nid => {
                const cnode = this.logic.getNode(nid)
                if (cnode) {
                    const alias = "T" + talias.size;
                    talias = talias.set(nid, alias);
                }
            })
            nodes.forEach(nid => {
                const cnode = this.logic.getNode(nid)
                if (cnode) {
                    const subs = this.processNode2(cnode);
                    if (subs) {
                        graphics = graphics.merge(subs.graphics);
                        options = options.merge(subs.options);
                        const option: Option.JoinOption = this.options.get(nid + ".JOIN");
                        if (option) {
                            options = options.set(nid + ".JOIN", this.options.get(nid + ".JOIN"));
                            const join = new Join();
                            const sub = new SubSelect();
                            sub.select = subs.statement;
                            sub.alias = new Alias(talias.get(nid));
                            join.fromItem = sub;

                            join.mode = option.mode;
                            join.on = translateCombine(option.on, node.id, talias);

                            joins.push(join);
                        } else {
                            console.error("join error")
                        }
                    }
                }
            })
        }
        select.joins = joins;

        // select items
        const items = this.logic.collect(node.id);
        const selects = [];
        items.valueSeq().forEach(item => {
            const sitem = item.trace.current(node.id);
            const next = item.trace.next(node.id);
            if (sitem && next) {
                if (sitem.content instanceof Column) {
                    if (next.length == 0) {
                        sitem.content.table = select.fromItem.getAlias().alias;
                    } else if (talias.has(next[0])) {
                        sitem.content.table = talias.get(next[0]);
                    } else {
                        console.error("group error");
                    }
                }
                selects.push(sitem);
            }
        })
        select.items = selects;

        // where
        select.where = translateCombine(node.where, node.id, talias);

        // group
        const group = node.groupbys;
        const gsequence = group.sequence();
        const groups = new Array<Column>();
        gsequence.forEach(sq => {
            const next = sq.trace.next(node.id);
            const current = sq.trace.current(node.id);
            if (next && current) {
                let column = new Column(current.content.toString());
                if (next.length == 0) {
                    column.table = select.fromItem.getAlias().alias;
                } else if (talias.has(next[0])) {
                    column.table = talias.get(next[0]);
                } else {
                    console.error("group error");
                }
                groups.push(column);
            }
        })
        select.groups = groups;

        // having
        select.having = translateCombine(node.having, node.id, talias);

        // order
        const order = node.orderbys;
        const osequence = order.sequence();
        const orders = new Array<Order>();
        osequence.forEach(sq => {
            const tf = sq.field;
            const next = tf.trace.next(node.id);
            const current = tf.trace.current(node.id);
            if (next && current) {
                let column = new Column(current.content.toString());
                if (next.length == 0) {
                    column.table = select.fromItem.getAlias().alias;
                } else if (talias.has(next[0])) {
                    column.table = talias.get(next[0]);
                } else {
                    console.error("orders error");
                }
                const odr = new Order();
                odr.item = column;
                odr.mode = sq.mode;
                orders.push(odr);
            }
        })
        select.orders = orders;

        return {
            statement: select,
            graphics: graphics,
            options: options
        };
    }

    private processNode(node: SelectNode): Statement {
        const select: Select = new Select();

        const datanode = node.node;
        const data = datanode.get('data');

        // fromItem
        let fromItem = null;
        if (data instanceof DataModel.Data.Model) {
            fromItem = new SQLModelSelect();
            fromItem.sql = data.sql;
            fromItem.alias = new Alias("T");
        } else if (data instanceof DataModel.Data.Source) {
            fromItem = new Table();
            // TODO db, schema
            fromItem.name = data.name;
            fromItem.alias = new Alias("T");
        }
        select.fromItem = fromItem;

        // define alias
        let talias = immutable.Map<string, string>();

        // joins
        let joins = [];
        const nodes = node.nodes;
        if (nodes) {
            nodes.forEach(nid => {
                const cnode = this.logic.getNode(nid)
                if (cnode) {
                    const alias = "T" + talias.size;
                    talias = talias.set(nid, alias);
                }
            })
            nodes.forEach(nid => {
                const cnode = this.logic.getNode(nid)
                if (cnode) {
                    const subs = this.processNode(cnode);
                    if (subs) {
                        const option: Option.JoinOption = this.options.get(nid + ".JOIN");
                        if (option) {
                            const join = new Join();
                            const sub = new SubSelect();
                            sub.select = subs;
                            sub.alias = new Alias(talias.get(nid));
                            join.fromItem = sub;

                            join.mode = option.mode;
                            join.on = translateCombine(option.on, node.id, talias);

                            joins.push(join);
                        } else {
                            console.error("join error")
                        }
                    }
                }
            })
        }
        select.joins = joins;

        // select items
        const items = this.logic.collect(node.id);
        const selects = [];
        items.valueSeq().forEach(item => {
            const sitem = item.trace.current(node.id);
            const next = item.trace.next(node.id);
            if (sitem && next) {
                if (sitem.content instanceof Column) {
                    if (next.length == 0) {
                        sitem.content.table = select.fromItem.getAlias().alias;
                    } else if (talias.has(next[0])) {
                        sitem.content.table = talias.get(next[0]);
                    } else {
                        console.error("group error");
                    }
                }
                selects.push(sitem);
            }
        })
        select.items = selects;

        // where
        select.where = translateCombine(node.where, node.id, talias);

        // group
        const group = node.groupbys;
        const gsequence = group.sequence();
        const groups = new Array<Column>();
        gsequence.forEach(sq => {
            const next = sq.trace.next(node.id);
            const current = sq.trace.current(node.id);
            if (next && current) {
                let column = new Column(current.content.toString());
                if (next.length == 0) {
                    column.table = select.fromItem.getAlias().alias;
                } else if (talias.has(next[0])) {
                    column.table = talias.get(next[0]);
                } else {
                    console.error("group error");
                }
                groups.push(column);
            }
        })
        select.groups = groups;

        // having
        select.having = translateCombine(node.having, node.id, talias);

        // order
        const order = node.orderbys;
        const osequence = order.sequence();
        const orders = new Array<Order>();
        osequence.forEach(sq => {
            const tf = sq.field;
            const next = tf.trace.next(node.id);
            const current = tf.trace.current(node.id);
            if (next && current) {
                let column = new Column(current.content.toString());
                if (next.length == 0) {
                    column.table = select.fromItem.getAlias().alias;
                } else if (talias.has(next[0])) {
                    column.table = talias.get(next[0]);
                } else {
                    console.error("orders error");
                }
                const odr = new Order();
                odr.item = column;
                odr.mode = sq.mode;
                orders.push(odr);
            }
        })
        select.orders = orders;

        return select;
    }
}