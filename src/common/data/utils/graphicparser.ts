import * as immutable from 'immutable'
import * as uuid from 'uuid'
import { Expression, AtomExpression, Column } from '../define/expression'
import { SelectItem, Alias } from '../define/extra'
import { Option } from '../option'
import { Data as DataModel } from '../model'
import { Trace, TraceField, Designation } from '../option/traceability'

export function collectSelectItems(collecter: string, id: string, graphic: any) {
    return collectOneNode(collecter, id, graphic).toJS();
}

function collectOneNode(collecter: string, id: string, graphic: any) : immutable.Map<string, immutable.List<TraceField>> {
    const node = graphic.get(id);
    if (node) {
        const key = node.get('key');
        const identity = node.get('identity');
        const name = node.get('name');
        const data = node.get('data');
        const nodes = node.get('nodes');
        const tfs: immutable.Map<string, TraceField> = node.get('tfs');
        const appends: immutable.Map<string, TraceField> = node.get('appends');

        let res = immutable.Map<string, immutable.List<TraceField>>();
        if(collecter != id) {
            res = res.set(key, immutable.List<TraceField>(tfs.merge(appends).values()));
        } else {
            res = res.set(key, immutable.List<TraceField>(tfs.values()));
        }
        if (nodes) {
            nodes.forEach(nid => {
                res = res.merge(collectOneNode(collecter, nid, graphic));
            })
        } else if (data instanceof DataModel.Select) {
            const cid = data.children;
            res = res.merge(collectOneNode(collecter, cid, graphic));
        }
        return res;
    }
    return immutable.fromJS({});
}

export const UNIQUE_DESIGNATION_SEPARATOR = "_";

export function uniqueDesignation(unique: string): string {
    if(unique && unique.length > 2 && unique.charAt(unique.length - 2) == UNIQUE_DESIGNATION_SEPARATOR) {
        const number = parseInt(unique.charAt(unique.length - 1))
        if(!isNaN(number)) {
            return unique.slice(0, unique.length - 1) + (number + 1);
        }
    }
    return unique + UNIQUE_DESIGNATION_SEPARATOR + '1';
}