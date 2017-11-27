import { parse, yy } from 'alasql'
import * as immutable from 'immutable'
import * as SQLParser from './sqlparser'
import Generator from './generator'
import { Data } from '../model'
import { Option } from '../option'
import { translateCombine } from '../option/translate'
import { JoinMode } from '../define/set'
import { Expression, Column, AllColumn } from './../define/expression';

class Select {
    select: Expression
    level: number
    constructor(select: Expression, level: number) {
        this.select = select;
        this.level = level;
    }
}

class Brackets {
    content: any
    constructor(content: any) {
        this.content = content;
    }
    toString(): string {
        return "(" + this.content.toString() + ")"
    }
}

export class SQLBuilder {
    private generator: Generator;
    private graphic: any;
    private options: any;
    private step: string;
    private type: any = yy;

    private selects: immutable.Map<string, immutable.Map<number, immutable.List<Select>>>

    constructor(state, step: string) {
        this.graphic = state.getIn(['graphic', 'graphic']);
        this.options = state.getIn(['option', 'options']);
        this.step = step;
        this.generator = new Generator();
        this.selects = immutable.Map<string, immutable.Map<number, immutable.List<Select>>>();
    }

    build() {
        const stepNode = this.graphic.getIn(this.step);

    }


    process(node, level, named: string) {
        const data = node.get('data');
        const nodes = node.get('nodes');
        const key = data.get('key');

        // TODO Alias
        const alias = named ? named : "T" + this.generator.generator();
        level = level == null ? 1 : level;

        if (data instanceof Data.Model) {
            const modelKey = key + ".SQLMODEL";
            let option = this.options.getIn(modelKey);
            if (option == null) {
                option = Option.tableConstructorByDataModel(data);
            }
            this.processTable(option, key, level);
        } else if (data instanceof Data.Source) {
            const sourceKey = key + ".SOURCE";
            let option = this.options.getIn(sourceKey);
            if (option == null) {
                option = Option.tableConstructorByDataSource(data);
            }
            this.processTable(option, key, level);
        }

        let curr = this.type.Select();

        // Select Items
        curr.columns = [];
        const levelItems: immutable.List<Select> = this.selects.getIn([key, level]);
        levelItems.forEach(li => {
            const columnid = li.select.toString();
            if (curr.columns.indexOf(columnid)) {
                curr.columns.push(new this.type.Column({
                    columnid: columnid,
                    tableid: alias,
                    alias: columnid + "_"
                }))
            } else {
                curr.columns.push(new this.type.Column({
                    columnid: columnid,
                    tableid: alias
                }))
            }
        });

        level = level++;

        // Select From 
        curr.form = [];
        curr.push(this.processFrom(data))

        // Join
        curr.joins = [];
        nodes.forEach(n => {
            const sub = this.options.getIn(n);
            const subnamed = "T" + this.generator.generator(); // TODO alias
            const statement = this.process(sub, level, subnamed);
            const join: Option.Join = this.options.getIn(n + ".JOIN");
            if (join && sub) {
                if (join.mode == JoinMode.NATURAL) {
                    // TODO from push sub select
                    let form = new Brackets(statement);
                    curr.form.push({...form, as: subnamed});
                } else {
                    // TODO join push 
                    new this.type.Join({
                        joinmode: JoinMode[join.mode],
                        select: statement, // TODO sub select
                        on: translateCombine(join.on),
                        as: subnamed
                    })
                }
            }
        })

        if (data instanceof Data.Select) {
            
        }

        // Where

        // GROUP BY

        // HAVING

        // ORDER BY

        // UNION


        return curr;
    }

    processTable(table: Option.Table, resource: string, level: number) {
        const items = table.items;
        let selects = immutable.List<Select>();
        items.forEach(i => {
            if (i.checked) {
                selects = selects.push(new Select(i.content, level));
            }
        });
        if (items.length > 0 && selects.size == 0) {
            selects.push(new Select(new AllColumn(), level));
        }
        this.pushSelects(resource, level, selects);
    }

    private pushSelects(resource: string, level: number, selects: immutable.List<Select>) {
        let list = this.selects.getIn([resource, level]);
        if (list == null) { list = immutable.List<Select>(); }
        list = list.push(selects);
        this.selects = this.selects.setIn([resource, level], list);
    }

    private pushSelect(resource: string, level: number, select: Select) {
        let list = this.selects.getIn([resource, level]);
        if (list == null) { list = immutable.List<Select>(); }
        list = list.push(select);
        this.selects = this.selects.setIn([resource, level], list);
    }

    processFrom(data) {
        if (data instanceof Data.Model) {
            try {
                const s: any = parse(data.sql);
                return s.statements[0];
            } catch (error) {
                throw 'build error, model sql is not valid'
            }
        } else if (data instanceof Data.Source) {
            return new this.type.Table({
                tableid: data.name,
                databaseid: data.db
            });
        }
    }
}