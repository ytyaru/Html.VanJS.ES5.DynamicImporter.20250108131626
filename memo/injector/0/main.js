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
        link.className = 'dynamic-loader'
        link.onload = (e)=>{ onSucceeded({status:'success', path:href, event:e}); }
        link.onerror = (e)=>{ onFailed({status:'fail', path:href, event:e}); }
        return link
    }
    function injectEl(el) { document.body.append(el) }
    function injectJs(src, onSucceeded, onFailed) {return injectEl(mkScriptEl(src, onSucceeded, onFailed, 'text/javascript'))}
    function injectJson(src, onSucceeded, onFailed) {return injectEl(mkScriptEl(src, onSucceeded, onFailed, 'application/json'))}
    function injectCss(href, onSucceeded, onFailed) {return injectEl(mkLinkEl(href, onSucceeded, onFailed))}
    injectJs('lib/some-0.js',
    (e1)=>{
        console.log('1')
        injectJson('lib/some-0.json',
        (e2)=>{
            console.log('2')
            injectCss('lib/some-0.css',
            (e3)=>{
                console.log('3')
                console.log('All loadedd !!')
                console.log(e1)
                console.log(e2)
                console.log(e3)
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

