import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'
import * as immutable from 'immutable'

import AutoComplete from 'material-ui/AutoComplete'
import Toggle from 'material-ui/Toggle'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import { DropDownMenuProps } from 'material-ui'
import { Tabs as ScrollTabs, Tab as ScrollTab } from 'material-ui-scrollable-tabs/Tabs'

import { SimpleIcon as Icon } from '../../../icon'

import { cn } from '../../../text'
import { connect2 } from '../../../../common/connect'
import { DataModel, DataDefine } from '../../../../common/data'
import { SQLParser, GraphicParser } from '../../../../common/data/utils'
import { option as optionAction } from '../../../../common/actions'
import { JoinMode, modes } from '../../../../common/data/define/set'
import { Option, OptionTarget } from '../../../../common/data/option'
import { Expression, OptionOperator } from '../../../../common/data/define/expression'
import { Translate, ConnectAtomOption, GroupParentheses } from '../../../../common/data/option/translate'
import ExpressionList from './utils/expressionList'
import Select from './utils/select'
import { TraceField, Creater } from '../../../../common/data/option/traceability';

interface JoinContentProps {
    actions?: any
    options?: any
    graphic?: any
    target?: OptionTarget
}

interface JoinContentState {
    using: boolean
    join: Option.Join
    db: immutable.Map<string, immutable.List<TraceField>>
    group: immutable.Map<string, Creater>
}

class JoinContent extends React.PureComponent<JoinContentProps, JoinContentState> {

    constructor(props) {
        super(props);
        this.state = this.initialization();
        this.modes = immutable.Map<string, Select>();
        this.exps = immutable.Map<string, ExpressionList>();
    }

    private modes: immutable.Map<string, Select>;
    private exps: immutable.Map<string, ExpressionList>;

    initialization() {
        const idb = this.itemDBLoad();
        return {
            using: false,
            join: new Option.Join(),
            group: idb.group,
            db: idb.db
        }
    }

    itemDBLoad(): {
        group: immutable.Map<string, Creater>,
        db: immutable.Map<string, immutable.List<TraceField>>
    } {
        const { graphic, target, options } = this.props;
        const id: string = target.target.id;
        // const select = options.get(id);
        const ori = id.substr(0, id.length - ".JOIN".length);
        const cnode = graphic.get(ori);
        let group = immutable.Map<string, Creater>();
        let db = immutable.Map<string, immutable.List<TraceField>>();
        if (cnode) {
            const key = cnode.get('key');
            //const parent = cnode.get('parent');
            //if (parent) {
            //const csi = GraphicParser.collectSelectItems(parent, parent, graphic);
            const csi = GraphicParser.collectSelectItems(key, key, graphic);
            Object.keys(csi).forEach(key => {
                const list: Array<TraceField> = csi[key];
                if (list && list.length > 0) {
                    const creater = list[0].trace.creater.clone();
                    creater.item = null;
                    group = group.set(creater.id, creater);
                }
                db = db.set(key, immutable.List<TraceField>(list));
            })
            //}
        }
        return {
            group, db
        }
    }

    toggleUsingOrOn() {
        const future = !this.state.using;
        this.setState({
            using: future
        })
    }

    /* handleModeChange(identity: string, value_: any) {
        const { actions, options } = this.props;
        let join = options.get(identity);
        let action: optionAction.$actions = actions.option;
        // const curr: Option.Join = Object.create(join);
        join.mode = value_;
        action.SUBMIT(identity, join, null);
    } */

    /* flush(key_: any, new_: Array<Translate>) {
        // TODO ACTION OPTION[JOIN] SUBMIT
        const { actions, options } = this.props;
        let join = options.get(key_);
        let action: optionAction.$actions = actions.option;
        if (join == null) {
            join = new Option.Join();
        } else {
            join = Object.create(join);
        }
        join.on = new_;
        action.SUBMIT(key_, join, null);
    } */

    componentWillUnmount() {
        const { actions, options, target } = this.props;
        let action: optionAction.$actions = actions.option;
        if (target.target && target.addition) {
            target.addition.forEach(el => {
                if (el && el.id) {
                    let join: Option.Join = options.get(el.id);
                    if (join == null) { join = new Option.Join() }
                    else {
                        let nj = new Option.Join();
                        // nj.mode = join.mode;
                        nj.isUsing = join.isUsing;
                        nj.using = join.using
                        const mode = this.modes.get(el.id);
                        if (mode) { const mode_state = mode.collectValue(); if (mode_state) { nj.mode = mode_state.index; } }
                        if (nj.mode == null) { nj.mode = join.mode };

                        const on = this.exps.get(el.id);
                        if (on) { nj.on = on.collectTranslate(); }
                        if (nj.on == null) { nj.on = join.on };

                        join = nj;
                    }
                    action.SUBMIT(el.id, join);
                }
            })
        }
    }

    tabs(toggle) {
        const res = new Array();
        const { target, options } = this.props;
        const { group, db } = this.state;

        if (target.target && target.addition) {
            target.addition.forEach(el => {
                if (el && el.id && el.item) {
                    let label = <span style={{ fontSize: "16px" }}>{el.item.name}</span>;
                    const buttonStyle = {
                        lineHeight: "48px"
                    };
                    const addition = el.id;
                    let join = options.get(addition);
                    if (join == null) {
                        join = new Option.Join();
                    }
                    const targetId = target.target.id.substr(0, addition.length - ".JOIN".length);
                    const nodeId = addition.substr(0, addition.length - ".JOIN".length);
                    const tab = <ScrollTab key={uuid.v4()} label={label} buttonStyle={buttonStyle}>
                        <div className={'option-join-tool'}>
                            {toggle}
                            {
                                <Select
                                    identity={addition}
                                    name={addition + "-join-mode"}
                                    init={join.mode}
                                    style={{ width: "120px", float: "right", marginRight: "15px" }}
                                    textFieldStyle={{ width: "120px" }}
                                    dataSource={modes}
                                    ref={x => {
                                        this.modes = this.modes.set(addition, x)
                                    }} />
                            }
                            {/* <ModeMenu identity={addition} value={join.mode} onChange={this.handleModeChange.bind(this)} /> */}
                        </div>
                        <ExpressionList
                            className={"option-join-exp"}
                            match={true}
                            expressions={join.on ? join.on : []}
                            group={group}
                            db={db}
                            targetId={targetId}
                            nodeId={nodeId}
                            ref={x => {
                                this.exps = this.exps.set(addition, x)
                            }}
                        />
                    </ScrollTab>;
                    res.push(tab);
                }
            });
        }
        return res;
    }

    render() {
        const { using } = this.state;
        const toggle = <Toggle
            className={'option-toggle'}
            label={using ? cn.option_join_on : cn.option_join_using}
            toggled={using ? false : true}
            onToggle={this.toggleUsingOrOn.bind(this)}
            labelPosition={"right"}
        />
        return (
            <div className="option-join">
                <ScrollTabs tabType={`scrollable`}>
                    {this.tabs(toggle)}
                </ScrollTabs>
                <div className="option-join-bottom-tool">
                </div>
            </div>
        );
    }
}

export default connect2(null, { 'option': null, 'options': ['option', 'options'], 'target': ['option', 'target'], 'graphic': ['graphic', 'graphic'] })(JoinContent)