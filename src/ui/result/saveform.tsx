import * as React from 'react'
import * as immutable from 'immutable'
import * as classnames from 'classnames'
import * as uuid from 'uuid'

import Divider from 'material-ui/Divider'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import SuperSelectField from 'material-ui-superselectfield'

import { TraceField } from '../../common/data/option/traceability'
import { cn } from '../text/index'
import required from '../../common/api/required'
import urlrequired from '../../common/api/urlrequired'
import { urlparams } from '../../common/utils/urlparams';

interface SaveFormProps {
    sql: {
        sql: string,
        items: Array<TraceField>
        entrance: string,
        serialize: any
    }
}

interface SaveFormState {
    values: any,
    selectItems: immutable.Map<string, {
        identity: string,
        column: string,
        alias?: string
        datasource: any
    }>,
    group: immutable.Map<string, {
        identity: string,
        name: string,
        items: Array<string>
    }>
}

class SaveForm extends React.PureComponent<SaveFormProps, SaveFormState> {

    constructor(props) {
        super(props);
        this.state = this.initialization(props);
        this.formels = immutable.Map<string, React.Component>();
    }

    initialization(props) {
        const { sql } = props;
        const entrance = sql.entrance;
        const values = {};
        let params = urlparams[urlrequired];
        let group = immutable.Map<string, {
            identity: string,
            name: string,
            items: Array<string>
        }>();
        let selectItems = immutable.Map<string, {
            identity: string,
            column: string,
            alias?: string
            datasource: any
        }>();
        sql.items.forEach(item => {
            const tf: TraceField = item;
            const si = tf.trace.current(entrance);
            const sitem = {
                identity: tf.identity,
                column: si.content.toString(),
                alias: si.alias ? si.alias.alias : null,
                datasource: {
                    identity: tf.trace.datasource.identity,
                    name: tf.trace.datasource.name,
                    item: {
                        column : tf.trace.datasource.item.content.toString(),
                        alias: tf.trace.datasource.item.alias ? tf.trace.datasource.item.alias.alias : null
                    }
                }
            };
            selectItems = selectItems.set(tf.identity, sitem);
            if (group.get(tf.trace.datasource.identity)) {
                let ds = group.get(tf.trace.datasource.identity);
                ds.items.push(tf.identity);
                group = group.set(tf.trace.datasource.identity, ds);
            } else {
                group = group.set(tf.trace.datasource.identity, {
                    identity: tf.trace.datasource.identity,
                    name: tf.trace.datasource.name,
                    items: [tf.identity]
                })
            }
        })
        Object.keys(required).forEach(s => {
            const define = required[s];
            const hide = define.hide;
            const code = define.code;
            const name = define.name;
            const pre = define.pre;
            const db = define.db;
            if (hide && code && db) {
                if (typeof db != 'object') {
                    if (db.startsWith("$url")) {
                        const pos = db.split(".");
                        if (pos.length == 2) {
                            values[code] = params && params[pos[1]] ? params[pos[1]] : null
                        }
                    } else if (db.startsWith("$builder")) {
                        const pos = db.split(".");
                        if (pos.length == 2) {
                            if (pos[1] == "items") {
                                values[code] = selectItems;
                            } else if (pos[1] == "sql") {
                                values[code] = sql.sql;
                            } else if(pos[1] == "serialize") {
                                values[code] = sql.serialize;
                            }
                        }
                    }
                }
            }
        });
        return {
            values,
            selectItems,
            group
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this.initialization(nextProps))
    }

    public collect() {
        const { values } = this.state;
        const nv = {};
        Object.keys(required).forEach(s => {
            const define = required[s];
            const code = define.code;
            const hide = define.hide;
            const db = define.db;
            if (hide && values[code] && db) {
                if (typeof db == 'object') {

                } else if (db.startsWith("$url")) {
                    nv[code] = values[code];
                } else if (db.startsWith("$builder")) {
                    if (values[code].toJS) {
                        nv[code] = values[code].toJS();
                    } else {
                        nv[code] = values[code];
                    }
                }
            } else if (!hide) {
                if (db != null && values[code]) {
                    nv[code] = values[code].value;
                } else if (this.formels.has(code)) {
                    const input = this.formels.get(code);
                    if (input instanceof TextField) {
                        nv[code] = input.getValue();
                    }
                }
            }
        })
        return nv;
    }

    private formels: immutable.Map<string, React.Component>;

    handleSelect(value, code) {
        const { values } = this.state;
        const nv = { ...values };
        if (value && value.value && code) {
            nv[code] = value;
        }
        this.setState({
            values: nv
        })
    }

    fuzzyFilter(searchText, key) {
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

    formRender() {
        const { values, selectItems, group } = this.state;
        const forms = [];
        Object.keys(required).forEach(s => {
            const define = required[s];
            const hide = define.hide;
            const code = define.code;
            const name = define.name;
            const pre = define.pre;
            const db = define.db;
            if (!hide && code) {
                if (db == null) {
                    forms.push(
                        <TextField key={code} name={code} hintText={cn.result_sql_form_input + "  " + name} style={{ marginLeft: 20 }} underlineShow={false} ref={x => { this.formels = this.formels.set(code, x); }} />
                    )
                    forms.push(
                        <Divider key={code + "_d"} />
                    )
                } else {
                    if (typeof db != 'object') {
                        if (db.startsWith("$builder")) {
                            const pos = db.split(".");
                            if (pos.length == 2) {
                                if (pos[1] == "items") {
                                    const disabled = pre != null && (values[pre.key] == null || (values[pre.key] && values[pre.key].value != pre.value));
                                    forms.push(
                                        <SuperSelectField
                                            key={code}
                                            name={code}
                                            disabled={disabled}
                                            checkPosition='left'
                                            hintText={cn.result_sql_form_select + "  " + name}
                                            onChange={this.handleSelect.bind(this)}
                                            showAutocompleteThreshold={2}
                                            autocompleteFilter={this.fuzzyFilter}
                                            elementHeight={42}
                                            hintTextAutocomplete={"search"}
                                            value={!disabled && values[code] ? values[code] : null}
                                            style={{ minWidth: 150, marginTop: 10, marginBottom: 8, marginRight: 10, width: "20%" }}
                                            underlineStyle={{ display: "none" }}
                                            selectionsRenderer={(values, hintText) => {
                                                if (!values) {
                                                    return <div style={{ opacity: 1, color: "rgba(0, 0, 0, 0.3)", marginLeft: "20px", height: "24px", bottom: "12px" }}>
                                                        {hintText}
                                                    </div>
                                                }
                                                return <div style={{ opacity: 1, color: "#000", marginLeft: "20px", height: "24px", bottom: "12px" }}>
                                                    {values.value ? values.value.alias ? values.value.alias + "[" + values.value.column + "]" : values.value.column : ""}
                                                </div>
                                            }}

                                        >
                                            {group.valueSeq().toArray().map(datasource => {
                                                return <optgroup key={datasource.identity} label={datasource.name}>
                                                    {
                                                        datasource.items ? datasource.items.map(ci => {
                                                            const ditem = selectItems.get(ci);
                                                            const title = ditem ? ditem.alias ? ditem.alias + "[" + ditem.column + "]" : ditem.column : null;
                                                            const label = ditem ? ditem.datasource.name + "&" + title : null;
                                                            return title && label ? <div key={ditem.identity} {...{ value: ditem, label: label }}
                                                                style={{
                                                                    whiteSpace: 'normal',
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    lineHeight: 'normal'
                                                                }}>
                                                                <div style={{
                                                                    marginRight: '10px'
                                                                }}>
                                                                    <span style={{ fontWeight: 'bold' }}>{title}</span><br />
                                                                    {/* <span style={{ fontSize: 12 }}>{datasource}</span> */}
                                                                </div>
                                                            </div> : null
                                                        }) : null
                                                    }
                                                </optgroup>
                                            })}
                                        </SuperSelectField>
                                    )
                                    forms.push(<Divider key={code + "_d"} />);
                                }
                            }
                        }
                    } else {
                        forms.push(
                            <SuperSelectField
                                key={code}
                                name={code}
                                checkPosition='left'
                                hintText={cn.result_sql_form_select + "  " + name}
                                onChange={this.handleSelect.bind(this)}
                                value={values[code] ? values[code] : null}
                                style={{ minWidth: 150, marginTop: 10, marginBottom: 8, marginRight: 10, width: "20%" }}
                                underlineStyle={{ display: "none" }}
                                selectionsRenderer={(values, hintText) => {
                                    if (!values) {
                                        return <div style={{ opacity: 1, color: "rgba(0, 0, 0, 0.3)", marginLeft: "20px", height: "24px", bottom: "12px" }}>
                                            {hintText}
                                        </div>
                                    }
                                    return <div style={{ opacity: 1, color: "#000", marginLeft: "20px", height: "24px", bottom: "12px" }}>
                                        {values.label ? values.label : values.value}
                                    </div>
                                }}
                            >
                                {Object.keys(db).map(k => {
                                    return <div key={k} {...{ value: k, label: db[k] }}>{db[k]}</div>
                                })}
                            </SuperSelectField>
                        )
                        forms.push(<Divider key={code + "_d"} />);
                    }
                }
            }
        });
        return forms;
    }

    render() {
        return <Paper zDepth={1}>
            {this.formRender()}
        </Paper>
    }
}

export default SaveForm
