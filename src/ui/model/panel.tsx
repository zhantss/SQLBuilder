import * as React from 'react'
// import { bindActionCreators } from 'redux'
import * as immutable from 'immutable'
// import { connect } from 'react-redux'

import * as classnames from 'classnames'

import { graphic as graphicAction, result as resultAction, sync as sycnAction } from '../../common/actions'
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
import { serialize } from '../../common/utils/serialization';

interface ModelPanelProps {
    graphic: any
    options: any
    actions: any
}

class ModelPanel extends React.PureComponent<ModelPanelProps> {

    private btnStyle = {
        margin: "0 12px"
    }

    build() {
        const { graphic, options, actions } = this.props;
        const entrances = graphic.get('entrances');
        const graphicx = graphic.get('graphic');
        if (entrances && graphicx && options) {
            const selects = [];
            const sync: sycnAction.$actions = actions.sync;
            sync.SYNC(cn.sync_dialog_builder);
            const errors = [];
            entrances.forEach(entrance => {
                try {
                    const builder = new SQLBuilder(entrance, options, graphicx);
                    const build = builder.build2();
                    const select = build.statement;
                    // const select = builder.build();
                    const sql = select.toString();
                    const items = builder.collectTopItems();
                    /* try {
                        console.log(parser(sql));
                    } catch (error) {
                        console.error(error);
                    } */
                    const state = {
                        graphic: {
                            entrances: [entrance],
                            graphic: build.graphics
                        },
                        option: {
                            options: build.options
                        }
                    }
                    selects.push({
                        sql: sql,
                        items: items,
                        entrance: entrance,
                        serialize: serialize(state)
                    });
                } catch (error) {
                    // const ep = graphicx.get(entrance).get('name') + "SQL Build ERROR, ERROR: " + error;
                    // selects.push(ep);
                    const ex = graphicx.get(entrance).get('name') + ": SQL Build ERROR";
                    errors.push(ex);
                    console.log(ex);
                    console.error(error);
                }
            });
            if(errors.length > 0) {
                sync.SYNC(cn.sync_dialog_builder_error);
            } else {
                sync.END();
            }
            if (selects.length > 0) {
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
                            <FlatButton label={cn.model_test_sql} style={this.btnStyle} onTouchTap={this.build.bind(this)} />
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
    'options': ['option', 'options'],
    'result': null,
    'sync': null
})(ModelPanel)
