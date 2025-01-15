// ElementMakerRouter(ScriptElementMaker, LinkElementMaker), Injectorに依存している
/*
// Polyfillはすでに静的ロードされている必要がある
class PolyfillLoader {
    constructor(baseUrl) {
        this._baseUrl = baseUrl;
        this._names = 'allSettled with-resolvers try'.split(' ').map(n=>`${n}.js`)
        this._isLoadedPolyfills = false;
    }
    get isLoaded() {return this._isLoadedPolyfills}
    get paths() {return this._names.map(n=>`${this._baseUrl}/${n}`)}
    isStr(v) {return typeof v === 'string' || v instanceof String}
    get baseUrl() {return this._baseUrl}
    set baseUrl(v) {if (this.isStr(v)) {this._baseUrl=v}}
    async load(baseUrl) {
        this.baseUrl = baseUrl
        if (!this._isLoadedPolyfills) {
            try {
                const loader = new AsyncDynamicLoader((r)=>{console.log(`ポリフィル読み込み完了！`, r)})
                await loader.all(...this.paths)
                this._isLoadedPolyfills = true;
                console.log('PPPPPPPPPPPPPPPPPPPP')
            } catch(err) {console.error(`ポリフィルの読み込みに失敗しました。`, err)}
        }
    }
}
*/
class AsyncDynamicLoader {
    constructor(onSucceeded, onFailed, onFinally, onStepSucceeded, onStepFailed, onStepFinally) {
        this._onSucceeded = 'function'===typeof onSucceeded ? onSucceeded : ()=>{};
        this._onFailed = 'function'===typeof onFailed ? onFailed : ()=>{};
        this._onFinally = 'function'===typeof onFinally ? onFinally : ()=>{};
        this._onStepSucceeded = 'function'===typeof onStepSucceeded ? onStepSucceeded : (res)=>{};
        this._onStepFailed = 'function'===typeof onStepFailed ? onStepFailed : (e)=>{};
        this._onStepFinally = 'function'===typeof onStepFinally ? onStepFinally : (e)=>{};
//        this._emr = new ElementMakerRouter()
//        this._inj = new Injector()
        console.log(DynamicLoader.ElementMakerRouter)
        this._emr = new DynamicLoader.ElementMakerRouter()
//        this._inj = new DynamicLoader.Injector()
//        this._pl = new PolyfillLoader('../../../../../docs/lib/polyfill/promise/method/')
    }
//    async init(baseUrl) {await this._pl.load(baseUrl)}
    async series(...paths) { // 全件を直列に読み込む
        try {
//            await this.init();
            console.log('1')
            console.log(paths)
            console.log([...paths])
//            const promises = this.#injects(...paths)
            //const promises = this.#getPromises(...paths)
            //console.log(promises)
            //for (let promise of promises) { await promise }
            //for (let promise of promises) { console.log(promise); }
            //for (let promise of promises) { await promise; console.log(promise); }
            //promises.ForEach(async(promise)=>await promise);
//            promises.ForEach(async(promise)=>{console.log(promise);await promise});
            /*
            await [...paths].reduce(async (promise, path) => {
                await promise;
                console.log(path)
                console.log(this._emr.get(path).make(path, this._onStepSucceeded, this._onStepFailed))
                return this._emr.get(path).make(path, this._onStepSucceeded, this._onStepFailed);
            }, Promise.resolve());
            */
            for (const path of paths) {
                try {
                    console.log(path)
                    console.log(this._emr.get(path))
                    const promise = this._emr.get(path).make(path, this._onStepSucceeded, this._onStepFailed);
                    console.log(promise)
                    await promise;
                    console.log(promise)
                } catch (err) {console.error(err)}
            }
            //console.log(promises)
            this._onSucceeded(...paths)
        } catch (err) { this._onFailed(err, ...paths); }
        finally {this._onFinally()}
    }
    async all(...paths) {// 全件を並列に読み込む（一件でもエラーがあればその時点で中断する）
        try {
//            await this.init();
//            const promises = this.#injects(...paths)
            const promises = this.#getPromises(...paths)
            const res = await Promise.all(promises);
            this._onSucceeded(res, ...paths)
        } catch (err) { this._onFailed(err, ...paths); }
        finally {this._onFinally()}
    }
    async allSettled(...paths) {// 全件を並列に読み込む（エラーがあっても全件実行する）
        try {
//            await this.init();
//            const promises = this.#injects(...paths)
            const promises = this.#getPromises(...paths)
            const results = await Promise.allSettled(promises);
            for (let result of results) {
                if ('fulfilled'===reuslt.status) {this._onStepSucceeded(result)}
                else if ('rejected'===reuslt.status) {this._onStepFailed(result)}
            }
            this._onSucceeded(results, ...paths)
        } catch (err) { this._onFailed(err, ...paths); }
        finally {this._onFinally()}
    }
    async race(...paths) {// 全件を並列に読み込む（最初に一件解決した時点で中断する）
        try {
//            await this.init();
//            const promises = this.#injects(...paths)
            const promises = this.#getPromises(...paths)
            const res = await Promise.race(promises);
            this._onSucceeded(res, ...paths)
        } catch (err) { this._onFailed(err, ...paths); }
        finally {this._onFinally()}
    }
    #getPromises(...paths) {
        console.log(`#getPromises`)
        console.log([...paths])
        console.log(this._emr)
        console.log(this._emr.get)
        //console.log(this._emr.get())
        return [...paths].map(path=>this._emr.get(path).make(path, this._onStepSucceeded, this._onStepFailed))
        /*
        const maker = this._emr.get(path)
        console.log(maker)
        console.log(maker.make(path, this._onStepSucceeded, this._onStepFailed))
        return maker.make(path, this._onStepSucceeded, this._onStepFailed); // CSSのimg.onerrorの場合linkとimgの2個有
        */
    }
    #injects(...paths) {
        const data = this.#getData(...paths)
        console.log(data)
        const promises = []
        console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
        for (let d of data) {
            const [els, promise] = d;
            els.ForEach(el=>this._inj.inject(el))
            promises.push(promise)
        }
        console.log(promises)
        return promises;
    }
    #getData(...paths) { return paths.map(path=>{ // return [[els, promise],...]
        const maker = this._emr.get(path)
        console.log(maker)
        console.log('withResolvers' in Promise)
        console.log(maker.make(path, this._onStepSucceeded, this._onStepFailed))
        //const [promise, el] = maker.make(path, this._onSucceeded, this._onFailed)
        return maker.make(path, this._onStepSucceeded, this._onStepFailed); // CSSのimg.onerrorの場合linkとimgの2個有
    });}
}
