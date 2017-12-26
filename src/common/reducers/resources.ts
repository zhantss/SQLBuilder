import * as immutable from 'immutable'

import * as RemoteUtils from '../api/utils'
import { DataModel } from '../data'
import { resources as init } from '../state'
import { resources as action } from '../actions'
import create from './create'

const resources = create(init, {
    [action.$types.REFRESH](state, action) {
        // TODO
        return state;
    },
    [RemoteUtils.ok(action.$types.REFRESH)](state, action) {
        const { groups, models, sources } = action.result;
        if(groups && models && sources) {
            const ngs = groups.map(g => {
                return g;
            })
            const nms = [];
            models.forEach(m => {
                const { name, sql , identity, parent } = m;
                if(name && sql && identity && parent) {
                    nms.push({
                        identity,
                        parent,
                        name: name,
                        data: new DataModel.Data.Model(name, sql)
                    })
                }
            });
            const nss = [];
            sources.forEach(s => {
                const { name, fields, identity } = s;
                if(name && fields && identity) {
                    nss.push({
                        identity,
                        name: name,
                        data: new DataModel.Data.Source(name, null, fields.map(field => { return new DataModel.Data.Field(field); }))
                    })
                }
            });
            state = state.setIn(['groups'], immutable.fromJS(ngs)).setIn(['models'], immutable.fromJS(nms)).setIn(['sources'], immutable.fromJS(nss));
        }
        return state;
    },
    [RemoteUtils.no(action.$types.REFRESH)](state, action) {
        return state;
    },
    [action.$types.UPDATE](state, action) {
        // TODO
        return action.data;
    }
});

export default resources;