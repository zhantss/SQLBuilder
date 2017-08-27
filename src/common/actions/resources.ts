import { createActionDispatch, actionTypeProcess, createAction } from './create'

const pre = 'RESOURCES_';

const $types = {
    REFRESH : 'REFRESH',
    UPDATE : 'UPDATE'
}

const actions = {
    REFRESH : [],
    UPDATE : ['data']
}

actionTypeProcess(pre, $types);
const $dispatch = createActionDispatch(pre, actions);

interface $actions {
    REFRESH() : any,
    UPDATE(data) : any
}

export {
    $types,
    $dispatch,
    $actions
}