export interface Relation {

}

export class Join implements Relation {
    mode?: string
    number: number
}

export class SetOperation implements Relation {
    mode?: string
}