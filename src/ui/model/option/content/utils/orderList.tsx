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
import { Translate, ConnectAtomOption, GroupParentheses } from '../../../../../common/data/option/translate'
import { TraceSelectItem, TraceField } from '../../../../../common/data/option/traceability'
import { OrderByItem, Order } from '../../../../../common/data/option/option'

interface OrderListProps {
    // addins: immutable.Map<string, TraceField>
    order: Order
    nodeId: string
    className?: any
}

interface OrderListState {
    items: immutable.Map<number, ListItem>
    // exists: immutable.Map<string, number>
    unique: immutable.Map<string, number>
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

    initialization(order: Order) {
        return this.mapping(immutable.Map<number, ListItem>(), /* immutable.Map<string, number>(),  */immutable.Map<string, number>(), order);
    }

    mapping(items: immutable.Map<number, ListItem>, /* exists: immutable.Map<string, number>, */ unique: immutable.Map<string, number>, order: Order) {
        // let { items, exists } = this.state;
        const { nodeId } = this.props;
        let orders = order.sequence().toArray();
        for (let x = 0; x < orders.length; x++) {
            const oitem = orders[x];
            const ue = unique.get(oitem.id);
            if (ue != null) continue;
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
            tsi.index = size;
            items = items.set(size, new ListItem(oitem.id, tsi, oitem));
            unique = unique.set(oitem.id, size);
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
        const ne = items.get(newIndex);
        if (oe && ne) {
            items = items.set(newIndex, oe);
            unique = unique.set(oe.order.id, newIndex);
            items = items.set(oldIndex, ne);
            unique = unique.set(ne.order.id, oldIndex);
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

    private desc: immutable.Map<string, any> = immutable.Map<string, any>()

    public collect(): Order {
        const { nodeId } = this.props;
        const { items } = this.state;
        const upper: Array<OrderByItem> = [];
        const order = new Order();
        for (let x = 0; x < items.size; x++) {
            const item = items.get(x)
            if(this.desc.has(item.order.id)) {
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