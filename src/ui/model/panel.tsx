import * as React from 'react'
import { bindActionCreators } from 'redux'
import * as immutable from 'immutable'
import { connect } from 'react-redux'

import * as classnames from 'classnames'

import { graphic as graphicAction } from '../../common/actions'
import { cn } from '../text'
import { DataModel, DataDefine } from '../../common/data'

import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

import ModelArea from './area'
import PowerBtn from './powerBtn'

import '../stylesheet/model.scss'

interface ModelPanelProps {
    graphic: immutable.Map<string, any>
    actions: graphicAction.$actions
}

class ModelPanel extends React.PureComponent<ModelPanelProps> {

    private btnStyle = {
        margin: "0 12px"
    }

    render() {
        return (
            <Card initiallyExpanded={true} containerStyle={{ position: 'relative', height: '100%' }} className={classnames('height100')}>
                <CardHeader
                    style={{ borderLeft: "2px solid #efefef", padding: "0", height: '50px' }}
                    title={
                        <div className={'model-toolbar'}>
                            <PowerBtn content={cn.model_header_btn_sub} style={this.btnStyle} powerType={DataModel.Data.DataType.SELECT} />
                            <PowerBtn content={cn.model_header_btn_union} style={this.btnStyle} powerType={DataModel.Data.DataType.SETOPERATORS} />
                            <FlatButton label={cn.model_header_btn_cancel} style={this.btnStyle} />
                            <FlatButton label={cn.model_header_btn_redo} style={this.btnStyle} />
                        </div>
                    }>

                </CardHeader>
                <CardText expandable={true} className={classnames('height100', 'model-panel', 'user-select-none')}>
                    <ModelArea {...{ graphic: this.props.graphic }} />
                </CardText>
            </Card>
        );
    }

}

const mapStateToProps = (state, ownProps) => {
    return {
        graphic: state.get('graphic')
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        actions: bindActionCreators(graphicAction.$dispatch, dispatch)
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ModelPanel);
