import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'

import { cn } from '../../../text'
import { connect2 } from '../../../../common/connect'

import { option as optionAction } from '../../../../common/actions'
import { Option, OptionType, OptionTarget, OptionPosition } from '../../../../common/data/option'

interface SourceTriggerProps {
    node?: any
    actions?: any
    graphic?: any
}

class SourceTrigger extends React.PureComponent<SourceTriggerProps> {

    componentDidMount() {
        const { actions, node } = this.props;
        const { option } = actions;
        let action: optionAction.$actions = option;
        const key = node.get('key');
        const sourceKey = key + ".SOURCE";
        const optionSource = new Option.Table();
        action.SUBMIT(sourceKey, optionSource);
    }

    componentWillUnmount() {
        const { actions, node } = this.props;
        const { option } = actions;
        let action: optionAction.$actions = option;
        const key = node.get('key');
        const sourceKey = key + ".SOURCE";
        action.REMOVE(sourceKey);
    }

    source(event) {
        const { actions, graphic, node } = this.props;
        const { option } = actions;
        if (option && graphic && node && event && event.nativeEvent) {
            let action: optionAction.$actions = option;
            const target = new OptionTarget();
            target.target = node.get('data');
            action.PUSH(node.get('name'), OptionType.SOURCE, target, new OptionPosition(event.nativeEvent.clientX, event.nativeEvent.clientY))
        }
    }

    render() {
        return (
            <div className={classnames('option-btn option-source')} onTouchTap={this.source.bind(this)}></div>
        );
    }
}

export default connect2(null, {
    'option': null,
    'graphic': ['graphic', 'graphic']
})(SourceTrigger)