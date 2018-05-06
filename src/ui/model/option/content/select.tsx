import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'
import * as immutable from 'immutable'

import { Tabs as ScrollTabs, Tab as ScrollTab } from 'material-ui/Tabs'

import { cn } from '../../../text'
import { connect2 } from '../../../../common/connect'
import { DataModel, DataDefine } from '../../../../common/data'
import { SQLParser, GraphicParser } from '../../../../common/data/utils'
import { option as optionAction, graphic as graphicAction } from '../../../../common/actions'
import { JoinMode, modes } from '../../../../common/data/define/set'
import { Option, OptionTarget } from '../../../../common/data/option'
import { Expression, OptionOperator, Column } from '../../../../common/data/define/expression'
import { Translate } from '../../../../common/data/option/translate'

import Isolation from '../../../common/isolation/isolation'
import MixingMutiSelect from './utils/mixingMutiSelect'
import RichFieldList from './utils/richFieldList'
import OrderList from './utils/orderList'
import GroupList from './utils/groupList'
import ExpressionList from './utils/expressionList'
import { SelectLogic, SelectNode } from './utils/selectLogic'
import { TraceSelectItem, TraceField, Creater, DataSource, Trace } from '../../../../common/data/option/traceability'
import { SelectItem, Alias } from '../../../../common/data/define/extra'
import { arrayToOrder, OrderOption, GroupOption } from '../../../../common/data/option/option'

interface SelectContentProps {
    actions?: any
    options?: any
    graphic?: any
    target?: OptionTarget
}

interface SelectContentState {
    select: Option.SelectOption
    logic: SelectLogic
    nodeId: string
    targetId: string
    selectables: any
    group: immutable.Map<string, Creater>
    db: immutable.Map<string, immutable.List<TraceField>>
}

class SelectContent extends React.PureComponent<SelectContentProps, SelectContentState> {

    constructor(props) {
        super(props);
        const { target, options } = props;
        this.state = this.initialization(target, props.options, props.graphic);
    }

    private rich: RichFieldList
    private where: ExpressionList
    private having: ExpressionList

    private groupbyel: GroupList
    private orderbyel: OrderList

    initialization(target: OptionTarget, options, graphic) {
        const id: string = target.target.id;
        const select: Option.SelectOption = options.get(id);
        const ori = id.substr(0, id.length - ".SELECT".length);
        const csi = GraphicParser.collectSelectItems(ori, ori, graphic);
        const node = graphic.get(ori);
        let idb = this.itemDBLoad(csi);
        let logic = new SelectLogic(ori, options, graphic);
        return {
            select: select,
            selectables: csi,
            logic: logic,
            nodeId: ori,
            targetId: id,
            group: idb ? idb.group : null,
            db: idb ? idb.db : null
        }
    }

    private select(selects: Array<TraceField>) {
        let { nodeId, logic } = this.state;
        if (selects) {
            /* selects.forEach(s => {
                logic.select(s);
            }) */
            logic.select(nodeId, selects);
        }
        logic.collect(nodeId);
        this.setState({
            logic: logic.clone()
        })
    }

    private groupby(groupbys: Array<TraceField>) {
        let { nodeId, logic } = this.state;
        if (groupbys && groupbys.length > 0) {
            const selects = logic.collect(nodeId);
            let gbs = immutable.Map<string, TraceField>(selects);
            groupbys.forEach(gb => {
                gbs = gbs.set(gb.id, gb);
            })
            logic.groupby(nodeId, gbs.valueSeq().toArray());
        }
        this.setState({
            logic: logic.clone()
        })
    }

    private orderby(orderbys: Array<TraceField>) {
        let { nodeId, logic } = this.state;
        if (orderbys) {
            logic.orderby(nodeId, orderbys);
        }
        // if (!logic.history) logic.collect();
        this.setState({
            logic: logic.clone()
        })
    }

    private itemDBLoad(csi: any): {
        group: immutable.Map<string, Creater>,
        db: immutable.Map<string, immutable.List<TraceField>>
    } {
        let group = immutable.Map<string, Creater>();
        let db = immutable.Map<string, immutable.List<TraceField>>();
        Object.keys(csi).forEach(key => {
            const list: Array<TraceField> = csi[key];
            if (list && list.length > 0) {
                const creater = list[0].trace.creater.clone();
                creater.item = null;
                group = group.set(creater.id, creater);
            }
            db = db.set(key, immutable.List<TraceField>(list));
        })
        return {
            group, db
        }
    }

    componentWillUnmount() {
        const { actions, target, options, graphic } = this.props;
        let { targetId, nodeId, selectables, logic } = this.state;
        const nodes = logic.nodes;
        let submits = new Array<{ identity: string, option: any }>();
        let selects = new Array<{ nodeKey: string, tfs: any, appends: any }>();
        nodes.valueSeq().forEach(node => {
            const nid = node.id;
            let where = null;
            let having = null;
            if (nodeId == nid) {
                const upper = this.rich.collect();
                upper.forEach(up => {
                    // TODO Custom Select Item
                    logic.alias(nid, up);
                })
                const deletes = this.rich.collectDelete();
                if(deletes.length > 0) {
                    logic.removeSelects(nid, deletes);
                }
                where = this.where.collectTranslate();
                having = this.having.collectTranslate();
                logic.where(nodeId, where);
                logic.having(nodeId, having);
            }
            logic.collect(null);

            const select: Option.SelectOption = options.get(nid + ".SELECT");
            select.selects = node.selects.keySeq().toArray();
            select.deletes = node.deletes.toArray();
            select.named = node.named;
            select.groupby = node.groupbys;
            select.orderby = node.orderbys;
            // TODO where having
            if (nodeId == nid) {
                select.where = where;
                select.having = having;
                select.orderby = this.orderbyel.collect();
                select.groupby = this.groupbyel.collect();
            }
            // TODO GroupBy OrderBy
            submits.push({
                identity: nid + ".SELECT",
                option: select
            })

            selects.push({
                nodeKey: nid,
                tfs: node.tfs,
                appends: node.appends
            })
        })
        const oaction: optionAction.$actions = actions.option;
        oaction.SUBMITS(submits);
        const gaction: graphicAction.$actions = actions.graphic;
        gaction.SELECTS(selects);
    }

    tabChange() {
        // debugger
        const where = this.where.collectTranslate();
        const having = this.having.collectTranslate();
        const { select } = this.state;
        this.setState({
            select: { ...select, where, having }
        })
    }

    render() {
        const { selectables, select, targetId, nodeId, group, db, logic } = this.state;
        const buttonStyle = { lineHeight: "48px" };
        const selected = logic ? logic.collect(nodeId) : immutable.OrderedMap<string, TraceField>();
        const orderbys = logic ? logic.orders(nodeId) : new OrderOption();
        const gourpbys = logic ? logic.groups(nodeId) : new GroupOption();
        return (
            <div className="option-select">
                <ScrollTabs /* tabType={'scrollable-buttons'} */ className={'option-select-tabs'} onChange={this.tabChange.bind(this)}>
                    <ScrollTab key={uuid.v4()} label={<span style={{ fontSize: "16px" }}>{cn.option_select_tab_select_items}</span>} buttonStyle={buttonStyle}>
                        <MixingMutiSelect name={uuid.v4()} text={cn.option_select_tab_select_items_select} items={selectables} nodeId={nodeId} select={this.select.bind(this)} />
                        <RichFieldList addins={selected} nodeId={nodeId} className={'option-select-rich-list'} ref={c => this.rich = c} />
                    </ScrollTab>
                    <ScrollTab key={uuid.v4()} label={<span style={{ fontSize: "16px" }}>{cn.option_select_tab_where}</span>} buttonStyle={buttonStyle}>
                        <ExpressionList
                            className={"option-select-exp"}
                            expressions={select.where ? select.where : []}
                            group={group}
                            db={db}
                            targetId={targetId}
                            nodeId={nodeId}
                            ref={x => {
                                this.where = x;
                            }}
                        />
                    </ScrollTab>
                    <ScrollTab key={uuid.v4()} label={<span style={{ fontSize: "16px" }}>{cn.option_select_tab_groupby}</span>} buttonStyle={buttonStyle}>
                        <MixingMutiSelect name={uuid.v4()} text={cn.option_select_tab_select_items_select} items={selectables} nodeId={nodeId} select={this.groupby.bind(this)} />
                        {<GroupList group={gourpbys} nodeId={nodeId} className={'option-select-groupby-list'} ref={c => this.groupbyel = c} />}
                    </ScrollTab>
                    <ScrollTab key={uuid.v4()} label={<span style={{ fontSize: "16px" }}>{cn.option_select_tab_orderby}</span>} buttonStyle={buttonStyle}>
                        <MixingMutiSelect name={uuid.v4()} text={cn.option_select_tab_select_items_select} items={selectables} nodeId={nodeId} select={this.orderby.bind(this)} />
                        {<OrderList order={orderbys} nodeId={nodeId} className={'option-select-orderby-list'} ref={c => this.orderbyel = c} />}
                    </ScrollTab>
                    <ScrollTab key={uuid.v4()} label={<span style={{ fontSize: "16px" }}>{cn.option_select_tab_having}</span>} buttonStyle={buttonStyle}>
                        <ExpressionList
                            className={"option-select-exp"}
                            expressions={select.having ? select.having : []}
                            group={group}
                            db={db}
                            targetId={targetId}
                            nodeId={nodeId}
                            ref={x => {
                                this.having = x;
                            }}
                        />
                    </ScrollTab>
                </ScrollTabs>
                <div className="option-select-bottom-tool">
                </div>
            </div>
        );
    }
}

export default connect2(null, { 'option': null, 'options': ['option', 'options'], 'target': ['option', 'target'], 'graphic': ['graphic', 'graphic'] })(SelectContent)