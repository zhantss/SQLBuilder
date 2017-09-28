import { createActionDispatch, actionTypeProcess, createAction } from './create'
import { DataModel } from '../data'

const pre = 'GRAPHIC_';

const $types = {
    CREATE : 'CREATE',
    UPDATE : 'UPDATE',
    DELETE: 'DELETE',
    DATA: 'DATA',
    FIRST : 'FIRST'
}

const actions = {
    CREATE : ['data'],
    UPDATE : ['parentKey', 'currentNode'],
    DELETE : ['nodeKey'],
    DATA: ['nodeKey', 'data'],
    FIRST : ['key']
}

actionTypeProcess(pre, $types);
const $dispatch = createActionDispatch(pre, actions);

interface $actions {
    CREATE(data: any) : any
    UPDATE(parentKey: string, currentNode: any) : any
    DELETE(nodeKey: string) : any
    DATA(nodeKey: string, data: DataModel.Data.Data): any
    FIRST(key: string): any
}

export {
    $types,
    $dispatch,
    $actions
}