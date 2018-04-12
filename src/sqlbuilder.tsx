import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Route } from 'react-router'
import { ConnectedRouter } from 'react-router-redux'

// TODO onTouchTap event error info fix
import { TouchTapEventHandler } from 'material-ui'
declare module 'react' {
    interface DOMAttributes<T> {
        onTouchTap?: TouchTapEventHandler;
    }
};

interface SQLBuilder {
    bootstrap(): any
    urlrequired: any
    required: any
    url: any
    axios: any
}

declare global {
    interface Window { SQLBuilder: SQLBuilder }
}

const SQLBuilder: SQLBuilder = {
    bootstrap: null,
    urlrequired: null,
    required: null,
    url: null,
    axios: null
}

window.SQLBuilder = SQLBuilder

import history from './common/history'
import store from './common/store'
import { initialization } from './common/api/init'

// react-virtualized
import 'react-virtualized/styles.css'

import './style/icon.scss'
import * as ui from './ui'

SQLBuilder.bootstrap = function () {
    if (this.urlrequired && this.required && this.url) {
        ReactDOM.render(
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <Route /* exact */ path="/" component={ui.launcher} />
                </ConnectedRouter>
            </Provider>
            , document.getElementById("root"), () => {
                initialization(store)
            });
    }

}

//import * as alasql from 'alasql'
//console.log(alasql.parse('SELECT A.A AS AA, B.B, C.C FROM A LEFT JOIN B ON A.A = B.BA LEFT JOIN (SELECT * FROM AC) C ON (A.A = C.CA OR A.C = C.CC) AND B.B = C.CB AND C.C > 100'));
//console.log(alasql.parse('SELECT A.A, B.B FROM (SELECT C.A, D.B FROM C, D) A, B WHERE (B.C = 100 AND B.D = 1000) AND A.G = 2000'));
//console.log(alasql.parse('SELECT city.*, country.* FROM city LEFT OUTER JOIN country USING countryid, A'))
//console.log(alasql.parse('SELECT A FROM B UNION SELECT A FROM C EXCEPT SELECT A FROM D'))
//console.log(alasql.yy)

/* ReactDOM.render(

    <Provider store={store}>
        <ConnectedRouter history={history}>
            <Route  path="/" component={ui.launcher} />
        </ConnectedRouter>
    </Provider>

    , document.getElementById("root"), () => {
        initialization(store)
    }); */

export default SQLBuilder