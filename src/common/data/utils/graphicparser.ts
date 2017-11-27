import * as immutable from 'immutable'
import { Expression, AtomExpression, Column } from '../define/expression'
import { SelectItem, Alias } from '../define/extra'
import { Option } from '../option'
import { Data as DataModel } from '../model'
import { Traceability, TraceData, TraceSelectItem } from '../option/traceability'

export function collectSelectItems(id: string, graphic: any) {
    return collectOneNode(id, graphic).toJS();
}

function collectOneNode(id: string, graphic: any) : immutable.Map<string, immutable.List<TraceSelectItem>> {
    const node = graphic.get(id);
    if (node) {
        const key = node.get('key');
        const identity = node.get('identity');
        const name = node.get('name');
        const data = node.get('data');

        let res = immutable.Map<string, immutable.List<TraceSelectItem>>();
        const td = new TraceData(key, name, { identity: identity });
        if (data instanceof DataModel.Model || data instanceof DataModel.Source) {
            const fs = data.fields;
            fs.forEach(f => {
                const si = new SelectItem(new Column(f.name));
                if (f.alias) { si.alias = new Alias(f.alias, true); }
                const tsi = new TraceSelectItem(si, td);
                res = res.set(key, res.get(key) != null ? res.get(key).push(tsi) : immutable.List<TraceSelectItem>().push(tsi));
            })
            const nodes = node.get('nodes');
            if (nodes) {
                nodes.forEach(nid => {
                    res = res.merge(collectOneNode(nid, graphic));
                })
            }
        } else if (data instanceof DataModel.Select) {
            const cid = data.children;
            res = res.merge(collectOneNode(cid, graphic));
        }
        return res;
    }
    return immutable.fromJS({});
}