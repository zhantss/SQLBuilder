import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Route } from 'react-router'
import { ConnectedRouter } from 'react-router-redux'

// TODO test
import * as injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import history from './common/history'
import store from './common/store'

import './style/icon.scss'
import * as ui from './ui'

import * as alasql from 'alasql'
console.log(alasql.parse('SELECT A.A, B.B, C.C FROM A LEFT JOIN B ON A.A = B.BA LEFT JOIN (SELECT * FROM AC) C ON (A.A = C.CA OR A.C = C.CC) AND B.B = C.CB AND C.C > 100'));
console.log(alasql.parse('SELECT city.*, country.* FROM city LEFT OUTER JOIN country USING countryid, A'))
console.log(alasql.parse('SELECT A FROM B UNION SELECT A FROM C EXCEPT SELECT A FROM D'))
console.log(alasql.yy)

ReactDOM.render(

    <Provider store={store}>
        <ConnectedRouter history={history}>
            <Route exact path="/" component={ui.launcher}/>
        </ConnectedRouter>
    </Provider>

    , document.getElementById("root"));