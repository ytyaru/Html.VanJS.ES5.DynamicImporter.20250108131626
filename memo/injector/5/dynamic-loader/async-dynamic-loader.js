// ElementMakerRouter(ScriptElementMaker, LinkElementMaker), Injectorに依存している
class AsyncDynamicLoader {
    constructor(onSucceeded, onFailed, onFinally) {
        this._onSucceeded = 'function'===onSucceeded ? onSucceeded : ()=>{};
        this._onFailed = 'function'===onFailed ? onFailed : ()=>{};
        this._onFinally = 'function'===onFinally ? onFinally : ()=>{};
        this._onStepSucceeded = 'function'===onStepSucceeded ? onStepSucceeded : (res)=>{};
        this._onStepFailed = 'function'===onStepFailed ? onStepFailed : (e)=>{};
        this._emr = new ElementMakerRouter()
        this._inj = new Injector()
    }
    async series(...paths) { // 全件を直列に読み込む
        try {
            const promises = this.#injects(...paths)
            for (let promise of promises) { await promise }
            this._onSucceeded(...paths)
        } catch (err) { this._onFailed(err, ...paths); }
        finally() {this._onFinally()}
    }
    async all(...paths) {// 全件を並列に読み込む（一件でもエラーがあればその時点で中断する）
        try {
            const promises = this.#injects(...paths)
            const res = await Promise.all(promises);
            this._onSucceeded(res, ...paths)
        } catch (err) { this._onFailed(err, ...paths); }
        finally() {this._onFinally()}
    }
    async allSettled(...paths) {// 全件を並列に読み込む（エラーがあっても全件実行する）
        try {
            const promises = this.#injects(...paths)
            const results = await Promise.allSettled(promises);
            for (let result of results) {
                if ('fulfilled'===reuslt.status) {this._onStepSucceeded(result)}
                else if ('rejected'===reuslt.status) {this._onStepFailed(result)}
            }
            this._onSucceeded(results, ...paths)
        } catch (err) { this._onFailed(err, ...paths); }
        finally() {this._onFinally()}
    }
    async race(...paths) {// 全件を並列に読み込む（最初に一件解決した時点で中断する）
        try {
            const promises = this.#injects(...paths)
            const res = await Promise.race(promises);
            this._onSucceeded(res, ...paths)
        } catch (err) { this._onFailed(err, ...paths); }
        finally() {this._onFinally()}
    }
    #injects(...paths) {
        const data = this.#getData(...paths)
        const promises = []
        for (let d of data) {
            const [els, promise] = d;
            els.ForEach(el=>this._inj.inject(el))
            const promises.push(promise)
        }
        return promises;
    }
    #getData(...paths) { return paths.map(path=>{ // return [[els, promise],...]
        const maker = this._emr.get(path)
        //const [promise, el] = maker.make(path, this._onSucceeded, this._onFailed)
        return maker.make(path, this._onStepSucceeded, this._onStepFailed); // CSSのimg.onerrorの場合linkとimgの2個有
    });}
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
class ElementMakerRouter() { // 読み込むファイルの種別に応じたMakerを返す
    constructor() {
        this._map = new Map([
            ['js', new ScriptElementMaker()],
            ['css', new LinkElementMaker()],
        ])
    }
    get(path) {
        const parts = path.split('.')
        const ext = parts[-1]
        if (!this._map.has(ext)) {
            console.warn(`拡張子 ${ext} は動的読込できません。${[...this._map.keys()]}のいずれかのみ動的読込できます。次のファイルの読込はしません。:${path}`);
            return null
        } else {return this._map.get(ext)}
    }

}
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

