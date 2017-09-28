import { bindActionCreators } from 'redux'
import { connect as ReactReduxConnect } from 'react-redux'
import * as actions from '../../common/actions'

export const mapStateToProps = (mapping) => {
    return (state, ownProps) => {
        let res = {};
        if (mapping) {
            Object.keys(mapping).forEach(k => {
                if (mapping[k]) {
                    res[k] = state.getIn(mapping[k]);
                }
            })
        }
        return res;
    }
}

export const mapDispatchToProps = (mapping) => {
    return (dispatch, ownProps) => {
        const publish = {};
        Object.keys(mapping).forEach(k => {
            if (actions[k] && actions[k].$dispatch) {
                publish[k] = bindActionCreators(actions[k].$dispatch, dispatch);
            }
        })
        return {
            actions: publish
        };
    }
}

export const connect = (options, mapping) => {
    return ReactReduxConnect(
        mapStateToProps(mapping),
        mapDispatchToProps(mapping),
        null,
        options ? options : {}
    );
}