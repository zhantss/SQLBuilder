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

module.exports = groups