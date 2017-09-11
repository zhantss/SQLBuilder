import { createActionDispatch, actionTypeProcess, createAction } from './create'
import { OptionTarget } from '../data/option'

const pre = 'OPTION_';

const $types = {
    TARGET : 'TARGET',
    VISABLE: 'VISABLE'
}

const actions = {
    TARGET : ['target'],
    VISABLE : ['visable']
}

actionTypeProcess(pre, $types);
const $dispatch = createActionDispatch(pre, actions);


interface $actions {
    TARGET(target: OptionTarget) : any
    VISABLE(visbale: boolean) : any
}

export {
    $types,
    $dispatch,
    $actions
}