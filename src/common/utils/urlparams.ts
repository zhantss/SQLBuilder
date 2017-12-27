export default (): Object => {
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