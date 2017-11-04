import * as React from 'react'
import * as classnames from 'classnames'

import AutoComplete from 'material-ui/AutoComplete'
import { AutoCompleteProps } from 'material-ui'

interface SelectProps extends AutoCompleteProps<any> {
    identity: any
    init?: string
    update(identity: any, value_: any)
}

interface SelectState {
    text: string
}

class Select extends  React.PureComponent<SelectProps, SelectState> {

    constructor(props) {
        super(props);
        this.state = {
            text: this.props.init ? this.props.init : this.props.dataSource ? this.props.dataSource[0] : ""
        }
    }

    update(text, index) {
        this.props.update(this.props.identity, index);
        this.setState({
            text: text
        })
    }

    render() {
        const props = {...this.props};
        delete props["identity"];
        delete props["update"];
        return <AutoComplete {...props} onNewRequest={this.update.bind(this)} searchText={this.state.text} />
    }
}

export default Select