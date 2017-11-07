import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'

import AutoComplete from 'material-ui/AutoComplete'
import {
    Table,
    TableBody,
    TableFooter,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
} from 'material-ui/Table'
import IconButton from 'material-ui/IconButton'
import TextField from 'material-ui/TextField'

import { SimpleIcon as Icon } from '../../../icon'

import { cn } from '../../../text'
import { connect2 } from '../../../../common/connect'
import { DataModel, DataDefine } from '../../../../common/data'
import { Expression, Column, Value, Function } from '../../../../common/data/define/expression'
import { SQLParser } from '../../../../common/data/utils'
import { option as optionAction } from '../../../../common/actions'
import { Option, OptionTarget } from '../../../../common/data/option'
import { SelectableExpression } from '../../../../common/data/option/selectable'
import FieldList from './utils/fieldList' 

interface TableContentProps {
    actions?: any
    options?: any
    target?: OptionTarget
}

interface TableJoinContentState {
    customize: Array<Value>
}

class TableContent extends React.PureComponent<TableContentProps, TableJoinContentState> {

    constructor(props) {
        super(props)

    }

    flush(items: Array<SelectableExpression>) {
        const { actions, options, target } = this.props;
        let table: Option.Table = options.get(target.target.id);
        let action: optionAction.$actions = actions.option;
        table = Object.create(table);
        table.items = items;
        action.SUBMIT(target.target.id, table);
    }

    render() {
        const { target, options } = this.props;
        const id = target.target.id;
        const data = target.target.item;
        const table: Option.Table = options.get(id);

        return (
            <div className="option-table">
                <div className="option-table-toolbar">
                    <TextField name={id + "-alias"} hintText={cn.option_table_alias} style={{ float: "right", marginRight: "15px" }} />
                </div>
                <div className="option-table-select">
                    <FieldList table={table} flush={this.flush.bind(this)} />
                </div>
                <div className="option-table-bottom-tool"></div>
            </div>
        );
    }
}

export default connect2(null, { 'option': null, 'options': ['option', 'options'], 'target': ['option', 'target'] })(TableContent)