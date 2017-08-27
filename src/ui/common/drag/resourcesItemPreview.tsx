import * as React from 'react'
import * as classnames from 'classnames'

import { DragSource, ConnectDragSource, ConnectDragPreview } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import { cn } from '../../text'
import { DropTypes } from '../drag'

interface RIPProps {
    icon: string
    content: string
}

class ResourcesItemPreview extends React.PureComponent<RIPProps> {

    render() {
        return (
            <div className="resources preview">
                {/* <i className="material-icons">{this.props.icon}</i> */}
                <span className="content">{this.props.content}</span>
            </div>
        );
    }

}

export default ResourcesItemPreview