import * as React from 'react'
import * as classnames from 'classnames'

interface IsolationProps {
    size: number
}

class Isolation extends React.PureComponent<IsolationProps> {

    render() {
        const { size } = this.props;
        return (<div style={{ height: size + "px", position: "relative"}}></div>)
    }
}

export default Isolation