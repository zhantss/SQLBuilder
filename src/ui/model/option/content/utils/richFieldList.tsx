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
    rows: immutable.List<string>
    items: immutable.OrderedMap<string, TraceSelectItem>
    exists: immutable.Map<string, string>
    unique: immutable.Map<string, number>
}

class RichFieldList extends React.PureComponent<RichFieldListProps, RichFieldListState> {

    constructor(props) {
        super(props);
        this.state = this.initialization(this.props.addins);
    }

    initialization(addins: immutable.Map<string, TraceField>) {
        return this.mapping(immutable.OrderedMap<string, TraceSelectItem>(), /* immutable.Map<string, number>(), */ immutable.OrderedMap<string, number>(), addins);
    }

    mapping(items: immutable.OrderedMap<string, TraceSelectItem>, /* exists: immutable.Map<string, number>,  */unique: immutable.Map<string, number>, addins: immutable.OrderedMap<string, TraceField>) {
        // let { items, exists } = this.state;
        const { nodeId } = this.props;
        let tfs = addins.valueSeq().toArray();
        let rows = immutable.List<string>();
        let exists = immutable.Map<string, string>();
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
            // const ue = unique.get(tf.id);
            // let size = ue != null ? ue : items.size;
            let tsi = new TraceSelectItem(item, alias, tf);
            let id = tsi.getTraceField().id;
            let size = rows.size;
            rows = rows.set(size, id)
            items = items.set(id, tsi);
            if (alias != null) {
                exists = exists.set(alias.alias, id);
                unique = unique.set(tf.id, size);
            } else {
                exists = exists.set(item.toString(), id);
                unique = unique.set(tf.id, size);
            }
        }
        return {
            rows: rows,
            items: items,
            exists: exists,
            unique: unique
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this.mapping(this.state.items, /* this.state.exists,  */this.state.unique, nextProps.addins));
    }

    rowGetter({ index }) {
        const { items, rows } = this.state;
        return items.get(rows.get(index));
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

    // private alias: immutable.Map<number, any> = immutable.Map<number, any>();
    private aliasInputs: immutable.Map<string, any> = immutable.Map<string, any>();

    public collect(): Array<TraceField> {
        const { nodeId } = this.props;
        const { items } = this.state;
        const upper: Array<TraceField> = [];
        /* this.alias.entrySeq().forEach(e => {
            const index: number = e[0];
            const value: TextField = e[1];
            if(value == null) { console.log(this.alias.toJS()) }
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
        }) */

        this.aliasInputs.entrySeq().forEach(e => {
            const id: string = e[0];
            const value: string = e[1];
            // if(value == null) { console.log(this.alias.toJS()) }
            const alias = value;
            const item = items.get(id);
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

    private aliasChange(event, value) {
        if(event && event.currentTarget && event.currentTarget.getAttribute) {
            const id = event.currentTarget.getAttribute('data-id');
            if(id) {
                this.aliasInputs = this.aliasInputs.set(id, value);
            }
        }
    }

    private deleteSelects: immutable.Set<TraceField> = immutable.Set<TraceField>();

    public collectDelete(): Array<TraceField> {
        return this.deleteSelects.toArray();
    }

    private deleteSelect(event) {
        let { items, unique, exists, rows } = this.state;
        if(event.currentTarget && event.currentTarget.getAttribute('data-index')) {
            let index = parseInt(event.currentTarget.getAttribute('data-index'));
            if(!isNaN(index)) {
                let id = rows.get(index);
                let item = items.get(id);
                if(item) {
                    let id = item.getTraceField().id;
                    let alias = item.alias;
                    rows = rows.remove(index);
                    items = items.remove(id);
                    unique = unique.remove(id);
                    this.deleteSelects = this.deleteSelects.add(item.getTraceField());
                    if(alias) {
                        exists = exists.remove(alias.alias);
                    }
                    this.setState({
                        items, unique, exists, rows
                    })
                }
            }
        }
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
                            return <TextField defaultValue={alias ? alias.alias : ""} name={uuid.v4()} data-index={rowIndex} data-id={data.getTraceField().id} onChange={this.aliasChange.bind(this)} /* ref={x => { this.alias = this.alias.set(rowIndex, x); }} */ />
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
                    <RV_Column
                        label={cn.option_select_tab_select_items_control_delete}
                        // cellDataGetter={(row) => { const data: TraceSelectItem = row.rowData; return <IconButton data-identity={data.index} onTouchTap={this.deleteItems.bind(this)}><Icon name={"clear"} /></IconButton> }}
                        cellRenderer={(row) => { const data: TraceSelectItem = row.rowData; return <IconButton data-index={row.rowIndex} data-canelhoc={true} onTouchTap={this.deleteSelect.bind(this)}><Icon name={"clear"} /></IconButton> }}
                        dataKey={'name'}
                        width={200}
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