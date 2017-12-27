import * as immutable from 'immutable'
import { sync as init } from '../state'
import { sync as action } from '../actions'
import create from './create'

const sync = create(init, {
    [action.$types.SYNC](state, action) {
        if(action && action.info) {
            return state.set("info", action.info).set("dialog", true);
        }
        return state;
    },
    [action.$types.END](state, action) {
        return state.set("info", null).set("dialog", false);
    }
});

export default sync;