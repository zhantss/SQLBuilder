import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'

import SuperSelectField from 'material-ui-superselectfield'

import { cn } from '../../../../text/index';
import { Column } from '../../../../../common/data/define/expression';
import { SelectItem } from '../../../../../common/data/define/extra';
import { TraceField, Designation, Trace } from '../../../../../common/data/option/traceability'


interface MixingMutiSelectProps {
    name: string
    text: string
    nodeId: string
    items: any
    select(selected: Array<TraceField>): any
}

interface MixingMutiSelectState {/* 
    values: Array<any>,
    tsis: any */
}

class MixingMutiSelect extends React.PureComponent<MixingMutiSelectProps, MixingMutiSelectState> {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    handleSelection(values, name) {
        const selected = values.map(value => {
            const v: TraceField = value.value;
            return v.clone();
        })
        this.props.select(selected);
    }

    itemsToSelects() {
        const { items, nodeId } = this.props;
        const selects = [];
        Object.keys(items).forEach(key => {
            const ary: Array<TraceField> = items[key];
            selects.push(
                <optgroup key={key} label={ary[0].trace.creater.name}>
                    {ary.map((item, index) => {
                        const current = item.trace.current(nodeId);
                        const creater = item.trace.creater.name;
                        const datasource = item.trace.datasource.source();

                        const title = current ? current.content.toString() + (current.alias ? "(" + current.alias.alias + ")" : "") : "";
                        const label = creater + "&" + title + "&" + datasource;
                        return (
                            <div key={index} {...{ value: item, label: label }} style={{
                                whiteSpace: 'normal',
                                display: 'flex',
                                justifyContent: 'space-between',
                                lineHeight: 'normal'
                            }}>
                                <div style={{
                                    marginRight: '10px'
                                }}>
                                    <span style={{ fontWeight: 'bold' }}>{title}</span><br />
                                    <span style={{ fontSize: 12 }}>{datasource}</span>
                                </div>
                            </div>
                        )
                    })}
                </optgroup>
            );
        });
        return selects;
    }

    fuzzyFilter(searchText, key) {
        const compareString = key.toLowerCase();
        searchText = searchText.toLowerCase();

        let searchTextIndex = 0;
        for (let index = 0; index < key.length; index++) {
            if (compareString[index] === searchText[searchTextIndex]) {
                searchTextIndex += 1;
            }
        }

        return searchTextIndex === searchText.length;
    }

    render() {
        const { name, text } = this.props;
        return <SuperSelectField
            name={name}
            multiple={true}
            checkPosition='left'
            hintText={text}
            onChange={this.handleSelection.bind(this)}
            selectionsRenderer={(values) => { return <div style={{ height: "42px", lineHeight: "42px", padding: "0 10px" }}>{text}</div>; }}
            // value={values}
            value={[]}
            showAutocompleteThreshold={2}
            autocompleteFilter={this.fuzzyFilter}
            style={{ width: '50%', marginLeft: "45%" }}
            menuGroupStyle={{ color: "#455a64" }}
            elementHeight={62}
            hintTextAutocomplete={cn.option_select_tab_select_items_select_search}
            keepSearchOnSelect={true}
        >
            {this.itemsToSelects()}
        </SuperSelectField>
    }

}

export default MixingMutiSelect