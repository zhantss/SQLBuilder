/* import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'

import { List, ListItem } from 'material-ui/List'
import AutoComplete from 'material-ui/AutoComplete'
import Subheader from 'material-ui/Subheader'
import Divider from 'material-ui/Divider'
import Checkbox from 'material-ui/Checkbox'
import IconButton from 'material-ui/IconButton'

import { SimpleIcon as Icon } from '../../../../icon'
import Select from './select'
import Input from './input'

import { cn } from '../../../../text'
import { connect2 } from '../../../../../common/connect'
import { DataModel, DataDefine } from '../../../../../common/data'
import { Expression, AtomExpression, Value, Column, Function } from '../../../../../common/data/define/expression'
import { Option, OptionTarget } from '../../../../../common/data/option'
import { SelectableExpression } from '../../../../../common/data/option/selectable'


interface FieldListProps {
    table: Option.TableOption
    flush(items: Array<SelectableExpression>): any
    className?: any
}

class FieldList extends React.PureComponent<FieldListProps> {

    constructor(props) {
        super(props);
        this.items = this.props.table.items ? this.props.table.items : [];
    }

    items: Array<SelectableExpression> = null;

    componentWillReceiveProps(nextProps) {
        this.items = nextProps.table.items;
    }

    componentWillUnmount() {
        const { flush } = this.props;
        flush(this.items)
    }

    handleCheck(event, isInputChecked) {
        const identity = event.currentTarget.dataset.identity;
        const index = Number(identity);
        if (!isNaN(index) && this.items && this.items && this.items[index]) {
            this.items[index].checked = isInputChecked;
        }
    }

    pushCustomize() {
        const { flush } = this.props;
        this.items.push(new SelectableExpression(new Value(null), true));
        flush(this.items)
    }

    delteCustomize(event) {
        const { flush } = this.props;
        const identity = event.currentTarget.dataset.identity;
        const index = Number(identity);
        if (!isNaN(index) && this.items && this.items && this.items[index]) {
            this.items.splice(index, 1);
        }
        flush(this.items);
    }

    changeCustomizeValue(identity: any, right: boolean, value_: any) {
        const index = Number(identity);
        if (!isNaN(index) && this.items && this.items && this.items[index]) {
            this.items[index].content = new Value(value_);
        }
    }

    listRender() {
        const items = new Array();
        const length = this.items.length;
        for (let i = 0; i < length; i++) {
            const item = this.items[i];
            let primary = null;
            if (item.content instanceof Column) {
                primary = <span>{item.content.toString()}</span>
                items.push(
                    <ListItem
                        key={i}
                        leftCheckbox={<Checkbox data-identity={i} defaultChecked={item.isChecked()} onCheck={this.handleCheck.bind(this)} />}
                        primaryText={primary}
                    />);
            } else {
                primary = <Input
                    identity={i}
                    name={i + ".customize"}
                    init={item.content}
                    update={this.changeCustomizeValue.bind(this)}
                    dataSource={[]}
                />
                items.push(
                    <ListItem
                        key={i}
                        style={{ padding: "0 16px 0 72px"}}
                        leftCheckbox={<Checkbox data-identity={i} checked={true} disabled={true} />}
                        rightIconButton={<IconButton data-identity={i} onTouchTap={this.delteCustomize.bind(this)}><Icon name={"clear"} /></IconButton>}
                        primaryText={primary}
                    />);
            }
        }
        items.push(
            <ListItem
                key={"add"}
                primaryText={
                    <div className="list-add-btn">
                        <IconButton onTouchTap={this.pushCustomize.bind(this)}><Icon name={"add"} /></IconButton>
                    </div>
                }
                hoverColor="none"
                disabled={true} />
        )
        return <List>{items}</List>
    }

    render() {
        const { className } = this.props;
        return (
            <div className={className ? className : null}>
                {this.listRender()}
            </div>
        );
    }
}

export default FieldList */