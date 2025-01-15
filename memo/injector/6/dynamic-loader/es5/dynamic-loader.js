;(function(){ // ES5 DynamicLoader
var DynamicLoader = function(onSucceeded, onFailed, onFinally) {
    this.name = 'DynamicLoader'
}
DynamicLoader.prototype.series = function(paths) {

};
DynamicLoader.prototype.all = function(paths) {

};
DynamicLoader.prototype.allSettled = function(paths) {

};
DynamicLoader.prototype.race = function(paths) {

};
var Injector = function() {}
Injector.prototype.inject() { this.getParent(el).appendChild(el); }
Injector.prototype.getParent(e) {
    if ('SCRIPT'===el.tagName || 'IMG'===el.tagName) {return document.body}
    else if ('LINK'===el.tagName) {return document.head}
    else {console.warn(`指定された要素を挿入できませんでした。script,img,link要素のみ有効です:`, el); return null;}
}

/*
CallbackScriptElementMaker 
CallbackLinkElementMaker 
CallbackOnLoadLinkElementMaker 
CallbackImgOnErrorLinkElementMaker 
*/
window.DynamicLoader = DynamicLoader;
})();
