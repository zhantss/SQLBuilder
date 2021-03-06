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
import { Alias, OrderMode, ordermodes } from '../../../../../common/data/define/extra'
import { Option } from '../../../../../common/data/option'
import { Translate } from '../../../../../common/data/option/translate'
import { TraceSelectItem, TraceField } from '../../../../../common/data/option/traceability'
import { OrderByItem, OrderOption } from '../../../../../common/data/option/option'
import shouldCancelStart from './shouldCancelStart'

interface OrderListProps {
    // addins: immutable.Map<string, TraceField>
    order: OrderOption
    nodeId: string
    className?: any
}

interface OrderListState {
    items: immutable.List<ListItem>
    // exists: immutable.Map<string, number>
    unique: immutable.Set<string>
}

const SortableTable = SortableContainer(RV_Table, { withRef: true })
const SortableTableRowRenderer = SortableElement((props) => {
    return RV_defaultTableRowRenderer({ index: props.inx, ...props });
});

class ListItem {
    id: string
    item: TraceSelectItem
    order: OrderByItem
    constructor(id: string, item: TraceSelectItem, order: OrderByItem) {
        this.id = id;
        this.item = item;
        this.order = order;
    }
}

class OrderList extends React.PureComponent<OrderListProps, OrderListState> {

    constructor(props) {
        super(props);
        this.state = this.initialization(this.props.order);
    }

    initialization(order: OrderOption) {
        return this.mapping(immutable.List<ListItem>(), /* immutable.Map<string, number>(),  */immutable.Set<string>(), order);
    }

    mapping(items: immutable.List<ListItem>, /* exists: immutable.Map<string, number>, */ unique: immutable.Set<string>, order: OrderOption) {
        // let { items, exists } = this.state;
        const { nodeId } = this.props;
        let orders = order.sequence().toArray();
        for (let x = 0; x < orders.length; x++) {
            const oitem = orders[x];
            // const ue = unique.has(oitem.id);
            if (unique.has(oitem.id)) continue;
            const current = oitem.field.trace.current(nodeId);
            if (current == null) continue;

            let item: AtomExpression = null;
            let alias: Alias = null;
            if (nodeId == oitem.field.trace.creater.id) {
                item = current.content;
                alias = current.alias;
            } else if (current.alias && oitem.field.trace.getDesignation(nodeId) == null) {
                item = new Column(current.alias.alias);
            } else {
                item = current.content;
                alias = current.alias;
            }

            if (item == null) continue;
            let size = items.size;
            const tsi = new TraceSelectItem(item, alias, oitem.field);
            // tsi.index = size;
            items = items.set(size, new ListItem(oitem.id, tsi, oitem));
            unique = unique.add(oitem.id);
        }
        return {
            items: items,
            // exists: exists,
            unique: unique
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this.mapping(this.state.items, /* this.state.exists,  */this.state.unique, nextProps.order));
    }

    rowGetter({ index }) {
        const { items } = this.state;
        return items.get(index);
    }

    onSortEnd({ oldIndex, newIndex }) {
        let { items, unique } = this.state;
        const oe = items.get(oldIndex);
        /* const oe = items.get(oldIndex);
        const ne = items.get(newIndex);
        const diff = newIndex > oldIndex ? -1 : newIndex == oldIndex ? 0 : 1;
        let curr = newIndex;
        const oe = items.get(oldIndex);
        let nitems = immutable.Map<number, ListItem>(items);
        while(curr != oldIndex) {
            const ce = items.get(curr);
            curr = curr + diff;
            nitems = nitems.set(curr, ce);
            // items = items.set(curr - 1, ce);
            unique = unique.set(ce.order.id, curr);
        }
        nitems = nitems.set(newIndex, oe);
        // items = items.set(newIndex, oe);
        unique = unique.set(oe.order.id, newIndex);
        items = nitems;
        /* if (oe && ne) {
            items = items.set(newIndex, oe);
            unique = unique.set(oe.order.id, newIndex);
            items = items.set(oldIndex, ne);
            unique = unique.set(ne.order.id, oldIndex);
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
        /* if(props.style) {
            props.style = { zIndex: 10005, ...props.style }
        } else {
            props.style = { zIndex: 10005 }
        } */
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

    deleteItems(event) {
        let { items, unique } = this.state;
        if(event.currentTarget && event.currentTarget.getAttribute('data-index')) {
            let index = parseInt(event.currentTarget.getAttribute('data-index'));
            if(!isNaN(index)) {
                let item = items.get(index);
                if(item) {
                    let id = item.order.id;
                    items = items.remove(index);
                    unique = unique.remove(id);
                    this.setState({
                        items, unique
                    })
                }
            }
        }
    }

    private desc: immutable.Map<string, any> = immutable.Map<string, any>()

    public collect(): OrderOption {
        const { nodeId } = this.props;
        const { items } = this.state;
        const upper: Array<OrderByItem> = [];
        const order = new OrderOption();
        for (let x = 0; x < items.size; x++) {
            const item = items.get(x)
            if (this.desc.has(item.order.id)) {
                const desc: Select = this.desc.get(item.order.id);
                item.order.mode = desc.collectValue().index;
            }
            order.push(item.order);
        }
        return order;
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
                    gridStyle={{ outline: 0 }}
                    helperClass='sortable-helper'
                    // onSortMove={event => console.log(event)}
                    // pressDelay={100}
                    lockAxis={"y"}
                    lockToContainerEdges={true}
                >
                    {/* <RV_Column
                        label={'index'}
                        cellDataGetter={(row) => { return row.rowData.index; }}
                        dataKey={'index'}
                        width={60}
                    /> */}
                    <RV_Column
                        label={cn.option_select_tab_order_items_table_des}
                        cellRenderer={({ rowData, rowIndex }) => {
                            const data: ListItem = rowData;
                            const desc = data.order.mode;
                            return <Select
                                identity={data.order.id}
                                name={data.order.id}
                                init={desc}
                                dataSource={ordermodes}
                                ref={x => { this.desc = this.desc.set(data.order.id, x); }}
                            />
                        }}
                        dataKey={'name'}
                        width={200}
                    />
                    <RV_Column
                        label={cn.option_select_tab_select_items_table_name}
                        cellDataGetter={(row) => { const data: ListItem = row.rowData; return data.item.item instanceof Column ? data.item.item.column : data.item.item.toString(); }}
                        dataKey={'name'}
                        width={200}
                    />
                    <RV_Column
                        label={cn.option_select_tab_select_items_table_from}
                        cellDataGetter={(row) => { const data: ListItem = row.rowData; return data.item.from() }}
                        dataKey={'from'}
                        width={300}
                    />
                    <RV_Column
                        label={cn.option_select_tab_select_items_table_datasource}
                        cellDataGetter={(row) => { const data: ListItem = row.rowData; return data.item.datasource() }}
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

export default OrderList