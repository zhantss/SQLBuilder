import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'

import AutoComplete from 'material-ui/AutoComplete'
import { Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton'
import MenuItem from 'material-ui/MenuItem'

import { SimpleIcon as Icon } from '../../../../icon'
import Select from './select'
import Input from './input'

import { cn } from '../../../../text'
import { connect2 } from '../../../../../common/connect'
import { DataModel, DataDefine } from '../../../../../common/data'
import { Expression, AtomExpression, Value, Column, Function } from '../../../../../common/data/define/expression'
import { Option } from '../../../../../common/data/option'
import { Translate, AtomOption, ConnectAtomOption, GroupParentheses } from '../../../../../common/data/option/translate'

interface RichFieldListProps {
    items: Array<AtomExpression>
    groupby: Array<AtomExpression>
    className?: any
}

class RichFieldList extends React.PureComponent<RichFieldListProps> {

    constructor(props) {
        super(props);
        this.items = this.props.items;
        this.groupby = this.props.groupby;
    }

    items: Array<AtomExpression> = null;
    groupby: Array<AtomExpression> = null

    componentWillReceiveProps(nextProps) {
        this.items = nextProps.items;
        this.groupby = nextProps.groupby;
    }

    componentWillUnmount() {
        
    }

    selectRender() {
        

        return [];
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