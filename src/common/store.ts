import { createStore, applyMiddleware } from 'redux'
import * as immutable from 'immutable'
import { combineReducers } from 'redux-immutable'
import { routerReducer, routerMiddleware } from 'react-router-redux'
import { logger, createLogger } from 'redux-logger'
import createSagaMiddleware from 'redux-saga'
import * as reducers from './reducers'
import history from './history'

import DEV from './development'

const middleware = routerMiddleware(history);
const superLogger = createLogger({
    stateTransformer: (state) => {
        if (immutable.Iterable.isIterable(state)) {
            return state.toJS();
        }
        return state;
    }
})

let apply = applyMiddleware(middleware);
if (DEV) {
    apply = applyMiddleware(middleware, superLogger);
}

const store = createStore(combineReducers({
    ...reducers,
    router: routerReducer
}), apply);

export default store;