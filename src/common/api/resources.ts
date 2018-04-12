import axios from 'axios'
import * as Actions from '../actions/resources'
// import url from './url'
import API from './api'

function getGroup() {
    return axios.post(window.SQLBuilder.url.get_resources_group);
}

function getModel() {
    return axios.post(window.SQLBuilder.url.get_resources_model);
}

function getSource() {
    return axios.post(window.SQLBuilder.url.get_resources_source);
}

function api(data) {
    return axios.all([getGroup(), getModel(), getSource()])
        .then(axios.spread((groups, models, sources) => {
            // TODO
            return {
                groups: groups.data,
                models: models.data,
                sources: sources.data
            }
        }))
        .catch(error => {
            throw error;
        });
}

export default new API(Actions.$types.REFRESH, api)