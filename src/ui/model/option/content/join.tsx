import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'

import Toggle from 'material-ui/Toggle'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import { Tabs as ScrollTabs, Tab as ScrollTab } from 'material-ui-scrollable-tabs/Tabs'

import { SimpleIcon as Icon } from '../../../icon'

import { cn } from '../../../text'
import { connect2 } from '../../../../common/connect'
import { DataModel, DataDefine } from '../../../../common/data'
import { JoinMode } from '../../../../common/data/define/extra'
import { Option, OptionTarget } from '../../../../common/data/option'

interface JoinContentProps {
    actions?: any
    options?: any
    target?: OptionTarget
}

interface JoinContentState {
    using: boolean
    join: Option.Join
}

interface ModeMenuProps {
    mode: any
    handleModeChange()
}

class ModeMenu extends React.PureComponent<ModeMenuProps> {

    render() {
        const { mode, handleModeChange } = this.props;
        const menus = new Array();
        Object.keys(JoinMode).forEach((value, index) => {
            if (JoinMode[index]) {
                menus.push(<MenuItem key={index} value={index} label={JoinMode[index]} primaryText={JoinMode[index]} />)
            }
        })

        return (<DropDownMenu style={{ float: "right", width: "200px" }} value={mode} onChange={handleModeChange}>{menus}</DropDownMenu>);
    }
}

class JoinContent extends React.PureComponent<JoinContentProps, JoinContentState> {

    constructor(props) {
        super(props);
        this.state = {
            using: false,
            join: new Option.Join()
        }
    }

    toggleUsingOrOn() {
        const future = !this.state.using;
        this.setState({
            using: future
        })
    }

    handleModeChange(event, index, value) {
        let { join } = this.state;
        const curr: Option.Join = Object.create(join);
        curr.mode = index;
        this.setState({
            join: curr
        })
    }

    tabs(toggle) {
        const res = new Array();
        const { target } = this.props;
        const { join } = this.state;

        if (target.target && target.addition) {
            target.addition.forEach(el => {
                if (el && el.name) {
                    let label = <span style={{ fontSize: "16px" }}>{el.name}</span>;
                    const buttonStyle = {
                        lineHeight: "48px"
                    };
                    const children = new Array();
                    if (el instanceof DataModel.Data.Model) {
                        if (!join.isUsing) {
                            const on = join.on;
                            if (on) {

                            } else {
                                
                            }
                        } else {

                        }
                    } else if (el instanceof DataModel.Data.Source) {
                    } else if (el instanceof DataModel.Data.Select) {
                    }
                    const tab = <ScrollTab key={uuid.v4()} label={label} buttonStyle={buttonStyle}>
                        <div className={'option-join-tool'}>
                            {toggle}
                            {<ModeMenu mode={this.state.join.mode} handleModeChange={this.handleModeChange.bind(this)}/>}
                        </div>
                        {children}
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
                    <IconButton><Icon name={"add"}/></IconButton>
                    <IconButton><Icon name={"delete_forever"}/></IconButton>
                    <IconButton><Icon name={"chevron_left"}/><Icon name={"chevron_right"}/></IconButton>
                </div>
            </div>
        );
    }
}

export default connect2(null, { 'option': null, 'options': ['option', 'options'], 'target': ['option', 'target'] })(JoinContent)