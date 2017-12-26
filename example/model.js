const uuid = require('uuid')
const models = [
    {
        identity: uuid.v4(),
        name: "客户个人信息",
        sql: "SELECT NAME, AGE, SEX, AREA FROM CUSTOM_INFO",
        parent: "1.1",
    },
    {
        identity: uuid.v4(),
        name: "客户详细信息",
        sql: "SELECT NAME, BUSINESS, PROFESSION FROM CUSTOM_DETAIL",
        parent: "1.1"
    },
    {
        identity: uuid.v4(),
        name: "客户关联关系",
        sql: "SELECT TARGET_, INFO, RELATION FROM CUSTOM_RELATION",
        parent: "1.1"
    },
    {
        identity: uuid.v4(),
        name: "客户存款7月统计",
        sql: "SELECT ID, NAME, AMOUNT FROM CUSTOM_DEPOSIT WHERE MONTH = 7",
        parent: "1.2"
    },
    {
        identity: uuid.v4(),
        name: "客户存款9月统计",
        sql: "SELECT ID, NAME, AMOUNT FROM CUSTOM_DEPOSIT WHERE MONTH = 7",
        parent: "1.2"
    },
    {
        identity: uuid.v4(),
        name: "客户贷款7月统计",
        sql: "SELECT I.ID, I.NAME, SUM(L.AMOUNT) '贷款额' FROM CUSTOM_INFO I LEFT JOIN CUSTOM_LOAN L ON I.ID = L.CUSTOM_ID WHERE L.AMOUNT IS NOT NULL AND L.MONTH = 7 GROUP BY I.ID",
        parent: "1.3"
    },
    {
        identity: uuid.v4(),
        name: "客户贷款9月统计",
        sql: "SELECT I.ID, I.NAME, '测试' || '结果' as GG, SUM(L.AMOUNT) AS [贷款额] FROM CUSTOM_INFO I LEFT JOIN CUSTOM_LOAN L ON I.ID = L.CUSTOM_ID WHERE L.AMOUNT IS NOT NULL AND L.MONTH = 9 GROUP BY I.ID",
        parent: "1.3"
    }
]

module.exports = models