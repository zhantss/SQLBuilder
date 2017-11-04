export class OptionTarget {
    target: OptionItem
    addition?: Array<OptionItem>

    constructor() {
        this.addition = new Array();
    }
}

export class OptionItem {
    id: any
    item: any

    constructor(id, item) {
        this.id = id;
        this.item = item;
    }
}