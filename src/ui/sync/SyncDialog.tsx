import * as React from 'react'
import * as immutable from 'immutable'
import * as classnames from 'classnames'
import * as uuid from 'uuid'

import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'

import { connect2 } from '../../common/connect'
import { sync as syncAction } from '../../common/actions'
import * as cn from '../text/cn'

interface SyncDialogProps {
    sync: any
    actions: any
}

class SyncDialog extends React.PureComponent<SyncDialogProps> {

    handleClose() {
        const { actions } = this.props;
        const action: syncAction.$actions = actions.sync;
        action.END();
    }

    render() {
        const { sync } = this.props;
        const actions = [
            <FlatButton
                label="Close"
                primary={true}
                onClick={this.handleClose}
            />
        ];

        return <Dialog
            title={null}
            actions={actions}
            modal={false}
            open={sync.get('dialog')}
            onRequestClose={this.handleClose}
        >
            { sync.get('info') ? sync.get('info') : cn.sync_dialog_info }
        </Dialog>
    }
}

export default connect2(null, {
    'sync': ['sync'],
})(SyncDialog)