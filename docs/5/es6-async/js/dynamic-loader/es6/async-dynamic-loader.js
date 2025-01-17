// DynamicLoader(ElementMakerRouter(ScriptElementMaker, LinkElementMaker), Injector)に依存している
class AsyncDynamicLoader {
    constructor(onSucceeded, onFailed, onFinally, onStepSucceeded, onStepFailed, onStepFinally) {
        this._onSucceeded = 'function'===typeof onSucceeded ? onSucceeded : ()=>{};
        this._onFailed = 'function'===typeof onFailed ? onFailed : ()=>{};
        this._onFinally = 'function'===typeof onFinally ? onFinally : ()=>{};
        this._onStepSucceeded = 'function'===typeof onStepSucceeded ? onStepSucceeded : (res)=>{};
        this._onStepFailed = 'function'===typeof onStepFailed ? onStepFailed : (e)=>{};
        this._onStepFinally = 'function'===typeof onStepFinally ? onStepFinally : (e)=>{};
        this._emr = new DynamicLoader._.ElementMakerRouter()
    }
    /*
    async load(dependencies) {
        let method = 'series';
        let items = null;
        const promises = []
        for (let depend of dependencies) {
            promises.push(this.#load(method, items))
        }
        const promise = this._emr.get(path).make(path, this._onStepSucceeded, this._onStepFailed);
    }
    async #load(method, items) {
        return this[method](...items)
    }
    */
    async series(...paths) { // 全件を直列に読み込む
        try {
            const promises = this.#getPromises(...paths)
            for (const promise of promises) { await promise; }
            this._onSucceeded(...paths)
        } catch (err) { this._onFailed(err, ...paths); }
        finally {this._onFinally()}
    }

    /*
    async series(...paths) { // 全件を直列に読み込む
        try {
            for (const path of paths) {
                try {
                    console.log(path)
                    console.log(this._emr.get(path))
                    //const promise = this._emr.get(path).make(path, this._onStepSucceeded, this._onStepFailed);
                    const promises = this.#getPromises(...paths)
                    console.log(promise)
                    await promise;
                    console.log(promise)
                } catch (err) {console.error(err)}
            }
            this._onSucceeded(...paths)
        } catch (err) { this._onFailed(err, ...paths); }
        finally {this._onFinally()}
    }
    */
    async all(...paths) {// 全件を並列に読み込む（一件でもエラーがあればその時点で中断する）
        try {
            const promises = this.#getPromises(...paths)
            const res = await Promise.all(promises);
            this._onSucceeded(res, ...paths)
        } catch (err) { this._onFailed(err, ...paths); }
        finally {this._onFinally()}
    }
    async allSettled(...paths) {// 全件を並列に読み込む（エラーがあっても全件実行する）
        try {
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
            const promises = this.#getPromises(...paths)
            const res = await Promise.race(promises);
            this._onSucceeded(res, ...paths)
        } catch (err) { this._onFailed(err, ...paths); }
        finally {this._onFinally()}
    }
    #getPromises(...paths) {return [...paths].map(path=>this._emr.get(path).make(path,this._onStepSucceeded, this._onStepFailed))}
}
