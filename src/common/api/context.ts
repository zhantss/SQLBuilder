let appHref = window.document.location.href;

let appProtocol = window.location.protocol;

let appAbsolute = appHref.substring(appProtocol.length + 2);

let appPath = window.document.location.pathname;

let appPos = appAbsolute.indexOf(appPath);

let appAddress = appAbsolute.substring(0, appPos);

let appContext = appAbsolute.substring(appAbsolute.indexOf("/"));

let context = appPath;

if (appContext.length > 1) {
    context = appContext.substring(1);
    context = context.substring(0, context.indexOf("/"));
} else {

}

if (context == "#") {
    context = appPath;
} else {
    context = "/" + context + "/";
}

export default context;