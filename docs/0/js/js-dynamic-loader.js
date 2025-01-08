class JsDynamicLoader { // 非ESMでも動作するよう<script>タグ挿入することで動的インポートする
    constructor(options=null) {
        this._options = options && 'object'===typeof options ? ({...this._defaultOptions, ...options}) : this._defaultOptions;
        this._basePath = this._options.basePath
        this._paths = this._options.paths
        this._count = 0;
        this._CLASS_ID = 'js-dynamic-loader'; // <script class="${CLASS_ID}">
        console.log(this._options)
    }
    get _defaultOptions() { return {
        basePath: '',
        paths: new Set(),
        loadedFullPaths: new Set(),
        onError: (e)=>{console.error(`onError:`, e.target.src)}, 
        onStepped: (e)=>{console.debug(`onStepped:`, e.target.src + ' is successfully loaded.');}, 
        onLoaded: ()=>{console.debug(`Loaded: All loaded !!`);}
    } }
    get basePath() {return this._options.basePath}
    set _basePath(v) {this._options.basePath = this.#delTailSlash(v)}
    get fullPaths() {return [...this._options.paths].map(p=>this.#joinPath(p))}
    get loadedFullPaths() {return [...this._options.loadedFullPaths].map(p=>p)}
    set _paths(v) {
        if (Array.isArray(v)){this._options.paths = new Set(v.map(V=>this.#delHeadSlash(V)))}
        else if (v instanceof Set){this._options.paths = new Set([...v].map(V=>this.#delHeadSlash(V)))}
    }
    set _onLoaded(v){if('function'===typeof v){this._options.onLoaded=v}}
    get isLoaded() {return this._count===this._options.paths.size}
    add(...paths) { for (let p of paths) { this._options.paths.add(this.#delHeadSlash(p)) } }
    clear(isRemoveScript=false) { // isRemoveScript:読込済の<script>要素を削除する
        if (isRemoveScript) {
            for (let el of document.querySelectorAll(`script.${this._CLASS_ID}`)) {
                el.remove();
            }                    
        }
        this._count=0;
        this._options.paths.clear()
    }
    load(onLoaded, ...paths) { // 引数なしでもいい。constructor, addで設定できるから。
        if (this.isLoaded) {return} // 必要なら一旦clear()してから再度呼び出すこと（同じ<script src="">が複数個できてしまうかも）
        this._onLoaded = onLoaded
        this.add(...paths)
        //for (let lang of this._languages) {
        for (let path of this._options.paths) {
            this.#insertEl(this.#createEl(path))
            this._count++;
        }
        /*
        */
        /*
        for (let p=0; p<this._options.paths.length; p++) {
            this.#insertEl(this.#createEl(this._options.paths[p]))
            this._count++;
        }
        */
    }
    #onLoaded(e) {// 全ロード完了後に行う
        this._options.loadedFullPaths.add(e.target.src)
        this._options.onStepped(e)
        if (this._count < this._languages.size) {return;}
        this._options.onLoaded()
        this.clear()
    }
    #createEl(path) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = this.#joinPath(path)
        script.classList.add(this._CLASS_ID)
        script.onload = (e)=>{
            this.#onLoaded(e)
            this._count++;
        }
        script.onerror = (e)=>{ this._options.onError(e) }
//        console.log(script)
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
