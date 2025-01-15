class ModuleDynamicLoader {// ES Module利用可能環境でのみ使用可能
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
            for (let path of paths) { await import(path) }
            this._onSucceeded(...paths)
        } catch (err) { this._onFailed(err, ...paths); }
    }
    async all(...paths) {// 全件を並列に読み込む（一件でもエラーがあればその時点で中断する）
        try {
            const promises = [...paths].map(path=>import(path))
            const res = await Promise.all(promises); // 例外発生しうる
            this._onSucceeded(res, ...paths)
        } catch (err) { this._onFailed(err, ...paths); }
    }
    async allSettled(...paths) {// 全件を並列に読み込む（エラーがあっても全件実行する）
        try {
            const promises = [...paths].map(path=>import(path))
            const results = await Promise.allSettled(promises); // 例外発生しない
            for (let result of results) {
                if ('fulfilled'===reuslt.status) {this._onStepSucceeded(result)}
                else if ('rejected'===reuslt.status) {this._onStepFailed(result)}
            }
            this._onSucceeded(results, ...paths)
        } catch (err) { this._onFailed(err, ...paths); }
    }
    async race(...paths) {// 全件を並列に読み込む（最初に一件解決した時点で中断する）
        try {
            const promises = [...paths].map(path=>import(path))
            const res = await Promise.race(promises);
            this._onSucceeded(res, ...paths)
        } catch (err) { this._onFailed(err, ...paths); }
    }
}

