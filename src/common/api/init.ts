import axios from 'axios'
import { Store } from 'redux'
import { urlparams } from '../utils/urlparams'
import { deserialize } from '../utils/serialization'
import url from './url'
import { cn } from '../../ui/text/index';
import urlrequired from './urlrequired'

function initialization(store: Store<{}>) {
    const params = urlparams;
    let init = null;
    if (params && params[urlrequired]) {
        try {
            init = params[urlrequired];
            if (init.modelId) {
                store.dispatch({ type: "SYNC_SYNC", info: cn.sync_dialog_info });
                axios.post(url.get_model_init, { modelId: init.modelId })
                    .then(response => {
                        const data = response.data;
                        if (data && data.id && data.serialize && data.serialize.graphic && data.serialize.option && data.form) {
                            store.dispatch({ type: "GRAPHIC_CREATE", data: deserialize(data.serialize.graphic) });
                            store.dispatch({ type: "OPTION_CREATE", data: deserialize(data.serialize.option) });
                            const form = {};
                            form[data.id] = data.form;
                            store.dispatch({ type: "RESULT_FORM", form: form });
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
