import * as React from 'react'
import * as classnames from 'classnames'
import * as immutable from 'immutable'

import { DragSource, ConnectDragSource, ConnectDragPreview } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import { connect2 } from '../../../common/connect'
import { cn } from '../../text'
import { DropTypes, InnerType } from '../../common/drag'
import { DataModel } from '../../../common/data'

interface ModelItemProps {
    connectDragSource?: ConnectDragSource
    connectDragPreview?: ConnectDragPreview
    isDragging?: boolean
    node?: any
    isOver?: boolean
    canDrop?: boolean
}

class ModelItem extends React.PureComponent<ModelItemProps> {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { connectDragPreview } = this.props;
        connectDragPreview(getEmptyImage(), {
            captureDraggingState: true
        })
    }

    render() {
        const { connectDragSource, isDragging, node, isOver, canDrop } = this.props;

        return connectDragSource(
            <div className={classnames('model-item', { over: isOver }, { can: canDrop })}>
                <div className={classnames('item-package', node.get('relation'))} data-key={node.get('key')}>{node.get('name')}</div>
                {node.get('parent') ? <div className={classnames('model-option')}></div> : null}
            </div>
        );
    }

}

export default connect2(null, {
    'option' : null
})(DragSource(DropTypes.RESOURCES, {
    beginDrag(props: ModelItemProps, monitor, component) {
        return {
            content: props.node.get('name'),
            node: props.node,
            type: InnerType.ITEM
        };
    },
    endDrag(props: ModelItemProps, monitor, component) {
        let res: any = monitor.getDropResult();
        if (res && res.update) {
            res.update(props.node)
        }
    }
}, (connect, monitor) => {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    }
})(ModelItem))