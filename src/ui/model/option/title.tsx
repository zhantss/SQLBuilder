import * as React from 'react'
import * as classnames from 'classnames'

import { cn } from '../../text'
import { connect2 } from '../../../common/connect'


interface OptionTitleProps {
    title: any
}

class OptionTitle extends React.PureComponent<OptionTitleProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const { title } = this.props;
        return (
            <div className="option-title">{title}</div>
        );
    }
}

export default connect2(null, { 'title': ['option', 'title'] })(OptionTitle)