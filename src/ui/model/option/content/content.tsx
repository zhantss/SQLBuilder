import * as React from 'react'
import * as classnames from 'classnames'

import { cn } from '../../../text'
import { connect2 } from '../../../../common/connect'
import { OptionType, OptionTarget } from '../../../../common/data/option'

interface OptionContentProps {
    graphic?: any,
    options?: any
    target?: OptionTarget
    type?: OptionType,
}

class OptionContent extends React.PureComponent<OptionContentProps> {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="option-content"></div>
        );
    }
}

export default connect2(null, {
    'graphic': ['graphic', 'graphic',],
    'target': ['option', 'target'],
    'type': ['option', 'type'],
    'options' : ['option', 'options']
})(OptionContent)