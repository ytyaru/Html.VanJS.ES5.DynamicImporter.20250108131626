class HljsLangLoader {
    constructor(baseDir='') {
        this._count = 0;
        this._baseDir = baseDir;
        this._languages = new Set(); // 読込候補の言語名
        this._CLASS_ID = 'hljs-lang-loader'; // <script class="${CLASS_ID}">
    }
    get baseDir() {return this._baseDir}
    isLoaded(lang) {return this._languages.has(lang)}
    add(...langs) { for (let l of langs) { this._languages.add(l) } }
    clear(isRemoveScript=false) { // isRemoveScript:読込済の<script>要素を削除する
        if (isRemoveScript) {
            for (let el of document.querySelectorAll(`script.${this._CLASS_ID}`)) {
                el.remove();
            }                    
        }
        this._count=0;
        this._languages.clear();
    }
    load() {
        for (let lang of this._languages) {
            this.#insertEl(this.#createEl(lang))
            this._count++;
        }
    }
    #onLoaded(e) {// 全ロード完了後に行う
        console.debug(e.target.src + " is successfully loaded");
        if (this._count < this._languages.size) {return;}
        for (let q of [`pre code`, `p code`]) {
            for (let el of document.querySelectorAll(q)) {
                hljs.highlightElement(el)
            }        
        }
    }
    #createEl(lang) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `${this._baseDir}/${lang}.js`; // .min.js
        script.classList.add(this._CLASS_ID)
        script.onload = (e)=>{
            this.#onLoaded(e)
            this._count++;
        }
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
    /*
    #hljs() {
        for (let el of document.querySelectorAll(`pre code.language-${lang}`)) {
            hljs.
        }
    }
    load(lang) {
        if (this.isLoaded(lang)) {return}
        this.#insertEl(this.#createEl(lang))
        this._count++;
    }
    */
}
