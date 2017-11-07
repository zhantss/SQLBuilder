import { parse, yy } from 'alasql'
import { Field } from './../model/data'

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
                    items.push(new Field(c.alias ? c.alias : c.columnid));
                })
            }
            return items;
        }
    } catch (error) {
        return null;
    }
    return null;
}