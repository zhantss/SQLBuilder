import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'

import MenuItem from 'material-ui/MenuItem'
import { MenuItemProps } from 'material-ui'

import { cn } from '../../../text'
import { connect2 } from '../../../../common/connect'

import { option as optionAction } from '../../../../common/actions'
import { Option, OptionType, OptionTarget, OptionPosition, OptionItem } from '../../../../common/data/option'

interface SQLModelTriggerProps extends MenuItemProps {
    node?: any
    actions?: any
    // close(): any
}

class SQLModelTrigger extends React.PureComponent<SQLModelTriggerProps> {

    static muiName = 'MenuItem';

    componentDidMount() {/* 
        const { actions, node } = this.props;
        const { option } = actions;
        let action: optionAction.$actions = option;
        const key = node.get('key');
        const modelKey = key + ".SQLMODEL";
        const optionSQLModel = new Option.Table();
        action.SUBMIT(modelKey, optionSQLModel); */
    }

    componentWillUnmount() {/* 
        const { actions, node } = this.props;
        const { option } = actions;
        let action: optionAction.$actions = option;
        const key = node.get('key');
        const modelKey = key + ".SQLMODEL";
        action.REMOVE(modelKey); */
    }

    model(event) {
        event.preventDefault();
        const { actions, node } = this.props;
        const { option } = actions;
        if (option && node && event && event.nativeEvent) {
            let action: optionAction.$actions = option;
            const target = new OptionTarget();
            target.target = new OptionItem(node.get('key') + ".SQLMODEL",  node.get('data'));
            action.PUSH(node.get('name'), OptionType.SQLMODEL, target, new OptionPosition(event.nativeEvent.clientX, event.nativeEvent.clientY))
        }
    }

    render() {
        {/* <div className={classnames('option-btn option-model')} onTouchTap={this.model.bind(this)}></div> */}
        {/* <MenuItem primaryText={cn.option_setting} onTouchTap={this.model.bind(this)}/> */}
        {/* <span onTouchTap={this.model.bind(this)}>{cn.option_setting}</span> */}
        const props = {...this.props};
        delete props["node"];
        delete props["actions"];
        return <MenuItem {...props} onClick={this.model.bind(this)}/>
    }
}

export default SQLModelTrigger /* connect2(null, {
    'option': null,
    'graphic': ['graphic', 'graphic']
})(SQLModelTrigger) */