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

interface OptionState {
    left: number
    top: number
    move: boolean,
    mx: number,
    my: number
}

class Option extends React.PureComponent<OptionProps, OptionState> {

    constructor(props) {
        super(props);
        this.state = this.position(props.position)
    }

    position(position) {
        let left = position ? position.x - 240 : 0;
        let top = position ? position.y : 0;
        if (left / window.innerWidth > 0.5) left = left / 2;
        return {
            left,
            top,
            move: false,
            mx: 0,
            my: 0,
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState(
            this.position(nextProps.position)
        )
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

    start(event) {
        event.preventDefault();
        // event.stopPropagation();
        const { left, top } = this.state;
        this.setState({
            move: true,
            mx: left - event.nativeEvent.x,
            my: top - event.nativeEvent.y
        })
    }

    move(event) {
        event.preventDefault();
        // event.stopPropagation();
        const { mx, my, left, top, move } = this.state;
        if (!move) return;
        let nl = event.nativeEvent.x + mx;
        let nt = event.nativeEvent.y + my;
        this.setState({
            left: nl < 0 ? 0 : nl,
            top: nt < 0 ? 0 : nt
        })
    }

    end(event) {
        event.preventDefault();
        // event.stopPropagation();
        this.setState({
            move: false
        })
    }

    render() {
        const { visable, position } = this.props;
        const { left, top } = this.state;
        //if (!visable) {
        //    return null;
        //}
        return (
            <div className={classnames('option-container', { 'hidden': !visable })} onTouchTap={this.hidden.bind(this)} onMouseMove={this.move.bind(this)} onMouseUp={this.end.bind(this)} >
                <TransitionGroup>
                    {visable ? <CSSTransition key={'one'} classNames="option-package" timeout={{ enter: 200, exit: 200 }}
                        mountOnEnter={true}
                        unmountOnExit={true}>
                        <div className={classnames('option-panel')} style={{
                            transform: "translate(" + left + "px, " + top + "px)"
                        }} onTouchTap={this.stop}>
                            <OptionTitle start={this.start.bind(this)} />
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