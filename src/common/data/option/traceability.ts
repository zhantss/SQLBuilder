import { SelectItem } from '../define/extra'

export interface Traceability {
    trace(): any
}

export class TraceData {
    traceId: string
    traceName?: string
    props?: Object

    constructor(traceId: string, traceName?: string, props?: Object) {
        this.traceId = traceId;
        this.traceName = traceName;
        this.props = {...props};
    }   
}

export class TraceSelectItem implements Traceability  {
    item: SelectItem
    traceData: TraceData

    constructor(item: SelectItem, traceData: TraceData) {
        this.item = item;
        this.traceData = traceData;
    }

    trace() {
        return this.traceData.traceId;
    }
}