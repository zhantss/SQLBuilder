export default class Generator {
    private cursor: number;
    constructor() {
        this.cursor == 0;
    }
    generator(): number {
        return this.cursor++;
    }
}