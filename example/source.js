const uuid = require('uuid')

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
        fields.push(String.fromCharCode(Math.floor(Math.random() * (90 - 65) + 65)));
    }

    const id = uuid.v4();
    /* let table = {
        name: name,
        fields: fields
    };//new DataModel.Data.Source(name, null, fields); */
    sources.push({
        identity: id,
        name: name,
        fields: fields
    })
}

module.exports = sources