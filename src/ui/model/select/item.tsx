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
import { JoinTrigger, SelectTrigger } from '../option/trigger' 

import SelectPackage from './package'

interface SelectItemProps {
    connectDragSource?: ConnectDragSource
    connectDragPreview?: ConnectDragPreview
    isDragging?: boolean
    isOver?: boolean
    canDrop?: boolean
    node?: any
    graphic?: immutable.Map<string, any>
    actions?: any
    isSelect?: boolean
}

interface SelectItemState {
    menu: boolean
}

class SelectItem extends React.PureComponent<SelectItemProps, SelectItemState> {

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
        const selectKey = key + ".SELECT";
        const data: DataModel.Data.Select = node.get('data');
        // TODO
        const optionSelect = new Option.SelectOption(selectKey);
        action.SUBMIT(selectKey, optionSelect);
    }

    componentWillUnmount() {
        const { actions, node } = this.props;
        const { option } = actions;
        let action: optionAction.$actions = option;
        const key = node.get('key');
        const selectKey = key + ".SELECT";
        action.REMOVE(selectKey);
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
            <div className={classnames('model-item', 'model-select', { over: isOver }, { can: canDrop })} onMouseOver={this.over.bind(this)} onMouseLeave={this.leave.bind(this)}>
                <div className={classnames('item-package', node.get('relation'))} data-key={node.get('key')}>
                    {/* <div className={'model-select-title'}>{node.get('name')}</div> */}
                    <SelectPackage node={node} sub={sub} />
                </div>
                {node.get('parent') ? <JoinTrigger node={node} /> : null}
                <div className={classnames('item-menu', { 'visable': this.state.menu })}>
                    <IconMenu
                        iconButtonElement={<IconButton style={{ height: '40px', width: '40px', padding: '0 0 0 0' }}><Icon name={'menu'} /></IconButton>}
                        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
                        targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                        touchTapCloseDelay={10}
                    >
                        <SelectTrigger primaryText={cn.option_setting} node={node} actions={this.props.actions} />
                        {/* <MenuItem primaryText={cn.option_setting} onTouchTap={this.select.bind(this)} /> */}
                        <MenuItem primaryText={cn.option_delete} onTouchTap={this.delete.bind(this)} />
                    </IconMenu>
                </div>
            </div>
        );
    }

}

export default connect2(null, {
    'option': null,
    'graphic': null
})(DragSource(DropTypes.RESOURCES, {
    beginDrag(props: SelectItemProps, monitor, component) {
        return {
            // content: props.node.get('name'),
            node: props.node,
            type: InnerType.SELECT
        };
    },
    endDrag(props: SelectItemProps, monitor, component) {
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
})(SelectItem))