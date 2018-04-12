import axios from 'axios'
import * as Actions from '../actions/result'
// import url from './url'
import API from './api'

function preview(data) {
    const { index, sql } = data;
    return axios.post(window.SQLBuilder.url.sql_model_preview, { index, sql: sql })
        .then(response => {
            return response.data;
        }).catch(error => {
            throw error;
        })
}

function save(data) {
    const { sqls } = data;
    return axios.post(window.SQLBuilder.url.sql_model_save, { sqls })
        .then(response => {
            return response.data;
        }).catch(error => {
            throw error;
        })
}

const api_preview = new API(Actions.$types.PREVIEW, preview)
const api_save = new API(Actions.$types.SAVE, save)

export {
    api_preview,
    api_save
}