import * as immutable from 'immutable'
import * as uuid from 'uuid'
import DEV from '../development'

let result = immutable.fromJS({
    
    sql: [],

    dialog : false,

    form: null,

    result: {}

});

export default result