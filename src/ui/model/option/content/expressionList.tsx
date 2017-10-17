import * as React from 'react'
import * as classnames from 'classnames'

import { List, ListItem } from 'material-ui/List'
import AutoComplete from 'material-ui/AutoComplete'
import DropDownMenu from 'material-ui/DropDownMenu'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'

import { cn } from '../../../text'
import { connect2 } from '../../../../common/connect'
import { DataModel, DataDefine } from '../../../../common/data'
import { Expression, operators, OptionOperatorEnumToSQL, OptionOperator, connects, OptionConnect, OptionConncetEnumToSQL } from '../../../../common/data/define/expression'
import { Translate, AtomOption, ConnectAtomOption, GroupParentheses } from '../../../../common/data/option/translate'

interface ExpressionListProps {
    expressions: Array<Translate>
    className?: any
    left?: Array<any>
    right?: Array<any>
}

class ExpressionList extends React.PureComponent<ExpressionListProps> {

    listRender() {
        const { expressions, left, right } = this.props;
        if (expressions == null) {
            return <List>
                <ListItem
                    primaryText={
                        <div className={"expression-item"} data-identity={"INIT"}>
                            <AutoComplete filter={AutoComplete.fuzzyFilter} dataSource={left} />
                            <AutoComplete filter={AutoComplete.fuzzyFilter} dataSource={operators} />
                            <AutoComplete filter={AutoComplete.fuzzyFilter} dataSource={right} />
                        </div>
                    }
                />
            </List>;
        }
        return this.listCreate(expressions);
    }

    listCreate(translates: Array<Translate>) {
        const items = new Array();
        for (let i = 0; i < translates.length; i++) {
            const translate = translates[i];
            const curr = this.listItemCreate(translate, i.toString());
            if (curr) { items.push(curr) };
        }
        return <List>{items}</List>
    }

    listItemCreate(tranlate: Translate, identity: string) {
        const { left, right } = this.props;
        if (tranlate instanceof GroupParentheses) {
            const items = new Array();
            const content = tranlate.content;
            for (let i = 0; i < content.length; i++) {
                const tc = content[i];
                const curr = this.listItemCreate(tc, identity + "." + i.toString());
                if (curr) { items.push(curr) };
            }
            return <ListItem
                primaryText="Parentheses"
                nestedItems={items}
            />
        }
        if (tranlate instanceof ConnectAtomOption) {
            const connect = tranlate.connect;
            const content = tranlate.content;
            return <ListItem
                primaryText={
                    <div className={"expression-item"} data-identity={identity}>
                        {
                            connect != null ?
                                <SelectField value={connect}>
                                    <MenuItem value={OptionConnect.AND} primaryText={OptionConncetEnumToSQL(OptionConnect.AND)} />
                                    <MenuItem value={OptionConnect.OR} primaryText={OptionConncetEnumToSQL(OptionConnect.OR)} />
                                </SelectField>
                                : null
                        }
                        <AutoComplete filter={AutoComplete.fuzzyFilter} dataSource={left} defaultValue={content.left.toString()} />
                        <AutoComplete filter={AutoComplete.fuzzyFilter} dataSource={operators} defaultValue={OptionOperatorEnumToSQL(content.operator)} />
                        <AutoComplete filter={AutoComplete.fuzzyFilter} dataSource={right} defaultValue={content.right.toString()} />
                    </div>
                }
            />
        }
        return null;
    }

    render() {
        const { expressions, className } = this.props
        return (
            <div className={className ? className : null}></div>
        );
    }
}

