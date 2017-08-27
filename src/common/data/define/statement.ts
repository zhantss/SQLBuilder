import { Expression, Column } from './expression';
import { FromItem } from './fromItem'
import { Join, Order } from './extra'


export interface Statement {

}

export class Select implements Statement {
    items: Array<Expression>
    fromItem: FromItem
    joins: Array<Join>
    where: Expression
    groups: Array<Column>
    having: Expression
    orders: Array<Order>
    // TODO Limit
    // TODO Fetch
    // TODO Offset
    // TODO Skip
    // TODO First
    // TODO Top
    // TODO Oracle OEM
}