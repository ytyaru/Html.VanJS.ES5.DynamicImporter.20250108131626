;(function(){
class Supported { // ブラウザに機能が実装されているか
    constructor() {
        this._hasPromise()
        this._hasAsync()
    }
    get isPromise() { return this._isPromise }
    get isAsync() { return this._isAsync }
    _hasPromise() {
        if ('undefined' === typeof Promise) {this._isPromise=false}
        if (-1 === Promise.toString().indexOf('[native code]')) {this._isPromise=false}
        this._isPromise=true
    }
    _hasAsync() {
        try { this._isAsync = eval(`typeof Object.getPrototypeOf(async function() {}).constructor === 'function'`); }
        catch (exception) { this._isAsync = false; }
    }
}
class DynamicLoader { // Async/Then/Callback のどれをロードするか決定する
    static Supported = new Supported;
    static new(onSucceeded, onFailed, onFinally, onStepSucceeded, onStepFailed, onStepFinally) {
        return new (this.class())(onSucceeded, onFailed, onFinally, onStepSucceeded, onStepFailed, onStepFinally)
    }
    static class() {
        console.log(this.Supported.isPromise, this.Supported.isAsync)
             if (this.Supported.isPromise &&  this.Supported.isAsync) {return AsyncDynamicLoader}
        else if (this.Supported.isPromise && !this.Supported.isAsync) {return ThenDynamicLoader}
        else {return CallbackDynamicLoader}
    }
}
class Injector { // 指定した要素を所定の箇所に挿入する
    inject(el) {
        const parent = this.getParent(el);
        parent.appendChild(el)
    }
    getParent(el) {
        if (['SCRIPT','IMG'].some(n=>n===el.tagName)) { return document.body }
        else if ('LINK'===el.tagName) {return document.head} // <link rel="stylesheet">はbodyに動的挿入しても反映されなかった
        else {console.warn(`指定された要素を挿入できませんでした。script,img,link要素のみ有効です:`, el); return null;}
    }
}
class ElementMakerRouter { // 読み込むファイルの種別に応じたMakerを返す
    constructor(type='img.onerror') {
        this._map = new Map(this.select(type));
    }
    get(path) {
        console.log('ElementMakerRouter.get():', path)
        const parts = path.split('.')
        const ext = parts.slice(-1)[0]
        if (!this._map.has(ext)) {
            console.warn(`拡張子 ${ext} は動的読込できません。${[...this._map.keys()]}のいずれかのみ動的読込できます。次のファイルの読込はしません。:${path}`);
            return null
        } else {return this._map.get(ext)}
//        } else {console.log('ElementMakerRouter.get():', this._map.get(ext));return this._map.get(ext)}
    }
    select(type) {
        //if (DynamicLoader._.Supported.isPromise) {return [
        if (DynamicLoader.Supported.isPromise) {return [
            ['js', new PromiseScriptElementMaker()],
            ['css', new PromiseLinkElementMaker(type)],
        ]} else {return [
            ['js', new CallbackScriptElementMaker()],
            ['css', new CallbackLinkElementMaker(type)],
        ]}
    }
}
class CallbackScriptElementMaker {
    make(src, onLoad, onError) {
        const onload = (e)=>{ onLoad({status:'resolve', path:src, event:e}); };
        const onerror = (e)=>{ onError({status:'reject', path:src, event:e}); };
        return this.makeBase(src, onload, onerror)
    }
    makeBase(src, onLoad, onError) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.className = 'dynamic-loader';
        script.src = src;
        script.onload = onLoad;
        script.onerror = onError;
        return script;
    }
}
class CallbackLinkElementMaker { // ES5で作り直した版も欲しい
    constructor(type='img.onerror') {
        this._type = this.getType(type)
        this._makers = {'img.onerror':null,'link.onload':null}
    }
    make(path, resolver, rejector) { return this.getMaker().make(path, resolver, rejector) }
    getMaker() {
        if (!this._makers[this._type]) { this._makers[this._type] = Reflect.construct(this.selectMaker(), []) }
        return this._makers[this._type]
    }
    selectMaker() { return 'link.onload'===this._type ? CallbackOnLoadLinkElementMaker : CallbackImgOnErrorLinkElementMaker; }
    getType(type) {
        if ('img.onerror'===type) {return type}
        else if ('link.onload'===type) {return type}
        else {console.log(`指定したtype:${type}は未対応値です。代わりに旧式かつ全環境対応と思われるimg.onerrorを設定します。`); return 'img.onerror';}
    }
}
class CallbackOnLoadLinkElementMaker {// ES5で作り直した版も欲しい
    make(href, resolver, rejector) {
        const link = document.createElement('link');
        link.href = href;
        link.rel = 'stylesheet';
        link.className = 'dynamic-loader';
        link.onload = resolver; // <link>にonloadがないか、存在しても機能しない場合がある！ブラウザの実装次第。
        link.onerror = rejector;
        return [link];
    }
}
class CallbackImgOnErrorLinkElementMaker {// ES5で作り直した版も欲しい
    // <link>にonloadがないか、存在しても機能しない場合、代わりにimg要素のonerrorで行う
    // https://stackoverflow.com/questions/3078584/link-element-onload
    // https://www.viget.com/articles/js-201-run-a-function-when-a-stylesheet-finishes-loading/
    // https://qiita.com/rana_kualu/items/95a7adf8420ea2b9f657
    make(src, resolver, rejector) {
        console.log('CallbackImgOnErrorLinkElementMaker.make()')
        const link = document.createElement('link');
        link.href = src
        link.rel = 'stylesheet'
        link.className = 'dynamic-loader';
        //document.body.appendChild(link); // bodyに挿入しても反映されなかった（色が赤にならなかった）
//        document.head.appendChild(link); // ここで挿入せず後で一括してやる
        // fallback onload
        const img = document.createElement('img');
        img.className = 'dynamic-loader';
        //img.onerror = (e)=>{ onSucceeded({status:'success', path:src, event:e}); document.body.removeChild(img);}
        //img.onerror = (e)=>{ onSucceeded({status:'success', path:src, event:e}); document.body.removeChild(e.target);}
        //img.onerror = (e)=>{ onSucceeded({status:'success', path:src, event:e}); e.target.remove();}
        img.onerror = resolver;
//        document.body.appendChild(img); // ここで挿入せず後で一括してやる
        img.src = src;
        return [link, img]
    }
}
class PromiseScriptElementMaker extends CallbackScriptElementMaker {
    make(path, onLoad, onError) {
        return new Promise((resolve, reject)=>{
            try {
                const onLoad = (e)=>resolve({ status:'resolve', path:path, event:e });
                const onError = (e)=>reject({ status:'reject', path:path, event:e });
                const el = super.makeBase(path, onLoad, onError)
                console.log(el)
                DynamicLoader._.Injector.inject(el)
            } catch (err) {reject({ status:'exception', path:path, event:err })}
        })
    }
}
class PromiseLinkElementMaker extends CallbackLinkElementMaker {
    constructor(type='img.onerror') { super(type) }
    make(path, onSucceeded, onFailed) {
       return new Promise((resolve, reject)=>{
            try {
                const onLoad = (e)=>{resolve({ status:'resolve', path:path, event:e });this.delImg.apply(this);};
                const onError = (e)=>{reject({ status:'reject', path:path, event:e });this.delImg.apply(this);};
                const els = super.make(path, onLoad, onError)
                els.map(el=>DynamicLoader._.Injector.inject(el))
            } catch (err) {reject({ status:'exception', path:path, event:err })}
        })
    }
    delImg() { for (let el of document.querySelectorAll('img.dynamic-loader')) { el.remove(); } }
}

//DynamicLoader.d = new Dependencies();
//DynamicLoader.Supported = Supported;
DynamicLoader._ = {};
DynamicLoader._.Injector = new Injector();
//DynamicLoader.Router = new ElementMakerRouter();
//DynamicLoader.Injector = Injector;
DynamicLoader._.ElementMakerRouter = ElementMakerRouter;
DynamicLoader._.CallbackScriptElementMaker = CallbackScriptElementMaker 
DynamicLoader._.CallbackLinkElementMaker = CallbackLinkElementMaker
DynamicLoader._.CallbackOnLoadLinkElementMaker = CallbackOnLoadLinkElementMaker
DynamicLoader._.CallbackImgOnErrorLinkElementMaker = CallbackImgOnErrorLinkElementMaker
DynamicLoader._.PromiseScriptElementMaker = PromiseScriptElementMaker
DynamicLoader._.PromiseLinkElementMaker = PromiseLinkElementMaker
Object.freeze(DynamicLoader._)
console.log(DynamicLoader._.ElementMakerRouter)
window.DynamicLoader = DynamicLoader;
/*
class ScriptElementMaker() {
    constructor(mode='promise') { // mode:'promise'/'callback'
        this._mode = this.#getMode(mode)
    }
    #getMode(mode='promise') {return 'promise'===mode && Supported.isPromise ? 'promise' : 'callback'}
    make(src, onSucceeded, onFailed) {
        return this[this._mode](src, onSucceeded, onFailed)
    }
    promise(src) {
        const {promise, resolve, reject} = Promise.withResolvers();
        return [[this.makeEl(src, 
            ev=>resolve({ status:'resolve', path:path, event:ev }), 
            ev=>reject({ status:'reject', path:path, event:ev }))], promise];
    }
    callback(src, onSucceeded, onFailed) {
        return [[this.makeEl(src, 
            (e)=>{ onSucceeded({status:'success', path:src, event:e}); },
            (e)=>{ onFailed({sutatus:'fail', path:src, event:e}); })], null];
    }
    #makeEl(src, onLoad, onError) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.className = 'dynamic-loader';
        script.src = src;
        script.onload = onLoad;
        script.onerror = onError;
        return script;
    }
}
class LinkElementMaker() {
    constructor(mode='promise', type='img.onerror') {// mode:'promise'/'callback', type:'img.onerror'/'link.onload'
        this._mode = this.#getMode(mode)
        this._type = this.#getType(type)
    }
    #getMode(mode='promise') {return 'promise'===mode && Supported.isPromise ? mode : 'callback'}
    #getType(type='img.onerror') {return 'link.onload'===type ? type : 'img.onerror'}
    make(path, onSucceeded, onFailed) {
        const [promise, resolver, rejector] = 'promise'===this._modea
            ? this.promise(path, onSucceeded, onFailed)
            : this.callback(path, onSucceeded, onFailed);
        const els = 'link.onload'===this._type
            ? this.makeOnLoadLinkElement(path, resolver, rejector)
            : this.makeOnErrorImgLinkElement(path, resolver, rejector);
        return [els, promise]
    }
    promise(src) {
        const {promise, resolve, reject} = Promise.withResolvers();
        return {promise, 
            (e)=>resolve({status:'resolve', path:path, event:e}), 
            (e)=>reject({status:'reject', path:path, event:e}))}
    }
    callback(src, onSucceeded, onFailed) {
        return [null,
            (e)=>{ onSucceeded({status:'success', path:src, event:e}); },
            (e)=>{ onFailed({sutatus:'fail', path:src, event:e}); }), null];
    }
    makeOnloadLinkElement(href, resolver, rejector) {
        const link = document.createElement('link');
        link.href = href;
        link.rel = 'stylesheet';
        link.className = 'dynamic-loader';
//        console.assert('onload' in link)
//        console.log('onload' in link)
        link.onload = resolver;
        link.onerror = rejector;
        return [link];
    }
    // <link>にonloadがないか、存在しても機能しない場合、代わりにimg要素のonerrorで行う
    // https://stackoverflow.com/questions/3078584/link-element-onload
    // https://www.viget.com/articles/js-201-run-a-function-when-a-stylesheet-finishes-loading/
    // https://qiita.com/rana_kualu/items/95a7adf8420ea2b9f657
    makeOnErrorImgLinkElement(src, resolver, rejector) {
        const link = document.createElement('link');
        link.href = src
        link.rel = 'stylesheet'
        link.className = 'dynamic-loader';
        //document.body.appendChild(link); // bodyに挿入しても反映されなかった（色が赤にならなかった）
//        document.head.appendChild(link); // ここで挿入せず後で一括してやる
        // fallback onload
        const img = document.createElement('img');
        img.className = 'dynamic-loader';
        //img.onerror = (e)=>{ onSucceeded({status:'success', path:src, event:e}); document.body.removeChild(img);}
        //img.onerror = (e)=>{ onSucceeded({status:'success', path:src, event:e}); document.body.removeChild(e.target);}
        //img.onerror = (e)=>{ onSucceeded({status:'success', path:src, event:e}); e.target.remove();}
        img.onerror = resolver;
//        document.body.appendChild(img); // ここで挿入せず後で一括してやる
        img.src = src;
        return [link, img]
    }
}
*/
})();
