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
import Select from './select'

import { cn } from '../../../../text'
import { connect2 } from '../../../../../common/connect'
import { DataModel, DataDefine } from '../../../../../common/data'
import { GraphicParser } from '../../../../../common/data/utils'
import { Expression, AtomExpression, Value, Column, Function } from '../../../../../common/data/define/expression'
import { Alias } from '../../../../../common/data/define/extra'
import { Option } from '../../../../../common/data/option'
import { Translate } from '../../../../../common/data/option/translate'
import { TraceSelectItem, TraceField } from '../../../../../common/data/option/traceability'
import { GroupOption } from '../../../../../common/data/option/option'
import shouldCancelStart from './shouldCancelStart'

interface GroupListProps {
    // addins: immutable.Map<string, TraceField>
    group: GroupOption
    nodeId: string
    className?: any
}

interface GroupListState {
    items: immutable.List<TraceSelectItem>
    // exists: immutable.Map<string, number>
    unique: immutable.Set<string>
}

const SortableTable = SortableContainer(RV_Table, { withRef: true })
const SortableTableRowRenderer = SortableElement((props) => {
    return RV_defaultTableRowRenderer({ index: props.inx, ...props });
});

class GroupList extends React.PureComponent<GroupListProps, GroupListState> {

    constructor(props) {
        super(props);
        this.state = this.initialization(this.props.group);
    }

    initialization(group: GroupOption) {
        return this.mapping(immutable.List<TraceSelectItem>(), /* immutable.Map<string, number>(),  */immutable.Set<string>(), group);
    }

    mapping(items: immutable.List<TraceSelectItem>, /* exists: immutable.Map<string, number>, */ unique: immutable.Set<string>, group: GroupOption) {
        // let { items, exists } = this.state;
        const { nodeId } = this.props;
        let groups = group.sequence().toArray();
        for (let x = 0; x < groups.length; x++) {
            const gitem = groups[x];
            // const ue = unique.has(gitem.id);
            if (unique.has(gitem.id)) continue;
            const current = gitem.trace.current(nodeId);
            if (current == null) continue;

            let item: AtomExpression = null;
            let alias: Alias = null;
            if (nodeId == gitem.trace.creater.id) {
                item = current.content;
                alias = current.alias;
            } else if (current.alias && gitem.trace.getDesignation(nodeId) == null) {
                item = new Column(current.alias.alias);
            } else {
                item = current.content;
                alias = current.alias;
            }

            if (item == null) continue;
            let size = items.size;
            const tsi = new TraceSelectItem(item, alias, gitem);
            // tsi.index = size;
            items = items.set(size, tsi);
            unique = unique.add(gitem.id);
        }
        return {
            items: items,
            // exists: exists,
            unique: unique
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this.mapping(this.state.items, /* this.state.exists,  */this.state.unique, nextProps.group));
    }

    rowGetter({ index }) {
        const { items } = this.state;
        return items.get(index);
    }

    onSortEnd({ oldIndex, newIndex }) {
        let { items, unique } = this.state;
        const oe = items.get(oldIndex);
        // const ne = items.get(newIndex);
       /*  if (oe && ne) {
            items = items.set(newIndex, oe);
            unique = unique.set(oe.getTraceField().id, newIndex);
            items = items.set(oldIndex, ne);
            unique = unique.set(ne.getTraceField().id, oldIndex);
        } */
        if(oe) {
            items = items.remove(oldIndex);
            items = items.insert(newIndex, oe);
        }
        this.setState({
            items, unique
        })
    }

    rowRenderer(props) {
        const inx = props.index;
        props = { inx: inx, ...props }
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

    // private desc: immutable.Map<string, any> = immutable.Map<string, any>()

    deleteItems(event) {
        let { items, unique } = this.state;
        if(event.currentTarget && event.currentTarget.getAttribute('data-index')) {
            let index = parseInt(event.currentTarget.getAttribute('data-index'));
            if(!isNaN(index)) {
                let item = items.get(index);
                if(item) {
                    let id = item.getTraceField().id;
                    items = items.remove(index);
                    unique = unique.remove(id);
                    this.setState({
                        items, unique
                    })
                }
            }
        }
    }

    public collect(): GroupOption {
        const { nodeId } = this.props;
        const { items } = this.state;
        const group = new GroupOption();
        const upper: Array<TraceField> = [];
        for (let x = 0; x < items.size; x++) {
            const item = items.get(x);
            group.push(item.getTraceField());
        }
        return group;
    }

    private columnRender() {
        const { className } = this.props;
        const { items } = this.state;
        return <RV_AutoSizer disableHeight className={className}>
            {({ width }) => (
                <SortableTable headerHeight={20} height={450} width={width} rowHeight={40}
                    onSortEnd={this.onSortEnd.bind(this)}
                    rowGetter={this.rowGetter.bind(this)}
                    rowCount={items.size}
                    rowClassName={this.rowClassName.bind(this)}
                    rowRenderer={this.rowRenderer}
                    noRowsRenderer={this.noRowsRenderer}
                    shouldCancelStart={shouldCancelStart}
                    pressDelay={100}
                    gridStyle={{ outline: 0 }}
                    helperClass='sortable-helper'
                >
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
                    <RV_Column
                        label={cn.option_select_tab_select_items_control_delete}
                        // cellDataGetter={(row) => { const data: TraceSelectItem = row.rowData; return <IconButton data-identity={data.index} onTouchTap={this.deleteItems.bind(this)}><Icon name={"clear"} /></IconButton> }}
                        cellRenderer={(row) => { const data: TraceSelectItem = row.rowData; return <IconButton data-index={row.rowIndex} data-canelhoc={true} onTouchTap={this.deleteItems.bind(this)}><Icon name={"clear"} /></IconButton> }}
                        dataKey={'name'}
                        width={200}
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

export default GroupList