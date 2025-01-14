class AsyncDynamicLoader {
    constructor(onSucceeded, onFailed) {
        this._onSucceeded = 'function'===onSucceeded ? onSucceeded : ()=>{};
        this._onFailed = 'function'===onFailed ? onFailed : ()=>{};
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
    }
    async all(...paths) {// 全件を並列に読み込む（一件でもエラーがあればその時点で中断する）
        try {
            const promises = this.#injects(...paths)
            const res = await Promise.all(promises);
            this._onSucceeded(res, ...paths)
        } catch (err) { this._onFailed(err, ...paths); }
    }
    async allSettled(...paths) {// 全件を並列に読み込む（エラーがあっても全件実行する）
        try {
            const promises = this.#injects(...paths)
            const results = await Promise.allSettled(promises);
            this._onSucceeded(results, ...paths)
        } catch (err) { this._onFailed(err, ...paths); }
    }
    async race(...paths) {// 全件を並列に読み込む（最初に一件解決した時点で中断する）
        try {
            const promises = this.#injects(...paths)
            const res = await Promise.race(promises);
            this._onSucceeded(res, ...paths)
        } catch (err) { this._onFailed(err, ...paths); }
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
class ThenDynamicLoader {
    constructor(onSucceeded, onFailed) {
        this._onSucceeded = 'function'===onSucceeded ? onSucceeded : (res)=>{};
        this._onFailed = 'function'===onFailed ? onFailed : (e)=>{};
        this._onStepSucceeded = 'function'===onStepSucceeded ? onStepSucceeded : (res)=>{};
        this._onStepFailed = 'function'===onStepFailed ? onStepFailed : (e)=>{};
        this._emr = new ElementMakerRouter()
        this._inj = new Injector()
    }
    series(...paths) { // 全件を直列に読み込む
        const promises = this.#injects(...paths)
        // 直列の場合、次回のプロミスを用意する
// one.element.onload = two.promise
// two.element.onload = three.promise      
// three.element.onload = four.promise   
        // https://qiita.com/ttokutake/items/969d60a1981aa06e7bf8#%E3%81%A8%E3%82%8A%E3%81%82%E3%81%88%E3%81%9A%E8%BB%BD%E3%81%8F%E3%82%84%E3%82%8A%E6%96%B9%E3%82%92%E6%8E%A2%E3%81%A3%E3%81%A6%E3%81%BF%E3%81%9F
        try {
            let p = Promise.resolve();
            for (let i=0; i<promises.length; i++) {
                p = p.then(()=>promises[i]);
            }
            p.then((res)=>this.onSucceeded([...paths]))
        } catch (err) { this._onFailed(err) }
        /*
        for (let i=0; i<promises.length; i++) {
            prommises[i].then(res=>{
                return prommises[i+1]
            })
        }
        for (let promise of promises) { promise.then((res)=>{this._onSucceeded(res)}).catch((e)=>this._onFailed(e)) }
        */
    }
    all(...paths) {// 全件を並列に読み込む（一件でもエラーがあればその時点で中断する）
        const promises = this.#injects(...paths)
        Promise.all(promises).then((res)=>{this._onSucceeded(res)}).catch((e)=>this._onFailed(e));
    }
    allSettled(...paths) {// 全件を並列に読み込む（エラーがあっても全件実行する）
        const promises = this.#injects(...paths)
        Promise.allSettled(promises).then(results=>this._onSucceeded(results)).catch((e)=>this._onFailed(e));
    }
    race(...paths) {// 全件を並列に読み込む（最初に一件解決した時点で中断する）
        const promises = this.#injects(...paths)
        Promise.race(promises).then((res)=>{this._onSucceeded(res)}).catch((e)=>this._onFailed(e);
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
class CallbackDynamicLoader {
    constructor(onSucceeded, onFailed) {
        this._onSucceeded = 'function'===onSucceeded ? onSucceeded : ()=>{};
        this._onFailed = 'function'===onFailed ? onFailed : ()=>{};
        this._onStepSucceeded = 'function'===onStepSucceeded ? onStepSucceeded : (res)=>{};
        this._onStepFailed = 'function'===onStepFailed ? onStepFailed : (e)=>{};
        this._emr = new ElementMakerRouter()
        this._inj = new Injector()
        this._count = 0; // 並列読込時の完了数
    }
    series(...paths) { // 全件を直列に読み込む
        try { this.#injects(this.#getDataSeries(...paths)); }
        catch(err) {this._onFailed(err);}
//        const promises = this.#injects(...paths)
//        for (let promise of promises) { await promise }
    }
    all(...paths) {// 全件を並列に読み込む（一件でもエラーがあればその時点で中断する）
        try { this.#injects(this.#getDataParallel('all', ...paths)); }
        catch(err) {this._onFailed(err);}
//        const promises = this.#injects(...paths)
//        await Promise.all(promises);
    }
    allSettled(...paths) {// 全件を並列に読み込む（エラーがあっても全件実行する）
        try { this.#injects(this.#getDataParallel('allSettled', ...paths)); }
        catch(err) {this._onFailed(err);}
//        const promises = this.#injects(...paths)
//        await Promise.allSettled(promises);
    }
    race(...paths) {// 全件を並列に読み込む（最初に一件解決した時点で中断する）
        try { this.#injects(this.#getDataParallel('race', ...paths)); }
        catch(err) {this._onFailed(err);}
//        const promises = this.#injects(...paths)
//        await Promise.race(promises);
    }
    /*
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
    */
    #injects(data) {
        try {
            const data = this.#getDataSeries(...paths)
            for (let d of data) {
                const [els, promise] = d;
                els.ForEach(el=>this._inj.inject(el))
            }
        } catch (err) { this._onFailed(err, ...paths); }
    }
    #getDataSeries(...paths) { return [...paths].map((path,p)=>{ // return [[els, promise],...]
        const maker = this._emr.get(path)
        function onStepSucceeded(e) {
            this._onStepSucceeded(e);
            // 次回動的読込するために要素を生成し動的挿入する／最終回（全件完了）処理する
            //const [els, promise] = maker.make(path, this._onStepSucceeded, this._onStepFailed);
            //const [els, promise] = maker.make(paths[p+1], this._onStepSucceeded, this._onStepFailed);
            const onSS = p===paths.length-1
                ? (e)=>{this._onSucceeded(e, ...paths)}
                : (e)=>{
                    const [els, promise] = maker.make(paths[p+1], this._onStepSucceeded, this._onStepFailed);
                    els.ForEach(el=>this._inj.inject(el))
                };
            const onSF = (e)=>{this._onStepFailed(e); this._onFailed(e, ...paths);};
//            const onSF = p===paths.length-1
//                ? (e)=>{this._onFailed(e, ...paths)}
//                : (e)=>{this._onStepFailed(e); this._onFailed(e, ...paths);};
            //const [els, promise] = maker.make(paths[p+1], this._onStepSucceeded, this._onStepFailed);
            //const [els, promise] = maker.make(paths[p+1], onSS, this._onStepFailed);
            //const [els, promise] = maker.make(paths[p+1], onSS, onSF);
            const [els, promise] = maker.make(path, onSS, onSF);
            els.ForEach(el=>this._inj.inject(el))
        }
        function onStepFialed(e) {
            this._onStepFailed(e);
            this._onFailed(e);
        }
        onStepSucceeded.bind(this)
        onStepFailed.bind(this)
        return maker.make(path, onStepSucceeded, onStepFailed);
    });}
    #getDataParallel(type, ...paths) { return paths.map((path,p)=>{ // return [[els, promise],...]
        const maker = this._emr.get(path)
        function onStepSucceeded(e) {
            this._onStepSucceeded(e);
            const onSS = (e)=>{
                this._count++;
                this._onStepSucceeded(e);
                if (this._count===paths.length-1) { this._count=0; this._onSucceeded(e); }
                else { // 次回動的読込するために要素を生成し、動的挿入する
                    if ('race'===type && 0 < this._count) {return} // 最初に成功した時点で次回読込不要
                    const [els, promise] = maker.make(path, this._onStepSucceeded, this._onStepFailed);
                    els.ForEach(el=>this._inj.inject(el))
                }
            }
            const onSF = (e)=>{
                this._onStepFailed(e)
                if ('all'===type) {throw new TypeError(`Load error.`)}
//                if ('allSettled'===type) {}
//                else if ('all'===type) {throw new TypeError(`Load error.`)}
//                else if ('race'===type) {}
            }
            const [els, promise] = maker.make(path, onSS, this._onStepFailed);
            els.ForEach(el=>this._inj.inject(el))
            /*
            const onSS = (p < paths.length-1)
            ? (e)=>{
                this._onStepSucceeded(e);
                // 次回動的読込するために要素を生成し、動的挿入する
                const [els, promise] = maker.make(path, this._onStepSucceeded, this._onStepFailed);
                els.ForEach(el=>this._inj.inject(el))
            }
            : (e)=>{this._onStepSucceeded(e);this._onSucceeded(e);}; // 完了
            const [els, promise] = maker.make(path, onSS, this._onStepFailed);
            els.ForEach(el=>this._inj.inject(el))
            */
        }
        function onStepFialed(e) { this._count=0; this._onStepFailed(e); this._onFailed(e); }
        onStepSucceeded.bind(this)
        onStepFailed.bind(this)
        return maker.make(path, onStepSucceeded, onStepFailed);
    });}
    #getData(...paths) { return paths.map((path,p)=>{ // return [[els, promise],...]
        const maker = this._emr.get(path)
        function onStepSucceeded(e) {
            this._onStepSucceeded(e);
            // 次回動的読込するために要素を生成し、動的挿入する
            const [els, promise] = maker.make(path, this._onStepSucceeded, this._onStepFailed);
            els.ForEach(el=>this._inj.inject(el))
        }
        function onStepFialed(e) {
            this._onStepFailed(e);
            this._onFailed(e);
        }
        onStepSucceeded.bind(this)
        onStepFailed.bind(this)
        return maker.make(path, onStepSucceeded, onStepFailed);
        /*
        const onStepSucceeded = (e)=>{
        const onStepFialed = (e)=>{
            this._onStepSucceeded(e);
            // 次回動的読込するために要素を生成し、動的挿入する
            const [els, promise] = maker.make(path, this._onStepSucceeded, this._onStepFailed);
            els.ForEach(el=>this._inj.inject(el))
        }
        const onStepFailed = (e)=>{

        }
        //const [promise, el] = maker.make(path, this._onSucceeded, this._onFailed)
        return maker.make(path, this._onStepSucceeded, this._onStepFailed); // CSSのimg.onerrorの場合linkとimgの2個有
        */
    });}
    #makeCallbackFns(...paths) { return paths.map((path,i)=>{
        return (e)=>{
            this._onStepSucceeded(e);
            this.#makeCallbackFn(path)
        };
    });}
    #makeCallbackFn(path) {
        return (e)=>{
            this._onStepSucceeded(e);
            this.#makeCallbackFn(path)
        };
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
class InjectRouter() { // 読み込むファイルの種別に応じたInjectorを返す
    constructor() {
        this._map = new Map([
            ['js', new ScriptElementInjector()],
            ['css', new LinkElementInjector()],
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
class Supported { // ブラウザに機能が実装されているか
    constructor() {
        this._hasPromise()
        this._hasAsync()
    }
    get isPromise() { return this._isPromise }
    get isAsync() { return this._isAsync }
    _hasPromise() {
        if ('undefined' === typeof Promise) {this._Promise=false}
        if (-1 === Promise.toString().indexOf('[native code]')) {this._Promise=false}
        this._Promise=true
    }
    _hasAsync() {
        try { this._isAsync = eval(`typeof Object.getPrototypeOf(async function() {}).constructor === 'function'`); }
        catch (exception) { this._isAsync = false; }
    }
}
const Supported = new Supported;
class PromiseMaker {
    make(...paths) {
        if (Supported.isPromise) {
            paths.map(path=>)
        }
    }
}
// const [el, promise] = elmk.make(src, onSucceeded, onFailed)
// inject(el)
// if (promise) { await promise }
// if (promise) {
//   if (Supported.isAsync) {await promise;}
//   else {promise.then((results)=>{onSucceeded(results)}).catch(e=>{onFailed(e)});}
// } else {synchor.series()/synchor.parallel()}
class AsyncController { // 実行方法（直列・並列）を制御する
    constructor(onSucceeded, onFailed) {
        this._onSucceeded = 'function'===onSucceeded ? onSucceeded : ()=>{};
        this._onFailed = 'function'===onFailed ? onFailed : ()=>{};
    }
    async series(promises) { // 直列
        //for await (let promise of promises) {
        for (let promise of promises) { await promise; }
    }
    async all(promises) {// 並列（最初にエラーが見つかった時点で中断する）
        await Promise.all(promises)
    }
    async allSettled(promises) {// 並列（エラーがあっても全件実行する）
        await Promise.allSettled(promises)
    }
    async race(promises) {// 並列（最初に成功した時点で中断する）
        await Promise.race(promises)
    }
}
class ThenController { // 実行方法（直列・並列）を制御する

}
class CallbackController { // 実行方法（直列・並列）を制御する

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


    /*
    promise() {
        const {promise, resolve, reject} = Promise.withResolvers();
        return this.make(src, 
            ev=>resolve({ status:'resolve', path:path, event:ev }), 
            ev=>reject({ status:'reject', path:path, event:ev }));
    }
    callback() {

    }
    makeOnloadLinkElement(href, onSucceeded, onFailed) {
        const link = document.createElement('link');
        link.href = href
        link.rel = 'stylesheet'
        link.className = 'dynamic-loader'
        console.assert('onload' in link)
        console.log('onload' in link)
        link.onload = (e)=>{ onSucceeded({status:'success', path:href, event:e}); }
        link.onerror = (e)=>{ onFailed({status:'fail', path:href, event:e}); }
        return link
    }
    // <link>にonloadがないか、存在しても機能しない場合、代わりにimg要素のonerrorで行う
    // https://stackoverflow.com/questions/3078584/link-element-onload
    // https://www.viget.com/articles/js-201-run-a-function-when-a-stylesheet-finishes-loading/
    // https://qiita.com/rana_kualu/items/95a7adf8420ea2b9f657
    makeOnErrorImgLinkElement(src, onSucceeded) {
        const link = document.createElement('link');
        link.href = src
        link.rel = 'stylesheet'
        //document.body.appendChild(link); // bodyに挿入しても反映されなかった（色が赤にならなかった）
        document.head.appendChild(link);
        // fallback onload
        const img = document.createElement('img');
        //img.onerror = (e)=>{ onSucceeded({status:'success', path:src, event:e}); document.body.removeChild(img);}
        //img.onerror = (e)=>{ onSucceeded({status:'success', path:src, event:e}); document.body.removeChild(e.target);}
        img.onerror = (e)=>{ onSucceeded({status:'success', path:src, event:e}); e.target.remove();}
        document.body.appendChild(img);
        img.src = src;
    }
    // <link>にonloadがないか、存在しても機能しない場合、代わりにimg要素のonerrorで行う
    // https://stackoverflow.com/questions/3078584/link-element-onload
    // https://www.viget.com/articles/js-201-run-a-function-when-a-stylesheet-finishes-loading/
    // https://qiita.com/rana_kualu/items/95a7adf8420ea2b9f657
    function fallbackLinkOnload(src, onSucceeded) {
        const link = document.createElement('link');
        link.href = src
        link.rel = 'stylesheet'
        //document.body.appendChild(link); // bodyに挿入しても反映されなかった（色が赤にならなかった）
        document.head.appendChild(link);
        // fallback onload
        const img = document.createElement('img');
        //img.onerror = (e)=>{ onSucceeded({status:'success', path:src, event:e}); document.body.removeChild(img);}
        //img.onerror = (e)=>{ onSucceeded({status:'success', path:src, event:e}); document.body.removeChild(e.target);}
        img.onerror = (e)=>{ onSucceeded({status:'success', path:src, event:e}); e.target.remove();}
        document.body.appendChild(img);
        img.src = src;
    }
    */
}
class ScriptElementInjector() {
    injectScript(path, isAsync=true, type='text/javascript') {
        return new Promise((resolve, reject) => {
            try {
                const script = document.createElement('script');
                script.type = type;
                script.async = isAsync;
                script.src = path;
                script.classList.add(this._CLASS_ID)
                script.onload = ev=>resolve({ status:'resolve', path:path, event:ev });
                script.onerror = ev=>reject({ status:'reject', path:path, event:ev })
//                script.addEventListener('load', ev=>resolve({ status:'resolve', path:path, event:ev }))
//                script.addEventListener('error', ev=>reject({ status:'reject', path:path, event:ev }))
                document.body.appendChild(script);
            } catch (error) { reject({ status:'exception', path:path, error:error }) }
        });
    }
    inject(el) {document.body.appendChild(el)}
    promise(src) {
        const {promise, resolve, reject} = Promise.withResolvers();
        const script = this.make(src, 
            ev=>resolve({ status:'resolve', path:path, event:ev }), 
            ev=>reject({ status:'reject', path:path, event:ev }));
        this.inject(script)
    }
    callback(src, onSucceeded, onFailed) {
        const script = this.make(src, 
            (e)=>{ onSucceeded({status:'success', path:src, event:e}); },
            (e)=>{ onFailed({sutatus:'fail', path:src, event:e}); });
        this.inject(script)
    }
    make(src, onLoad, onError) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.className = 'dynamic-loader';
        script.src = src;
        script.onload = onLoad;
        script.onerror = onError;
        return script;
    }
}
class LinkElementInjector() {

}
