import axios from 'axios'

import context from './context'
import { urlparams } from '../utils/urlparams'

axios.interceptors.request.use(config => {
    const { data, method } = config;
    config.timeout = 3000;
    if(window.SQLBuilder.axios) {
        if(window.SQLBuilder.axios.context) {
            config.baseURL = window.SQLBuilder.axios.context;
        }
        if(window.SQLBuilder.axios.timeout) {
            config.timeout = window.SQLBuilder.axios.timeout;
        }
    }
    if (method == 'post') {
        let request = null;
        if(data) {
            request = {...data, urlparams};
        } else {
            request = {
                urlparams
            }
        }
        
        const params = new URLSearchParams();
        Object.keys(request).forEach(name => {
            let value = request[name];
            if(typeof value != 'string') {
                value = JSON.stringify(value);
            }
            params.append(name, value);
        })
        config.data = params;
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        return config;
    }
    return config;
})

axios.interceptors.response.use(response => {
    const data = response.data;
    if(data.success == true && data.data) {
        response.data = data.data;
    } else if(data.success == false) {
        throw 'request fail';
    } else if(data.success == null) {

    }
    return response;
})

axios.defaults.baseURL = context;

class API {
    type: string
    api: (data: any) => Promise<any>

    constructor(type: string, api: (data: any) => Promise<any>) {
        this.type = type;
        this.api = api;
    }
}

export default API