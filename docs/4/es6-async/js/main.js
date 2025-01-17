window.addEventListener('DOMContentLoaded', async(event) => {
    console.log('DOMContentLoaded!!');
    /*
    const author = 'ytyaru'
    van.add(document.querySelector('main'), 
        van.tags.h1(van.tags.a({href:`https://github.com/${author}/Html.VanJS.ES5.DynamicImporter.20250108131626/`}, 'ES5.DynamicImporter')),
        van.tags.p('ES5でも動作する動的インポートAPIを作る。'),
//        van.tags.p('Create a dynamic import API that also works with ES5.'),
    )
    van.add(document.querySelector('footer'),  new Footer('ytyaru', '../').make())
    */
    function getPaths() {
        const dir = 'js/dynamic-loader/es6/load-files/series/'
        const jss = ['one','two','three'].map(n=>`${dir}${n}.js`);//js/dynamic-loader/es6/load-files/series/one.js
        const csss = ['red','green','blue'].map(n=>`${dir}${n}.css`);
        return [...jss, ...csss]
    }
    function tests() {
        a.t('one' in window)
        a.t('two' in window)
        a.t('three' in window)
        a.t('function'===typeof one)
        a.t('function'===typeof two)
        a.t('function'===typeof three)
        a.t(1===one())
        a.t(2===two())
        a.t(3===three())
    }
    function deletes() {
        for (let el of document.querySelectorAll(`script.dynamic-loader`)) {el.remove();}
        for (let el of document.querySelectorAll(`link.dynamic-loader`)) {el.remove();}
        for (let name of 'one two three'.split(' ')) {delete window[name]}
        console.log('Finished !!')
    }

    const a = new Assertion();
    a.t(async()=>{
        try {
            const loader = new AsyncDynamicLoader()
            await loader.series(...getPaths());
            tests()
            deletes()
            return true;
        } catch(err){console.error(err);return false;}
    });
    a.t(async()=>{
        try {
            const loader = new AsyncDynamicLoader()
            await loader.all(...getPaths());
            tests()
            deletes()
            return true;
        } catch(err){console.error(err);return false;}
    });
    /*
    const a = new Assertion()
    a.t(async()=>{ // 引数なし
        const jdl = new JsAsyncDynamicLoader()
        const results = await jdl.load()
        console.log(results)
        return 0===results.length
    })
    a.t(async()=>{ // 存在しないパス1件
        try {
            const jdl = new JsAsyncDynamicLoader()
            const results = await jdl.load('./js/test-files/NO-EXIST.js')
            return 1===results.length 
            && 'rejected'===results[0].status
            && 'reject'===results[0].reason.status
            && './js/test-files/NO-EXIST.js'===results[0].reason.path
        } catch (e) { console.error(e); return false; }
    })
    a.t(async()=>{ // 存在するパス1件
        try {
            a.f('someFn0' in window)
            const jdl = new JsAsyncDynamicLoader()
            const results = await jdl.load('./js/test-files/some-fn-0.js').catch(e=>console.error(e))
            const test = 1===results.length 
            && 'fulfilled'===results[0].status
            && 'resolve'===results[0].value.status
            && './js/test-files/some-fn-0.js'===results[0].value.path
            && 'someFn0' in window
            return test
        } catch (e) { console.error(e); return false; }
    })
    /*
    // constructor()
    a.t(()=>{
        const jdl = new JsDynamicLoader()
        return Type.isIns(jdl, JsDynamicLoader)
            && ''===jdl.basePath
            && Type.isEmpty(jdl.fullPaths)
//            && jdl.isIdling
            && 0===jdl.loadedFullPaths.size
    })
    // constructor(options)
    // ...
    // add()
    a.t(()=>{
        const jdl = new JsDynamicLoader()
        jdl.add('js/test-files/some-fn-0.js')
        const paths = jdl.fullPaths
        return Type.isIns(jdl, JsDynamicLoader)
            && ''===jdl.basePath
            && 1 === paths.length
            && 'js/test-files/some-fn-0.js'=== paths[0]
//            && jdl.isQueueing
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader()
        jdl.add('/js/test-files/some-fn-0.js')
        const paths = jdl.fullPaths
        console.log(jdl)
        return Type.isIns(jdl, JsDynamicLoader)
            && ''===jdl.basePath
            && 1 === paths.length
            && 'js/test-files/some-fn-0.js'=== paths[0]
//            && jdl.isQueueing
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader()
        jdl.add('//js/test-files/some-fn-0.js')
        const paths = jdl.fullPaths
        return Type.isIns(jdl, JsDynamicLoader)
            && ''===jdl.basePath
            && 1 === paths.length
            && 'js/test-files/some-fn-0.js'=== paths[0]
//            && jdl.isQueueing
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader({basePath:'js/test-files'})
        jdl.add('some-fn-0.js')
        const paths = jdl.fullPaths
        return Type.isIns(jdl, JsDynamicLoader)
            && 'js/test-files'===jdl.basePath
            && 1 === paths.length
            && 'js/test-files/some-fn-0.js'=== paths[0]
//            && jdl.isQueueing
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader({basePath:'js/test-files/'})
        jdl.add('some-fn-0.js')
        const paths = jdl.fullPaths
        return Type.isIns(jdl, JsDynamicLoader)
            && 'js/test-files'===jdl.basePath
            && 1 === paths.length
            && 'js/test-files/some-fn-0.js'=== paths[0]
//            && jdl.isQueueing
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader({basePath:'js/test-files'})
        jdl.add('/some-fn-0.js')
        const paths = jdl.fullPaths
        return Type.isIns(jdl, JsDynamicLoader)
            && 'js/test-files'===jdl.basePath
            && 1 === paths.length
            && 'js/test-files/some-fn-0.js'=== paths[0]
//            && jdl.isQueueing
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader({basePath:'js/test-files/'})
        jdl.add('/some-fn-0.js')
        const paths = jdl.fullPaths
        return Type.isIns(jdl, JsDynamicLoader)
            && 'js/test-files'===jdl.basePath
            && 1 === paths.length
            && 'js/test-files/some-fn-0.js'=== paths[0]
//            && jdl.isQueueing
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader({basePath:'js/test-files//'})
        jdl.add('//some-fn-0.js')
        const paths = jdl.fullPaths
        return Type.isIns(jdl, JsDynamicLoader)
            && 'js/test-files'===jdl.basePath
            && 1 === paths.length
            && 'js/test-files/some-fn-0.js'=== paths[0]
//            && jdl.isQueueing
    })
    // load()
    a.t(()=>{
        const jdl = new JsDynamicLoader()
        const ret = jdl.load(()=>{
            const test = 'someFn0' in window && Type.isFn(window.someFn0) && 'Some function 0.'===someFn0()
            a.t(test); a.fin(); console.log(test); console.assert(test);
            jdl.clear(true)
            delete window.someFn0
        }, 'js/test-files/some-fn-0.js')
//        }, 'js/test-files/some-fn-2.js')
//        console.log(jdl.state)
//        a.t(jdl.isSucceeded)
        return ret
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader()
        jdl.add('js/test-files/some-fn-0.js')
        jdl.load(()=>{
            const test = 'someFn0' in window && Type.isFn(window.someFn0) && 'Some function 0.'===someFn0()
            a.t(test); a.fin(); console.log(test); console.assert(test);
            jdl.clear(true)
            delete window.someFn0
        })
        return true
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader({basePath:'js/test-files'})
        jdl.add('some-fn-0.js')
        jdl.load(()=>{
            const test = 'someFn0' in window && Type.isFn(window.someFn0) && 'Some function 0.'===someFn0()
            a.t(test); a.fin(); console.log(test); console.assert(test);
            jdl.clear(true)
            delete window.someFn0
        })
        return true
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader({basePath:'js/test-files///'})
        jdl.add('///some-fn-0.js')
        jdl.load(()=>{
            const test = 'someFn0' in window && Type.isFn(window.someFn0) && 'Some function 0.'===someFn0()
            a.t(test); a.fin(); console.log(test); console.assert(test);
            jdl.clear(true)
            delete window.someFn0
        })
        return true
    })
    // load() 複数
    a.t(()=>{
        const jdl = new JsDynamicLoader()
        jdl.load(()=>{
            for (let i=0; i<2; i++) {
                const name = `someFn${i}`
                const test = name in window && Type.isFn(window[name]) && `Some function ${i}.`===window[name]()
                a.t(test); a.fin(); console.log(i, name, test); console.assert(test);
                jdl.clear(true)
            }
            for (let i=0; i<2; i++) { delete window[`someFn${i}`] }
        }, 'js/test-files/some-fn-0.js', 'js/test-files/some-fn-1.js')
        return true
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader()
        jdl.add('js/test-files/some-fn-0.js', 'js/test-files/some-fn-1.js')
        jdl.load(()=>{
            for (let i=0; i<2; i++) {
                const name = `someFn${i}`
                const test = name in window && Type.isFn(window[name]) && `Some function ${i}.`===window[name]()
                a.t(test); a.fin(); console.log(i, name, test); console.assert(test);
                jdl.clear(true)
            }
            for (let i=0; i<2; i++) { delete window[`someFn${i}`] }
        })
        return true
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader({basePath:'js/test-files'})
        jdl.add('some-fn-0.js', 'some-fn-1.js')
        jdl.load(()=>{
            for (let i=0; i<2; i++) {
                const name = `someFn${i}`
                const test = name in window && Type.isFn(window[name]) && `Some function ${i}.`===window[name]()
                a.t(test); a.fin(); console.log(i, name, test); console.assert(test);
                jdl.clear(true)
            }
            for (let i=0; i<2; i++) { delete window[`someFn${i}`] }
        })
        return true
    })
    // onStepped
    a.t(()=>{
        const isOks = [false, false]
        const jdl = new JsDynamicLoader({basePath:'js/test-files', onStepped:(e)=>{
            if (e.target.src.endsWith('js/test-files/some-fn-0.js')) {isOks[0]=true; console.assert(isOks[1]===false); a.t(isOks[0] && !isOks[1]); a.fin();}
            if (e.target.src.endsWith('js/test-files/some-fn-1.js')) {isOks[1]=true; console.assert(isOks[0]===true); a.t(isOks[0] && isOks[1]); a.fin();}
        }})
        jdl.add('some-fn-0.js', 'some-fn-1.js')
        jdl.load(()=>{
//            console.log(jdl.state, jdl.isLoaded, isOks)
            //a.t(jdl.isLoaded); a.fin();
            a.t(isOks.every(v=>v===true)); a.fin();
            console.assert(isOks.every(v=>v===true))
            jdl.clear(true)
            for (let i=0; i<2; i++) { delete window[`someFn${i}`] }
        })
        return true
    })
    // onStepFailed
    a.t(()=>{
        const jdl = new JsDynamicLoader({basePath:'js/test-files', onStepFailed:(e)=>{
            a.t(e.srcElement.src.endsWith('js/test-files/NOT-EXIST.js'))
            a.fin()
        }})
        jdl.add('NOT-EXIST.js')
        jdl.load(()=>{
            const t1 = 1===jdl.failedFullPaths.size
            a.t(t1); a.fin(); console.assert(t1);
            const t2 = 0===jdl.loadedFullPaths.size
            a.t(t2); a.fin(); console.assert(t2);
            const t3 = [...jdl.failedFullPaths][0].endsWith('NOT-EXIST.js')
            a.t(t3); a.fin(); console.assert(t3);
        })
        return true
    })
    // 警告：一つ以上パスを追加してください
    a.t(()=>{
        const jdl = new JsDynamicLoader({basePath:'js/test-files'})
//        jdl.add('some-fn-0.js') // 一つもパスを追加しない
        const ret = jdl.load(()=>{
            a.t(false); a.fin(); console.assert(false);// ここは通らないはず！
        })
        return ret===false
    })
    // 成功と失敗をするファイルが混在している
    a.t(()=>{
        const jdl = new JsDynamicLoader({basePath:'js/test-files', paths:[`some-fn-0.js`, `NOT-EXIST.js`, `some-fn-1.js`], 
        //const jdl = new JsDynamicLoader({basePath:'js/test-files', paths:[`NOT-EXIST.js`, `some-fn-0.js`, `some-fn-1.js`], 
        //const jdl = new JsDynamicLoader({basePath:'js/test-files', paths:[`some-fn-0.js`, `some-fn-1.js`, `NOT-EXIST.js`], 
            onStepFailed: (e)=>{
                //console.log(e.target.src)
                const test = e.target.src.endsWith(`js/test-files/NOT-EXIST.js`)
                a.t(test); a.fin(); console.assert(test);
            },
            onStepped: (e)=>{
                const paths = [0,1].map(n=>`js/test-files/some-fn-${n}.js`)
                const test = paths.some(p=>e.target.src.endsWith(p))
                //console.log(e.target.src)
                a.t(test); a.fin(); console.assert(test);
                     if (e.target.src.endsWith('js/test-files/some-fn-0.js')) {const t2 = 1===jdl.loadedFullPaths.size; a.t(t2); a.fin(); console.assert(t2);}
                else if (e.target.src.endsWith('js/test-files/some-fn-1.js')) {const t2 = 2===jdl.loadedFullPaths.size; a.t(t2); a.fin(); console.assert(t2);}
                else {a.t(false); a.fin(); console.assert(false);}
            },
            onLoaded:()=>{
                const t1 = 2===jdl.loadedFullPaths.size
                const t2 = 1===jdl.failedFullPaths.size
                a.t(t1 && t2); a.fin(); console.assert(t1 && t2);
                const t3 = [...jdl.loadedFullPaths][0].endsWith(`js/test-files/some-fn-0.js`)
                const t4 = [...jdl.loadedFullPaths][1].endsWith(`js/test-files/some-fn-1.js`)
                const t5 = [...jdl.failedFullPaths][0].endsWith(`js/test-files/NOT-EXIST.js`)
                //console.log(t3, t4, t5)
                a.t(t3 && t4 && t5); a.fin(); console.assert(t3 && t4 && t5);
                //const t6 = jdl.isLoaded && jdl.hasFailded && !jdl.isSucceeded;
                //console.log(jdl.isLoaded, jdl.hasFailded, !jdl.isSucceeded)
                //a.t(t6); a.fin(); console.assert(t6);

                for (let i=0; i<2; i++) {
                    const name = `someFn${i}`
                    const test = name in window && Type.isFn(window[name]) && `Some function ${i}.`===window[name]()
                    a.t(test); a.fin(); console.log(i, name, test); console.assert(test);
                    jdl.clear(true)
                }
                for (let i=0; i<2; i++) { delete window[`someFn${i}`] }
            },
        })
        jdl.load();
        return true
    })
    */

    /*
    // 二回に分けてload()する。前回の完了待ちをするとネスト地獄になる。
    a.t(()=>{
        const jdl = new JsDynamicLoader({basePath:'js/test-files'}) 
        jdl.load((loadedFullPaths, failedFullPaths)=>{
            console.log(loadedFullPaths)
            console.log(failedFullPaths)
            const test = 1 === jdl.loadedFullPaths.size && [...jdl.loadedFullPaths].some(p=>p.endsWith('js/test-files/some-fn-0.js'));
            a.t(test); a.fin();

            jdl.load((loadedFullPaths, failedFullPaths)=>{
                console.log(loadedFullPaths)
                console.log(failedFullPaths)
                const test = 2 === jdl.loadedFullPaths.size 
                    && [...jdl.loadedFullPaths].some(p=>p.endsWith('js/test-files/some-fn-0.js'))
                    && [...jdl.loadedFullPaths].some(p=>p.endsWith('js/test-files/some-fn-1.js'));
                console.log(jdl.loadedFullPaths.size)
                console.log(jdl.loadedFullPaths)
                console.log([...jdl.loadedFullPaths])
                console.log([...jdl.failedFullPaths])
                console.log(jdl.loadedFullPaths.has('js/test-files/some-fn-0.js'))
                console.log(jdl.loadedFullPaths.has('js/test-files/some-fn-1.js'))
                a.t(test); a.fin();
            }, 'some-fn-1.js')
        }, 'some-fn-0.js')
        return true
    })
    */
    a.fin()
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});
