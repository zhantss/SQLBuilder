import * as React from 'react'
import * as classnames from 'classnames'

import { cn } from '../../text'
import { connect2 } from '../../../common/connect'


interface OptionTitleProps {
    title: any,
    start?: () => void/* 
    move?: () => void
    end?: () => void */
}

class OptionTitle extends React.PureComponent<OptionTitleProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const { title, start/* , move, end */ } = this.props;
        return (
            <div className="option-title" onMouseDown={start} /* onMouseMove={move} onMouseUp={end} */>{title}</div>
        );
    }
}

export default connect2(null, { 'title': ['option', 'title'] })(OptionTitle)