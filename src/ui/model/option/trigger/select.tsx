import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'

import MenuItem from 'material-ui/MenuItem'
import { MenuItemProps } from 'material-ui'

import { cn } from '../../../text'
import { connect2 } from '../../../../common/connect'

import { option as optionAction } from '../../../../common/actions'
import { Option, OptionType, OptionTarget, OptionPosition, OptionItem } from '../../../../common/data/option'

interface SelectTriggerProps extends MenuItemProps {
    node?: any
    actions?: any
}

class SelectTrigger extends React.PureComponent<SelectTriggerProps> {
    
    static muiName = 'MenuItem';

    componentDidMount() {/* 
        const { actions, node } = this.props;
        const { option } = actions;
        let action: optionAction.$actions = option;
        const key = node.get('key');
        const selectKey = key + ".SELECT";
        const optionSelect = new Option.Table();
        action.SUBMIT(selectKey, optionSelect); */
    }

    componentWillUnmount() {/* 
        const { actions, node } = this.props;
        const { option } = actions;
        let action: optionAction.$actions = option;
        const key = node.get('key');
        const selectKey = key + ".SELECT";
        action.REMOVE(selectKey); */
    }

    select(event) {event.preventDefault();
        const { actions, node } = this.props;
        const { option } = actions;
        if (option && node && event && event.nativeEvent) {
            let action: optionAction.$actions = option;
            const target = new OptionTarget();
            target.target = new OptionItem(node.get('key') + ".SELECT",  node.get('data'));
            action.PUSH(node.get('name'), OptionType.SELECT, target, new OptionPosition(event.nativeEvent.clientX, event.nativeEvent.clientY))
        }
    }

    render() {
        /* return (
            <div className={classnames('option-btn option-select')} onTouchTap={this.select.bind(this)}></div>
        ); */
        const props = {...this.props};
        delete props["node"];
        delete props["actions"];
        return <MenuItem {...props} onClick={this.select.bind(this)}/>
    }
}

export default SelectTrigger/* connect2(null, {
    'option': null,
    'graphic': ['graphic', 'graphic']
})(SelectTrigger) */