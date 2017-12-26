import * as React from 'react'
import * as immutable from 'immutable'
import * as classnames from 'classnames'
import * as uuid from 'uuid'

import { AutoSizer, Table, Column, SortDirection, SortIndicator } from 'react-virtualized'

import { cn } from '../text/index'

interface DataTableProps {
    index: number
    sql: string
    result: any
}

interface DataTableState {
    cols: any
    body: any
}

class DataTable extends React.PureComponent<DataTableProps, DataTableState> {

    constructor(props) {
        super(props);
        this.state = this.process(props.result);
    }

    process(result) {
        return {
            cols: result.cols,
            body: result.body
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState(
            this.process(nextProps.result)
        )
    }

    rowGetter({ index }) {
        const { cols, body } = this.state;
        return body[index]
    }

    rowClassName(row) {
        if (row && row.index != null) {
            if (row.index < 0) {
                return 'rv-table-header-row';
            } else {
                return row.index % 2 === 0 ? 'rv-table-even-row' : 'rv-table-odd-row';
            }
        }
    }

    noRowsRenderer() {
        return <div className={'no-selected-field'}>{cn.option_select_tab_select_items_table_no_row}</div>
    }

    render() {
        const { cols, body } = this.state;
        return <AutoSizer disableHeight>
            {({ width }) => (
                <Table headerHeight={20} height={450} width={width} rowHeight={40}
                    rowGetter={this.rowGetter.bind(this)}
                    rowCount={body.length}
                    rowClassName={this.rowClassName.bind(this)}
                    noRowsRenderer={this.noRowsRenderer}>
                    {cols.map(col => {
                        return <Column
                            key={col}
                            label={col}
                            cellDataGetter={({ dataKey, rowData }) => { return rowData[dataKey]; }}
                            dataKey={col}
                            width={200} />
                    })}
                </Table>
            )}
        </AutoSizer>
    }

}

export default DataTable