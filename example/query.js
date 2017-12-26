//@ts-nocheck
const alasql = require('alasql')

function extract(statement) {
    const type = alasql.yy;
    if (statement && statement instanceof type.Select) {
        let items = [];
        if (statement.columns) {
            statement.columns.forEach(c => {
                // TODO Type, Table, DB
                let alias = c.as ? c.as.toString() : null;
                if (alias && alias.charAt(0) == "'" && alias.charAt(alias.length - 1) == "'") { alias = alias.substr(1, alias.length - 2)}

                if (c.columnid) {       // column
                    items.push(alias ? alias : c.columnid);
                } else if (c.aggregatorid) {        // Aggregate Functions
                    items.push(alias ? alias : c.expression && c.expression.columnid ? c.aggregatorid + "(" + c.expression.columnid + ")" : c.toString());
                } else {
                    items.push(alias ? alias : c.toString());
                }
                // TODO custom value
                // TODO case when
            })
        }
        if(items.length == 1 && items[0] == "*" && statement.from && statement.from.length > 0) {
            items = [];
            statement.from.forEach(fs => {
                items = items.concat(extract(fs));
            })
        }
        return items;
    }
}

function random() {
    let value = "";
    let length = Math.floor(Math.random() * (10 - 4) + 4);
    while (length--) {
        value = value + String.fromCharCode(Math.floor(Math.random() * (90 - 65) + 65));
    }
    return value;
}

function result(sql) {
    try {
        const last = alasql.parse(sql);
        const statement = last.statements[0];
        const items = extract(statement);
        if(items && items.length > 0) {
            const result = {
                cols: [].concat(items),
                body: []
            }
            let rows = 1000;
            while(rows--) {
                const row = {};
                items.forEach(i => {
                    row[i] = random();
                })
                result.body.push(row);
            }
            return result;
        }
        return {}
    } catch (error) {
        return {};
    }
}

module.exports = result