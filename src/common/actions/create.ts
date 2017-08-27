export function createActionType(pre: string, actions: {[key: string]: Array<string>}) {
    const res = {};
    for (let i in actions) {
        res[i] = pre + i;
    }
    return res;
}

export function actionTypeProcess(pre: string, types: {[key: string]: string}) {
    for (let i in types) {
        types[i] = pre + types[i];
    }
}

export function createActionDispatch(pre: string, actions: {[key: string]: Array<string>}) {
    const res = {};
    for (let i in actions) {
        res[i] = (...args) => {
            let type = pre + i;
            let action = { type };
            actions[i].forEach((arg, index) => { action[arg] = args[index]; })
            return action;
        }
    }
    return res;
}

export function createAction(pre: string, actions: {[key: string]: Array<string>}): {[key: string]: {[key: string]: any}} {
    let type = {};
    let dispatch = {};

    for (let i in actions) {
        let assemble = pre + i;
        type[i] = assemble;

        dispatch[i] = (...args) => {
            let type = pre + i;
            let action = { assemble };
            actions[i].forEach((arg) => { action[arg] = arg; })
            return action;
        }
    }

    return {
        $type : type,
        $dispatch : dispatch
    }
}