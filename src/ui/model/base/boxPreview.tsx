import * as React from 'react'
import { bindActionCreators } from 'redux'
import * as classnames from 'classnames'
import * as immutable from 'immutable'

import { DropTarget, ConnectDropTarget } from 'react-dnd';

import { connect } from '../../../common/connect'
import { cn } from '../../text'
import { DropTypes } from '../../common/drag'
import { DataModel } from '../../../common/data'

import ModelItemPreview from './itemPreview'
import ModelWrapPreview from './wrapPreview'

import SelectItemPreview from '../select/itemPreview'
import SourceItemPreview from '../source/itemPreview'
import SQLItemPreview from '../sql/itemPreview'

interface ModelBoxProps {
    node: any
    graphic?: immutable.Map<string, any>
}

class ModelBoxPreview extends React.PureComponent<ModelBoxProps> {

    constructor(props) {
        super(props);
    }

    render() {
        const { node, graphic } = this.props;
        let item = null;
        let nodes = null;
        if (node) {
            const data = node.get('data');
            if (data instanceof DataModel.Data.Select) {
                item = <SelectItemPreview node={node} graphic={graphic.get('graphic')}/>
            } else if (data instanceof DataModel.Data.SetOperators) {

            } else if (data instanceof DataModel.Data.Source) {
                item = <SourceItemPreview node={node} />
            } else if (data instanceof DataModel.Data.Model) {
                item = <SQLItemPreview node={node} />
            } else {
                item = <ModelItemPreview node={node} />;
            }
            nodes = node.get('nodes');
        }

        return (
            <div className={'model-box'}>
                {item}
                <ModelWrapPreview {...{ nodes: nodes }} />
            </div>
        );
    }

}

export default connect(null, 'graphic')(ModelBoxPreview)