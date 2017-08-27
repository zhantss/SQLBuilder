import * as React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as classnames from 'classnames'
import * as immutable from 'immutable'

import { graphic as graphicAction } from '../../../common/actions'
import { cn } from '../../text'
import { DataModel } from '../../../common/data'

import ModelBox from './box'

interface ModelWrapProps {
    graphic?: immutable.Map<string, any>
    nodes?: Array<string>
}

class ModelWrap extends React.PureComponent<ModelWrapProps> {

    constructor(props) {
        super(props);
    }

    render() {
        const { graphic, nodes } = this.props;
        const boxs = [];

        if (graphic && nodes) {
            nodes.forEach(element => {
                const node = graphic.get(element);
                if (node) {
                    boxs.push(
                        <ModelBox key={node.get('key')} {...{ node: node }} />
                    )
                }
            });
        }

        return (
            <div className={`model-wrap`}>
                {boxs}
            </div>
        );
    }

}

const mapStateToProps = (state, ownProps) => {
    return {
        graphic: state.getIn(['graphic', 'graphic'])
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        actions: bindActionCreators(graphicAction.$dispatch, dispatch)
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        withRef: true
    }
)(ModelWrap)