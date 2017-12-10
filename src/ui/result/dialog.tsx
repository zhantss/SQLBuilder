import * as React from 'react'
import * as immutable from 'immutable'
import * as classnames from 'classnames'
import * as uuid from 'uuid'

import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import { cn } from '../text/index';

interface ResultDialogProps {
    sql: Array<string>
    open: boolean
    hide()
}

class ResultDialog extends React.PureComponent<ResultDialogProps> {

    handleClose() {
        const { hide } = this.props;
        hide();
    }

    render() {
        const { open, sql } = this.props;
        const actions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onClick={this.handleClose.bind(this)}
            />,
            <FlatButton
                label="Submit"
                primary={true}
                keyboardFocused={true}
                onClick={this.handleClose.bind(this)}
            />,
        ];
        return <Dialog
            title={cn.result_sql_title}
            actions={actions}
            modal={false}
            open={open}
            onRequestClose={this.handleClose}
        >
            {sql ? sql.map(s => {
                return <p key={uuid.v4()}>{s}</p>
            }) : null}
        </Dialog>
    }
}

export default ResultDialog