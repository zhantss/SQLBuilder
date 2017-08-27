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

import ModelBoxPreview from '../base/boxPreview'

interface SelectPackagePreviewProps {
    node: any
    sub?: any
}

class SelectPackagePreview extends React.PureComponent<SelectPackagePreviewProps> {

    constructor(props) {
        super(props);
    }

    render() {
        const { node, sub } = this.props;

        return (
            <div className={'model-select-package'}>
                <div className={'model-select-title'}>
                    <div className={'title-text'}>{node.get('name')}</div>
                    {/* <TextField defaultValue={node.get('name')} style={{ maxWidth: "180px", height: "40px", lineHeight: "40px"}}/> */}
                </div>
                {sub ? <ModelBoxPreview node={sub} /> : null}
            </div>
        );
    }

}

export default SelectPackagePreview