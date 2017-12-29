import * as React from 'react'
import * as immutable from 'immutable'
import * as classnames from 'classnames'
import * as uuid from 'uuid'

import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import { Tabs, Tab } from 'material-ui/Tabs'
import { Step, Stepper, StepLabel } from 'material-ui/Stepper'
import TextField from 'material-ui/TextField'
import CircularProgress from 'material-ui/CircularProgress'

import { connect2 } from '../../common/connect'
import { result as resultAction } from '../../common/actions'
import DataTable from './datatable'
import SaveForm from './saveform'

import { cn } from '../text/index'
import { TraceField } from '../../common/data/option/traceability';

interface ResultDialogProps {
    result: any
    actions: any
}

interface ResultDialogState {
    step: string
    sql: Array<{
        sql: string,
        items: Array<TraceField>
        entrance: string,
        serialize: any
    }>
    open: boolean
    result: any
    loading: boolean,
    form: any
}

class ResultDialog extends React.PureComponent<ResultDialogProps, ResultDialogState> {

    constructor(props) {
        super(props);
        this.state = {
            step: "check",
            ...this.process(props)
        }
        this.forms = immutable.Map<string, SaveForm>();
    }

    process(props) {
        return {
            sql: props.result.get('sql'),
            open: props.result.get('dialog'),
            result: props.result.get('result'),
            loading: props.result.get('loading'),
            form: props.result.get('form')
        }
    }

    private saves = immutable.OrderedMap<number, TextField>();

    handleClose() {
        const action: resultAction.$actions = this.props.actions.result;
        action.HIDE();
        this.setState({
            step: "check"
        })
    }

    /* componentDidMount() {
        const { sql } = this.props;
        if(sql && sql.length > 0) {
            this.query(sql[0]);
        }
    } */

    query(index: number, sql: string) {
        const { result, actions } = this.props;
        const action: resultAction.$actions = actions.result;
        action.PREVIEW({ index, sql });
    }

    forms: immutable.Map<string, SaveForm>

    save() {
        const { actions } = this.props;
        const { sql } = this.state;

        const action: resultAction.$actions = actions.result;
        const sqls = [];
        const nform = {};
        this.forms.valueSeq().forEach(f => {
            const form = f.collect();

            if (form && form["entrance"]) {
                sqls.push(form);
                nform[form["entrance"]] = form;
            }
        })
        /* this.saves.entrySeq().forEach(e => {
            const index: number = e[0];
            const text: TextField = e[1];
            if (sql && sql[index] && text) {
                let name = text.getValue();
                sqls[name] = sql[index];
            }
        }) */
        action.FORM(nform);
        action.SAVE({ sqls: sqls });
    }

    handelActive(tab) {
        const { sql, result } = this.state;
        const index = parseInt(tab.props['data-index']);
        if (index != null && !isNaN(index) && sql[index] && result.get(index) == null) {
            this.query(index, sql[index].sql);
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState(
            this.process(nextProps)
        )
    }

    componentDidUpdate() {
        const { sql, result } = this.state;
        const index = 0;
        if (index != null && !isNaN(index) && sql[index] && result.get(index) == null) {
            this.query(index, sql[index].sql);
        }
    }

    step(step: string) {
        switch (step) {
            case "check": return 0;
            case "save": return 1;
            case "finished": return 2;
        }
    }

    next() {
        const { step } = this.state;
        switch (step) {
            case "check": return "save";
            case "save": return "finished";
            case "finished": return null;
        }
    }

    back() {
        const { step } = this.state;
        switch (step) {
            case "check": return null;
            case "save": return "check";
            case "finished": return "save";
        }
    }

    handelBack() {
        const rn = this.back();
        if (rn == null) {

        } else {
            this.setState({
                step: rn
            })
        }
    }

    handleNext() {
        const rn = this.next();
        if (rn == null) {

        } else {
            let pass = true;
            if(rn == "finished") {
                this.forms.valueSeq().forEach(f => {
                    const fpass = f.validation();
                    if(!fpass && pass) {
                        pass = false;
                    }
                })
            }
            if(pass) {
                this.setState({
                    step: rn
                })
                if (rn == "finished") {
                    this.save();
                }
            }
        }
    }

    bottomTool() {
        const { step } = this.state;
        if(step == "check") {
            return [
                <RaisedButton
                    label="NEXT"
                    primary={true}
                    keyboardFocused={true}
                    onClick={this.handleNext.bind(this)}
                />
            ]
        }
        if(step == "save") {
            return [
                <FlatButton
                    label="BACK"
                    primary={true}
                    onClick={this.handelBack.bind(this)}
                />,
                <RaisedButton
                    label="NEXT"
                    primary={true}
                    keyboardFocused={true}
                    onClick={this.handleNext.bind(this)}
                />,
            ]
        }
        if (step == "finished") {
            return [
                <RaisedButton
                    label="OK"
                    primary={true}
                    keyboardFocused={true}
                    onClick={this.handleClose.bind(this)}
                />
            ];
        }
    }

    render() {
        const { open, sql, result, loading, form } = this.state;
        const { step } = this.state;
        let actions = this.bottomTool();
        return <Dialog
            title={/* cn.result_sql_title */
                <div>
                    <Stepper activeStep={this.step(step)}>
                        <Step>
                            <StepLabel>{cn.result_sql_title}</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>{cn.result_sql_save}</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>{cn.result_sql_save_loading}</StepLabel>
                        </Step>
                    </Stepper>
                </div>
            }
            actions={actions}
            modal={false}
            open={open}
            onRequestClose={this.handleClose.bind(this)}
            contentStyle={{
                width: "50%",
                maxWidth: "75%"
            }}
        >
            <div style={{
                minHeight: "500px",
                // visibility: step == "check" ? "visible" : "hidden",
                display: step == "check" ? "flex" : "none"/* ,
                alignItems: "center" */
            }}>
                <Tabs style={{ flex: 1 }}>
                    {sql ? sql.map((s, index) => {
                        return <Tab key={index} label={"SQL " + index} onActive={this.handelActive.bind(this)} data-index={index}>
                            <p>{s.sql}</p>
                            {result && result.get(index) ?
                                <DataTable index={index} sql={s.sql} result={result.get(index)} />
                                : null}
                        </Tab>
                    }) : null}
                </Tabs>
            </div>
            <div style={{
                minHeight: "500px",
                // visibility: step == "save" ? "visible" : "hidden",
                display: step == "save" ? "flex" : "none",
                // alignItems: "flex-start",
                // flexDirection: "column"
            }}>
                <Tabs style={{ flex: 1 }}>
                    {sql ? sql.map((s, index) => {
                        return <Tab key={index} label={"SQL " + index} onActive={this.handelActive.bind(this)} data-index={index}>
                            <p>{s.sql}</p>
                            <SaveForm sql={s} init={form && form[s.entrance] ? form[s.entrance] : null} ref={x => { this.forms = this.forms.set(s.entrance, x) }} />
                        </Tab>
                    }) : null}
                </Tabs>
            </div>
            <div style={{
                minHeight: "500px",
                // visibility: step == "finished" ? "visible" : "hidden",
                display: step == "finished" ? "flex" : "none",
                alignItems: "center",
                justifyContent: "center"
            }}>
                {
                    loading == null ?
                        <div style={{
                            flex: 1,
                            textAlign: "center"
                        }}>
                            <i className="material-icons" style={{ fontSize: "100px" }}>clear</i>
                        </div>
                        : loading ?
                            <CircularProgress size={100} thickness={7} />
                            : <div style={{
                                flex: 1,
                                textAlign: "center"
                            }}>
                                <i className="material-icons" style={{ fontSize: "100px" }}>done</i>
                            </div>
                }
            </div>

        </Dialog>
    }
}

// export default ResultDialog
export default connect2(null, {
    'result': ['result'],
})(ResultDialog)