import * as React from 'react'
import * as classnames from 'classnames'

import { DragLayer, ClientOffset } from 'react-dnd';

import { cn } from '../../text'
import DragTypes from './types'
import InnerType from './innerType'

import ResourcesItemPreview from './resourcesItemPreview'
import ModelBoxPreview from '../../model/base/boxPreview'

interface LayoutProps {
    currentOffset: ClientOffset
    item: Object
    itemType: string
    isDragging: boolean
}

class Layout extends React.PureComponent<LayoutProps> {

    private currentPosition(props) {
        const { currentOffset, item } = props;
        if (!currentOffset) {
            return {
                display: 'none'
            };
        }

        const { x, y } = currentOffset;
        // console.log(currentOffset);
        const transform = `translate(${x}px, ${item && item.type && item.type == InnerType.RESOURCES ? y - 16: y}px)`;     // y- 16/ font-size = 16px
        return {
            transform: transform,
            WebkitTransform: transform
        }
    }

    private renderItem(type, item) {
        switch (type) {
            case DragTypes.RESOURCES: {
                if (item && item.type) {
                    switch (item.type) {
                        case InnerType.ITEM:
                        case InnerType.SOURCE:
                        case InnerType.SQLMODEL:
                        case InnerType.SELECT:
                        case InnerType.SETOP: {
                            try {
                                // console.log()
                                return (
                                    <ModelBoxPreview {...{ node: item.node.set('parent', null)}} />
                                );
                            } catch (error) {
                                console.error(error);
                                return null;
                            }
                        }
                        case InnerType.RESOURCES: {
                            return (
                                <ResourcesItemPreview icon={item.icon} content={item.content} />
                            );
                        }
                    }

                }

                return (
                    <ResourcesItemPreview icon={item.icon} content={item.content} />
                );
            }
        }
    }

    render() {
        const { item, itemType, isDragging } = this.props;

        if (!isDragging) {
            return null;
        }

        return (
            <div className={'layout'}>
                <div style={this.currentPosition(this.props)}>
                    {this.renderItem(itemType, item)}
                </div>
            </div>
        );
    }

}

export default DragLayer((monitor) => {
    return {
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging()
    }
})(Layout)