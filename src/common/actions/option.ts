import { createActionDispatch, actionTypeProcess, createAction } from './create'
import { OptionTarget, OptionType, OptionPosition } from '../data/option'

const pre = 'OPTION_';

const $types = {
    CREATE: 'CREATE',
    TARGET: 'TARGET',
    VISABLE: 'VISABLE',
    PUSH: 'PUSH',
    DROP: 'DROP',
    SUBMIT: 'SUBMIT',
    SUBMITS: 'SUBMITS',
    REMOVE: 'REMOVE'
}

const actions = {
    CREATE: ['data'],
    TARGET: ['target'],
    VISABLE: ['visable'],
    PUSH: ['title', 'optionType', 'optionTarget', 'position'],
    DROP: [],
    SUBMIT: ['identity', 'option'],
    SUBMITS: ['submits'],
    REMOVE: ['identity']
}

actionTypeProcess(pre, $types);
const $dispatch = createActionDispatch(pre, actions);


interface $actions {
    CREATE(data: any): any
    TARGET(target: OptionTarget): any
    VISABLE(visbale: boolean): any
    PUSH(title: string, optionType: OptionType, optionTarget: OptionTarget, position: OptionPosition): any
    DROP(): any
    SUBMIT(identity: string, option: any): any
    SUBMITS(submits: Array<{identity: string, option: any}>): any
    REMOVE(identity: string): any
}

export {
    $types,
    $dispatch,
    $actions
}