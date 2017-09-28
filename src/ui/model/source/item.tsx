import * as React from 'react'
import * as classnames from 'classnames'
import * as immutable from 'immutable'

import { DragSource, ConnectDragSource, ConnectDragPreview } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Divider from 'material-ui/Divider';
import { SimpleIcon as Icon } from '../../icon'

import { connect2 } from '../../../common/connect'
import { cn } from '../../text'
import { DropTypes, InnerType } from '../../common/drag'
import { DataModel } from '../../../common/data'
import { option as optionAction } from '../../../common/actions'
import { graphic as graphicAction } from '../../../common/actions'
import { Option, OptionType, OptionTarget, OptionPosition } from '../../../common/data/option'
import { JoinTrigger } from '../option/trigger'

interface SourceItemProps {
    connectDragSource?: ConnectDragSource
    connectDragPreview?: ConnectDragPreview
    isDragging?: boolean
    node?: any
    isOver?: boolean
    canDrop?: boolean
    actions?: any
}

interface SourceItemState {
    menu: boolean
}

class SourceItem extends React.PureComponent<SourceItemProps, SourceItemState> {

    constructor(props) {
        super(props);
        this.state = {
            menu: false
        }
    }

    componentDidMount() {
        const { connectDragPreview } = this.props;
        connectDragPreview(getEmptyImage(), {
            captureDraggingState: true
        })
        const { actions, node } = this.props;
        const { option } = actions;
        let action: optionAction.$actions = option;
        const key = node.get('key');
        action.SUBMIT(key, new Option.Table());
    }

    componentWillUnmount() {
        const { actions, node } = this.props;
        const { option } = actions;
        let action: optionAction.$actions = option;
        const key = node.get('key');
        action.REMOVE(key);
    }

    source(event) {
        const { actions, node } = this.props;
        const { option } = actions;
        if (option && node && event && event.nativeEvent) {
            let action: optionAction.$actions = option;
            const target = new OptionTarget();
            target.target = node.get('data');
            action.PUSH(node.get('name'), OptionType.SOURCE, target, new OptionPosition(event.nativeEvent.clientX, event.nativeEvent.clientY))
        }
    }

    over(event) {
        event.preventDefault();
        event.stopPropagation();
        this.setState({
            menu: true
        })
    }

    leave(event) {
        event.preventDefault();
        event.stopPropagation();
        this.setState({
            menu: false
        })
    }

    delete(event) {
        event.preventDefault();
        const { actions, node } = this.props;
        const { graphic } = actions;
        let action: graphicAction.$actions = graphic;
        action.DELETE(node.get('key'));
    }

    render() {
        const { connectDragSource, isDragging, node, isOver, canDrop } = this.props;

        return connectDragSource(
            <div className={classnames('model-item', 'model-source', { over: isOver }, { can: canDrop })} onMouseOver={this.over.bind(this)} onMouseLeave={this.leave.bind(this)}>
                <div className={classnames('item-package', node.get('relation'))} data-key={node.get('key')}>{node.get('name')}</div>
                {node.get('parent') ? <JoinTrigger node={node} /> : null}
                <div className={classnames('item-menu', { 'visable': this.state.menu })}>
                    <IconMenu
                        iconButtonElement={<IconButton style={{ height: '40px', width: '40px', padding: '0 0 0 0' }}><Icon name={'menu'} /></IconButton>}
                        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
                        targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                        touchTapCloseDelay={10}
                    >
                        <MenuItem primaryText={cn.option_setting} onTouchTap={this.source.bind(this)} />
                        <MenuItem primaryText={cn.option_delete} onTouchTap={this.delete.bind(this)} />
                    </IconMenu>
                </div>
            </div>
        );
    }

}

export default connect2(null, { 'option': null, 'graphic': null })(DragSource(DropTypes.RESOURCES, {
    beginDrag(props: SourceItemProps, monitor, component) {
        return {
            content: props.node.get('name'),
            node: props.node,
            type: InnerType.SOURCE
        };
    },
    endDrag(props: SourceItemProps, monitor, component) {
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
})(SourceItem))