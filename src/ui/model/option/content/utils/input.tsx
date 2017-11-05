import * as React from 'react'
import * as classnames from 'classnames'

import AutoComplete from 'material-ui/AutoComplete'
import { AutoCompleteProps } from 'material-ui'

import { Column, Value, Function } from '../../../../../common/data/define/expression'

interface InputProps extends AutoCompleteProps<any> {
    identity: any
    right?: boolean
    init?: any
    update(identity: any, right: boolean, value_: any)
}

interface InputState {
    text: string
    value_: any
}

class Input extends  React.PureComponent<InputProps, InputState> {

    constructor(props) {
        super(props);
        this.state = {
            text: this.props.init ? this.props.init.toString() : "",
            value_: this.props.init ? this.props.init : null
        }
    }

    componentWillReceiveProps(nextProps) {
        const props = nextProps;
        this.state = {
            text: props.init ? props.init.toString() : "",
            value_: props.init ? props.init : null
        }
    }

    update(text, db, params) {
        let value_ = null;
        if (params && params.source) {
            if (params.source === "change") {
                value_ = new Value(text);
            } else {
                // TODO
                value_ = new Value(text);
            }
        }
        this.setState({
            text: text,
            value_ : value_
        })
    }

    componentDidUpdate() {
        this.props.update(this.props.identity, this.props.right ? this.props.right : false, this.state.text);
    }

    render() {
        const props = {...this.props};
        delete props["identity"];
        delete props["update"];
        delete props["init"];
        delete props["right"];
        return <AutoComplete {...props} onUpdateInput={this.update.bind(this)} searchText={this.state.text} />
    }
}

export default Input