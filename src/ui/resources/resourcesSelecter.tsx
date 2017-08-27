import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as classnames from 'classnames'
import * as immutable from 'immutable'

import { resources as resourcesAction } from '../../common/actions'
import { cn } from '../text'

import { Card, CardHeader } from 'material-ui/Card';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import ResourcesItem from './resourcesItem'
import ResourcesModel from './resourcesModel'
import ResourcesSource from './resourcesSource'
import Icon from '../icon'

import '../stylesheet/resources.scss'

interface ResourcesSelecterProps {
    resources: any
    actions: resourcesAction.$actions
}

interface ResourcesSelecterState {
    show?: string
}

class ResourcesSelecter extends React.PureComponent<ResourcesSelecterProps, ResourcesSelecterState> {

    constructor(props) {
        super(props);
        this.state = {
            show: "resources_selecter_model"
        }
    }

    toggleSelecter(event, index, value) {
        this.setState({
            show: value
        })
    }

    render() {
        return (
            <Card initiallyExpanded={true} className={classnames('height100', 'user-select-none', 'resources-card')} containerStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <CardHeader
                    className={"resources-card-header"}
                    title={cn.resource_card_title}
                    style={{ width: "100%" }}
                    textStyle={{ width: "100%" }}
                    subtitleStyle={{ width: "100%" }}
                    subtitle={
                        <SelectField
                            // floatingLabelText={cn.resource_card_title}
                            value={this.state.show}
                            onChange={this.toggleSelecter.bind(this)}
                            fullWidth={true}
                            // style={{ width: '100%', padding: 0}}
                        >
                            <MenuItem value={"resources_selecter_model"} primaryText={cn.resources_selecter_model} />
                            <MenuItem value={"resources_selecter_source"} primaryText={cn.resources_selecter_source} />
                        </SelectField>
                    }
                // expandable={true}
                // actAsExpander={true}
                // showExpandableButton={true}
                />
                <ResourcesModel open={false} display={this.state.show == "resources_selecter_model"} />
                <ResourcesSource display={this.state.show == "resources_selecter_source"} />
            </Card>
        )
    }

}

const mapStateToProps = (state, ownProps) => {
    return {
        resources: state.get('resources')
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        actions: bindActionCreators(resourcesAction.$dispatch, dispatch)
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ResourcesSelecter);