import * as statement from './statement'
import * as fromItem from './fromItem'
import * as expression from './expression'
import * as Extra from './extra'
import * as Set from './set'

const Statement = statement;
const Expression = expression;
const FromItem = fromItem;

const Select = statement.Select;
const Table = fromItem.Table;
const Join = Set.Join;
const JoinMode = Set.JoinMode;
const SetOperation = Set.SetOperation
const SetOperationType = Set.SetOperationType
const SetOperators = Set.SetOperators
const Order = Extra.Order;
const OrderMode = Extra.OrderMode;

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

