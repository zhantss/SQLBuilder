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

import ResourcesItem from './resourcesItem'
import Icon from '../icon'

interface ResourcesModelProps {
    open?: boolean
    display?: boolean
    resources: any
    actions: resourcesAction.$actions
}

interface ResourcesModelState {
    search?: string
    mark?: any
    db?: any
    tree?: any
    // path?: any
    open?: any
    superopen?: boolean
}

class ResourcesModel extends React.PureComponent<ResourcesModelProps, ResourcesModelState> {

    constructor(props) {
        super(props);
        this.state = this.modelFilter(props.resources, null);
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this.modelFilter(nextProps.resources, null));
    }

    private modelFilter(resources, search): any {
        const groups = resources.get('groups');
        const models = resources.get('models');
        if (models == null) {
            return {
                search: null,
                db: [],
                tree: null,
                mark: null,
                superopen: null
            };
        }

        const db = [];
        let path = {};
        let mark: any = new Array<string>();
        let pmark: any = new Array<string>();
        let tree = immutable.fromJS({
            root: {

            }
        });
        let sort = groups.sort((pre, after) => {
            return pre.get('depth') - after.get('depth');
        });
        sort.forEach(el => {
            const parent = el.get('parent');
            const identity = el.get('identity');
            const name = el.get('name');
            db.push(name);
            let pre = null;
            if (parent != null) {
                if (path[parent] == null) {
                } else {
                    const parentNode = tree.getIn(path[parent]);
                    if (parentNode) {
                        pre = path[parent];
                    }
                }
            } else {
                pre = ['root'];
            }

            if (pre != null) {
                let curr = pre.concat(['nodes', identity])
                if (search != null) {
                    if (name.indexOf(search) != -1) {
                        el = el.set('disable', false);
                        mark = mark.concat(curr);
                        pmark = pmark.concat(pre);
                    } else {
                        el = el.set('disable', true);
                    }
                }
                el = el.set('group', true);
                tree = tree.setIn(curr, el);
                path[identity] = curr;
            }
        });

        models.forEach(el => {
            const parent = el.get('parent');
            const identity = el.get('identity');
            const name = el.get('name');
            db.push(name);
            if (parent != null && path[parent] != null) {
                let pre = path[parent];
                let parentNode = tree.getIn(path[parent]);
                let curr = pre.concat(['nodes', identity]);
                if (search != null && name.indexOf(search) == -1) {
                    el = el.set('disable', true);
                    if (!parentNode.get('disable')) {
                        el = el.set('disable', false);
                    }
                } else {
                    el = el.set('disable', false);
                    // mark = mark.concat(curr);
                    mark = mark.concat(pre);
                    pmark = pmark.concat(pre);
                }
                tree = tree.setIn(curr, el);
            }
        });

        mark = immutable.fromJS(mark).toSet().toList();
        pmark = immutable.fromJS(pmark).toSet().toList();
        let open = immutable.fromJS({});
        if (search != null) {
            pmark.forEach(el => {
                open = open.set(el, true);
            })
        }

        return {
            // path: path,
            tree: tree,
            mark: mark,
            search: search,
            db: db,
            open: open,
            superopen: null
        }
    }

    private treeBuild(tree, mark) {
        let res = new Array();
        if (tree && mark) {
            const roots = tree.getIn(['root', 'nodes']);
            roots.forEach(el => {
                res.push(this.nodeBuild(el, mark));
            })
        }
        return res;
    }

    private nodeBuild(node, mark) {
        let leaf = node.get('nodes') == null;
        const nodes = node.get('nodes');
        const disable = node.get('disable');
        // const mark = node.get('mark');
        const group = node.get('group');
        const { search } = this.state;
        if (group) {
            const identity = node.get('identity');
            let nestedItems = new Array();
            if(nodes != null) {
                nodes.forEach(element => {
                    nestedItems.push(this.nodeBuild(element, mark));
                });
            }
            if (mark.indexOf(identity) != -1) {
                return <ListItem
                    key={identity}
                    primaryText={<Icon name={'folder'} content={node.get('name')} />}
                    initiallyOpen={search == null ? this.props.open : false}
                    primaryTogglesNestedList={true}
                    open={this.canOpen(this.state.superopen, this.state.open.get(identity))}
                    nestedItems={nestedItems}
                    data-identity={identity}
                    onNestedListToggle={this.nestedListToggle.bind(this)}
                />
            } else if (disable) {
                return null;
            } else {
                return <ListItem
                    key={identity}
                    primaryText={<Icon name={'folder'} content={node.get('name')} />}
                    initiallyOpen={search == null ? this.props.open : false}
                    primaryTogglesNestedList={true}
                    open={this.canOpen(this.state.superopen, this.state.open.get(identity))}
                    onNestedListToggle={this.nestedListToggle.bind(this)}
                    nestedItems={nestedItems}
                    data-identity={identity}
                />
            }
        } else {
            const identity = node.get('identity');
            const parent = node.get('parent');
            if (disable) {
                return null;
            } else {
                return <ListItem
                    key={identity}
                    primaryText={<ResourcesItem {...{ icon: "insert_drive_file", content: node.get('name'), itemKey: node.get('identity'), data: node } as any } />}
                    className={`resources-item`}
                />
            }
        }
    }

    canOpen(global, self) {
        if (global == null) {
            return self;
        }
        return global;
    }

    setSearch(text) {
        const { resources } = this.props;
        this.setState(this.modelFilter(resources, text));
    }

    updateSearch(text) {
        if (text == "") {
            const { resources } = this.props;
            this.setState(this.modelFilter(resources, null));
        }
    }

    nestedListToggle(item) {
        const identity = item.props['data-identity'];
        let { open, superopen } = this.state;
        const already = open.get(identity);
        let now = open.get(identity) ? false : true;
        now = superopen == false ? true : superopen == true ? false : now;
        open = open.set(identity, now);
        this.setState({
            open: open,
            superopen: null
        })
    }

    handleSuperOpenToggle() {
        this.setState({
            superopen: this.state.superopen ? false : true
        })
    }

    render() {
        const { tree, mark, db } = this.state;
        let modelList = this.treeBuild(tree, mark);
        return (
            <CardText expandable={true} className={classnames('resources-card-text', { "display-none": !this.props.display })}>
                <AutoComplete
                    style={{ padding: "0 16px", boxSizing: "border-box" }}
                    floatingLabelText={<Icon name={'search'} content={cn.resources_selecter_model} custom={"auto-complete"} />}
                    filter={AutoComplete.fuzzyFilter}
                    dataSource={db != null ? db : []}
                    maxSearchResults={10}
                    onNewRequest={this.setSearch.bind(this)}
                    onUpdateInput={this.updateSearch.bind(this)}
                    fullWidth={true}
                />
                <Toggle
                    className={'resources-card-toggle'}
                    toggled={this.state.superopen ? true : false}
                    onToggle={this.handleSuperOpenToggle.bind(this)}
                    labelPosition={"right"}
                    label={this.state.superopen ? cn.resources_selecter_model_switch_close : cn.resources_selecter_model_switch_open}
                />
                <List style={{ overflow: 'auto' }}>
                    {modelList}
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
)(ResourcesModel);