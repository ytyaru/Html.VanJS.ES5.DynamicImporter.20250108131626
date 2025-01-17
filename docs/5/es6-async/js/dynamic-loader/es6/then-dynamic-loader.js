class ThenDynamicLoader {
    constructor(onSucceeded, onFailed, onFinally, onStepSucceeded, onStepFailed, onStepFinally) {
        this._onSucceeded = 'function'===typeof onSucceeded ? onSucceeded : ()=>{};
        this._onFailed = 'function'===typeof onFailed ? onFailed : ()=>{};
        this._onFinally = 'function'===typeof onFinally ? onFinally : ()=>{};
        this._onStepSucceeded = 'function'===typeof onStepSucceeded ? onStepSucceeded : (res)=>{};
        this._onStepFailed = 'function'===typeof onStepFailed ? onStepFailed : (e)=>{};
        this._onStepFinally = 'function'===typeof onStepFinally ? onStepFinally : (e)=>{};
        this._emr = new DynamicLoader.ElementMakerRouter()
//        this._emr = new ElementMakerRouter()
//        this._inj = new Injector()
    }
    series(...paths) { // 全件を直列に読み込む
//        const promises = this.#injects(...paths)
        // 直列の場合、次回のプロミスを用意する
// one.element.onload = two.promise
// two.element.onload = three.promise      
// three.element.onload = four.promise   
        // https://qiita.com/ttokutake/items/969d60a1981aa06e7bf8#%E3%81%A8%E3%82%8A%E3%81%82%E3%81%88%E3%81%9A%E8%BB%BD%E3%81%8F%E3%82%84%E3%82%8A%E6%96%B9%E3%82%92%E6%8E%A2%E3%81%A3%E3%81%A6%E3%81%BF%E3%81%9F
        try {
            const promises = this.#getPromises(...paths);
            let p = Promise.resolve();
            for (let i=0; i<promises.length; i++) {
                //p = p.then(()=>promises[i]).catch(err=>console.error(err));
                //p = p.then(promises[i]).catch(err=>console.error(err));
                //p = p.then(promises[i]);
                p = p.then(()=>promises[i]);
            }
            //p.then((res)=>this._onSucceeded([...paths])).catch(err=>console.error(err))
            //p.then(this._onSucceeded.bind(this, ...[...paths].filter(v=>v))).catch(err=>console.error(err))
            //p.then(this._onSucceeded.bind(this, ...paths)).catch(err=>console.error(err))
            p.then(this._onSucceeded.bind(this, ...paths));
            console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx')
            console.log(this._onSucceeded)
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
//        const promises = this.#injects(...paths)
        const promises = this.#getPromises(...paths);
        Promise.all(promises).then((res)=>{this._onSucceeded(res)}).catch((e)=>this._onFailed(e));
    }
    allSettled(...paths) {// 全件を並列に読み込む（エラーがあっても全件実行する）
//        const promises = this.#injects(...paths)
        const promises = this.#getPromises(...paths);
        Promise.allSettled(promises).then(results=>this._onSucceeded(results)).catch((e)=>this._onFailed(e));
    }
    race(...paths) {// 全件を並列に読み込む（最初に一件解決した時点で中断する）
//        const promises = this.#injects(...paths)
        const promises = this.#getPromises(...paths);
        Promise.race(promises).then((res)=>{this._onSucceeded(res)}).catch((e)=>this._onFailed(e));
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
    /*
    #injects(...paths) {
        const data = this.#getData(...paths)
        const promises = []
        for (let d of data) {
            const [els, promise] = d;
            els.ForEach(el=>this._inj.inject(el))
            promises.push(promise)
        }
        return promises;
    }
    #getData(...paths) { return paths.map(path=>{ // return [[els, promise],...]
        const maker = this._emr.get(path)
        //const [promise, el] = maker.make(path, this._onSucceeded, this._onFailed)
        return maker.make(path, this._onStepSucceeded, this._onStepFailed); // CSSのimg.onerrorの場合linkとimgの2個有
    });}
    */
}

