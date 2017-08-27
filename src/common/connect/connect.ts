import { bindActionCreators } from 'redux'
import { connect as ReactReduxConnect } from 'react-redux'
import * as actions from '../../common/actions'

export const mapStateToProps = (states) => {
    return (state, ownProps) => {
        let res = {};
        if (states) {
            states.forEach(element => {
                res[element] = state.get(element)
            })
        }
        return res;
    }
}

export const mapDispatchToProps = (states) => {
    return (dispatch, ownProps) => {
        if (states.length == 0) {
            return {}
        }
        if (states.length == 1 && actions[states[0]]) {
            return {
                actions: bindActionCreators(actions[states[0]].$dispatch, dispatch)
            }
        } else {
            let res = {};
            states.forEach(element => {
                if (actions[element]) {
                    res[element] = bindActionCreators(actions[element].$dispatch, dispatch)
                }
            })
            return {
                actions: res
            }
        }
    }
}

export const connect = (options, ...states) => {
    return ReactReduxConnect(
        mapStateToProps(states),
        mapDispatchToProps(states),
        null,
        options ? options : {}
    );
}