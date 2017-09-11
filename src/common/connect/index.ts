import * as innerConnect from './connect'
import * as innerConnect2 from './connect2'

const connectMapStateToProps = innerConnect.mapStateToProps
const connectMapDispatchToProps = innerConnect.mapDispatchToProps
const connect = innerConnect.connect
const connect2 = innerConnect2.connect;

export {
    connectMapDispatchToProps,
    connectMapStateToProps,
    connect,
    connect2
}