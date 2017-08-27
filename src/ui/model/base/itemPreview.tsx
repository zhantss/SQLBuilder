import * as React from 'react'
import * as classnames from 'classnames'
import * as immutable from 'immutable'

import { DragSource, ConnectDragSource, ConnectDragPreview } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import { cn } from '../../text'
import { DropTypes } from '../../common/drag'
import { DataModel } from '../../../common/data'

interface ModelItemProps {
    node?: any
}

class ModelItemPreview extends React.PureComponent<ModelItemProps> {

    constructor(props) {
        super(props);
    }

    render() {
        const { node } = this.props;

        return (
            <div className={classnames('model-item')}>
                <div className={classnames('item-package', node.get('relation'))} data-key={node.get('key')}>{node.get('name')}</div>
                {node.get('parent') ? <div className={classnames('model-option')}></div> : null}
            </div>
        );
    }

}

export default ModelItemPreview