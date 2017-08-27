import * as immutable from 'immutable'
import * as uuid from 'uuid'
import { DataModel } from '../data'
import DEV from '../development'

/**
 * 资源选择器State
 */
let resources = immutable.fromJS({

    /** 数据模型 */
    model: [],

    /** 数据源 */
    original: [],

});

if (DEV) {
    const groups = [
        {
            identity: "1",
            name: "客户信息",
            depth: 1
        },
        {
            identity: "1.1",
            name: "客户资料",
            parent: "1",
            depth: 2
        },
        {
            identity: "1.2",
            name: "客户存款",
            parent: "1",
            depth: 2
        },
        {
            identity: "1.3",
            name: "客户贷款",
            parent: "1",
            depth: 2
        }
    ]
    resources = resources.set('groups', immutable.fromJS(groups));

    const models = [
        {
            identity: uuid.v4(),
            name: "客户个人信息",
            data : new DataModel.Data.Model("客户个人信息", "SELECT * FROM CUSTOM_INFO"),
            parent: "1.1",
        },
        {
            identity: uuid.v4(),
            name: "客户详细信息",
            data : new DataModel.Data.Model("客户详细信息", "SELECT * FROM CUSTOM_DETAIL"),
            parent: "1.1"
        },
        {
            identity: uuid.v4(),
            name: "客户关联关系",
            data : new DataModel.Data.Model("客户关联关系", "SELECT * FROM CUSTOM_RELATION"),
            parent: "1.1"
        },
        {
            identity: uuid.v4(),
            name: "客户存款7月统计",
            data : new DataModel.Data.Model("客户存款7月统计", "SELECT * FROM CUSTOM_DEPOSIT WHERE MONTH = 7"),
            parent: "1.2"
        },
        {
            identity: uuid.v4(),
            name: "客户存款9月统计",
            data : new DataModel.Data.Model("客户存款9月统计", "SELECT * FROM CUSTOM_DEPOSIT WHERE MONTH = 9"),
            parent: "1.2"
        },
        {
            identity: uuid.v4(),
            name: "客户贷款7月统计",
            data : new DataModel.Data.Model("客户贷款7月统计", "SELECT I.ID, I.NAME, SUM(L.AMOUNT) FROM CUSTOM_INFO I LEFT JOIN CUSTOM_LOAN L ON I.ID = L.CUSTOM_ID GROUP BY I.ID WHERE L.AMOUNT IS NOT NULL AND L.MONTH = 7"),
            parent: "1.3"
        },
        {
            identity: uuid.v4(),
            name: "客户贷款9月统计",
            data : new DataModel.Data.Model("客户贷款9月统计", "SELECT I.ID, I.NAME, SUM(L.AMOUNT) FROM CUSTOM_INFO I LEFT JOIN CUSTOM_LOAN L ON I.ID = L.CUSTOM_ID GROUP BY I.ID WHERE L.AMOUNT IS NOT NULL AND L.MONTH = 9"),
            parent: "1.3"
        }
    ]
    resources = resources.set('models', immutable.fromJS(models));

    const sources = [];
    let size = 100;
    while (size--) {
        let name = "";
        let length = Math.floor(Math.random() * (10 - 4) + 4);
        while (length--) {
            name = name + String.fromCharCode(Math.floor(Math.random() * (90 - 65) + 65));
        }
        let fields = [];
        let number = Math.floor(Math.random() * (20 - 2) + 2);
        while (number--) {
            fields.push(new DataModel.Data.Field(String.fromCharCode(Math.floor(Math.random() * (90 - 65) + 65)), null));
        }

        const id = uuid.v4();
        let table = new DataModel.Data.Source(name, null, fields);
        sources.push({
            identity: id,
            name: name,
            data: table
        })
    }
    resources = resources.set('sources', immutable.fromJS(sources));
}

export default resources;