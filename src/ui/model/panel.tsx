import * as React from 'react'
// import { bindActionCreators } from 'redux'
import * as immutable from 'immutable'
// import { connect } from 'react-redux'

import * as classnames from 'classnames'

import { graphic as graphicAction, result as resultAction } from '../../common/actions'
import { cn } from '../text'
import { DataModel, DataDefine } from '../../common/data'
import { connect2 } from '../../common/connect'

import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

import ModelArea from './area'
import PowerBtn from './powerBtn'
import { SQLBuilder } from '../../common/data/utils/sqlbuilder2'

import '../stylesheet/model.scss'
import { parser } from '../../common/data/utils/sqlparser';

interface ModelPanelProps {
    graphic: any
    options: any
    actions: any
}

class ModelPanel extends React.PureComponent<ModelPanelProps> {

    private btnStyle = {
        margin: "0 12px"
    }

    testsql() {
        const { graphic, options, actions } = this.props;
        const entrances = graphic.get('entrances');
        const graphicx = graphic.get('graphic');
        if(entrances && graphicx && options) {
            const selects = [];
            entrances.forEach(entrance => {
                try {
                    const builder = new SQLBuilder(entrance, options, graphicx);
                    const select = builder.build();
                    const sql = select.toString();
                    /* try {
                        console.log(parser(sql));
                    } catch (error) {
                        console.error(error);
                    } */
                    selects.push(sql);
                } catch(error) {
                    const ep = graphicx.get(entrance).get('name') + "SQL Build ERROR, ERROR: " + error;
                    selects.push(ep);
                    console.error(ep);
                }
            });
            if(selects.length > 0) {
                const action: resultAction.$actions = actions.result;
                action.BUILD(selects);
            }
        }
    }

    render() {
        // TODO UNION, HISTORY
        return (
            <Card initiallyExpanded={true} containerStyle={{ position: 'relative', height: '100%' }} className={classnames('height100')}>
                <CardHeader
                    style={{ borderLeft: "2px solid #efefef", padding: "0", height: '50px' }}
                    title={
                        <div className={'model-toolbar'}>
                            {/* <PowerBtn content={cn.model_header_btn_sub} style={this.btnStyle} powerType={DataModel.Data.DataType.SELECT} /> */}
                            <PowerBtn content={cn.model_header_btn_union} style={this.btnStyle} powerType={DataModel.Data.DataType.SETOPERATORS} disabled={true} />
                            <FlatButton label={cn.model_header_btn_cancel} style={this.btnStyle} disabled={true} />
                            <FlatButton label={cn.model_header_btn_redo} style={this.btnStyle} disabled={true} />
                            <FlatButton label={cn.model_test_sql} style={this.btnStyle} onTouchTap={this.testsql.bind(this)}/>
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

/* const mapStateToProps = (state, ownProps) => {
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
)(ModelPanel); */

export default connect2(null, {
    'graphic': ['graphic'],
    'options' : ['option', 'options'],
    'result' : null,
})(ModelPanel)
