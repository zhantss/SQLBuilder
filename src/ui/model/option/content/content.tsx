import * as React from 'react'
import * as classnames from 'classnames'

import { cn } from '../../../text'
import { connect2 } from '../../../../common/connect'
import { OptionType, OptionTarget } from '../../../../common/data/option'
import JoinContent from './join'
import TableContent from './table'
// import SelectContent from './select'
import SelectContent from './select2'

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

    content() {
        const { type } = this.props;
        switch(type) {
            case OptionType.SOURCE: {
                // TODO
                // Table Alias/SELECT ITEMs & Alias
                return <TableContent />;
            }
            case OptionType.SQLMODEL: {
                // TODO
                // similar for SOURCE
                return <TableContent />;
            }
            case OptionType.SELECT: {
                // TODO
                // SELECT Alias/SELECT ITEMs & Alias/Where/Group/Order
                return <SelectContent />;
            }
            case OptionType.JOIN: {
                // TODO
                // Join Mode/ON | USING
                return <JoinContent />;
            }
            case OptionType.SETOP: {
                // TODO
                // SETOP Alias/SELECT ITEMs/Item Relation
                return null;
            }
        }
        return null;
    }

    render() {
        return (
            <div className="option-content">
                {this.content()}
            </div>
        );
    }
}

export default connect2(null, {
    'graphic': ['graphic', 'graphic',],
    'target': ['option', 'target'],
    'type': ['option', 'type'],
    'options' : ['option', 'options']
})(OptionContent)