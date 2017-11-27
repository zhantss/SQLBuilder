import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'

import { Tabs as ScrollTabs, Tab as ScrollTab } from 'material-ui-scrollable-tabs/Tabs'

import { cn } from '../../../text'
import { connect2 } from '../../../../common/connect'
import { DataModel, DataDefine } from '../../../../common/data'
import { SQLParser, GraphicParser } from '../../../../common/data/utils'
import { option as optionAction } from '../../../../common/actions'
import { JoinMode, modes } from '../../../../common/data/define/set'
import { Option, OptionTarget } from '../../../../common/data/option'
import { Expression, OptionOperator } from '../../../../common/data/define/expression'
import { Translate, AtomOption, ConnectAtomOption, GroupParentheses } from '../../../../common/data/option/translate'

import MixingMutiSelect from './utils/mixingMutiSelect'
import RichFieldList from './utils/richFieldList'

interface SelectContentProps {
    actions?: any
    options?: any
    graphic?: any
    target?: OptionTarget
}

interface SelectContentState {
    select: Option.Select
    items: any
}

class SelectContent extends React.PureComponent<SelectContentProps, SelectContentState> {

    constructor(props) {
        super(props);
        const { target, options } = props;
        this.state = this.initialization(target, props.options, props.graphic);
    }

    initialization(target: OptionTarget, options, graphic) {
        const id: string = target.target.id;
        const select = options.get(id);
        const ori = id.substr(0, id.length - ".SELECT".length);
        const csi = GraphicParser.collectSelectItems(ori, graphic);
        return {
            select: select,
            items: csi
        }
    }

    render() {
        const { items } = this.state;

        const buttonStyle = { lineHeight: "48px" };
        return (
            <div className="option-select">
                <ScrollTabs tabType={'scrollable-buttons'} className={'option-select-tabs'}>
                    <ScrollTab key={uuid.v4()} label={<span style={{ fontSize: "16px" }}>{cn.option_select_tab_select_items}</span>} buttonStyle={buttonStyle}>
                        <MixingMutiSelect name={uuid.v4()} text={cn.option_select_tab_select_items_select} items={items} />
                        <RichFieldList items={[]} />
                    </ScrollTab>
                    <ScrollTab key={uuid.v4()} label={<span style={{ fontSize: "16px" }}>{cn.option_select_tab_where}</span>} buttonStyle={buttonStyle}>
                        
                    </ScrollTab>
                    <ScrollTab key={uuid.v4()} label={<span style={{ fontSize: "16px" }}>{cn.option_select_tab_groupby}</span>} buttonStyle={buttonStyle}>
                        
                    </ScrollTab>
                    <ScrollTab key={uuid.v4()} label={<span style={{ fontSize: "16px" }}>{cn.option_select_tab_orderby}</span>} buttonStyle={buttonStyle}>
                        
                    </ScrollTab>
                    <ScrollTab key={uuid.v4()} label={<span style={{ fontSize: "16px" }}>{cn.option_select_tab_having}</span>} buttonStyle={buttonStyle}>
                        
                    </ScrollTab>
                </ScrollTabs>
                <div className="option-select-bottom-tool">
                </div>
            </div>
        );
    }
}

export default connect2(null, { 'option': null, 'options': ['option', 'options'], 'target': ['option', 'target'], 'graphic': ['graphic', 'graphic'] })(SelectContent)