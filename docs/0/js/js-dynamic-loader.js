(function(){
class QueueState {
    constructor() { return Object.freeze(this) }
    get Idling() { return 0 }     // 待機中
    get Queueing() { return 1 }   // 待ち行列を作成中
    get Processing() { return 2 } // 処理中（Loading）
    get Finished() { return 3 }   // 完了済み（Loaded）
}
class JsDynamicLoader { // 非ESMでも動作するよう<script>タグ挿入することで動的インポートする
    static QueueState = new QueueState();
    constructor(options=null) {
        this._options = options && 'object'===typeof options ? ({...this._defaultOptions, ...options}) : this._defaultOptions;
        this._basePath = this._options.basePath
        this._paths = this._options.paths
        this._count = 0;
        this._CLASS_ID = 'js-dynamic-loader'; // <script class="${CLASS_ID}">
        this._state = 0 < this._options.paths.size ?  JsDynamicLoader.QueueState.Queueing: JsDynamicLoader.QueueState.Idling
    }
    get _defaultOptions() { return {
        basePath: '',
        paths: new Set(),
        loadedFullPaths: new Set(),
        failedFullPaths: new Set(),
        onStepFailed: (e)=>{console.error(`onStepFailed:`, e.target.src)}, 
        onStepped: (e)=>{console.debug(`onStepped:`, e.target.src + ' is successfully loaded.');}, 
        onLoaded: ()=>{console.debug(`Loaded: All loaded !!`);}
    } }
    get basePath() {return this._options.basePath}
    set _basePath(v) {this._options.basePath = this.#delTailSlash(v)}
    get fullPaths() {return [...this._options.paths].map(p=>this.#joinPath(p))}
    get loadedFullPaths() {return this._options.loadedFullPaths}
    get failedFullPaths() {return this._options.failedFullPaths}
    set _paths(v) {
        if (Array.isArray(v)){this._options.paths = new Set(v.map(V=>this.#delHeadSlash(V)))}
        else if (v instanceof Set){this._options.paths = new Set([...v].map(V=>this.#delHeadSlash(V)))}
    }
    set _onLoaded(v){if('function'===typeof v){this._options.onLoaded=v}}
    get state() {return this._state}
    get isIdling() {return this._state===JsDynamicLoader.QueueState.Idling}
    get isQueueing() {return this._state===JsDynamicLoader.QueueState.Queueing}
    get isLoading() {return this._state===JsDynamicLoader.QueueState.Processing}
    get isLoaded() {return this._state===JsDynamicLoader.QueueState.Finished}
    get isSucceeded() {return this.isLoaded && 0===this._options.failedFullPaths.size && 0 < this._options.loadedFullPaths.size}
    get hasFailded() {return 0 < this._options.failedFullPaths.size}
    add(...paths) {
        for (let p of paths) { this._options.paths.add(this.#delHeadSlash(p)) }
        if (0 < this._options.paths.size) {this._state = JsDynamicLoader.QueueState.Queueing}
    }
    clear(isRemoveScript=false) { // isRemoveScript:読込済の<script>要素を削除する
        if (isRemoveScript) {
            for (let el of document.querySelectorAll(`script.${this._CLASS_ID}`)) {
                el.remove();
            }
            this._options.loadedFullPaths.clear();
            this._options.failedFullPaths.clear();
        }
        this._count=0;
        this._options.paths.clear()
        this._state = JsDynamicLoader.QueueState.Idling
    }
    load(onLoaded, ...paths) { // 引数なしでもいい。constructor, addで設定できるから。
        this._onLoaded = onLoaded
        this.add(...paths)
        if (!this.isQueueing) {console.warn(`一つ以上パスを追加してください。パスを追加する方法は三通りあります。
A. コンストラクタの第一引数に{paths:['some/path']}を渡す
B. load()を呼ぶ前にadd('some/path')を呼ぶ
C. load()の第二引数以降に渡す：load(()=>{alert('Loaded')}, 'some/path')`);return false;}
        this._state = JsDynamicLoader.QueueState.Processing
        for (let path of this._options.paths) {
            this.#insertEl(this.#createEl(path))
        }
        return true
    }
    #onProcess(e, isError=false) { // <script onload="..."> 一つのファイルを読み込む毎に行う
        this._count++;
        this._options[`${isError ? 'fail' : 'load'}edFullPaths`].add(e.target.src)
        this._options[`on${isError ? 'StepFailed' : 'Stepped'}`](e)
        if (this._count < this._options.paths.size) {return;} // 完了判定
        this._state = JsDynamicLoader.QueueState.Finished
        this._options.onLoaded()
        this.clear()
    }
    #createEl(path) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = this.#joinPath(path)
        script.classList.add(this._CLASS_ID)
        script.onload = (e)=>{ this.#onProcess(e); }
        script.onerror = (e)=>{ this.#onProcess(e, true); }
        return script
    }
    #insertEl(el) {
        const s = document.querySelector('script')
        if (s) {s.parentNode.insertBefore(el, s); return;}
        const h = document.querySelector('head')
        if (h) {h.append(el); return;}
        document.querySelector('body').append(el)
    }
    #joinPath(path) {return this._options.basePath ? this._options.basePath + '/' + path : path; }
    #delHeadSlash(str) {return str.replace(/^(\/{1,})/,'')}
    #delTailSlash(str) {return str.replace(/(\/{1,})$/,'')}
}
window.JsDynamicLoader = JsDynamicLoader 
})();
