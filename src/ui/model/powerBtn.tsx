import * as React from 'react'
import * as classnames from 'classnames'
import * as immutable from 'immutable'
import * as uuid from 'uuid'

import { DragSource, ConnectDragSource, ConnectDragPreview } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import RaisedButton from 'material-ui/RaisedButton';

import { cn } from '../text'
import { DropTypes, InnerType } from '../common/drag'
import { DataModel } from '../../common/data'

interface PowerBtnProps {
    connectDragSource?: ConnectDragSource
    connectDragPreview?: ConnectDragPreview
    isDragging?: boolean
    style?: any
    content?: any
    powerType: DataModel.Data.DataType
}

class PowerBtn extends React.PureComponent<PowerBtnProps> {

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
        const { connectDragSource, isDragging, style, content } = this.props;

        return connectDragSource(
            <div className={classnames('model-power-btn')}>
                <RaisedButton label={content} style={style} />
            </div>
        );
    }

}

export default DragSource(DropTypes.RESOURCES, {
    beginDrag(props: PowerBtnProps, monitor, component) {
        if (props.powerType) {
            switch (props.powerType) {
                case DataModel.Data.DataType.SELECT: {
                    const id = "new Select";
                    return {
                        node: immutable.fromJS({
                            key: id,
                            identity: id,
                            name: id,
                            data: new DataModel.Data.Select(id, null)
                        }),
                        type: InnerType.SELECT,
                        powerType: props.powerType
                    };
                }
                case DataModel.Data.DataType.SETOPERATORS: {
                    const id = "new SetOperators";
                    return {
                        node: immutable.fromJS({
                            key: id,
                            identity: id,
                            name: id,
                            data: new DataModel.Data.SetOperators(null)
                        }),
                        type: InnerType.SETOP,
                        powerType: props.powerType
                    };
                }
            }
        }
        return {
            powerType: props.powerType
        };
    },
    endDrag(props: PowerBtnProps, monitor, component) {
        let res: any = monitor.getDropResult();
        if (res && res.update) {
            let id = uuid.v4();
            let { powerType } = props;
            switch (powerType) {
                case DataModel.Data.DataType.SELECT: {
                    res.update(immutable.fromJS({
                        key: id,
                        identity: id,
                        name: id,
                        data: new DataModel.Data.Select(id, null)
                    }))
                    break;
                }
                case DataModel.Data.DataType.SETOPERATORS: {
                    res.update(immutable.fromJS({
                        key: id,
                        identity: id,
                        name: id,
                        data: new DataModel.Data.SetOperators(null)
                    }))
                    break;
                }
            }
        }
    }
}, (connect, monitor) => {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    }
})(PowerBtn)