(async function(){
// https://medium.com/swlh/async-defer-and-dynamic-scripts-9a2c43a92be1
class JsAsyncDynamicLoader { // 非ESMでも動作するよう<script>タグ挿入することで動的インポートする
    constructor() {
        this._CLASS_ID = 'js-dynamic-loader'
    }
    load(...paths) { return Promise.allSettled([...paths].filter(p=>p).map(p=>this.injectScript(p))) }
    injectScript(path, isAsync=true, type='text/javascript') {
        return new Promise((resolve, reject) => {
            try {
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
    };
    clear(isRemoveScript=false) {
        if (isRemoveScript) {
            for (let el of document.querySelectorAll(`script.${this._CLASS_ID}`)) {
                el.remove();
            }
        }
    }
}
window.JsAsyncDynamicLoader = JsAsyncDynamicLoader 
// (async function(){
//   const jdl = new JsAsyncDynamicLoader();
//   const paths = ['one.js', 'two.js']
//   const results = await jdl.load(...paths)
//   const fulfilleds = results.filter(r=>r.status==='fulfilled').map(r=>r.value)
//   const rejecteds = results.filter(r=>r.status==='rejected').map(r=>r.reason)
//   const loadeds = fulfilleds.filter(f=>f.status==='resolve')
//   const faileds = fulfilleds.filter(f=>f.status==='reject')
//   const expects = fulfilleds.filter(f=>f.status==='expection')
//   rejecteds.ForEach(v=>console.error(v))
//   expects.ForEach(v=>console.error(v))
//   faileds.ForEach(v=>console.error(v))
//   loadeds.ForEach(v=>console.log(v))
//   const isAllSucceeded = paths.length === loadeds.length
//   if (isAllSucceeded) { console.log('All loaded !!') }
// })();
})();
