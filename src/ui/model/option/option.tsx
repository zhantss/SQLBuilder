import * as React from 'react'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import * as classnames from 'classnames'

import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';

import { cn } from '../../text'
import { connect2 } from '../../../common/connect'

import OptionTitle from './title'
import { OptionContent } from './content'
import { OptionPosition } from '../../../common/data/option'
import { option as optionAction } from '../../../common/actions'

interface OptionProps {
    visable: boolean
    position: OptionPosition
    actions: any
}

class Option extends React.PureComponent<OptionProps> {

    constructor(props) {
        super(props);
    }

    hidden(event) {
        event.preventDefault();
        const { actions } = this.props;
        const { option } = actions;
        if (option) {
            let actions: optionAction.$actions = option;
            actions.DROP();
        }
    }

    stop(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    render() {
        const { visable, position } = this.props;
        //if (!visable) {
        //    return null;
        //}
        return (
            <div className={classnames('option-container', { 'hidden': !visable })} onTouchTap={this.hidden.bind(this)}>
                <TransitionGroup>
                    {visable ? <CSSTransition key={'one'} classNames="option-package" timeout={{ enter: 200, exit: 200 }}
                        mountOnEnter={true}
                        unmountOnExit={true}>
                        <div className={classnames('option-panel')} style={{ left: position.x - 240, top: position.y }} onTouchTap={this.stop}>
                            <OptionTitle />
                            <OptionContent />
                            <div className="option-toolbar"></div>
                        </div>
                    </CSSTransition> : null}
                </TransitionGroup>
            </div>
        );
    }

}

export default connect2(null, { 'visable': ['option', 'visable'], 'position': ['option', 'position'], 'option': null })(Option)