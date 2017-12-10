import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'
import * as immutable from 'immutable'

import { List, ListItem } from 'material-ui/List'
import AutoComplete from 'material-ui/AutoComplete'
import DropDownMenu from 'material-ui/DropDownMenu'
import SelectField from 'material-ui/SelectField'
import IconButton from 'material-ui/IconButton'
import MenuItem from 'material-ui/MenuItem'

import { SimpleIcon as Icon } from '../../../../icon'
import Select from './select'
import Input from './input'
import ExpressionInput from './expressionInput'

import { cn } from '../../../../text'
import { connect2 } from '../../../../../common/connect'
import { DataModel, DataDefine } from '../../../../../common/data'
import { Expression, operators, OptionOperatorEnumToSQL, OptionOperator, connects, OptionConnect, OptionConncetEnumToSQL, Value, Column, Function, Parentheses } from '../../../../../common/data/define/expression'
import { Translate, Conditional, ConditionalParentheses, TraceTerm, OperatorTerm, ConnectTerm } from '../../../../../common/data/option/translate'
import { Creater, TraceField } from '../../../../../common/data/option/traceability';

interface ExpressionListProps {
    expressions: Array<Translate>
    db: immutable.Map<string, immutable.List<TraceField>>
    group: immutable.Map<string, Creater>
    match?: boolean
    className?: any
    targetId: string
    nodeId: string
}

interface ExpressionListState {
    data: immutable.Map<any, any>
}

interface ElementTreeNode { }

class ConnectNode implements ElementTreeNode {
    identity: Array<number>
    connect?: Select
    left?: ExpressionInput
    operator?: Select
    right?: ExpressionInput
    constructor(identity: Array<number>) {
        this.identity = identity;
    }
}

class GroupNode implements ElementTreeNode {
    identity: Array<number>
    connect?: any
    constructor(identity: Array<number>) {
        this.identity = identity;
    }
}

class ElementList {
    nodes: immutable.Map<any, any>
    constructor() {
        this.nodes = immutable.Map<any, any>()
    }

    setElementNode(sequence: Array<number>, node: ElementTreeNode) {
        this.nodes = this.nodes.setIn([].concat(sequence).concat(['data']), node);
    }

    getElementNode(sequence: Array<number>): ElementTreeNode {
        return this.nodes.getIn([].concat(sequence).concat(['data']));
    }

    combine(data: immutable.Map<any, any>, targetId: string, nodeId: string) {
        const translates = new Array<Translate>();
        if (this.nodes && data && targetId && nodeId) {
            data.toSeq().forEach((value, index) => {
                if (index == 'number') { } else {
                    const sq = [].concat([index]);
                    const translate = this.process(value, sq, data, targetId, nodeId);
                    if (translate) translates.push(translate);
                }
            })
        }
        return translates;
    }

    private process(value: immutable.Map<any, any>, index: Array<any>, data: immutable.Map<any, any>, targetId: string, nodeId: string) {
        if (value == null) return null;
        const ori = value.get('data');
        const del = value.get('delete');
        const el = this.nodes.getIn([].concat(index).concat('data'));
        if (ori && el && !del) {
            if (el instanceof ConnectNode && ori instanceof Conditional) {
                const connect_state = el.connect ? el.connect.collectValue() : null;
                if (connect_state) ori.connect = new ConnectTerm(connect_state.index, connect_state);

                const left_state = el.left ? el.left.collectValue() : null;
                if (left_state) {
                    const dbv = left_state.dbValue;
                    const custormv = left_state.customValue;
                    if (dbv) {
                        const tf: TraceField = dbv.value;
                        const current = tf.trace.current(targetId);
                        ori.left = new TraceTerm(tf.trace.creater.id, tf.id, current ? current.content.clone() : tf.trace.creater.item.content.clone(), left_state);
                    } else if (custormv) {
                        ori.left = new TraceTerm(null, null, new Value(custormv), left_state);
                    }
                }

                const right_state = el.right ? el.right.collectValue() : null;
                if (right_state) {
                    const dbv = right_state.dbValue;
                    const custormv = right_state.customValue;
                    if (dbv) {
                        const tf: TraceField = dbv.value;
                        const current = tf.trace.current(targetId);
                        ori.right = new TraceTerm(tf.trace.creater.id, tf.id, current ? current.content.clone() : tf.trace.creater.item.content.clone(), right_state);
                    } else if (custormv) {
                        ori.right = new TraceTerm(null, null, new Value(custormv), right_state);
                    }
                }

                const operator_state = el.operator ? el.operator.collectValue() : null;
                if (operator_state) ori.operator = new OperatorTerm(operator_state.index, operator_state);
            } else if (el instanceof GroupNode && ori instanceof ConditionalParentheses) {
                const connect_state = el.connect.collectValue();
                if (connect_state) ori.connect = new ConnectTerm(connect_state.index, connect_state);

                const translates = [];
                value.toSeq().forEach((value, inx) => {
                    if (inx != 'data' && inx != 'delete') {
                        const sq = [].concat(index).concat([inx]);
                        const translate = this.process(value, sq, data, targetId, nodeId);
                        if (translate) translates.push(translate);
                    }
                })
                ori.content = translates;
            }
            return ori;
        }
        return null;
    }
}

class ExpressionList extends React.PureComponent<ExpressionListProps, ExpressionListState> {

    ItemStyle = {
        padding: "0 9px"
    }

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

    constructor(props) {
        super(props);
        this.state = {
            data: this.translateLoad(this.props)
        }
    }

    private elementRefs = new ElementList();

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: this.translateLoad(nextProps)
        })
        // this.data = this.translateLoad(nextProps.expressions);
    }

    componentWillMount() {
        // this.match(this.props);
    }

    collectTranslate() {
        const { targetId, nodeId } = this.props;
        const { data } = this.state;
        return this.elementRefs.combine(data, targetId, nodeId);
    }

    private translateLoad(props: ExpressionListProps): immutable.Map<any, any> {
        const expressions = props.expressions;
        let data = immutable.Map<any, any>();
        for (let i = 0; i < expressions.length; i++) {
            const translate = expressions[i];
            data = data.merge(this.processTranslate(translate, [i]));
        }
        const match = props.match;
        const group = props.group;
        const db = props.db;
        if (expressions.length == 0 && match && group && db) {
            const id = props.targetId;
            if (db.has(id)) {
                const left = db.get(id);
                const right = (() => {
                    let list = immutable.List<TraceField>();
                    db.toSeq().forEach((value, key) => {
                        if (key != id) { list = immutable.List<TraceField>(list.concat(value)); }
                    })
                    return list;
                })();
                left.forEach(l => {
                    const lc = l.trace.current(id);
                    const lname = lc.content.toString()
                    right.forEach(r => {
                        const rc = r.trace.current(id);
                        const rname = rc.content.toString();
                        if (lname == rname) {
                            data = data.setIn([data.size, 'data'],
                                new Conditional(
                                    new TraceTerm(
                                        l.trace.creater.id,
                                        l.id,
                                        lc.content.clone(),
                                        {
                                            limit: l.trace.creater.id,
                                            groupValue : { label: l.trace.creater.name, value: l.trace.creater },
                                            dbValue: { label: "", value: l },
                                            customValue: null
                                        }
                                    ),
                                    new OperatorTerm(OptionOperator.Equal, { index: OptionOperator.Equal, text: OptionOperatorEnumToSQL(OptionOperator.Equal) }),
                                    new TraceTerm(
                                        r.trace.creater.id,
                                        r.id,
                                        rc.content.clone(),
                                        {
                                            limit: r.trace.creater.id,
                                            groupValue : { label: r.trace.creater.name, value: r.trace.creater },
                                            dbValue: { label: "", value: r },
                                            customValue: null
                                        }
                                    ),
                                    data.size > 0 ? new ConnectTerm(OptionConnect.AND, { index: OptionConnect.AND, text: OptionConncetEnumToSQL(OptionConnect.AND) }) : null
                                )
                            )
                        }
                    })
                });
                data = data.setIn(['number'], data.size);
            }
        } else {
            data = data.setIn(['number'], expressions.length);
        }
        return data;
    }

    private processTranslate(translate: Translate, identity: Array<number>): immutable.Map<any, any> {
        let data = immutable.Map<any, any>();
        if (translate instanceof ConditionalParentheses) {
            data = data.setIn([].concat(identity).concat(['data']), translate);
            const content = translate.content;
            for (let i = 0; i < content.length; i++) {
                this.processTranslate(content[i], [].concat(identity).concat([i]));
            }
            data = data.setIn([].concat(identity).concat(['number']), content.length);
        } else if (translate instanceof Conditional) {
            data = data.setIn([].concat(identity).concat(['data']), translate);
        }
        return data;
    }

    private newCAOTranslate(event) {
        let { nodeId } = this.props;
        let { data } = this.state;
        const identity: string = event.currentTarget.dataset.identity;
        const ary: Array<number> = identity.split('-').map(x => {
            return parseInt(x);
        }).filter(x => {
            return x != null && !isNaN(x);
        });
        if (ary.length == 0) {
            let number = data.getIn(['number']);
            const size = data.size;
            const el = //new ConnectAtomOption(new AtomOption(null, OptionOperator.Equal, null), size > 0 ? OptionConnect.AND : null)
                new Conditional(
                    new TraceTerm(null, null, null),
                    new OperatorTerm(OptionOperator.Equal),
                    new TraceTerm(null, null, null),
                    number > 0 ? new ConnectTerm(OptionConnect.AND) : null);
            data = data.setIn([size - 1, 'data'], el);
            if (number == null || number < 0) number = 0;
            data = data.setIn(['number'], number + 1);
        } else {
            const target = data.getIn(ary);
            if (target) {
                let number = target.getIn(['number']);
                const size = target.size;
                const el = // new ConnectAtomOption(new AtomOption(null, OptionOperator.Equal, null), size > 0 ? OptionConnect.AND : null)
                    new Conditional(
                        new TraceTerm(null, null, null),
                        new OperatorTerm(OptionOperator.Equal),
                        new TraceTerm(null, null, null),
                        number > 0 ? new ConnectTerm(OptionConnect.AND) : null);
                data = data.setIn([].concat(ary).concat([size - 2, 'data']), el);
                if (number == null || number < 0) number = 0;
                data = data.setIn([].concat(ary).concat(['number']), number + 1);
            } /* else {
                const el = // new ConnectAtomOption(new AtomOption(null, OptionOperator.Equal, null), null)
                    new Conditional(
                        new TraceTerm(null, null, null),
                        new OperatorTerm(OptionOperator.Equal),
                        new TraceTerm(null, null, null),
                        null);
                data = data.setIn([].concat(ary).concat(['data']), el);
            } */
        }
        this.setState({
            data: data
        })
    }

    private newGPTranslate(event) {
        let { data } = this.state;
        const identity: string = event.currentTarget.dataset.identity;
        const ary: Array<number> = identity.split('-').map(x => {
            return parseInt(x);
        }).filter(x => {
            return x != null && !isNaN(x);
        });
        if (ary.length == 0) {
            let number = data.getIn(['number']);
            const size = data.size;
            const el = // new GroupParentheses([], size > 0 ? OptionConnect.AND : null);
                new ConditionalParentheses([], number > 0 ? new ConnectTerm(OptionConnect.AND) : null);
            data = data.setIn([size - 1, 'data'], el);
            data = data.setIn([size - 1, 'number'], 0);
            if (number == null || number < 0) number = 0;
            data = data.setIn(['number'], number + 1);
        } else {
            const target = data.getIn(ary);
            if (target) {
                let number = target.getIn(['number']);
                const size = target.size;
                const el = // new GroupParentheses([], size > 0 ? OptionConnect.AND : null);
                    new ConditionalParentheses([], number > 0 ? new ConnectTerm(OptionConnect.AND) : null);
                data = data.setIn([].concat(ary).concat([size - 2, 'data']), el);
                data = data.setIn([].concat(ary).concat([size - 2, 'number']), 0);
                if (number == null || number < 0) number = 0;
                data = data.setIn([].concat(ary).concat(['number']), number + 1);
            } /* else {
                const el = // new ConnectAtomOption(new AtomOption(null, OptionOperator.Equal, null), null)
                    new ConditionalParentheses([], null);
                data = data.setIn([].concat(ary).concat(['data']), el);
            } */
        }
        this.setState({
            data: data
        })
    }

    private deleteTranslate(event) {
        let { data } = this.state;
        const identity: string = event.currentTarget.dataset.identity;
        const ary: Array<number> = identity.split('-').map(x => {
            return parseInt(x);
        }).filter(x => {
            return x != null && !isNaN(x);
        });
        if (ary && ary.length > 0) {
            const keypath = [].concat(ary).concat(['data']);
            const target = data.getIn(keypath);
            const cutp = ary.slice(0, ary.length - 1);
            const number = data.getIn([].concat(cutp).concat(['number']));
            if (target != null && number != null) {
                data = data.setIn([].concat(ary).concat(['delete']), true);
                data = data.setIn([].concat(cutp).concat(['number']), number - 1);
                if (target instanceof Conditional || target instanceof ConditionalParentheses) {
                    const connect = target.connect;
                    if (connect == null || connect.connect == null) {
                        const cut = data.getIn([].concat(cutp));
                        const size = cut.size - (cutp.length == 0 ? 1 : 2);
                        for (let i = ary[ary.length - 1] + 1; i < size; i++) {
                            const t = data.getIn([].concat(cutp).concat([i]));
                            if (t == null) continue;
                            const del = t.get('delete');
                            if (del) continue;
                            const td = t.get('data');
                            if (td instanceof Conditional || td instanceof ConditionalParentheses) {
                                td.connect = null;
                                data = data.setIn([].concat(cutp).concat([i, 'data']), td);
                                break;
                            }
                        }
                    }
                }
                /* 
                // data = data.deleteIn([].concat(ary));
                const index = ary[ary.length - 1];
                const pre = ary.slice(0, ary.length - 1);
                let sq = null
                let size = 0;
                if(pre.length == 0) {
                    sq = data;
                    size = sq.size;
                } else {
                    sq = data.getIn([].concat(pre));
                    size = sq.size - 1;
                }
                if (sq) {
                    let i = index + 1;
                    for (; i < size; i++) {
                        const up = data.getIn([].concat(pre).concat([i]));
                        if (up) {
                            data = data.setIn([].concat(pre).concat([i - 1]), up);
                        } else {
                            break;
                        }
                    }
                    data = data.deleteIn([].concat(pre).concat([size - 1]));
                }
             */}
        }
        this.setState({
            data: data
        })
    }

    private listRender() {
        // const { expressions/* , left, right */ } = this.props;
        const { data } = this.state;
        return this.listCreate(data);
    }

    private listCreate(translates: immutable.Map<any, any>) {
        const items = new Array();
        // let number = translates.getIn(['number']);
        let size = translates.size;
        for (let i = 0; i < size; i++) {
            let node = translates.get(i);
            if (node) {
                const curr = this.listItemCreate(node, [i]);
                if (curr) { items.push(curr) };
            }
        }
        items.push(<ListItem
            key={"new"}
            primaryText={this.toolItemCreate([])}
            hoverColor="none"
            disabled={true}
            style={this.ItemStyle} />);
        return <List>{items}</List>
    }

    private toolItemCreate(identity: Array<number>) {
        return <div className="list-add-btn">
            <IconButton data-identity={identity.join("-")} onTouchTap={this.newCAOTranslate.bind(this)}><Icon name={"add"} /></IconButton>
            <IconButton data-identity={identity.join("-")} onTouchTap={this.newGPTranslate.bind(this)}><Icon name={"chevron_left"} /><Icon name={"chevron_right"} /></IconButton>
        </div>
    }

    private listItemCreate(node: immutable.Map<any, any>, identity: Array<number>) {
        const { /* left, right, */ group, db, targetId, nodeId } = this.props;

        // let number = node.getIn(['number']);
        let size = node.size;
        const tranlate: Translate = node.get("data");
        const del = node.get('delete');
        if (del) {
            return null;
        }
        if (tranlate instanceof ConditionalParentheses) {
            const items = new Array();
            const connect = tranlate.connect;
            for (let i = 0; i < size - 2; i++) {
                const nid = [].concat(identity);
                nid.push(i);
                const curr = this.listItemCreate(node.get(i), nid);
                if (curr) { items.push(curr) };
            }
            items.push(<ListItem
                key={identity.join("-")}
                primaryText={this.toolItemCreate(identity)}
                hoverColor="none"
                disabled={true}
                style={this.ItemStyle} />);
            return <ListItem
                key={identity.join("-")}
                hoverColor="none"
                disabled={true}
                style={this.ItemStyle}
                primaryText={
                    <div className={"expression-item"} data-identity={identity.join("-")}>
                        <div className="item-btn">
                            <IconButton data-identity={identity.join("-")} onTouchTap={this.deleteTranslate.bind(this)}><Icon name={"clear"} /></IconButton>
                        </div>
                        <div className={"item-andor"}>
                            {
                                connect != null ?
                                    <Select
                                        identity={identity}
                                        name={identity + "-andor"}
                                        style={this.AndOrRootStyle}
                                        textFieldStyle={this.AndOrTextStyle}
                                        init={connect.connect}
                                        dataSource={connects}
                                        ref={x => {
                                            const node: ElementTreeNode = this.elementRefs.getElementNode(identity);
                                            if (node == null) {
                                                const curr = new GroupNode(identity);
                                                curr.connect = x;
                                                this.elementRefs.setElementNode(identity, curr);
                                            } else if (node instanceof ConnectNode) {
                                                node.connect = x;
                                                this.elementRefs.setElementNode(identity, node);
                                            }
                                        }}
                                    />
                                    : null
                            }
                        </div>
                        {<span>{cn.option_exp_parentheses_node_text}</span>}
                    </div>
                }
                nestedItems={items}
            />
        }
        if (tranlate instanceof Conditional) {
            const connect = tranlate.connect;
            return <ListItem
                key={identity.join("-")}
                hoverColor="none"
                disabled={true}
                style={this.ItemStyle}
                primaryText={
                    <div className={"expression-item"} data-identity={identity.join("-")}>
                        <div className="item-btn">
                            <IconButton data-identity={identity.join("-")} onTouchTap={this.deleteTranslate.bind(this)}><Icon name={"clear"} /></IconButton>
                        </div>
                        <div className={"item-andor"}>
                            {
                                connect != null ?
                                    <Select
                                        identity={identity.join("-")}
                                        name={identity.join("-") + "-andor"}
                                        style={this.AndOrRootStyle}
                                        textFieldStyle={this.AndOrTextStyle}
                                        init={connect.connect}
                                        dataSource={connects}
                                        ref={x => {
                                            const node: ElementTreeNode = this.elementRefs.getElementNode(identity);
                                            if (node == null) {
                                                const curr = new ConnectNode(identity);
                                                curr.connect = x;
                                                this.elementRefs.setElementNode(identity, curr);
                                            } else if (node instanceof ConnectNode) {
                                                node.connect = x;
                                                this.elementRefs.setElementNode(identity, node);
                                            }
                                        }}
                                    />
                                    : null
                            }
                        </div>
                        {/* <Input 
                            identity={identity}
                            name={identity + "-left"}
                            init={content.left}
                            update={this.updateInputTranslate.bind(this)}
                            style={this.AcRootLStyle} 
                            textFieldStyle={this.AcTextLStyle} 
                            openOnFocus={true} 
                            filter={AutoComplete.fuzzyFilter} 
                            dataSource={left} /> */}
                        <ExpressionInput
                            identity={identity.join("-")}
                            name={identity.join("-") + "-left"}
                            init={tranlate.left.state}
                            db={db}
                            group={group}
                            ref={x => {
                                const node: ElementTreeNode = this.elementRefs.getElementNode(identity);
                                if (node == null) {
                                    const curr = new ConnectNode(identity);
                                    curr.left = x;
                                    this.elementRefs.setElementNode(identity, curr);
                                } else if (node instanceof ConnectNode) {
                                    node.left = x;
                                    this.elementRefs.setElementNode(identity, node);
                                }
                            }} />
                        <Select
                            identity={identity.join("-")}
                            name={identity.join("-") + "-operator"}
                            style={this.AcRootOStyle}
                            textFieldStyle={this.AcTextOStyle}
                            dataSource={operators}
                            init={tranlate.operator.operator}
                            ref={x => {
                                const node: ElementTreeNode = this.elementRefs.getElementNode(identity);
                                if (node == null) {
                                    const curr = new ConnectNode(identity);
                                    curr.operator = x;
                                    this.elementRefs.setElementNode(identity, curr);
                                } else if (node instanceof ConnectNode) {
                                    node.operator = x;
                                    this.elementRefs.setElementNode(identity, node);
                                }
                            }} />
                        <ExpressionInput
                            identity={identity.join("-")}
                            name={identity.join("-") + "-right"}
                            init={tranlate.right.state}
                            db={db}
                            group={group}
                            ref={x => {
                                const node: ElementTreeNode = this.elementRefs.getElementNode(identity);
                                if (node == null) {
                                    const curr = new ConnectNode(identity);
                                    curr.right = x;
                                    this.elementRefs.setElementNode(identity, curr);
                                } else if (node instanceof ConnectNode) {
                                    node.right = x;
                                    this.elementRefs.setElementNode(identity, node);
                                }
                            }} />
                        {/* <Input 
                            identity={identity}
                            name={identity + "-right"}
                            init={content.right}
                            right={true}
                            update={this.updateInputTranslate.bind(this)}
                            style={this.AcRootRStyle} 
                            textFieldStyle={this.AcTextRStyle} 
                            openOnFocus={true} 
                            filter={AutoComplete.fuzzyFilter} 
                            dataSource={right} /> */}
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
                {/* this.listRender() */}
                {this.listRender()}
            </div>
        );
    }
}


export default ExpressionList