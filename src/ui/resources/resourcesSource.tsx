import * as React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as classnames from 'classnames'
import * as immutable from 'immutable'

import { resources as resourcesAction } from '../../common/actions'
import { cn } from '../text'

import { CardText } from 'material-ui/Card';
import Subheader from 'material-ui/Subheader';
import AutoComplete from 'material-ui/AutoComplete';
import Toggle from 'material-ui/Toggle';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';

import ResourcesItem from './resourcesItem'
import Icon from '../icon'

interface ResourcesSourceProps {
    display?: boolean
    resources: any
    actions: resourcesAction.$actions
}

interface ResourcesSourceState {
    search?: string
    db?: any
    list?: any
}

class ResourcesSource extends React.PureComponent<ResourcesSourceProps, ResourcesSourceState> {

    constructor(props) {
        super(props);
        this.state = this.sourceFilter(props.resources, null);
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this.sourceFilter(nextProps.resources, null));
    }

    private sourceFilter(resources, search) {
        const sources = resources.get('sources');
        if (sources == null) {
            return {
                search: null,
                db: [],
                list: null
            }
        }

        let list = immutable.fromJS([]);
        let db = [];
        sources.forEach(el => {
            const name = el.get('name');
            if (name != null) {
                db.push(name);
                if (search != null && name.indexOf(search) == -1) {
                    el = el.set('disbale', true);
                } else {
                    el = el.set('disable', false);
                }
                list = list.push(el);
            }
        });
        return {
            list: list,
            search: search,
            db: db
        }
    }

    private listBuild(list) {
        let res = new Array();
        if (list) {
            list.forEach(el => {
                res.push(this.nodeBuild(el));
            })
        }
        return res;
    }

    private nodeBuild(node) {
        const disable = node.get('disable');
        const identity = node.get('identity');
        if (disable) {
            return null;
        } else {
            return <ListItem
                key={identity}
                primaryText={<ResourcesItem {...{ icon: "insert_drive_file", content: node.get('name'), itemKey: identity, data: node } as any } />}
                className={`resources-item`}
            />
        }
    }

    setSearch(text) {
        const { resources } = this.props;
        this.setState(this.sourceFilter(resources, text));
    }

    updateSearch(text) {
        if (text == "") {
            const { resources } = this.props;
            this.setState(this.sourceFilter(resources, null));
        }
    }

    render() {
        const { list, db } = this.state;
        const sourceList = this.listBuild(list);
        return (
            <CardText expandable={true} className={classnames('resources-card-text', { "display-none": !this.props.display })}>
                <AutoComplete
                    style={{ padding: "0 16px", boxSizing : "border-box" }}
                    floatingLabelText={<Icon name={'search'} content={cn.resources_selecter_source} custom={"auto-complete"} />}
                    filter={AutoComplete.fuzzyFilter}
                    dataSource={db != null ? db : []}
                    maxSearchResults={10}
                    onNewRequest={this.setSearch.bind(this)}
                    onUpdateInput={this.updateSearch.bind(this)}
                    fullWidth={true}
                />
                <List style={{ overflow: 'auto' }}>
                    {sourceList}
                </List>
            </CardText>
        )
    }

}

const mapStateToProps = (state, ownProps) => {
    return {
        resources: state.get('resources')
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        actions: bindActionCreators(resourcesAction.$dispatch, dispatch)
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ResourcesSource);