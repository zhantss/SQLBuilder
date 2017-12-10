import { result as init } from '../state'
import { result as action } from '../actions'
import create from './create'

const result = create(init, {
    [action.$types.BUILD](state, action) {
        if(action.sql) {
            state = state.set('sql', action.sql);
            state = state.set('dialog', true);
        }
        return state;
    },
    [action.$types.HIDE](state, action) {
        state = state.set('dialog', false);
        return state;
    }
});

export default result;