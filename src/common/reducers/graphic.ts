import * as immutable from 'immutable'
import { graphic as init } from '../state'
import { graphic as action } from '../actions'
import create from './create'

import { DataModel } from '../data'
import { Trace, TraceField, Designation, Creater, DataSource } from '../data/option/traceability';
import { SelectItem, Alias } from '../data/define/extra';
import { Column } from '../data/define/expression';

function collectionTraceField(node): any {
    const key = node.get('key');
    const identity = node.get('identity');
    const name = node.get('name');
    const path = node.get('path').toJS();
    const data = node.get('data');
    let tfs: immutable.Map<string, TraceField> = node.get('tfs');
    let fs = null;
    if (data instanceof DataModel.Data.Source) {
        fs = data.fields;
    } else if (data instanceof DataModel.Data.Model) {
        fs = data.fields;
    }
    if(tfs) {
        tfs = immutable.Map<string, TraceField>(tfs.map((value, key) => {
            let v = value;
            v.trace.update(path);
            return v;
        }));/* 
        fs.forEach(f => {
            let tf: TraceField = tfs.getIn([f.identity]);
            if (tf) {
                tf.trace.updatePath(path);
                tfs.setIn([tf.identity], tf);
            } else {
                const trace = new Trace(key, name, path);
                const item = new SelectItem(new Column(f.name));
                if (f.alias) { item.alias = new Alias(f.alias, true); }
                const tf = new TraceField(f.identity, item, trace);
                tfs = tfs.setIn([tf.identity], tf);
            }
        }) */
    } else {
        tfs = immutable.Map<string, TraceField>();
        fs.forEach(f => {
            const item = new SelectItem(new Column(f.name));
            if (f.alias) { item.alias = new Alias(f.alias, true); }
            const creater = new Creater(key, identity, name, item.clone());
            const datasource = new DataSource(key, identity, name, item.clone());
            const trace = new Trace(datasource, creater, path);
            const tf = new TraceField(f.identity, trace);
            tfs = tfs.setIn([tf.id], tf);
        })
    }
    return node.set('tfs', tfs);
}

const graphic = create(init, {
    [action.$types.DELETE](state, action) {
        if (action && action.nodeKey) {
            let graphic = state.get('graphic');
            if (graphic) {
                graphic = graphic.filterNot((v, k) => {
                    const path = v.get('path');
                    if (path && path.indexOf(action.nodeKey) != -1) {
                        return true;
                    }
                    return false;
                });
                state = state.set('graphic', graphic);
                if (graphic.size <= 0) {
                    state = state.delete('key');
                }
            }
        }
        return state;
    },
    [action.$types.UPDATE](state, action) {
        if (action && action.currentNode) {
            let currentNode = action.currentNode;
            const orginalParentKey = currentNode.get('parent');
            const topKey = currentNode.get('top');
            const currentPath = currentNode.get('path');

            // Original Parent Node
            if (orginalParentKey) {
                if (orginalParentKey == action.parentKey) {
                    return state;
                }
                let orginalParentNode = state.getIn(['graphic', orginalParentKey]);
                if (orginalParentNode) {
                    let orginalParentNodes: immutable.List<string> = orginalParentNode.get('nodes');
                    if (orginalParentNodes) {
                        let index = orginalParentNodes.findIndex(function (item): boolean {
                            return item == currentNode.get('key');
                        })
                        if (index >= 0) {
                            orginalParentNodes = orginalParentNodes.delete(index);
                            orginalParentNode = orginalParentNode.set('nodes', orginalParentNodes);
                            state = state.setIn(['graphic', orginalParentKey], orginalParentNode);
                        }
                    }
                }

            }

            // Drag entrance item to children item
            const entrances = state.get('entrances');
            if (entrances) {
                let index = entrances.indexOf(currentNode.get('key'));
                if (index >= 0) {
                    state = state.setIn(['entrances'], entrances.delete(index));
                }
            }

            // Sub Select & Set Operators
            if (topKey) {
                if (action.parentKey) {
                    currentNode = currentNode.set('top', null);
                    let topNode = state.getIn(['graphic', topKey]);
                    if (topNode) {
                        let topData = topNode.get('data');
                        if (topData instanceof DataModel.Data.Select) {
                            topNode = topNode.set('data', new DataModel.Data.Select('new Select', null));
                            state = state.setIn(['graphic', topKey], topNode);
                        } else if (topData instanceof DataModel.Data.SetOperators) {
                            topNode = topNode.set('data', new DataModel.Data.SetOperators(null));
                            state = state.setIn(['graphic', topKey], topNode);
                        }
                    }
                } else {
                    currentNode = currentNode.set('parent', null);
                }
            }

            // Parent Node 
            if (action.parentKey) {
                currentNode = currentNode.set('parent', action.parentKey);
                const parentNode = state.getIn(['graphic', action.parentKey]);
                if (parentNode) {
                    let nodes = parentNode.get('nodes');
                    if (nodes) {
                        nodes = nodes.push(currentNode.get('key'))
                    } else {
                        nodes = immutable.fromJS([currentNode.get('key')]);
                    }

                    let path = parentNode.get('path');
                    if (path) {
                        path = path.push(currentNode.get('key'));
                    } else {
                        path = immutable.fromJS([currentNode.get('key')]);
                    }
                    currentNode = currentNode.set('path', path);
                    currentNode = collectionTraceField(currentNode);
                    return state.setIn(['graphic', action.parentKey, 'nodes'], nodes).setIn(['graphic', currentNode.get('key')], currentNode);
                } else {
                    return state;
                }
            } else {
                // Multi Selection
                const entrances: immutable.List<string> = state.get('entrances');
                if(entrances) {
                    if(entrances.indexOf(currentNode.get('key')) == -1) {
                        state = state.setIn(['entrances'], entrances.push(currentNode.get('key')));
                    }
                } else {
                    state = state.setIn(['entrances'], immutable.fromJS([currentNode.get('key')]));
                }

                currentNode = currentNode.set('parent', null).set('path', immutable.fromJS([currentNode.get('key')]));
                currentNode = collectionTraceField(currentNode);
                return state.setIn(['graphic', currentNode.get('key')], currentNode);
                
                // if (currentPath != null && currentPath.size > 0) {
                //     currentNode = currentNode.set('path', immutable.fromJS([currentNode.get('key')]));
                //     return state.setIn(['graphic', currentNode.get('key')], currentNode);
                // } else {
                //     currentNode = currentNode.set('path', immutable.fromJS([currentNode.get('key')]));
                //     return state.setIn(['graphic', currentNode.get('key')], currentNode);
                // }
            }
        }
        return state;
    },
    [action.$types.DATA](state, action) {
        let nodeKey = action.nodeKey;
        let data = action.data;
        if (nodeKey) {
            let node = state.getIn(['graphic', nodeKey]);
            if (node) {
                node = node.set('data', data);
                return state.setIn(['graphic', nodeKey], node);
            }
        }
        return state;
    },
    [action.$types.SELECT](state, action) {
        let nodeKey = action.nodeKey;
        let tfs = action.tfs;
        let appends = action.appends;
        let selects = action.selects;
        if(nodeKey && tfs && appends) {
            let node = state.getIn(['graphic', nodeKey]);
            if (node) {
                node = node.set('tfs', tfs);
                node = node.set('appends', appends);
                node = node.set('selects', selects);
                return state.setIn(['graphic', nodeKey], node);
            }
        }
        return state;
    },
    [action.$types.FIRST](state, action) {
        if (action && action.key) {
            return state.setIn(['key'], action.key);
        }
        return state;
    }
});

export default graphic;