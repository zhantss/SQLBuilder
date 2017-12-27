import { parse, yy } from 'alasql'
import { Field } from './../model/data'
import { Function } from '../define/expression';

export function parser(sql: string) {
    return parse(sql);
}

export function getSelectItems(sql: string): Array<Field> {
    try {
        const type: any = yy;
        const last: any = parse(sql);
        const statement = last.statements[0];
        if (statement && statement instanceof type.Select) {
            const items = new Array<Field>();
            if (statement.columns) {
                statement.columns.forEach(c => {
                    // TODO Type, Table, DB
                    let alias: string = c.as ? c.as.toString() : null;
                    if (alias && alias.charAt(0) == "'" && alias.charAt(alias.length - 1) == "'") { alias = alias.substr(1, alias.length - 2)}

                    if (c.columnid) {       // column
                        items.push(new Field(c.columnid, alias));
                    } else if (c.aggregatorid) {        // Aggregate Functions
                        items.push(new Field(c.expression && c.expression.columnid ? c.aggregatorid + "(" + c.expression.columnid + ")" : c.toString(), alias));
                    } else {
                        items.push(new Field(c.toString(), alias));
                    }
                    // TODO custom value
                    // TODO case when
                })
            }
            return items;
        }
    } catch (error) {
        return null;
    }
    return null;
}

export function convertToState(sql: string, state) {
    try {
        const type: any = yy;
        const last: any = parse(sql);
        const statement = last.statements[0];
        if (statement && statement instanceof type.Select) {

        }
    } catch (error) {
        
    }

}

function convertSelect(select, state) {
    const from = select.from;
    const columns = select.columns;

    const joins = select.joins;
    
}