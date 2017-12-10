import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'
import * as immutable from 'immutable'

import AutoComplete from 'material-ui/AutoComplete'
import IconButton from 'material-ui/IconButton'
import MenuItem from 'material-ui/MenuItem'
import TextField from 'material-ui/TextField'

import { AutoSizer as RV_AutoSizer, Table as RV_Table, Column as RV_Column, SortDirection as ev_SortDirection, SortIndicator as RV_SortIndicator, SortDirection as RV_SortDirection, defaultTableRowRenderer as RV_defaultTableRowRenderer } from 'react-virtualized'
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc'

import { SimpleIcon as Icon } from '../../../../icon'
import Input from './input'

import { cn } from '../../../../text'
import { connect2 } from '../../../../../common/connect'
import { DataModel, DataDefine } from '../../../../../common/data'
import { GraphicParser } from '../../../../../common/data/utils'
import { Expression, AtomExpression, Value, Column, Function } from '../../../../../common/data/define/expression'
import { Alias } from '../../../../../common/data/define/extra'
import { Option } from '../../../../../common/data/option'
import { Translate, ConnectAtomOption, GroupParentheses } from '../../../../../common/data/option/translate'
import { TraceSelectItem, TraceField } from '../../../../../common/data/option/traceability'

interface ColumnListProps {
    addins: immutable.Map<string, TraceField>
    nodeId: string
    className?: any
}

interface ColumnListState {
    items: immutable.Map<number, TraceSelectItem>
    // exists: immutable.Map<string, number>
    unique: immutable.Map<string, number>
}

const SortableTable = SortableContainer(RV_Table)
const SortableTableRowRenderer = SortableElement(RV_defaultTableRowRenderer);

class ColumnList extends React.PureComponent<ColumnListProps, ColumnListState> {

    constructor(props) {
        super(props);
        this.state = this.initialization(this.props.addins);
    }

    initialization(addins: immutable.Map<string, TraceField>) {
        return this.mapping(immutable.Map<number, TraceSelectItem>(), /* immutable.Map<string, number>(),  */immutable.Map<string, number>(), addins);
    }

    mapping(items: immutable.Map<number, TraceSelectItem>, /* exists: immutable.Map<string, number>, */ unique: immutable.Map<string, number>, addins: immutable.Map<string, TraceField>) {
        // let { items, exists } = this.state;
        const { nodeId } = this.props;
        let tfs = addins.valueSeq().toArray();
        for (let x = 0; x < tfs.length; x++) {
            const tf = tfs[x];
            const ue = unique.get(tf.id);
            if (ue != null) continue;
            const current = tf.trace.current(nodeId);
            if (current == null) continue;

            let item: AtomExpression = null;
            let alias: Alias = null;
            if (nodeId == tf.trace.creater.id) {
                item = current.content;
                alias = current.alias;
            } else if (current.alias) {
                item = new Column(current.alias.alias);
            } else {
                item = current.content;
            }

            if (item == null) continue;
            let size = items.size;
            items = items.set(size, new TraceSelectItem(item, alias, tf));
            unique = unique.set(tf.id, size);
        }
        return {
            items: items,
            // exists: exists,
            unique: unique
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this.mapping(this.state.items, /* this.state.exists,  */this.state.unique, nextProps.addins));
    }

    rowGetter({ index }) {
        const { items } = this.state;
        const item = items.get(index);
        item.index = index;
        return item;
    }

    rowRenderer(props) {
        return <SortableTableRowRenderer {...props} />
    }

    noRowsRenderer() {
        return <div className={'no-selected-field'}>{cn.option_select_tab_select_items_table_no_row}</div>
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

    public collect(): Array<TraceField> {
        const { nodeId } = this.props;
        const { items } = this.state;
        const upper: Array<TraceField> = [];
        for(let x = 0; x < items.size; x++) {
            const item = items.get(x)
            upper.push(item.getTraceField());
        }
        return upper;
    }

    private columnRender() {
        const { className } = this.props;
        const { items } = this.state;
        return <RV_AutoSizer disableHeight className={className}>
            {({ width }) => (
                <SortableTable headerHeight={20} height={450} width={width} rowHeight={40}
                    rowGetter={this.rowGetter.bind(this)}
                    rowCount={items.size}
                    rowClassName={this.rowClassName.bind(this)}
                    rowRenderer={this.rowRenderer}
                    noRowsRenderer={this.noRowsRenderer}>
                    {/* <RV_Column
                        label={'index'}
                        cellDataGetter={(row) => { return row.rowData.index; }}
                        dataKey={'index'}
                        width={60}
                    /> */}
                    <RV_Column
                        label={cn.option_select_tab_select_items_table_name}
                        cellDataGetter={(row) => { const data: TraceSelectItem = row.rowData; return data.item instanceof Column ? data.item.column : data.item.toString(); }}
                        dataKey={'name'}
                        width={200}
                    />
                    <RV_Column
                        label={cn.option_select_tab_select_items_table_from}
                        cellDataGetter={(row) => { const data: TraceSelectItem = row.rowData; return data.from() }}
                        dataKey={'from'}
                        width={300}
                    />
                    <RV_Column
                        label={cn.option_select_tab_select_items_table_datasource}
                        cellDataGetter={(row) => { const data: TraceSelectItem = row.rowData; return data.datasource() }}
                        dataKey={'datasource'}
                        width={600}
                    />
                </SortableTable>)}
        </RV_AutoSizer>;
    }

    render() {
        const { className } = this.props;
        return (
            <div className={className ? className : null}>
                {this.columnRender()}
            </div>
        );
    }


}

export default ColumnList