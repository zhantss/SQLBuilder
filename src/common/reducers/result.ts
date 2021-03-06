import * as immutable from 'immutable'
import * as RemoteUtils from '../api/utils'
import { result as init } from '../state'
import { result as action } from '../actions'
import create from './create'

const result = create(init, {
    [action.$types.BUILD](state, action) {
        if(action.sql) {
            const sql = state.get('sql');
            for(let i = 0; i < sql.length; i++) {
                if(i >= action.sql.length || action.sql[i].sql != sql[i].sql) {
                    state = state.setIn(['result', i], null);
                } 
            }
            state = state.set('sql', action.sql);
            state = state.set('dialog', true);
        }
        return state;
    },
    [action.$types.HIDE](state, action) {
        state = state.set('dialog', false);
        // state = state.set('result', immutable.Map({}));
        return state;
    },
    [action.$types.PREVIEW](state, action) {
        return state;
    },
    [RemoteUtils.ok(action.$types.PREVIEW)](state, action) {
        if(action.result && action.payload) {
            let result = state.get('result');
            if(result) {
                result = result.set(action.payload.index, action.result);
                state = state.set('result', result);
            } else {
                const x = {};
                x[action.payload.index] = action.result;
                state = state.set('result', immutable.Map(x))
            }
        }
        return state;
    },
    [action.$types.SAVE](state, action) {
        state = state.set('loading', true);
        return state;
    },
    [action.$types.FORM](state, action) {
        if(action && action.form) {
            state = state.set('form', action.form);
        }
        return state;
    },
    [RemoteUtils.ok(action.$types.SAVE)](state, action) {
        state = state.set('loading', false);
        state = state.set('success', true);
        return state;
    },
    [RemoteUtils.no(action.$types.SAVE)](state, action) {
        state = state.set('loading', null);
        state = state.set('success', false);
        return state;
    }
});

export default result;