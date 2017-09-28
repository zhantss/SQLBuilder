import * as immutable from 'immutable'
import { graphic as init } from '../state'
import { graphic as action } from '../actions'
import create from './create'

import { DataModel } from '../data'

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
                    return state.setIn(['graphic', action.parentKey, 'nodes'], nodes).setIn(['graphic', currentNode.get('key')], currentNode);
                } else {
                    return state;
                }
            } else {
                if (currentPath != null && currentPath.size > 0) {
                    return state.setIn(['graphic', currentNode.get('key')], currentNode);
                } else {
                    currentNode = currentNode.set('path', immutable.fromJS([currentNode.get('key')]));
                    return state.setIn(['graphic', currentNode.get('key')], currentNode);
                }
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
    [action.$types.FIRST](state, action) {
        if (action && action.key) {
            return state.setIn(['key'], action.key);
        }
        return state;
    }
});

export default graphic;