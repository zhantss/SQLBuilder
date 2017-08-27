import * as React from 'react'
import * as classnames from 'classnames'
import * as immutable from 'immutable'

import { DragSource, ConnectDragSource, ConnectDragPreview } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import { cn } from '../../text'
import { DropTypes, InnerType } from '../../common/drag'
import { DataModel } from '../../../common/data'

import SelectPackage from './package'

interface SourceItemProps {
    connectDragSource?: ConnectDragSource
    connectDragPreview?: ConnectDragPreview
    isDragging?: boolean
    node?: any
    isOver?: boolean
    canDrop? : boolean
    graphic?: immutable.Map<string, any>
}

class SourceItem extends React.PureComponent<SourceItemProps> {

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
        const { connectDragSource, isDragging, node, isOver, canDrop, graphic } = this.props;
        const data: DataModel.Data.Select = node.get('data');
        let sub = null;
        if (data) {
            const children = data.children;
            if (children && graphic) {
                sub = graphic.get(children);
            }
        }

        return connectDragSource(
            <div className={classnames('model-item', 'model-select', { over : isOver }, { can : canDrop })}>
                <div className={classnames('item-package', node.get('relation'))} data-key={node.get('key')}>
                    {/* <div className={'model-select-title'}>{node.get('name')}</div> */}
                    <SelectPackage node={node} sub={sub} />
                </div>
                {node.get('parent') ? <div className={classnames('model-option')}></div> : null}
            </div>
        );
    }

}

export default DragSource(DropTypes.RESOURCES, {
    beginDrag(props: SourceItemProps, monitor, component) {
        return {
            // content: props.node.get('name'),
            node: props.node,
            type: InnerType.SELECT
        };
    },
    endDrag(props: SourceItemProps,  monitor, component) {
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
})(SourceItem)