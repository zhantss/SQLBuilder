import { Expression, AtomExpression } from '../define/expression'

export interface Selectable {
    isChecked(): boolean
}

export class SelectableExpression implements Selectable {
    checked: boolean
    content: Expression

    constructor(content: Expression, checked?: boolean) {
        this.content = content;
        this.checked = checked ? true : false;
    }

    isChecked(): boolean {
        return this.checked ? true : false;
    }
}  