import axios from 'axios'

import context from './context'

axios.interceptors.request.use(config => {
    const { data, method } = config;
    config.timeout = 10000;
    if (method == 'post' && data) {
        const params = new URLSearchParams();
        Object.keys(data).forEach(name => {
            let value = data[name];
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