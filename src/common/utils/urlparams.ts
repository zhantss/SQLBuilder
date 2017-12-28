function urlparser(): Object {
    let params = {};
    let search = window.location.search;
    if (search && search.length > 0) {
        search = search.substr(1);
        let rs = search.split("&");
        rs.forEach((r) => {
            var part = r.split("=");
            if (part.length == 2) {
                params[decodeURIComponent(part[0])] = decodeURIComponent(part[1]);
            } else if (part.length == 1) {
                params[decodeURIComponent(part[0])] = null;
            }
        })
    }
    return params;
}

let params = urlparser();
const urlparams = {};
Object.keys(params).forEach(k => {
    try {
        urlparams[k] = JSON.parse(params[k]);
    } catch (error) {
        urlparams[k] = params[k];
    }
})

export {
    urlparser,
    urlparams
}