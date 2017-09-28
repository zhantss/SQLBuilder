import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'

import Toggle from 'material-ui/Toggle';
import { Tabs as ScrollTabs, Tab as ScrollTab } from 'material-ui-scrollable-tabs/Tabs';

import { cn } from '../../../text'
import { connect2 } from '../../../../common/connect'
import { DataModel } from '../../../../common/data'
import { OptionTarget } from '../../../../common/data/option'

interface JoinContentProps {
    actions?: any
    options?: any
    target?: OptionTarget
}

interface JoinContentState {
    using: boolean
}

class JoinContent extends React.PureComponent<JoinContentProps, JoinContentState> {

    constructor(props) {
        super(props);
        this.state = {
            using: false
        }
    }

    toggleUsingOrOn() {
        const future = !this.state.using;
        this.setState({
            using: future
        })
    }

    tabs() {
        const res = new Array();
        const { target } = this.props;
        const toggle = <Toggle
            className={'option-toggle'}
            label={this.state.using ? cn.option_join_on : cn.option_join_using}
            toggled={this.state.using ? false : true}
            onToggle={this.toggleUsingOrOn.bind(this)}
            labelPosition={"right"}
        />
        if (target.target && target.addition) {
            target.addition.forEach(el => {
                if (el instanceof DataModel.Data.Model) {
                    res.push(
                        <ScrollTab key={uuid.v4()} label={el.name}>
                            {toggle}
                        </ScrollTab>
                    );
                } else if (el instanceof DataModel.Data.Source) {
                    res.push(
                        <ScrollTab key={uuid.v4()} label={el.name}>
                            {toggle}
                        </ScrollTab>
                    );
                } else if (el instanceof DataModel.Data.Select) {
                    res.push(
                        <ScrollTab key={uuid.v4()} label={el.name}>
                            {toggle}
                        </ScrollTab>
                    );
                }
            });
        }
        return res;
    }

    render() {
        return (
            <div className="option-join">
                <ScrollTabs tabType={`scrollable`}>
                    {this.tabs()}
                </ScrollTabs>
            </div>
        );
    }
}

export default connect2(null, { 'option': null, 'options': ['option', 'options'], 'target': ['option', 'target'] })(JoinContent)