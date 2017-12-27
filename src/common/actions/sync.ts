import { createActionDispatch, actionTypeProcess, createAction } from './create'

const pre = 'SYNC_';

const $types = {
    SYNC: 'SYNC',
    END: 'END'
}

const actions = {
    SYNC: ['info'],
    END: []
}

actionTypeProcess(pre, $types);
const $dispatch = createActionDispatch(pre, actions);

interface $actions {
    SYNC(info: string): any
    END(): any
}

export {
    $types,
    $dispatch,
    $actions
}