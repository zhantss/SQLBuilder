import * as React from 'react'
import { bindActionCreators } from 'redux'
// import { connect } from 'react-redux'
import * as classnames from 'classnames'
import * as immutable from 'immutable'

import { graphic as graphicAction } from '../../../common/actions'
import { connect } from '../../../common/connect'
import { cn } from '../../text'
import { DataModel } from '../../../common/data'

import ModelBoxPreview from './boxPreview'

interface ModelWrapProps {
    graphic?: immutable.Map<string, any>
    nodes?: Array<string>
}

class ModelWrapPreview extends React.PureComponent<ModelWrapProps> {

    constructor(props) {
        super(props);
    }

    render() {
        const { graphic, nodes } = this.props;
        const boxs = [];

        if (graphic && graphic.get('graphic') && nodes) {
            const g = graphic.get('graphic');
            nodes.forEach(element => {
                const node = g.get(element);
                if (node) {
                    boxs.push(
                        <ModelBoxPreview key={node.get('key')} {...{ node: node }} />
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

export default connect({ withRef: true }, 'graphic')(ModelWrapPreview)