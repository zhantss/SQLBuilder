import * as React from 'react'
import * as classnames from 'classnames'

import '../stylesheet/icon.scss'

interface IconProps {
    name: string;
    content?: string;
    custom?: string
}

class Icon extends React.Component<IconProps> {

    render() {
        return (
            <div className={classnames("icon-list", this.props.custom)}>
                <div className={`icon-package`}>
                    <i className="material-icons">{this.props.name}</i>
                    <span className="content">{this.props.content}</span>
                </div>
            </div>
        )
    }

}

export default Icon