import * as React from 'react'
import * as classnames from 'classnames'

import '../stylesheet/icon.scss'

interface IconProps {
    name: string;
}

class SimpleIcon extends React.Component<IconProps> {

    render() {
        return (
            <i className="material-icons">{this.props.name}</i>
        )
    }

}

export default SimpleIcon