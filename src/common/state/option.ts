import * as immutable from 'immutable'
import * as uuid from 'uuid'
import DEV from '../development'

/**
 * 操作区域State
 */
let option = immutable.fromJS({

    visable: false,

    title: "",

    type: null,

    target: null,

    position: null,

    options: {}

});

export default option;