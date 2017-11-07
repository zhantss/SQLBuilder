import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'

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
import { SQLParser } from '../../../../common/data/utils'
import { option as optionAction } from '../../../../common/actions'
import { JoinMode, modes } from '../../../../common/data/define/extra'
import { Option, OptionTarget } from '../../../../common/data/option'
import { Expression, OptionOperator } from '../../../../common/data/define/expression'
import { Translate, AtomOption, ConnectAtomOption, GroupParentheses } from '../../../../common/data/option/translate'
import ExpressionList from './utils/expressionList'
import Select from './utils/select'

interface JoinContentProps {
    actions?: any
    options?: any
    target?: OptionTarget
}

interface JoinContentState {
    using: boolean
    join: Option.Join
}

class JoinContent extends React.PureComponent<JoinContentProps, JoinContentState> {

    constructor(props) {
        super(props);
        this.state = {
            using: false,
            join: new Option.Join()
        }
    }

    db(model: any) {
        const list = [];
        if (model instanceof DataModel.Data.Model) {
            const fields = model.fields;
            const sql = model.sql;
            if (fields != null && fields.length > 0) {
                fields.forEach(f => {
                    // TODO type
                    list.push(f.name);
                })
            } else if (sql != null) {
                const pfs = SQLParser.getSelectItems(sql);
                pfs.forEach(pf => {
                    // TODO type
                    list.push(pf.name);
                })
            }
        } else if (model instanceof DataModel.Data.Source) {
            const fields = model.fields;
            fields.forEach(f => {
                // TODO type
                list.push(f.name);
            })
        }
        return list;
    }

    toggleUsingOrOn() {
        const future = !this.state.using;
        this.setState({
            using: future
        })
    }

    handleModeChange(identity: string, value_: any) {
        const { actions, options } = this.props;
        let join = options.get(identity);
        let action: optionAction.$actions = actions.option;
        // const curr: Option.Join = Object.create(join);
        join.mode = value_;
        action.SUBMIT(identity, join);
    }

    flush(key_: any, new_: Array<Translate>) {
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
        action.SUBMIT(key_, join);
    }

    tabs(toggle) {
        const res = new Array();
        const { target, options } = this.props;

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
                    const tab = <ScrollTab key={uuid.v4()} label={label} buttonStyle={buttonStyle}>
                        <div className={'option-join-tool'}>
                            {toggle}
                            {
                                <Select
                                    identity={addition}
                                    name={addition + "-join-mode"}
                                    init={join.mode}
                                    update={this.handleModeChange.bind(this)}
                                    style={{ width: "120px", float: "right", marginRight: "15px" }}
                                    textFieldStyle={{ width: "120px" }}
                                    openOnFocus={true}
                                    filter={AutoComplete.noFilter}
                                    dataSource={modes}/>
                            }
                            {/* <ModeMenu identity={addition} value={join.mode} onChange={this.handleModeChange.bind(this)} /> */}
                        </div>
                        <ExpressionList
                            className={"option-join-exp"}
                            addition={addition}
                            match={true}
                            expressions={join.on ? join.on : []}
                            flush={this.flush.bind(this)}
                            left={this.db(target.target.item)}
                            right={this.db(el.item)} />
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

export default connect2(null, { 'option': null, 'options': ['option', 'options'], 'target': ['option', 'target'] })(JoinContent)