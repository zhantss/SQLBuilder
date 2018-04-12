window.SQLBuilder.url = {
    get_model_init: "/get/model/init",

    get_resources_group: "/get/resources/group",
    get_resources_model: "/get/resources/model",
    get_resources_source: "/get/resources/source",

    sql_model_save: "/sql/model/save",
    sql_model_preview: "/sql/model/preview"
}

window.SQLBuilder.required = {
    "groupID": {
        pre: null,
        hide: true,
        code: "groupID",
        db: "$url.groupID"
    },
    "connID": {
        pre: null,
        hide: true,
        code: "connID",
        db: "$url.connID"
    },
    "code": {
        pre: null,
        code: "code",
        name: "模型代码",
        required: true
    },
    "text": {
        pre: null,
        code: "text",
        name: "模型名称",
        required: true
    },
    "reportUnitTypeCol": {
        pre: null,
        code: "reportUnitTypeCol",
        name: "维度模式",
        db: {
            "automatic": "有时间机构维度模式",
            "manual": "无机构时间维度模式"
        },
        default: "automatic",
        required: true
    },
    "orgCol": {
        pre: {
            key: "reportUnitTypeCol",
            value: "automatic"
        },
        code: "orgCol",
        name: "报表机构维度",
        db: "$builder.items",
        required: true
    },
    "dateCol": {
        pre: {
            key: "reportUnitTypeCol",
            value: "automatic"
        },
        code: "dateCol",
        name: "报表时间维度",
        db: "$builder.items",
        required: true
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
    "serialize": {
        pre: null,
        hide: true,
        code: "serialize",
        db: "$builder.serialize"
    }
}

window.SQLBuilder.urlrequired = "init"
window.SQLBuilder.axios = {
    context: null,
    timeout: 10000
}

window.SQLBuilder.bootstrap();

export default window.SQLBuilder