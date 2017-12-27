import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'
import * as immutable from 'immutable'

import AutoComplete from 'material-ui/AutoComplete'
import IconButton from 'material-ui/IconButton'
import MenuItem from 'material-ui/MenuItem'
import TextField from 'material-ui/TextField'

import { AutoSizer as RV_AutoSizer, Table as RV_Table, Column as RV_Column, SortIndicator as RV_SortIndicator, SortDirection as RV_SortDirection } from 'react-virtualized'
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
import { Translate } from '../../../../../common/data/option/translate'
import { TraceSelectItem, TraceField } from '../../../../../common/data/option/traceability'

interface RichFieldListProps {
    addins: immutable.OrderedMap<string, TraceField>
    nodeId: string
    className?: any
}

interface RichFieldListState {
    items: immutable.OrderedMap<number, TraceSelectItem>
    exists: immutable.Map<string, number>
    unique: immutable.Map<string, number>
}

class RichFieldList extends React.PureComponent<RichFieldListProps, RichFieldListState> {

    constructor(props) {
        super(props);
        this.state = this.initialization(this.props.addins);
    }

    initialization(addins: immutable.Map<string, TraceField>) {
        return this.mapping(immutable.OrderedMap<number, TraceSelectItem>(), /* immutable.Map<string, number>(), */ immutable.OrderedMap<string, number>(), addins);
    }

    mapping(items: immutable.OrderedMap<number, TraceSelectItem>, /* exists: immutable.Map<string, number>,  */unique: immutable.Map<string, number>, addins: immutable.OrderedMap<string, TraceField>) {
        // let { items, exists } = this.state;
        const { nodeId } = this.props;
        let tfs = addins.valueSeq().toArray();
        let exists = immutable.Map<string, number>();
        for (let x = 0; x < tfs.length; x++) {
            const tf = tfs[x];
            const current = tf.trace.current(nodeId);
            if (current == null) continue;
            
            let item: AtomExpression = null;
            let alias: Alias = null;
            if (nodeId == tf.trace.creater.id) {
                item = current.content;
                alias = current.alias;
            } else if (current.alias && tf.trace.getDesignation(nodeId) == null) {
                item = new Column(current.alias.alias);
            } else {
                item = current.content;
                alias = current.alias;
            }
            
            if (item == null) continue;
            
            const exid = exists.get(item.toString());
            const exist = items.get(exid)
            if (exist && (alias == null || alias.alias == item.toString())) {
                let an = item.toString();
                while (exists.get(an) != null) {
                    an = GraphicParser.uniqueDesignation(an);
                }
                alias = new Alias(an, alias ? alias.as : false);
            } else if (alias != null && items.get(exists.get(alias.alias)) != null) {
                let an = alias.alias;
                while (exists.get(an) != null) {
                    an = GraphicParser.uniqueDesignation(an);
                }
                alias.alias = an;
            }
            const ue = unique.get(tf.id);
            let size = ue != null ? ue : items.size;
            items = items.set(size, new TraceSelectItem(item, alias, tf));
            if (alias != null) {
                exists = exists.set(alias.alias, size);
                unique = unique.set(tf.id, size);
            } else {
                exists = exists.set(item.toString(), size);
                unique = unique.set(tf.id, size);
            }
        }
        return {
            items: items,
            exists: exists,
            unique: unique
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this.mapping(this.state.items, /* this.state.exists,  */this.state.unique, nextProps.addins));
    }

    rowGetter({ index }) {
        const { items } = this.state;
        return items.get(index);
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

    private alias: immutable.Map<number, any> = immutable.Map<number, any>()

    public collect(): Array<TraceField> {
        const { nodeId } = this.props;
        const { items } = this.state;
        const upper: Array<TraceField> = [];
        this.alias.entrySeq().forEach(e => {
            const index: number = e[0];
            const value: TextField = e[1];
            const alias = value.getValue();
            const item = items.get(index);
            if (item) {
                const tf = item.getTraceField();
                if (alias != null && alias.length != 0) {
                    tf.trace.setDesignation(nodeId, alias);
                    if (tf.trace.creater.id == nodeId) {
                        tf.trace.creater.item.alias = new Alias(alias);
                    }
                }
                upper.push(tf);
            }
        })
        return upper;
    }

    private selectRender() {
        const { className } = this.props;
        const { items } = this.state;
        return <RV_AutoSizer disableHeight className={className}>
            {({ width }) => (
                <RV_Table headerHeight={20} height={450} width={width} rowHeight={40}
                    rowGetter={this.rowGetter.bind(this)}
                    rowCount={items.size}
                    rowClassName={this.rowClassName.bind(this)}
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
                        label={cn.option_select_tab_select_items_table_alias}
                        // cellDataGetter={(row) => { const data: TraceSelectItem = row.rowData.value; const alias = data.item.alias ? data.item.alias : null; return <input value={alias ? alias.alias : ""} />}}
                        cellRenderer={({ rowData, rowIndex }) => {
                            const data: TraceSelectItem = rowData;
                            const alias = data.alias ? data.alias : null;
                            return <TextField defaultValue={alias ? alias.alias : ""} name={uuid.v4()} ref={x => { this.alias = this.alias.set(rowIndex, x); }} /* onChange={this.aliasChange.bind(this)} data-index={rowData.index} */ />
                        }}
                        dataKey={'alias'}
                        width={200}
                    />
                    <RV_Column
                        label={cn.option_select_tab_select_items_table_as}
                        cellDataGetter={(row) => { const data: TraceSelectItem = row.rowData; return data.alias ? data.alias.as : false }}
                        dataKey={'as'}
                        width={60}
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
                </RV_Table>)}
        </RV_AutoSizer>;
    }

    render() {
        const { className } = this.props;
        return (
            <div className={className ? className : null}>
                {this.selectRender()}
            </div>
        );
    }


}

export default RichFieldList