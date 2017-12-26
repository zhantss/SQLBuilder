import { Expression, Column, AtomExpression } from './expression';
import { FromItem } from './fromItem'
import { Join, JoinMode } from './set'
import { Order, SelectItem } from './extra'


export interface Statement {

}

export class Select implements Statement {
    items: Array<SelectItem>
    fromItem: FromItem
    joins?: Array<Join>
    where?: Expression
    groups?: Array<Column>
    having?: Expression
    orders?: Array<Order>
    // TODO Limit
    // TODO Fetch
    // TODO Offset
    // TODO Skip
    // TODO First
    // TODO Top
    // TODO Oracle OEM

    toString() {
        let s = "SELECT " + (this.items.length > 0 ? this.items.join(", ") : "*") + " FROM " + this.fromItem.toString();
        if(this.joins) {
            const filters = this.joins.filter(j => {
                return j.mode == JoinMode.NATURAL
            })
            if(filters.length > 0) {
                s = s + ", " + this.joins.join(", ");
            } else {
                this.joins.forEach(join => {
                    s = s + " " + join.toString();
                })
            }  
        }
        if(this.where) {
            s = s + " WHERE " + this.where.toString();
        }
        if(this.groups && this.groups.length > 0) {
            s = s + " GROUP BY " + this.groups.join(", ");
        }
        if(this.having) {
            s = s + " HAVING " + this.having.toString();
        }
        if(this.orders && this.orders.length > 0) {
            s = s + " ORDER BY " + this.orders.join(", ");
        }
        return s;
    }
}