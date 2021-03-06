import * as React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import HTML5Backend from "react-dnd-html5-backend"
import { DragDropContext } from "react-dnd"

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import { result as resultAction } from '../../common/actions'
import Layout from '../common/drag/layout'
import { connect2 } from '../../common/connect'
import { ResourcesSelecter } from '../resources'
import { ModelPanel } from '../model'
import { OptionPanel } from '../model/option'
import ResultDialog from '../result/dialog'

import * as commonActions from '../../common/actions'

import '../stylesheet/common.scss'
import '../stylesheet/drag.scss'
import '../stylesheet/draw.scss'
import '../stylesheet/option.scss'
import '../stylesheet/launcher.scss'
import SyncDialog from '../sync/SyncDialog';

class LauncherProps {
    result: any
    actions: any
}

class Launcher extends React.PureComponent<LauncherProps> {

    private launcher: Launcher;

    previewResult(index: number, sql: string) {
        const { result, actions } = this.props;
        const action: resultAction.$actions = actions.result;
        action.PREVIEW({ index, sql });
    }

    saveResult(sqls: any) {
        const { result, actions } = this.props;
        const action: resultAction.$actions = actions.result;
        action.SAVE({ sqls : sqls });
    }

    render() {
        const { result } = this.props;
        return (
            <MuiThemeProvider>
                <div className="launcher">
                    <div className="list before flex-column">
                        <ResourcesSelecter open={false} />
                    </div>
                    <div className="tabpanel">
                        <ModelPanel />
                    </div>
                    {<Layout />}
                    {<OptionPanel />}
                    {<ResultDialog />}
                    {<SyncDialog />}
                </div>
            </MuiThemeProvider>
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
        actions: bindActionCreators(commonActions.graphic.$dispatch, dispatch)
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DragDropContext(HTML5Backend)(Launcher)); */

export default connect2(null, {
    'result': ['result']
})(DragDropContext(HTML5Backend)(Launcher))