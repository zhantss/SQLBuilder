import { createActionDispatch, actionTypeProcess, createAction } from './create'

const pre = 'RESULT_';

const $types = {
    BUILD : 'BUILD',
    HIDE : 'HIDE'
}

const actions = {
    BUILD : ['sql'],
    HIDE : []
}

actionTypeProcess(pre, $types);
const $dispatch = createActionDispatch(pre, actions);

interface $actions {
    BUILD(sql: Array<string>) : any,
    HIDE() : any
}

export {
    $types,
    $dispatch,
    $actions
}