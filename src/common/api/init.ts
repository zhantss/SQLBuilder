import axios from 'axios'
import { Store } from 'redux'
import UrlParams from '../utils/urlparams'
import { deserialize } from '../utils/serialization'
import url from './url'
import { cn } from '../../ui/text/index';


function initialization(store: Store<{}>) {
    const request = "init";
    const params = UrlParams();
    let init = null;
    if (params && params[request]) {
        store.dispatch({ type: "SYNC_SYNC", info: cn.sync_dialog_info });
        try {
            init = JSON.parse(params[request]);
            if (init.modelId) {
                axios.post(url.get_model_init, { modelId: init.modelId })
                    .then(response => {
                        const data = response.data;
                        if (data && data.graphic && data.option) {
                            store.dispatch({ type: "GRAPHIC_CREATE", data: deserialize(data.graphic) });
                            store.dispatch({ type: "OPTION_CREATE", data: deserialize(data.option) });
                        }
                        store.dispatch({ type: "SYNC_END" })
                    }).catch(error => {
                        throw error;
                    }) 
            }
        } catch (error) {
            console.error(error);
            store.dispatch({ type: "SYNC_SYNC", info: cn.sync_dialog_info });
        }
    }

}

export {
    initialization
}
