import * as React from 'react'
import * as classnames from 'classnames'

import AutoComplete from 'material-ui/AutoComplete'
import { AutoCompleteProps } from 'material-ui'

interface SelectProps {
    identity: any
    name: any
    style?: any
    textFieldStyle?: any
    dataSource?: any
    init?: number
}

interface SelectState {
    text: string
    index: number
}

class Select extends React.PureComponent<SelectProps, SelectState> {

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

    collectValue() {
        return this.state;
    }

    componentDidUpdate() {

    }

    render() {
        const { name, style, textFieldStyle, dataSource } = this.props;
        const { text } = this.state;
        return <AutoComplete
            name={name}
            style={style}
            textFieldStyle={textFieldStyle}
            dataSource={dataSource}
            openOnFocus={true}
            filter={AutoComplete.noFilter}
            searchText={text ? text : ""}
            onNewRequest={this.update.bind(this)}
        />
    }
}

export default Select