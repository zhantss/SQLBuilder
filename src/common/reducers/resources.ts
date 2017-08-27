import { resources as init } from '../state'
import { resources as action } from '../actions'
import create from './create'

const resources = create(init, {
    [action.$types.REFRESH](state, action) {
        // TODO
        return action.data;
    },
    [action.$types.UPDATE](state, action) {
        // TODO
        return action.data;
    }
});

export default resources;