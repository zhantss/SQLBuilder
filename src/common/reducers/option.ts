import * as immutable from 'immutable'
import { option as init } from '../state'
import { option as action } from '../actions'
import create from './create'

const option = create(init, {
    [action.$types.TARGET](state, action){
        // TODO
        return init;
    },
    [action.$types.VISABLE](state, action) {
        // TODO
        return init;
    }
});

export default option;