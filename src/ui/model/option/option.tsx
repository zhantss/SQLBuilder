import * as React from 'react'
import * as classnames from 'classnames'

import { cn } from '../../text'
import { connect2 } from '../../../common/connect'

import OptionTitle from './title'
import { OptionContent } from './content'

interface OptionProps {
    visable: boolean
}

class Option extends React.PureComponent<OptionProps> {

    constructor(props) {
        super(props);
    }

    render() {
        const { visable } = this.props;
        return (
            <div className={classnames('option-container', { "hiden": !visable })}>
                <OptionTitle />
                <OptionContent />
                <div className="option-toolbar"></div>
            </div>
        );
    }

}

export default connect2(null, { 'visable': ['option', 'visable'] })(Option)