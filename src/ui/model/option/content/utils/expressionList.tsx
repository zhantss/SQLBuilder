import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'

import { List, ListItem } from 'material-ui/List'
import AutoComplete from 'material-ui/AutoComplete'
import DropDownMenu from 'material-ui/DropDownMenu'
import SelectField from 'material-ui/SelectField'
import IconButton from 'material-ui/IconButton'
import MenuItem from 'material-ui/MenuItem'

import { SimpleIcon as Icon } from '../../../../icon'
import Select from './select'
import Input from './input'

import { cn } from '../../../../text'
import { connect2 } from '../../../../../common/connect'
import { DataModel, DataDefine } from '../../../../../common/data'
import { Expression, operators, OptionOperatorEnumToSQL, OptionOperator, connects, OptionConnect, OptionConncetEnumToSQL } from '../../../../../common/data/define/expression'
import { Translate, AtomOption, ConnectAtomOption, GroupParentheses } from '../../../../../common/data/option/translate'

interface ExpressionListProps {
    addition: any
    expressions: Array<Translate>
    flush(key_: any, new_: Expression): any
    left: Array<any>
    right: Array<any>
    className?: any
}

class ExpressionList extends React.PureComponent<ExpressionListProps> {

    ItemStyle = {
        padding: "0 9px"
    }

    AcRootLStyle = {
        width: "125px",
        marginLeft: "10px"
    }

    AcTextLStyle = {
        width: "125px"
    }

    AcRootRStyle = {
        width: "125px",
        marginLeft: "10px"
    }

    AcTextRStyle = this.AcTextLStyle

    AcRootOStyle = {
        width: "80px",
        marginLeft: "10px"
    }

    AcTextOStyle = {
        width: "80px"
    }

    AndOrRootStyle = {
        width: "48px",
    }

    AndOrTextStyle = {
        width: "48px"
    }

    temp = null;

    constructor(props) {
        super(props);
        this.temp = this.props.expressions;
    }

    updateTemp(exp) {
        this.temp = exp;
    }

    componentWillUnmount() {
        const { addition, flush } = this.props;
        flush(addition, this.temp)
    }

    newCAOTranslate(event) {
        const { expressions, addition, flush } = this.props;
        const identity = event.currentTarget.dataset.identity;
        let n: Array<Translate> = [].concat(expressions);
        let control = this.findTranslate(n, identity);
        if (control == null) {
            n.push(new ConnectAtomOption(new AtomOption(null, OptionOperator.Equal, null), n.length > 0 ? OptionConnect.AND : null));
        } else {
            if (control instanceof GroupParentheses) {
                control.content.push(new ConnectAtomOption(new AtomOption(null, OptionOperator.Equal, null), control.content.length > 0 ? OptionConnect.AND : null));
            }
        }
        this.updateTemp(n);
        flush(addition, n)
    }

    newGPTranslate(event) {
        const { expressions, addition, flush } = this.props;
        const identity = event.currentTarget.dataset.identity;
        let n: Array<Translate> = [].concat(expressions);
        let control = this.findTranslate(n, identity);
        if (control == null) {
            n.push(new GroupParentheses([], n.length > 0 ? OptionConnect.AND : null))
        } else {
            if (control instanceof GroupParentheses) {
                control.content.push(new GroupParentheses([], OptionConnect.AND));
            }
        }
        this.updateTemp(n);
        flush(addition, n)
    }

    deleteTranslate(event) {
        const { expressions, addition, flush } = this.props;
        const identity = event.currentTarget.dataset.identity;
        let n: Array<Translate> = [].concat(expressions);
        let find = this.findThisPreTranlate(n, identity);
        if (find == null) {
            return;
        }
        let control = find.control;
        let last = find.last;
        if (control == null) {
            n.splice(last, 1);
        }
        if (control instanceof GroupParentheses) {
            control.content.splice(last, 1);
            if (control.content.length >= 1) {
                control = control.content[0];
                if (control instanceof ConnectAtomOption || control instanceof GroupParentheses) {
                    control.connect = null;
                }
            }
        }
        if (n.length >= 1) {
            control = n[0];
            if (control instanceof ConnectAtomOption || control instanceof GroupParentheses) {
                control.connect = null;
            }
        }
        this.updateTemp(n);
        flush(addition, n)
    }

    findThisPreTranlate(exps: Array<Translate>, identity: string): any {
        let n: Array<Translate> = exps;
        let cor = identity.split(".");
        let length = cor.length;
        let last = null;
        if (length == 1) {
            return {
                last: Number(cor[0]),
                control: null
            };
        }
        last = cor[length - 1];
        cor = cor.slice(0, length - 1);
        let control: any = n;
        for (let c in cor) {
            const curr = Number(cor[c]);
            if (!isNaN(curr)) {
                if (control instanceof Array) {
                    control = control[curr]
                } else if (control instanceof GroupParentheses) {
                    control = control.content[curr];
                }
            } else {
                return null;
            }
        }
        return {
            last: Number(last),
            control: control
        };
    }

    findTranslate(exps: Array<Translate>, identity: string): any {
        let n: Array<Translate> = exps;
        const cor = identity.split(".");
        let control: any = n;
        for (let c in cor) {
            const curr = Number(cor[c]);
            if (!isNaN(curr)) {
                if (control instanceof Array) {
                    control = control[curr]
                } else if (control instanceof GroupParentheses) {
                    control = control.content[curr];
                }
            } else {
                return null;
            }
        }
        return control;
    }

    updateConnectTranslate(identity: string, value_: any) {
        const { expressions, addition, flush } = this.props;
        let n: Array<Translate> = [].concat(expressions);
        let control = this.findTranslate(n, identity);
        if (control instanceof ConnectAtomOption) {
            control.connect = value_;
            this.updateTemp(n);
        } else if (control instanceof GroupParentheses) {
            control.connect = value_;
            this.updateTemp(n);
        }
    }

    updateOperatorTranslate(identity: string, value_: any) {
        const { expressions, addition, flush } = this.props;
        let n: Array<Translate> = [].concat(expressions);
        let control = this.findTranslate(n, identity);
        if (control instanceof ConnectAtomOption) {
            control.content.operator = value_;
            this.updateTemp(n);
        }
    }

    updateInputTranslate(identity: string, right: boolean, value_: any) {
        const { expressions, addition, flush } = this.props;
        let n: Array<Translate> = [].concat(expressions);
        let control = this.findTranslate(n, identity);
        if (control instanceof ConnectAtomOption) {
            if (!right) {
                control.content.left = value_;
            } else {
                control.content.right = value_;
            }
            this.updateTemp(n);
        }
    }

    listRender() {
        const { expressions, left, right } = this.props;
        return this.listCreate(expressions);
    }

    listCreate(translates: Array<Translate>) {
        const items = new Array();
        for (let i = 0; i < translates.length; i++) {
            const translate = translates[i];
            const curr = this.listItemCreate(translate, i.toString());
            if (curr) { items.push(curr) };
        }
        items.push(<ListItem
            key={"new"}
            primaryText={this.toolItemCreate("new")}
            hoverColor="none"
            disabled={true}
            style={this.ItemStyle} />);
        return <List>{items}</List>
    }

    toolItemCreate(identity: string) {
        return <div className="list-add-btn">
            <IconButton data-identity={identity} onTouchTap={this.newCAOTranslate.bind(this)}><Icon name={"add"} /></IconButton>
            <IconButton data-identity={identity} onTouchTap={this.newGPTranslate.bind(this)}><Icon name={"chevron_left"} /><Icon name={"chevron_right"} /></IconButton>
        </div>
    }

    listItemCreate(tranlate: Translate, identity: string) {
        const { left, right } = this.props;
        if (tranlate instanceof GroupParentheses) {
            const items = new Array();
            const connect = tranlate.connect;
            const content = tranlate.content;
            for (let i = 0; i < content.length; i++) {
                const tc = content[i];
                const curr = this.listItemCreate(tc, identity + "." + i.toString());
                if (curr) { items.push(curr) };
            }
            items.push(<ListItem
                key={identity}
                primaryText={this.toolItemCreate(identity)}
                hoverColor="none"
                disabled={true}
                style={this.ItemStyle} />);
            return <ListItem
                key={identity}
                hoverColor="none"
                disabled={true}
                style={this.ItemStyle}
                primaryText={
                    <div className={"expression-item"} data-identity={identity}>
                        <div className="item-btn">
                            <IconButton data-identity={identity} onTouchTap={this.deleteTranslate.bind(this)}><Icon name={"clear"} /></IconButton>
                        </div>
                        <div className={"item-andor"}>
                            {
                                connect != null ?
                                    <Select
                                        identity={identity}
                                        name={identity + "-andor"}
                                        init={connect}
                                        update={this.updateConnectTranslate.bind(this)}
                                        style={this.AndOrRootStyle}
                                        textFieldStyle={this.AndOrTextStyle}
                                        openOnFocus={true}
                                        filter={AutoComplete.noFilter}
                                        dataSource={connects}
                                    />
                                    : null
                            }
                        </div>
                        {<span>GroupParentheses TODO</span>}
                    </div>
                }
                nestedItems={items}
            />
        }
        if (tranlate instanceof ConnectAtomOption) {
            const connect = tranlate.connect;
            const content = tranlate.content;
            return <ListItem
                key={identity}
                hoverColor="none"
                disabled={true}
                style={this.ItemStyle}
                primaryText={
                    <div className={"expression-item"} data-identity={identity}>
                        <div className="item-btn">
                            <IconButton data-identity={identity} onTouchTap={this.deleteTranslate.bind(this)}><Icon name={"clear"} /></IconButton>
                        </div>
                        <div className={"item-andor"}>
                            {
                                connect != null ?
                                    <Select
                                        identity={identity}
                                        name={identity + "-andor"}
                                        init={connect}
                                        update={this.updateConnectTranslate.bind(this)}
                                        style={this.AndOrRootStyle}
                                        textFieldStyle={this.AndOrTextStyle}
                                        openOnFocus={true}
                                        filter={AutoComplete.noFilter}
                                        dataSource={connects}
                                    />
                                    : null
                            }
                        </div>
                        <Input 
                            identity={identity}
                            name={identity + "-left"}
                            init={content.left}
                            update={this.updateInputTranslate.bind(this)}
                            style={this.AcRootLStyle} 
                            textFieldStyle={this.AcTextLStyle} 
                            openOnFocus={true} 
                            filter={AutoComplete.fuzzyFilter} 
                            dataSource={left} />
                        <Select
                            identity={identity}
                            name={identity + "-operator"}
                            init={content.operator}
                            update={this.updateOperatorTranslate.bind(this)}
                            style={this.AcRootOStyle}
                            textFieldStyle={this.AcTextOStyle}
                            openOnFocus={true}
                            filter={AutoComplete.noFilter}
                            dataSource={operators}
                        />
                        <Input 
                            identity={identity}
                            name={identity + "-right"}
                            init={content.right}
                            right={true}
                            update={this.updateInputTranslate.bind(this)}
                            style={this.AcRootRStyle} 
                            textFieldStyle={this.AcTextRStyle} 
                            openOnFocus={true} 
                            filter={AutoComplete.fuzzyFilter} 
                            dataSource={right} />
                    </div>
                }
            />
        }
        return null;
    }

    render() {
        const { expressions, className } = this.props
        return (
            <div className={className ? className : null}>
                {this.listRender()}
            </div>
        );
    }
}


export default ExpressionList