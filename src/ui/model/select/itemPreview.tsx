import * as React from 'react'
import * as classnames from 'classnames'
import * as immutable from 'immutable'

import { DragSource, ConnectDragSource, ConnectDragPreview } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import { cn } from '../../text'
import { DropTypes, InnerType } from '../../common/drag'
import { DataModel } from '../../../common/data'

import SelectPackagePreview from './packagePreview'

interface SourceItemPreviewProps {
    node?: any
    graphic?: immutable.Map<string, any>
}

class SourceItemPreview extends React.PureComponent<SourceItemPreviewProps> {

    constructor(props) {
        super(props);
    }
    render() {
        const { node, graphic } = this.props;
        const data: DataModel.Data.Select = node.get('data');
        let sub = null;
        if (data) {
            const children = data.children;
            if (children && graphic) {
                sub = graphic.get(children);
            }
        }

        return (
            <div className={classnames('model-item', 'model-select')}>
                <div className={classnames('item-package', node.get('relation'))} data-key={node.get('key')}>
                    <SelectPackagePreview node={node} sub={sub} />
                </div>
                {node.get('parent') ? <div className={classnames('model-option')}></div> : null}
            </div>
        );
    }

}

export default SourceItemPreview