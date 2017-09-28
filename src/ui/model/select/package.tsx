import * as React from 'react'
import { bindActionCreators } from 'redux'
// import { connect } from 'react-redux'
import * as classnames from 'classnames'
import * as immutable from 'immutable'

import { DropTarget, ConnectDropTarget } from 'react-dnd';
import TextField from 'material-ui/TextField';

import { graphic as graphicAction } from '../../../common/actions'
import { connect } from '../../../common/connect'
import { cn } from '../../text'
import { DropTypes, InnerType } from '../../common/drag'
import { DataModel } from '../../../common/data'

import ModelBox from '../base/box'

interface SelectPackageProps {
    connectDropTarget?: ConnectDropTarget
    isOver?: boolean
    isOverCurrent?: boolean
    canDrop?: boolean
    actions?: graphicAction.$actions
    graphic?: immutable.Map<string, any>
    node: any
    sub?: any
}

interface SelectPackageState {
    last: string
    canDrop: boolean
}

class SelectPackage extends React.PureComponent<SelectPackageProps, SelectPackageState> {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.setState({
            canDrop: true
        })
    }

    update = this.itemPlus.bind(this)

    itemPlus(drag: any) {
        const { graphic, actions, node } = this.props;
        if (drag && drag.get('key') && node && node.get('key')) {
            try {
                let path = node.get('path');
                if (path.findIndex((item) => { return item == drag.get('key') }) >= 0) {
                    return;
                }
                if (path) {
                    path = path.push(drag.get('key'));
                } else {
                    path = immutable.fromJS([node.get('key'), drag.get('key')]);
                }
                drag = drag.set('path', path);
                // drag = drag.set('parent', null);
                drag = drag.set('top', node.get('key'));

                actions.DATA(node.get('key'), new DataModel.Data.Select(node.get('key'), drag.get('key')));
                actions.UPDATE(null, drag);
            } catch (error) {
                // TODO 
                console.log(error);
            }
        }
    }

    render() {
        const { connectDropTarget, isOver, isOverCurrent, graphic, node, sub } = this.props;
        const { canDrop } = this.state;

        return (
            <div className={classnames('model-select-package')}>
                <div className={'model-select-title'}>
                    <div className={'title-text'}>{node.get('name')}</div>
                    {/* <TextField defaultValue={node.get('name')} style={{ maxWidth: "180px", height: "40px", lineHeight: "40px"}}/> */}
                </div>
                {
                    connectDropTarget(
                        <div className={classnames('model-select-fill', { 'hover': isOverCurrent }, {'can': canDrop })}>
                            {sub ? <ModelBox node={sub} /> : null}
                        </div>
                    )
                }
            </div>
        );
    }

}

export default connect(null, 'graphic')(DropTarget(DropTypes.RESOURCES, {
    canDrop: (props: SelectPackageProps) => {
        /* const { node } = props;
        const nodes = node.get('nodes');
        if (nodes == null || nodes.size == 0) {
            return true;
        }
        return false; */
        return true;
    },
    hover(props: SelectPackageProps, monitor, component) {
        const item: any = monitor.getItem();
        let canDrop = true;
        if (item && item.node) {
            try {
                const path = props.node.get('path');
                if (path && path.findIndex((element) => { return element == item.node.get('key') }) >= 0) {
                    canDrop = false;
                }
            } catch (error) {
                canDrop = false;
            }
        }
        component.setState({
            canDrop: canDrop
        })
    },
    drop: (props: SelectPackageProps, monitor, component: any) => {
        const hasDroppedOnChild = monitor.didDrop();
        if (hasDroppedOnChild) {
            return;
        }

        return {
            update: component.update
        }
    }
}, (connect, monitor) => {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
    }
})(SelectPackage))