/**
 * @param init      init state
 * @param handler   reducer process handler
 */
export default function createReducer(init, handler) {

    return function reducer(state = init, action) {
        if (Object.prototype.hasOwnProperty.call(handler, action.type)){
            return handler[action.type](state, action)
        }
        return state;
    }

}