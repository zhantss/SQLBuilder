import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'

import AutoComplete from 'material-ui/AutoComplete'
import IconButton from 'material-ui/IconButton'
import MenuItem from 'material-ui/MenuItem'

import { AutoSizer as RV_AutoSizer, Table as RV_Table, Column as RV_Column, SortDirection as ev_SortDirection, SortIndicator as RV_SortIndicator } from 'react-virtualized'

import { SimpleIcon as Icon } from '../../../../icon'
import Select from './select'
import Input from './input'

import { cn } from '../../../../text'
import { connect2 } from '../../../../../common/connect'
import { DataModel, DataDefine } from '../../../../../common/data'
import { Expression, AtomExpression, Value, Column, Function } from '../../../../../common/data/define/expression'
import { Option } from '../../../../../common/data/option'
import { Translate, AtomOption, ConnectAtomOption, GroupParentheses } from '../../../../../common/data/option/translate'
import { TraceSelectItem } from '../../../../../common/data/option/traceability'

interface RichFieldListProps {
    items: Array<TraceSelectItem>
    className?: any
}

class RichFieldList extends React.PureComponent<RichFieldListProps> {

    constructor(props) {
        super(props);
        this.items = this.props.items;
    }

    items: Array<TraceSelectItem> = null

    componentWillReceiveProps(nextProps) {
        this.items = nextProps.items;
    }

    componentWillUnmount() {

    }

    rowGetter(index) {
        const { items } = this.props;
        return items[index] ? items[index] : null;
    }

    selectRender() {
        const { items } = this.props;
        return <RV_AutoSizer disableHeight>
            {({ width }) => (<RV_Table headerHeight={20} height={450} width={width} rowHeight={32} rowGetter={this.rowGetter.bind(this)} rowCount={items.length} >
            <RV_Column 
                    label={'Name'}
                    cellDataGetter={(row) => { const data: TraceSelectItem = row.rowData; return data.item.content instanceof Column ? data.item.content.column : data.item.content.toString(); }}
                    dataKey={'name'}
                    width={120}
                />
                <RV_Column 
                    label={'Alias'}
                    cellDataGetter={(row) => { const data: TraceSelectItem = row.rowData; return data.item.alias ? data.item.alias : "" }}
                    dataKey={'alias'}
                    width={120}
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