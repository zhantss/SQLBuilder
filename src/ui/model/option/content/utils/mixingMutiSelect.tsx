import * as React from 'react'
import * as classnames from 'classnames'
import * as uuid from 'uuid'

import SuperSelectField from 'material-ui-superselectfield'
import { TraceSelectItem } from '../../../../../common/data/option/traceability'


interface MixingMutiSelectProps {
    name: string
    text: string
    items: any
}

interface MixingMutiSelectState {
    values: Array<any>
}

class MixingMutiSelect extends React.PureComponent<MixingMutiSelectProps, MixingMutiSelectState> {

    constructor(props) {
        super(props);
        this.state = {
            values: []
        }
    }

    handleSelection(values, name) {

    }

    itemsToSelects() {
        const { items } = this.props;
        const selects = [];
        Object.keys(items).forEach(key => {
            const ary: Array<TraceSelectItem> = items[key];
            selects.push(
                <optgroup key={key} label={ary[0].traceData.traceName}>
                    {ary.map((item, index) => {
                        const label = item.item.content ? item.item.content.toString() : "";
                        // const alias = item.item.alias ? item.item.alias.toString() : "";
                        const alias = item.item.alias ? item.item.alias.alias : null;
                        let show = alias ? alias + "[" + label + "]" : label;
                        return (
                            <div key={index} {...{ value: item, label: show }} style={{
                                whiteSpace: 'normal',
                                display: 'flex',
                                justifyContent: 'space-between',
                                lineHeight: 'normal'
                            }}>
                                <span style={{ fontWeight: 'bold' }}>{show}</span><br />
                                {/* <span style={{ fontSize: 12 }}>{alias}</span> */}
                            </div>
                        )
                    })}
                </optgroup>
            );
        });
        return selects;
        /* const { items } = this.props;
        const map = {};
        items.forEach(item => {
            let list = map[item.trace()];
            if (!list) { map[item.trace()] = []; };
            map[item.trace()].push(item);
        });

        const selects = [];
        Object.keys(map).forEach(key => {
            const list = map[key];
            selects.push(
                <optgroup key={key} label={key}>
                    {list.map((o: TraceSelectItem, index) => {
                        const label = o.item.content.toString();
                        const alias = o.item.alias.toString();

                        return (
                            <div key={index} {...{ value: o, label: label }}>
                                <span style={{ fontWeight: 'bold' }}>{label}</span><br />
                                <span style={{ fontSize: 12 }}>{alias}</span>
                            </div>
                        )
                    })}
                </optgroup>
            )
        }); */
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
        const { values } = this.state;
        return <SuperSelectField
            name={name}
            multiple={true}
            checkPosition='left'
            hintText={text}
            onChange={this.handleSelection.bind(this)}
            selectionsRenderer={(values) => { return <div style={{ height: "42px", lineHeight: "42px", padding: "0 10px" }}>{text}</div>; }}
            value={values}
            showAutocompleteThreshold={2}
            autocompleteFilter={this.fuzzyFilter}
            style={{ width: '50%', marginLeft : "45%" }}
            menuGroupStyle={{ color: "#455a64" }}
            elementHeight={46}
        >
            {this.itemsToSelects()}
        </SuperSelectField>
    }

}

export default MixingMutiSelect