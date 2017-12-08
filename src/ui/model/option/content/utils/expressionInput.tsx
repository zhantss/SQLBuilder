import * as React from 'react'
import * as classnames from 'classnames'
import * as immutable from 'immutable'
import * as uuid from 'uuid'

import TextField from 'material-ui/TextField'
import SuperSelectField from 'material-ui-superselectfield'

import { Column, Value, Function } from '../../../../../common/data/define/expression'
import { TraceField, Creater } from '../../../../../common/data/option/traceability';
import { cn } from '../../../../text/index';

interface ExpressionInputProps {
    className?: string
    identity: string
    name: string
    init?: any
    db: immutable.Map<string, immutable.List<TraceField>>
    group: immutable.Map<string, Creater>
    targetId: string
    nodeId: string
}

interface ExpressionInputState {
    limit: string
    groupValue: any
    dbValue: any
    customValue: any
}

const selectStyle = {
    width: "50%", 
    display: "inline-block",
    verticalAlign: "middle"
}

const menuStyle = {
    whiteSpace: 'normal',
    display: 'flex',
    justifyContent: 'space-between',
    lineHeight: 'normal'
}

class ExpressionInput extends React.PureComponent<ExpressionInputProps, ExpressionInputState> {
    constructor(props) {
        super(props);
        this.state = this.props.init ? this.props.init : {
            limit: null,
            groupValue: null,
            dbValue: null,
            customValue: null
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps && nextProps.init) {
            this.setState(nextProps.init);
        }
    }

    private groupFuzzyFilter(searchText, key) {
        const compareString = key.toLowerCase();
        searchText = searchText.toLowerCase();
        let searchTextIndex = 0;
        for (let index = 0; index < key.length; index++) {
            if (compareString[index] === searchText[searchTextIndex]) {
                searchTextIndex += 1;
            }
        }

        return searchTextIndex === searchText.length;
    }

    private dbFuzzyFilter(searchText, key) {
        const compareString = key.toLowerCase();
        searchText = searchText.toLowerCase();
        let searchTextIndex = 0;
        for (let index = 0; index < key.length; index++) {
            if (compareString[index] === searchText[searchTextIndex]) {
                searchTextIndex += 1;
            }
        }

        return searchTextIndex === searchText.length;
    }

    private groupSelection(value, label) {
        if (value && value.value) {
            const creater: Creater = value.value;
            const { groupValue, dbValue } = this.state;
            this.setState({
                limit: creater.id,
                groupValue: value,
                dbValue: groupValue && groupValue.value.id == value.value.id ? dbValue : null
            })
        } else {
            this.setState({
                limit: null,
                groupValue: null,
                dbValue: null
            })
        }
    }

    private dbSelection(value, label) {
        if (value && value.value) {
            const creater: Creater = value.value;
            this.setState({
                dbValue: value
            })
        } else {
            this.setState({
                dbValue: null
            })
        }
    }

    private groupItemsToSelects() {
        let { group } = this.props;
        const selects = [];
        group.valueSeq().forEach(creater => {
            const title = creater.name;
            selects.push(
                <div key={creater.id} {...{ value: creater, label: title }} style={menuStyle as any}>
                    <div style={{
                        marginRight: '10px'
                    }}>
                        <span style={{ fontWeight: 'bold' }}>{title}</span><br />
                        {/* <span style={{ fontSize: 12 }}>{datasource}</span> */}
                    </div>
                </div>
            )
        });
        return selects;
    }

    private dbItemsToSelects() {
        const { db, nodeId } = this.props;
        const { limit } = this.state;
        const selects = [];
        if (limit) {
            const list = db.get(limit);
            list.forEach(item => {
                let current = item.trace.current(limit);
                const creater = item.trace.creater.name;
                const datasource = item.trace.datasource.source();

                const title = current ? current.content.toString() + (current.alias ? "(" + current.alias.alias + ")" : "") : "";
                const label = creater + "&" + title + "&" + datasource;
                selects.push(<div key={item.id} {...{ value: item, label: label }} style={menuStyle as any}>
                    <div style={{
                        marginRight: '10px'
                    }}>
                        <span style={{ fontWeight: 'bold' }}>{title}</span><br />
                        <span style={{ fontSize: 12 }}>{datasource}</span>
                    </div>
                </div>)
            })
        }
        return selects;
    }

    private handleCustomExp(event, value) {
        this.setState({
            customValue: value
        })
    }

    collectValue() {
        return this.state;
    }

    render() {
        const { name, db, group, className, nodeId } = this.props;
        const { limit, groupValue, dbValue } = this.state;
        return <div className={classnames("expression-input", className)}>
            <SuperSelectField
                name={name + "_group"}
                // multiple={true}
                checkPosition='left'
                hintText={cn.option_join_exp_on_group}
                onChange={this.groupSelection.bind(this)}
                value={groupValue}
                showAutocompleteThreshold={1}
                autocompleteFilter={this.groupFuzzyFilter}
                menuGroupStyle={{ color: "#455a64" }}
                style={selectStyle}
                underlineStyle={{ bottom: "8px" }}
                selectionsRenderer={(value) => { return <div style={{ height: "42px", lineHeight: "42px", padding: "0 10px" }}>{value ? value.label : ""}</div>; }}
                elementHeight={48}
                hintTextAutocomplete={cn.option_join_exp_on_auto_search}
            // keepSearchOnSelect={true}
            >
                {this.groupItemsToSelects()}
            </SuperSelectField>
            {limit != null ?
                <SuperSelectField
                    name={name + "_db"}
                    // multiple={true}
                    checkPosition='left'
                    hintText={cn.option_join_exp_on_db}
                    onChange={this.dbSelection.bind(this)}
                    value={dbValue}
                    showAutocompleteThreshold={1}
                    autocompleteFilter={this.dbFuzzyFilter}
                    menuGroupStyle={{ color: "#455a64" }}
                    style={selectStyle}
                    underlineStyle={{ bottom: "8px" }}
                    selectionsRenderer={(value) => {
                        const v: TraceField = value ? value.value : null;
                        let text = "";
                        if(v) {
                            const current = v.trace.current(limit);
                            if(current) {
                                text = current.content.toString() + (current.alias ? "(" + current.alias.alias + ")" : "");
                            } else {
                                const creater = v.trace.creater;
                                text = creater.item.content.toString();
                            }
                        }
                        return <div style={{ height: "42px", lineHeight: "42px", padding: "0 10px" }}>{text}</div>;
                    }}
                    elementHeight={62}
                    hintTextAutocomplete={cn.option_join_exp_on_auto_search}
                // keepSearchOnSelect={true}
                >
                    {this.dbItemsToSelects()}
                </SuperSelectField> :
                <TextField 
                    name={uuid.v4()} 
                    style={{ width: "50%", verticalAlign: "middle" }} 
                    onChange={this.handleCustomExp.bind(this)} 
                    value={this.state.customValue ? this.state.customValue : ""} 
                    hintText={cn.option_join_exp_on_db_text_hint} />
            }
        </div>
    }
}

export default ExpressionInput