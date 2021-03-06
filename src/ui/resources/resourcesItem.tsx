import * as React from 'react'
import * as classnames from 'classnames'
import * as immutable from 'immutable'
import * as uuid from 'uuid'

import { DragSource, ConnectDragSource, ConnectDragPreview } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import { cn } from '../text'
import { DropTypes, InnerType } from '../common/drag'
import { DataModel, DataDefine } from '../../common/data'
import { TraceField, Trace, Designation } from '../../common/data/option/traceability';

interface RIProps {
    connectDragSource?: ConnectDragSource
    connectDragPreview?: ConnectDragPreview
    isDragging?: boolean
    icon?: string
    content?: string
    itemKey?: string
    data?: any
}

class ResourcesItem extends React.PureComponent<RIProps> {

    componentDidMount() {
        const { connectDragPreview } = this.props;
        connectDragPreview(getEmptyImage(), {
            captureDraggingState: true
        })
    }

    render() {
        const { connectDragSource, isDragging } = this.props;
        return (
            <div className={'icon-list'}>
                {
                    connectDragSource(
                        <div className={'icon-package'}>
                            <i className={classnames('material-icons', 'drag-source')}>{this.props.icon}</i>
                            <span className="content drag-source">{this.props.content}</span>
                        </div>
                    )
                }
            </div>
        );
    }

}

export default DragSource(DropTypes.RESOURCES, {
    beginDrag(props: RIProps, monitor, component) {
        return {
            icon: props.icon,
            content: props.content,
            type: InnerType.RESOURCES
        };
    },
    endDrag(props: RIProps, monitor, component) {
        let res: any = monitor.getDropResult();
        let node = props.data;
        if (res && res.update && node) {
            // TODO update global graphic state
            const key = uuid.v4();
            const data = node.get('data');
            if (data instanceof DataModel.Data.Source) {
            } else if (data instanceof DataModel.Data.Model) {
            }
            res.update(immutable.fromJS({
                key : key,
                name : props.content,
                identity : node.get('identity'),
                data : node.get('data')
            }))
        }
    }
}, (connect, monitor) => {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    }
})(ResourcesItem)