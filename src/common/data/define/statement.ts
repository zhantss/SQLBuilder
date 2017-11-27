import { Expression, Column, AtomExpression } from './expression';
import { FromItem } from './fromItem'
import { Join } from './set'
import { Order, SelectItem } from './extra'


export interface Statement {

}

export class Select implements Statement {
    items: Array<SelectItem>
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