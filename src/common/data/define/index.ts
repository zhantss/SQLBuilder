import * as statement from './statement'
import * as fromItem from './fromItem'
import * as expression from './expression'
import * as Extra from './extra'

const Statement = statement;
const Expression = expression;
const FromItem = fromItem;

const Select = statement.Select;
const Table = fromItem.Table;
const Join = Extra.Join;
const JoinMode = Extra.JoinMode;
const Order = Extra.Order;
const OrderMode = Extra.OrderMode;
const SetOperation = Extra.SetOperation
const SetOperationType = Extra.SetOperationType
const SetOperators = Extra.SetOperators

export {
    Statement,
    Expression,
    FromItem,
    Select,
    Table,
    Join,
    JoinMode,
    Order,
    OrderMode,
    SetOperators,
    SetOperation,
    SetOperationType
}

