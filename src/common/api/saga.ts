import axios from 'axios'
import { call, put, all, takeEvery, takeLatest } from 'redux-saga/effects'

import * as utils from './utils'

import * as ResourcesActions from '../actions/resources'
import * as ResultActions from '../actions/result'

import ResourcesAPI from './resources'
import * as ResultAPI from './result'

function* doit(load) {
    let { type, payload } = load;
    if(payload == null) payload = {};
    try {
        let result = null;
        switch (type) {
            case ResourcesAPI.type: {
                result = yield call(ResourcesAPI.api as any, payload)
                break;
            }
            case ResultAPI.api_preview.type: {
                result = yield call(ResultAPI.api_preview.api as any, payload)
                break;
            }
            case ResultAPI.api_save.type: {
                result = yield call(ResultAPI.api_save.api as any, payload)
                break;
            }
            default: {
                console.log("no request")
            }
        }
        if (result) {
            yield put({
                type: utils.ok(type),
                payload,
                result
            })
        }
    } catch (error) {
        yield put({
            type: utils.no(type),
            payload
        })
        // throw error;
    }
}

export default function* watch() {
    yield all([
        takeLatest(ResourcesAPI.type, /* ResourcesAPI.api */doit),
        takeEvery(ResultAPI.api_preview.type, doit),
        takeLatest(ResultAPI.api_save.type, doit),
    ]);
}