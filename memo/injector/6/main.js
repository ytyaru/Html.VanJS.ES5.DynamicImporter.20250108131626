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
    injectJs('load-lib/some-0.js',
    (e1)=>{
        console.log('1')
        injectJs('load-lib/some-1.js',
        (e2)=>{
            console.log('2')
            //injectCss('lib/some-0.css', // link要素にonloadがinされているのに機能しなかった。謎。
            injectCssFallback('load-lib/some-0.css',
            (e3)=>{
                // 動的ロード全件完了
                console.log('3')
                console.log('All loaded !!')
                console.log(e1)
                console.log(e2)
                console.log(e3)
                console.assert('some0' in window)
                console.assert('some1' in window)
                console.assert('function'===typeof some0)
                console.assert('function'===typeof some1)
                console.assert('some-0'===some0())
                console.assert('some-1'===some1())
                console.log(some0)
                console.log(some1)
                document.body.className = 'red'
                document.body.innerText = 'All loaded !!'
                console.log([...document.querySelectorAll('link')])
                console.log([...document.querySelectorAll('script')])
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

