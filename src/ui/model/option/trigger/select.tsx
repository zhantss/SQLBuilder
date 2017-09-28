import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'

import { cn } from '../../../text'
import { connect2 } from '../../../../common/connect'

import { option as optionAction } from '../../../../common/actions'
import { Option, OptionType, OptionTarget, OptionPosition } from '../../../../common/data/option'

interface SelectTriggerProps {
    node?: any
    actions?: any
    graphic?: any
}

class SelectTrigger extends React.PureComponent<SelectTriggerProps> {

    componentDidMount() {
        const { actions, node } = this.props;
        const { option } = actions;
        let action: optionAction.$actions = option;
        const key = node.get('key');
        const selectKey = key + ".SELECT";
        const optionSelect = new Option.Table();
        action.SUBMIT(selectKey, optionSelect);
    }

    componentWillUnmount() {
        const { actions, node } = this.props;
        const { option } = actions;
        let action: optionAction.$actions = option;
        const key = node.get('key');
        const selectKey = key + ".SELECT";
        action.REMOVE(selectKey);
    }

    select(event) {
        const { actions, graphic, node } = this.props;
        const { option } = actions;
        if (option && graphic && node && event && event.nativeEvent) {
            let action: optionAction.$actions = option;
            const target = new OptionTarget();
            target.target = node.get('data');
            action.PUSH(node.get('name'), OptionType.SELECT, target, new OptionPosition(event.nativeEvent.clientX, event.nativeEvent.clientY))
        }
    }

    render() {
        return (
            <div className={classnames('option-btn option-select')} onTouchTap={this.select.bind(this)}></div>
        );
    }
}

export default connect2(null, {
    'option': null,
    'graphic': ['graphic', 'graphic']
})(SelectTrigger)