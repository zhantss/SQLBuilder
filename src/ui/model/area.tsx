import * as React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as classnames from 'classnames'
import * as immutable from 'immutable'

import { DropTarget, ConnectDropTarget } from 'react-dnd';

import { graphic as graphicAction } from '../../common/actions'
import { cn } from '../text'
import { DropTypes, InnerType } from '../common/drag'
import { DataModel } from '../../common/data'

import ModelBox from './base/box'

interface ModelAreaProps {
    connectDropTarget?: ConnectDropTarget
    isOver?: boolean
    canDrop?: boolean
    actions?: graphicAction.$actions
    graphic?: immutable.Map<string, any>
    update(node: any): any
}

interface ModelAreaState {
    last: string
}

class ModelArea extends React.PureComponent<ModelAreaProps, ModelAreaState> {

    constructor(props) {
        super(props);
        this.state = {
            last: null
        }
    }

    update = this.itemPlus.bind(this)

    itemPlus(node: any) {
        const { graphic, actions } = this.props;
        // const first = graphic.get('key');
        if (node && node.get('key')) {
            try {
                // if (!first) {
                //     actions.FIRST(node.get('key'));
                //     actions.UPDATE(first, node);
                // } else {
                //     actions.UPDATE(this.state.last, node);
                // }
                // this.setState({
                //     last: node.get('key')
                // })
                actions.UPDATE(null, node);
            } catch (error) {
                // TODO 
                console.log(error);
            }
        }
    }

    render() {
        const { connectDropTarget, isOver, canDrop, graphic } = this.props;
        // const key = graphic.get('key');
        // const box_graphic = graphic.get('graphic');
        // const node = graphic.getIn(['graphic', key]);
        const entrances: immutable.List<string> = graphic.get('entrances');
        return connectDropTarget(
            <div className={classnames('model-area', { over: isOver }, { can: canDrop })}>
                {entrances ? entrances.map((value) => {
                    const node = graphic.getIn(['graphic', value]);
                    return node ? <ModelBox key={node.get('key')} {...{ node: node }} /> : null
                }) : null}
                {/* <ModelBox {...{ node: node }} /> */}
            </div>
        );
    }

}

const mapStateToProps = (state, ownProps) => {
    return {
        graphic: state.get('graphic')
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        actions: bindActionCreators(graphicAction.$dispatch, dispatch)
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DropTarget(DropTypes.RESOURCES, {
    canDrop: (props: ModelAreaProps) => { return true; },
    drop: (props: ModelAreaProps, monitor, component: any) => {
        const hasDroppedOnChild = monitor.didDrop();
        if (hasDroppedOnChild) {
            return;
        }
        // const c = component.getWrappedInstance();

        const item: any = monitor.getItem();
        if (item && item.type && item.powerType == null 
            && item.type != InnerType.RESOURCES 
            && item.type != InnerType.SQLMODEL 
            && item.type != InnerType.SOURCE 
            && item.type != InnerType.SETOP 
            && item.type != InnerType.SELECT) {
            return;
        }

        return {
            // key: c.state.last ? c.state.last : c.props.graphic.get('key'),
            // parentKey: component.state.last,
            update: component.update
        }
    }
}, (connect, monitor) => {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
    }
})(ModelArea))