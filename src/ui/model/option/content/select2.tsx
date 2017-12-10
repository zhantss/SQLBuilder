import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'
import * as immutable from 'immutable'

import { Tabs as ScrollTabs, Tab as ScrollTab } from 'material-ui/Tabs'
// import { Tabs as ScrollTabs, Tab as ScrollTab } from 'material-ui-scrollable-tabs/Tabs'

import { cn } from '../../../text'
import { connect2 } from '../../../../common/connect'
import { DataModel, DataDefine } from '../../../../common/data'
import { SQLParser, GraphicParser } from '../../../../common/data/utils'
import { option as optionAction, graphic as graphicAction } from '../../../../common/actions'
import { JoinMode, modes } from '../../../../common/data/define/set'
import { Option, OptionTarget } from '../../../../common/data/option'
import { Expression, OptionOperator, Column } from '../../../../common/data/define/expression'
import { Translate, ConnectAtomOption, GroupParentheses } from '../../../../common/data/option/translate'

import Isolation from '../../../common/isolation/isolation'
import MixingMutiSelect from './utils/mixingMutiSelect'
import RichFieldList from './utils/richFieldList'
import ColumnList from './utils/columnList'
import ExpressionList from './utils/expressionList'
import { SelectLogic, SelectNode } from './utils/selectLogic'
import { TraceSelectItem, TraceField, Creater, DataSource, Trace } from '../../../../common/data/option/traceability'
import { SelectItem, Alias } from '../../../../common/data/define/extra';

interface SelectContentProps {
    actions?: any
    options?: any
    graphic?: any
    target?: OptionTarget
}

interface SelectContentState {
    select: Option.Select
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

    initialization(target: OptionTarget, options, graphic) {
        const id: string = target.target.id;
        const select: Option.Select = options.get(id);
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
        const { graphic } = this.props;
        let { nodeId, logic, select } = this.state;
        if (selects) {
            selects.forEach(s => {
                logic.select(s.trace.creater.id, s.id);
            })
        }
        if (!logic.history) logic.collect();
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

    private groupby(selects: Array<TraceField>) {

    }

    private orderby(selects: Array<TraceField>) {

    }

    componentWillUnmount() {
        const { actions, target, options, graphic } = this.props;
        let { targetId, nodeId, selectables, logic } = this.state;
        const nodes = logic.nodes;
        let submits = new Array<{ identity: string, option: any }>();
        let selects = new Array<{nodeKey: string, tfs: any, appends: any}>();
        nodes.valueSeq().forEach(node => {
            const nid = node.id;
            if (nodeId == nid) {
                const upper = this.rich.collect();
                upper.forEach(up => {
                    // TODO Custom Select Item
                    logic.alias(nid, up);
                })
            }
            logic.collect();

            const select: Option.Select = options.get(nid + ".SELECT");
            select.selects = node.selects.keySeq().toArray();
            select.named = node.named;
            // TODO where having
            if(nodeId == nid) {
                select.where = this.where.collectTranslate();
                select.having = this.having.collectTranslate();
            }
            select.groupby = node.groupbys.toArray();
            select.orderby = node.orderbys.toArray();
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

    tabChange(a, b, c) {

    }

    render() {
        const { selectables, select, targetId, nodeId, group, db, logic } = this.state;
        const buttonStyle = { lineHeight: "48px" };
        const selected = logic ? logic.history ? logic.temp : logic.collect() : immutable.Map<string, TraceField>();
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
                    </ScrollTab>
                    <ScrollTab key={uuid.v4()} label={<span style={{ fontSize: "16px" }}>{cn.option_select_tab_orderby}</span>} buttonStyle={buttonStyle}>
                        <MixingMutiSelect name={uuid.v4()} text={cn.option_select_tab_select_items_select} items={selectables} nodeId={nodeId} select={this.orderby.bind(this)} />
                        {/* <ColumnList addins={selected} nodeId={nodeId} className={'option-select-orderby-list'} ref={null} /> */}
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