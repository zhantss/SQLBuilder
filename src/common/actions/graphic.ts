import { createActionDispatch, actionTypeProcess, createAction } from './create'
import { DataModel } from '../data'

const pre = 'GRAPHIC_';

const $types = {
    CREATE : 'CREATE',
    UPDATE : 'UPDATE',
    DATA: 'DATA',
    FIRST : 'FIRST'
}

const actions = {
    CREATE : ['data'],
    UPDATE : ['parentKey', 'currentNode'],
    DATA: ['nodeKey', 'data'],
    FIRST : ['key']
}

actionTypeProcess(pre, $types);
const $dispatch = createActionDispatch(pre, actions);

interface $actions {
    CREATE(data: any) : any
    UPDATE(parentKey: string, currentNode: any) : any
    DATA(nodeKey: string, data: DataModel.Data.Data)
    FIRST(key: string): any
}

export {
    $types,
    $dispatch,
    $actions
}