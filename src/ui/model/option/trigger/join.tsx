import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'

import { cn } from '../../../text'
import { connect2 } from '../../../../common/connect'

import { option as optionAction } from '../../../../common/actions'
import { Option, OptionType, OptionTarget, OptionPosition } from '../../../../common/data/option'
import { JoinMode } from '../../../../common/data/define/extra';

interface JoinTriggerProps {
    node?: any
    actions? : any
    graphic?: any
}

class JoinTrigger extends React.PureComponent<JoinTriggerProps> {

    componentDidMount() {
        const { actions, node } = this.props;
        const { option } = actions;
        let action: optionAction.$actions = option;
        const key = node.get('key');
        const joinKey = key + ".JOIN";
        const optionJoin = new Option.Join();
        action.SUBMIT(joinKey, optionJoin);
    }

    componentWillUnmount() {
        const { actions, node } = this.props;
        const { option } = actions;
        let action: optionAction.$actions = option;
        const key = node.get('key');
        const joinKey = key + ".JOIN";
        action.REMOVE(joinKey);
    }

    join(event) {
        const { actions, graphic, node } = this.props;
        const { option } = actions;
        if (option && graphic && node && event && event.nativeEvent) {
            let action: optionAction.$actions = option;
            const parentKey = node.get('parent');
            if (parentKey) {
                const parent = graphic.get(parentKey);
                if (parent) {
                    const target = new OptionTarget();
                    target.target = parent.get('data');
                    target.addition.push(node.get('data'));
                    action.PUSH('join', OptionType.JOIN, target, new OptionPosition(event.nativeEvent.clientX, event.nativeEvent.clientY))
                }
            }
        }
    }

    render(){
        return(
            <div className={classnames('model-option')} onTouchTap={this.join.bind(this)}></div>
        );
    }
}

export default connect2(null, {
    'option' : null,
    'graphic' : ['graphic', 'graphic']
})(JoinTrigger)