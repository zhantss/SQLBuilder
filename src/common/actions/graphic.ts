import * as immutable from 'immutable'
import { createActionDispatch, actionTypeProcess, createAction } from './create'
import { DataModel } from '../data'
import { TraceField } from '../data/option/traceability';

const pre = 'GRAPHIC_';

const $types = {
    CREATE : 'CREATE',
    UPDATE : 'UPDATE',
    DELETE: 'DELETE',
    DATA: 'DATA',
    FIRST : 'FIRST',
    SELECT : 'SELECT',
    SELECTS : 'SELECTS'
}

const actions = {
    CREATE : ['data'],
    UPDATE : ['parentKey', 'currentNode'],
    DELETE : ['nodeKey'],
    DATA: ['nodeKey', 'data'],
    FIRST : ['key'],
    SELECT : ['nodeKey', 'tfs', 'appends'/* , 'selects' */],
    SELECTS : ['selects']
}

actionTypeProcess(pre, $types);
const $dispatch = createActionDispatch(pre, actions);

interface $actions {
    CREATE(data: any) : any
    UPDATE(parentKey: string, currentNode: any) : any
    DELETE(nodeKey: string) : any
    DATA(nodeKey: string, data: DataModel.Data.Data): any
    FIRST(key: string): any
    SELECT(nodeKey: string, tfs: any, appends: any/* , selects: Array<string> */)
    SELECTS(selects: Array<{nodeKey: string, tfs: any, appends: any}>)
}

export {
    $types,
    $dispatch,
    $actions
}