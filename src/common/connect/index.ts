import * as innerConnect from './connect'

const connectMapStateToProps = innerConnect.mapStateToProps
const connectMapDispatchToProps = innerConnect.mapDispatchToProps
const connect = innerConnect.connect

export {
    connectMapDispatchToProps,
    connectMapStateToProps,
    connect
}