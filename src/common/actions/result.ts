import { createActionDispatch, actionTypeProcess, createAction } from './create'

const pre = 'RESULT_';

const $types = {
    BUILD: 'BUILD',
    HIDE: 'HIDE',
    PREVIEW: 'PREVIEW',
    SAVE: 'SAVE',
    FORM: 'FORM'
}

const actions = {
    BUILD: ['sql'],
    HIDE: [],
    PREVIEW: ['payload'],
    SAVE: ['payload'],
    FORM: ['form']
}

actionTypeProcess(pre, $types);
const $dispatch = createActionDispatch(pre, actions);

interface $actions {
    BUILD(sql: Array<any>): any
    HIDE(): any
    PREVIEW({ index: number, sql: string }): any,
    SAVE({ sqls: any }): any,
    FORM(form: any): any
}

export {
    $types,
    $dispatch,
    $actions
}