(function(){
class Injector {
    constructor() {
        this._router = new MimeTypeRouter()
    }
    inject(...paths) {
        const els = this.#makeEls([...paths])
        document.body.append(...els)
    }
    injectInline(...texts) {
        const els = this.#makeEls([...paths])
        document.body.append(...els)
    }
    injectPromise(...paths) {
        return new Promise((resolve, reject) => {
            try {
                this.inject(...paths)

                ElementMaker.script
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
    #makeEls(paths) {
        paths.map(path=>{
            const parts = path.split('.')
            const ext = parts.slice(-1)[0]
            return this._router.getElement(ext)
        })
    }
}
class PromiseRouter {
    
}
class MimeTypeRouter {
    constructor() {
        this._map = new Map([
            ['css', {tag:'link', attrs:{rel:'stylesheet'}}],
            ['js', {tag:'script', attrs:{type:'text/javascript'}}],
            ['json', {tag:'script', attrs:{type:'application/json'}}],
        ])
    }
    getElement(key, path) { return this.#get(path) }
    getElementInline(key, text) { return this.#get(text, true) }
    #get(pathOrText, isInline=false) {
        if (this._map.has(key)) {
            const setting = this._map.get(key)
            if (isInline) {
                return ElementMaker[setting.tag](setting.attrs, pathOrText)
            }
            else {
                this.#setPath(setting, pathOrText)
                return ElementMaker[setting.tag](setting.attrs)
            }
            
        }
        else {throw new TypeError(`指定したキー${key}は未サポートです。次のいずれかのキーのみサポートしています。:${this._map.keys()}`)}
    }
    #setPath(setting, path) {
        if ('script'===setting.tag) {setting['src'] = path}
        else if ('link'===setting.tag) {setting['href'] = path}
        else {throw new TypeError(`setting.tag ${setting.tag} は未サポートです。scriptかlinkのみサポートしています。`)}
    }
}
class ElementMaker {
    script(attrObj, ...children) {
        const script = document.createElement('script');
        for (let key of Object.keys(attrObj)) { // type,src,onload,onerror,class
            script.setAttribute(key, attrObj[key]); // on系のメソッドセットする奴とか、data-*系もちゃんとセットできるのか？
            /*
            if (key.startsWith('data-')) {
                const dsKey = 
                script.dataset[dsKey] = attrObj[key]
            }
            const k = 'class'===key ? 'className' : key;
            script[key] = attrObj[key];
            */
            /*
            script.type = 'text/javascript';
            script.src = this.#joinPath(path)
            script.classList.add(this._CLASS_ID)
            script.onload = (e)=>{ this.#onProcess(e); }
            script.onerror = (e)=>{ this.#onProcess(e, true); }
            */
        }
        return script
    }
    link(attrsObj, ...children) {

    }
}
window.Injector = Injector
})();
