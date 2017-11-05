import * as React from 'react'
import * as classnames from 'classnames'

import AutoComplete from 'material-ui/AutoComplete'
import { AutoCompleteProps } from 'material-ui'

interface SelectProps extends AutoCompleteProps<any> {
    identity: any
    init?: number
    update(identity: any, value_: any)
}

interface SelectState {
    text: string
    index: number
}

class Select extends  React.PureComponent<SelectProps, SelectState> {

    constructor(props) {
        super(props);
        this.state = {
            text: this.props.init && this.props.dataSource ? this.props.dataSource[this.props.init] : this.props.dataSource[0],
            index: this.props.init ? this.props.init : 0
        }
    }

    componentWillReceiveProps(nextProps) {
        const props = nextProps;
        this.state = {
            text: props.init && props.dataSource ? props.dataSource[props.init] : props.dataSource[0],
            index: props.init ? props.init : 0
        }
    }

    update(text, index) {
        this.setState({
            text: text,
            index: index
        })
    }

    componentDidUpdate() {
        this.props.update(this.props.identity, this.state.index);
    }

    render() {
        const props = {...this.props};
        delete props["identity"];
        delete props["update"];
        delete props["init"];
        return <AutoComplete {...props} onNewRequest={this.update.bind(this)} searchText={this.state.text} />
    }
}

export default Select