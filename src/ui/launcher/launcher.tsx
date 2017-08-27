import * as React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import HTML5Backend from "react-dnd-html5-backend";
import { DragDropContext } from "react-dnd";

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Layout from '../common/drag/layout'
import { ResourcesSelecter } from '../resources'
import { ModelPanel } from '../model'

import * as commonActions from '../../common/actions'

import '../stylesheet/common.scss'
import '../stylesheet/drag.scss'
import '../stylesheet/draw.scss'
import '../stylesheet/launcher.scss'

class Launcher extends React.PureComponent {

    private launcher: Launcher;

    render() {
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
                </div>
            </MuiThemeProvider>
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
        actions: bindActionCreators(commonActions.graphic.$dispatch, dispatch)
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DragDropContext(HTML5Backend)(Launcher));