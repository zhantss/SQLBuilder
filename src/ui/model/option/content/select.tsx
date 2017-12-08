import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'
import * as immutable from 'immutable'

import { Tabs as ScrollTabs, Tab as ScrollTab } from 'material-ui-scrollable-tabs/Tabs'

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
    selectables: any
    selected: immutable.Map<string, TraceField>
    exists: immutable.Map<string, immutable.Map<string, string>>
    nodeId: string
}

class SelectContent extends React.PureComponent<SelectContentProps, SelectContentState> {

    constructor(props) {
        super(props);
        const { target, options } = props;
        this.state = this.initialization(target, props.options, props.graphic);
    }

    initialization(target: OptionTarget, options, graphic) {
        const id: string = target.target.id;
        const select = options.get(id);
        const ori = id.substr(0, id.length - ".SELECT".length);
        const csi = GraphicParser.collectSelectItems(ori, ori, graphic);
        const node = graphic.get(ori);
        let selected = immutable.Map<string, TraceField>();
        let exists = immutable.Map<string, immutable.Map<string, string>>();
        if (node) {
            const key = node.get('key');
            const tfs = node.get('tfs');
            const appends = node.get('appends');
            const selects = node.get('selects');
            if (tfs && selects) {
                let s = [];
                selects.forEach(tfid => {
                    let tf: TraceField = tfs.get(tfid);
                    if(tf == null && appends != null) tf = appends.get(tfid);
                    if(tf != null) {
                        const cid = tf.trace.creater.id;
                        const cnode = graphic.get(cid);
                        if(cid) {
                            const cpath = cnode.get('path');
                            if(cpath && cpath.indexOf(key) != -1) {
                                s.push(tf);
                            }
                        }
                    }
                })
                const process = this.processSelect(s, node.get('key'), exists, selected, graphic);
                selected = process.selected;
                exists = process.exists;
            }
        }
        return {
            select: select,
            selectables: csi,
            selected: selected,
            exists: exists,
            nodeId: ori
        }
    }

    private uniqueNext(
        selected: immutable.Map<string, TraceField>,
        exists: immutable.Map<string, immutable.Map<string, string>>,
        update: TraceField,
        insert: TraceField,
        node: any,
        group: string,
        unique: string,
        unext: Array<string>,
        inext: Array<string>): {
            selected: immutable.Map<string, TraceField>,
            exists: immutable.Map<string, immutable.Map<string, string>>
        } {
        let x = 0
        for (; x < unext.length; x++) {
            if (inext[x] == unext[x]) {
                continue;
            }
            break;
        }
        x = x - 1;
        if (x >= 0 && x < unext.length) {
            const key = node.get('key');
            const identity = node.get('identity');
            const name = node.get('name');
            const path = node.get('path').toJS();
            const toChange = unext[x];
            update.trace.setDesignation(toChange, GraphicParser.uniqueDesignation(unique));
            if (update.id == insert.id) {
                const current = update.trace.current(key);
                const creater = new Creater(key, identity, name, current.clone());
                update = new TraceField(update.identity, new Trace(update.trace.datasource.clone(), creater, path));
            }
            return {
                selected: selected.set(update.id, update).set(insert.id, insert),
                exists: exists.setIn([group, update.trace.current(key).content.toString()], update)
                    .setIn([group, unique], insert)
            }
        }
        return {
            selected: selected,
            exists: exists
        };
    }

    private insert(
        selected: immutable.Map<string, TraceField>,
        insert: TraceField,
        node: any) {
        const key = node.get('key');
        const identity = node.get('identity');
        const name = node.get('name');
        const path = node.get('path').toJS();
        const exist = selected.get(insert.id);
        if (exist) {
            const current = insert.trace.current(key);
            const creater = new Creater(key, identity, name, current.clone());
            const ns = new TraceField(insert.identity, new Trace(insert.trace.datasource.clone(), creater, path));
            selected = selected.set(ns.id, ns);
        } else {
            selected = selected.set(insert.id, insert);
        }
        return selected;
    }

    private select(selects: Array<TraceField>) {
        const { graphic } = this.props;
        let { nodeId, exists, selected } = this.state;
        this.setState(this.processSelect(selects, nodeId, exists, selected, graphic));
    }

    private processSelect(
        selects: Array<TraceField>,
        nodeId: string,
        exists: immutable.Map<string, immutable.Map<string, string>>,
        selected: immutable.Map<string, TraceField>,
        graphic: any) : {
            selected: immutable.Map<string, TraceField>,
            exists: immutable.Map<string, immutable.Map<string, string>>
        }{
        const node = graphic.get(nodeId);
        const key = node.get('key');
        const identity = node.get('identity');
        const name = node.get('name');
        const path = node.get('path').toJS();
        const data = node.get('data');
        for (let i = 0; i < selects.length; i++) {
            const s = selects[i];
            const next = s.trace.next(key);
            if (next == null) break;
            if (next.length == 0) {
                selected = this.insert(selected, s, node);
            } else {
                const group = next[0];
                const current = s.trace.current(key);
                if (current == null) break;
                const unique = current.content.toString();
                const exid: string = exists.getIn([group, unique]);
                if (exid) {
                    const exist = selected.get(exid);
                    const enext = exist.trace.next(key);
                    let process = null;
                    if (next.length >= enext.length) {
                        process = this.uniqueNext(selected, exists, exist, s, node, group, unique, enext, next);
                    } else {
                        process = this.uniqueNext(selected, exists, s, exist, node, group, unique, next, enext);
                    }
                    selected = process.selected;
                    exists = process.exists;
                } else {
                    selected = this.insert(selected, s, node);
                    exists = exists.setIn([group, unique], s.id);
                }
            }
        }
        return {
            selected: selected,
            exists: exists
        }
    }

    componentWillUnmount() {
        const { actions } = this.props;
        let { nodeId, selected, selectables } = this.state;
        const upper = this.rich.collect();
        let tfs = immutable.Map<string, TraceField>();
        const tflist = selectables[nodeId];
        if (tflist) {
            tflist.forEach(tf => {
                tfs = tfs.set(tf.id, tf);
            })
        }
        let appends = immutable.Map<string, TraceField>();
        let selects = [];
        upper.forEach(up => {
            const tf = tfs.get(up.id);
            if (tf) {
                tfs = tfs.set(up.id, up);
            } else {
                appends = appends.set(up.id, up);
            }
            selects.push(up.id);
        })
        const gaction: graphicAction.$actions = actions.graphic;
        gaction.SELECT(nodeId, tfs, appends, selects);
    }

    rich: RichFieldList

    render() {
        const { selectables, select, selected, nodeId } = this.state;
        const buttonStyle = { lineHeight: "48px" };
        return (
            <div className="option-select">
                <ScrollTabs tabType={'scrollable-buttons'} className={'option-select-tabs'}>
                    <ScrollTab key={uuid.v4()} label={<span style={{ fontSize: "16px" }}>{cn.option_select_tab_select_items}</span>} buttonStyle={buttonStyle}>
                        <MixingMutiSelect name={uuid.v4()} text={cn.option_select_tab_select_items_select} items={selectables} nodeId={nodeId} select={this.select.bind(this)} />
                        <RichFieldList addins={selected ? selected : immutable.Map()} nodeId={nodeId} className={'option-select-rich-list'} ref={c => this.rich = c} />
                    </ScrollTab>
                    <ScrollTab key={uuid.v4()} label={<span style={{ fontSize: "16px" }}>{cn.option_select_tab_where}</span>} buttonStyle={buttonStyle}>

                    </ScrollTab>
                    <ScrollTab key={uuid.v4()} label={<span style={{ fontSize: "16px" }}>{cn.option_select_tab_groupby}</span>} buttonStyle={buttonStyle}>

                    </ScrollTab>
                    <ScrollTab key={uuid.v4()} label={<span style={{ fontSize: "16px" }}>{cn.option_select_tab_orderby}</span>} buttonStyle={buttonStyle}>

                    </ScrollTab>
                    <ScrollTab key={uuid.v4()} label={<span style={{ fontSize: "16px" }}>{cn.option_select_tab_having}</span>} buttonStyle={buttonStyle}>

                    </ScrollTab>
                </ScrollTabs>
                <div className="option-select-bottom-tool">
                </div>
            </div>
        );
    }
}

export default connect2(null, { 'option': null, 'options': ['option', 'options'], 'target': ['option', 'target'], 'graphic': ['graphic', 'graphic'] })(SelectContent)