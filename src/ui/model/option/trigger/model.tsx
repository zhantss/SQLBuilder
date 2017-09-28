import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'

import MenuItem from 'material-ui/MenuItem';

import { cn } from '../../../text'
import { connect2 } from '../../../../common/connect'

import { option as optionAction } from '../../../../common/actions'
import { Option, OptionType, OptionTarget, OptionPosition } from '../../../../common/data/option'

interface SQLModelTriggerProps {
    node?: any
    actions?: any
    graphic?: any
    close(): any
}

class SQLModelTrigger extends React.PureComponent<SQLModelTriggerProps> {

    componentDidMount() {
        const { actions, node } = this.props;
        const { option } = actions;
        let action: optionAction.$actions = option;
        const key = node.get('key');
        const modelKey = key + ".SQLMODEL";
        const optionSQLModel = new Option.Table();
        action.SUBMIT(modelKey, optionSQLModel);
    }

    componentWillUnmount() {
        const { actions, node } = this.props;
        const { option } = actions;
        let action: optionAction.$actions = option;
        const key = node.get('key');
        const modelKey = key + ".SQLMODEL";
        action.REMOVE(modelKey);
    }

    model(event) {
        event.preventDefault();
        const { actions, graphic, node } = this.props;
        const { option } = actions;
        if (option && graphic && node && event && event.nativeEvent) {
            let action: optionAction.$actions = option;
            const target = new OptionTarget();
            target.target = node.get('data');
            action.PUSH(node.get('name'), OptionType.SQLMODEL, target, new OptionPosition(event.nativeEvent.clientX, event.nativeEvent.clientY))
        }
    }

    render() {
        {/* <div className={classnames('option-btn option-model')} onTouchTap={this.model.bind(this)}></div> */}
        {/* <MenuItem primaryText={cn.option_setting} onTouchTap={this.model.bind(this)}/> */}
        {/* <span onTouchTap={this.model.bind(this)}>{cn.option_setting}</span> */}
        return (
            <MenuItem primaryText={cn.option_setting} onTouchTap={this.model.bind(this)}/>
        );
    }
}

export default connect2(null, {
    'option': null,
    'graphic': ['graphic', 'graphic']
})(SQLModelTrigger)