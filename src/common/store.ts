import { createStore, applyMiddleware } from 'redux'
import * as immutable from 'immutable'
import { combineReducers } from 'redux-immutable'
import { routerReducer, routerMiddleware } from 'react-router-redux'
import { logger, createLogger } from 'redux-logger'
import createSagaMiddleware from 'redux-saga'

import DEV from './development'
import watch from './api/saga'
import history from './history'

import * as reducers from './reducers'
// import { serialize } from './utils/serialization';

const middleware = routerMiddleware(history);
const superLogger = createLogger({
    stateTransformer: (state) => {
        if (immutable.Iterable.isIterable(state)) {
            return state.toJS();
        }
        return state;
    }
})

const saga = createSagaMiddleware()

// TODO State Time Line

let apply = applyMiddleware(middleware, saga);
if (DEV) {
    apply = applyMiddleware(middleware, saga, superLogger);
}

const store = createStore(combineReducers({
    ...reducers,
    router: routerReducer
}), apply);
saga.run(watch as any)

/* store.subscribe(() => {
    const state: any = store.getState();
    const graphic = state.get('graphic');
    const options = state.getIn(['option', 'options']);
    console.log(serialize(graphic))
    console.log(serialize(options))
}) */

export default store;