;(function{
function mkPromise() {
    return new Promise((resolve, reject)=>{

    })
}
})();
class Injector {

}
class JsInjector {
    inject(src, onSucceeded, onFailed, type) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.className = 'dynamic-loader'
        script.src = src
        script.onload = (e)=>{ onSucceeded({status:'success', path:src, event:e}); }
        script.onerror = (e)=>{ onFailed({sutatus:'fail', path:src, event:e}); }
        return script
    }
}
class CssInjector {
//    static #TYPE_IMG = 'img.onerror';
//    static #TYPE_LINK = 'link.onload'
    static #TYPES = ['img.onerror', 'link.onload']
    // CSS動的読込は<link rel="preload">,<link media="print" onload="this.media='all'">があるが両者ともlink.onloadが使える前提。
    // 残念ながらlinkにonloadがあってもそれが機能しない場合がある。各ブラウザ実装でそうなりがち。よって最旧方法を基本とする。
    // すなわちimg.onerror方式である。'fallback'としておく。
    constructor(type='img.onerror') { // type:'img-onerror'/'link-onload'   'fallback'/'newest'
        this._useType = this.#getUseType(type);
    }
    inject(href, onSucceeded, onFailed) {
        if ('link.onload'===this._useType) {return this.#injectLinkOnLoad(href, onSucceeded, onFailed)}
        else {return this.#injectImgOnError(href, onSucceeded, onFailed)}
    }
    #getUseType(type) { return CssInjector.#TYPES.some(t=>t===type) ? type : CssInjector.TYPES[0] }
    #injectLinkOnLoad(href, onSucceeded, onFailed) { // link.onloadが機能しないブラウザが結構ある
        const link = document.createElement('link');
        link.href = href
        link.rel = 'stylesheet'
        link.className = 'dynamic-loader'
        link.onload = (e)=>{ onSucceeded({status:'success', path:href, element:link, event:e}); }
        link.onerror = (e)=>{ onFailed({status:'fail', path:href, element:link, event:e}); }
        return link
    }
    // <link>にonloadがないか、存在しても機能しない場合、代わりにimg要素のonerrorで行う
    // https://stackoverflow.com/questions/3078584/link-element-onload
    // https://www.viget.com/articles/js-201-run-a-function-when-a-stylesheet-finishes-loading/
    // https://qiita.com/rana_kualu/items/95a7adf8420ea2b9f657
    #injectImgOnError(href, onSucceeded) { // 最旧方法 onFailedはキャッチできない。
        const link = document.createElement('link');
        link.href = src
        link.rel = 'stylesheet'
        link.className = 'dynamic-loader'
        //document.body.appendChild(link); // bodyに挿入しても反映されなかった（色が赤にならなかった）
        document.head.appendChild(link);
        // fallback onload
        const img = document.createElement('img');
        img.className = 'dynamic-loader'
        //img.onerror = (e)=>{ onSucceeded({status:'success', path:src, event:e}); document.body.removeChild(img);}
        //img.onerror = (e)=>{ onSucceeded({status:'success', path:src, event:e}); document.body.removeChild(e.target);}
        img.onerror = (e)=>{ onSucceeded({status:'success', path:src, element:link, event:e}); e.target.remove();}
        document.body.appendChild(img);
        img.src = src;
    }
}
class JsPromiseInjector {
    inject(...paths) {
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
}
class CssPromiseInjector {

}



/*
window.addEventListener('DOMContentLoaded', (event) => {
    function mkScriptEl(src, onSucceeded, onFailed, type) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.className = 'dynamic-loader'
        script.src = src
        script.onload = (e)=>{ onSucceeded({status:'success', path:src, event:e}); }
        script.onerror = (e)=>{ onFailed({sutatus:'fail', path:src, event:e}); }
        return script
    }
    function mkLinkEl(href, onSucceeded, onFailed) {
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
    function injectEl(el) { document.body.append(el) }
    function injectJs(src, onSucceeded, onFailed) {return injectEl(mkScriptEl(src, onSucceeded, onFailed, 'text/javascript'))}
    function injectCss(href, onSucceeded, onFailed) {return injectEl(mkLinkEl(href, onSucceeded))}
    function injectCssFallback(href, onSucceeded, onFailed) {return fallbackLinkOnload(href, onSucceeded, onFailed)}

    // 画面更新を停止する（パフォーマンス改善）
    
    // 動的ロード開始
    injectJs('lib/some-0.js',
    (e1)=>{
        console.log('1')
        injectJs('lib/some-1.js',
        (e2)=>{
            console.log('2')
            //injectCss('lib/some-0.css', // link要素にonloadがinされているのに機能しなかった。謎。
            injectCssFallback('lib/some-0.css',
            (e3)=>{
                // 動的ロード全件完了
                console.log('3')
                console.log('All loaded !!')
                console.log(e1)
                console.log(e2)
                console.log(e3)
                console.log(some0)
                console.log(some1)
                document.body.className = 'red'
                document.body.innerText = 'All loaded !!'
                console.log(document.querySelector('link'))

                // 画面更新を再開する（パフォーマンス改善）
            },
            (e)=>{console.error(e)});
        },
        (e)=>{console.error(e)});
    },
    (e)=>{console.error(e)})
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});
*/

