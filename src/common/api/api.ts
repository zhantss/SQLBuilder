import axios from 'axios'

import context from './context'
import { urlparams } from '../utils/urlparams'

axios.interceptors.request.use(config => {
    const { data, method } = config;
    config.timeout = 10000;
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