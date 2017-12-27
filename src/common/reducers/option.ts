import * as immutable from 'immutable'
import { option as init } from '../state'
import { option as action } from '../actions'
import create from './create'

const option = create(init, {
    [action.$types.SUBMIT](state, action) {
        if (action.identity && action.option) {
            const copy = state.getIn(['options', action.identity + ".BACKUP"]);
            if(copy) {
                state = state.deleteIn(['options', action.identity + ".BACKUP"]);
                state = state.setIn(['options', action.identity], copy)
            } else {
                state = state.setIn(['options', action.identity], action.option)
            }
        }
        return state;
    },
    [action.$types.SUBMITS](state, action) {
        if (action.submits) {
            const submits: Array<{identity: string, option: any}> = action.submits;
            submits.forEach(submit => {
                const identity = submit.identity;
                const option = submit.option;
                state = state.setIn(['options', identity], option)
            })
        }
        return state;
    },
    [action.$types.REMOVE](state, action) {
        if (action.identity) {
            const copy = state.getIn(['options', action.identity]);
            state = state.deleteIn(['options', action.identity]);
            state = state.setIn(['options', action.identity + ".BACKUP"], copy);
        }
        return state;
    },
    [action.$types.PUSH](state, action) {
        if (action.title && action.optionType != null && action.optionTarget && action.position) {
            state = state.set('title', action.title);
            state = state.set('type', action.optionType);
            state = state.set('target', action.optionTarget);
            state = state.set('position', action.position);
            state = state.set('visable', true);
            return state;
        }
        return state;
    },
    [action.$types.DROP](state, action) {
        state = state.delete('title').delete('type').delete('target').set('visable', false);
        return state;
    },
    [action.$types.CREATE](state, action) {
        if(action && action.data) {
            return immutable.fromJS(action.data);
        }
        return state;
    }
});

export default option;