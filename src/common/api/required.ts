export default {
    "groupID" : {
        pre: null,
        hide: true,
        code: "groupID",
        db: "$url.groupID"
    },
    "connID" : {
        pre: null,
        hide: true,
        code: "connID",
        db: "$url.connID"
    },
    "code": {
        pre: null,
        code: "code",
        name: "模型代码"
    },
    "text": {
        pre: null,
        code: "text",
        name: "模型名称"
    },
    "reportUnitTypeCol": {
        pre: null,
        code: "reportUnitTypeCol",
        name: "维度模式",
        db: {
            "automatic" : "有时间机构维度模式",
            "manual" : "无机构时间维度模式"
        }
    },
    "orgCol" : {
        pre: {
            key: "reportUnitTypeCol",
            value: "automatic"
        },
        code: "orgCol",
        name: "报表机构维度",
        db: "$builder.items"
    },
    "dateCol" : {
        pre: {
            key: "reportUnitTypeCol",
            value: "automatic"
        },
        code: "dateCol",
        name: "报表时间维度",
        db: "$builder.items"
    },
    "selectItems": {
        pre: null,
        hide: true,
        code: "selectItems",
        db: "$builder.items"
    },
    "sql": {
        pre: null,
        hide: true,
        code: "sql",
        db: "$builder.sql"
    },
    "serialize" : {
        pre: null,
        hide: true,
        code: "serialize",
        db: "$builder.serialize"
    }
}