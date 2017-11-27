import * as React from 'react'
import { bindActionCreators } from 'redux'
// import { connect } from 'react-redux'
import * as classnames from 'classnames'
import * as immutable from 'immutable'

import { DropTarget, ConnectDropTarget } from 'react-dnd';


import { graphic as graphicAction } from '../../../common/actions'
import { connect } from '../../../common/connect'
import { cn } from '../../text'
import { DropTypes } from '../../common/drag'
import { DataModel, DataDefine } from '../../../common/data'

import ModelItem from './item'
import ModelWrap from './wrap'

import SelectItem from '../select/item'
import SourceItem from '../source/item'
import SQLItem from '../sql/item'

interface ModelBoxProps {
    connectDropTarget?: ConnectDropTarget
    isOver?: boolean
    isOverCurrent?: boolean
    canDrop?: boolean
    actions?: graphicAction.$actions
    graphic?: immutable.Map<string, any>
    itemKey?: string
    node: any
}

interface ModelBoxState {
    canDrop?: boolean
}

class ModelBox extends React.PureComponent<ModelBoxProps, ModelBoxState> {

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
        try {
            if (drag && drag.get('key')) {
                if (node.get('path').findIndex((item) => { return item == drag.get('key') }) >= 0) {
                    return;
                }
                actions.UPDATE(node.get('key'), drag);
            }
        } catch (error) {
            // TODO 
            console.log(error);
        }
    }

    options = {
        join: this.join.bind(this),
        setop: this.setop.bind(this)
    }

    join() {
        const { graphic, actions, node } = this.props;
        // TODO 
        console.log('join')
        // DataDefine.Join
    }

    setop() {
        const { graphic, actions, node } = this.props;
        // TODO 
        console.log('setop');
        // DataDefine.SetOperators
    }

    render() {
        const { connectDropTarget, isOver, isOverCurrent, node, graphic } = this.props;
        const { canDrop } = this.state;
        let item = null;
        if (node) {
            const data = node.get('data');
            const path = node.get('path');
            const root = path && path.size == 1;
            const nodes = node.get('nodes');
            const innermost = nodes == null || nodes.size <= 0;
            
            if (data instanceof DataModel.Data.Select) {
                item = <SelectItem node={node} isOver={isOverCurrent} canDrop={canDrop} graphic={graphic.get('graphic')} isSelect={root || !innermost} />
            } else if (data instanceof DataModel.Data.SetOperators) {

            } else if (data instanceof DataModel.Data.Source) {
                item = <SourceItem node={node} isOver={isOverCurrent} canDrop={canDrop} isSelect={root || !innermost} />
            } else if (data instanceof DataModel.Data.Model) {
                item = <SQLItem node={node} isOver={isOverCurrent} canDrop={canDrop} isSelect={root || !innermost} />
            } else {
                item = <ModelItem node={node} isOver={isOverCurrent} canDrop={canDrop} isSelect={root || !innermost} />;
            }
        }

        return connectDropTarget(
            <div className={classnames('model-box')}>
                {node ? item : null}
                {node ? <ModelWrap {...{ nodes: node.get('nodes') }} /> : null}
            </div>
        );
    }

}

/* const mapStateToProps = (state, ownProps) => {
    return {
        graphic: state.get('graphic')
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        actions: bindActionCreators(graphicAction.$dispatch, dispatch)
    };
}; */

export default connect(null, 'graphic')(DropTarget(DropTypes.RESOURCES, {
    canDrop: (props: ModelBoxProps, monitor) => {
        /* const item: any = monitor.getItem();
        if (item && item.node) {
            try {
                if (item.node.get('parent') == props.node.get('key') || item.node.get('key') ==  props.node.get('key')) {
                    return false;
                }
            } catch (error) {
                return false;
            }
        } */
        return true;
    },
    hover(props: ModelBoxProps, monitor, component) {
        const item: any = monitor.getItem();
        let canDrop = true;
        if (item && item.node) {
            try {
                if (props.node.get('path').findIndex((element) => { return element == item.node.get('key') }) >= 0) {
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
    drop: (props: ModelBoxProps, monitor, component: ModelBox) => {
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
})(ModelBox))