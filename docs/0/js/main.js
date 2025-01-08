window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOMContentLoaded!!');
    const author = 'ytyaru'
    van.add(document.querySelector('main'), 
        van.tags.h1(van.tags.a({href:`https://github.com/${author}/Html.VanJS.ES5.DynamicImporter.20250108131626/`}, 'ES5.DynamicImporter')),
        van.tags.p('ES5でも動作する動的インポートAPIを作る。'),
//        van.tags.p('Create a dynamic import API that also works with ES5.'),
    )
    van.add(document.querySelector('footer'),  new Footer('ytyaru', '../').make())

    const a = new Assertion()
    // constructor()
    a.t(()=>{
        const jdl = new JsDynamicLoader()
        console.log(jdl)
        return Type.isIns(jdl, JsDynamicLoader)
            && ''===jdl.basePath
            && Type.isEmpty(jdl.fullPaths)
            && jdl.isLoaded
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
            && !jdl.isLoaded
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader()
        jdl.add('/js/test-files/some-fn-0.js')
        const paths = jdl.fullPaths
        return Type.isIns(jdl, JsDynamicLoader)
            && ''===jdl.basePath
            && 1 === paths.length
            && 'js/test-files/some-fn-0.js'=== paths[0]
            && !jdl.isLoaded
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader()
        jdl.add('//js/test-files/some-fn-0.js')
        const paths = jdl.fullPaths
        return Type.isIns(jdl, JsDynamicLoader)
            && ''===jdl.basePath
            && 1 === paths.length
            && 'js/test-files/some-fn-0.js'=== paths[0]
            && !jdl.isLoaded
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader({basePath:'js/test-files'})
        jdl.add('some-fn-0.js')
        const paths = jdl.fullPaths
        return Type.isIns(jdl, JsDynamicLoader)
            && 'js/test-files'===jdl.basePath
            && 1 === paths.length
            && 'js/test-files/some-fn-0.js'=== paths[0]
            && !jdl.isLoaded
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader({basePath:'js/test-files/'})
        jdl.add('some-fn-0.js')
        console.log(jdl)
        const paths = jdl.fullPaths
        return Type.isIns(jdl, JsDynamicLoader)
            && 'js/test-files'===jdl.basePath
            && 1 === paths.length
            && 'js/test-files/some-fn-0.js'=== paths[0]
            && !jdl.isLoaded
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader({basePath:'js/test-files'})
        jdl.add('/some-fn-0.js')
        console.log(jdl)
        const paths = jdl.fullPaths
        return Type.isIns(jdl, JsDynamicLoader)
            && 'js/test-files'===jdl.basePath
            && 1 === paths.length
            && 'js/test-files/some-fn-0.js'=== paths[0]
            && !jdl.isLoaded
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader({basePath:'js/test-files/'})
        jdl.add('/some-fn-0.js')
        console.log(jdl)
        const paths = jdl.fullPaths
        return Type.isIns(jdl, JsDynamicLoader)
            && 'js/test-files'===jdl.basePath
            && 1 === paths.length
            && 'js/test-files/some-fn-0.js'=== paths[0]
            && !jdl.isLoaded
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader({basePath:'js/test-files//'})
        jdl.add('//some-fn-0.js')
        console.log(jdl)
        const paths = jdl.fullPaths
        return Type.isIns(jdl, JsDynamicLoader)
            && 'js/test-files'===jdl.basePath
            && 1 === paths.length
            && 'js/test-files/some-fn-0.js'=== paths[0]
            && !jdl.isLoaded
    })
    // load()
    a.t(()=>{
        const jdl = new JsDynamicLoader()
        jdl.load(()=>{
            const test = 'someFn0' in window && Type.isFn(window.someFn0) && 'Some function 0.'===someFn0()
            a.t(test); console.log(test); console.assert(test);
            jdl.clear(true)
        }, 'js/test-files/some-fn-0.js')
        return true
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader()
        jdl.add('js/test-files/some-fn-0.js')
        jdl.load(()=>{
            const test = 'someFn0' in window && Type.isFn(window.someFn0) && 'Some function 0.'===someFn0()
            a.t(test); console.log(test); console.assert(test);
            jdl.clear(true)
        })
        return true
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader({basePath:'js/test-files'})
        jdl.add('some-fn-0.js')
        jdl.load(()=>{
            const test = 'someFn0' in window && Type.isFn(window.someFn0) && 'Some function 0.'===someFn0()
            a.t(test); console.log(test); console.assert(test);
            jdl.clear(true)
        })
        return true
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader({basePath:'js/test-files///'})
        jdl.add('///some-fn-0.js')
        jdl.load(()=>{
            const test = 'someFn0' in window && Type.isFn(window.someFn0) && 'Some function 0.'===someFn0()
            a.t(test); console.log(test); console.assert(test);
            jdl.clear(true)
        })
        return true
    })
    // load() 複数
    a.t(()=>{
        const jdl = new JsDynamicLoader()
        jdl.load(()=>{
            console.log('***********************************************************')
            console.log('someFn0' in window)
            console.log('someFn1' in window)
            for (let i=0; i<2; i++) {
                const name = `someFn${i}`
                const test = name in window && Type.isFn(window[name]) && `Some function ${i}.`===window[name]()
                a.t(test); console.log(i, name, test); console.assert(test);
                jdl.clear(true)
            }
        }, 'js/test-files/some-fn-0.js', 'js/test-files/some-fn-1.js')
        return true
    })
    a.t(()=>{
        const jdl = new JsDynamicLoader()
        jdl.add('js/test-files/some-fn-0.js', 'js/test-files/some-fn-1.js')
        jdl.load(()=>{
            console.log('someFn0' in window)
            console.log('someFn1' in window)
            for (let i=0; i<2; i++) {
                const name = `someFn${i}`
                const test = name in window && Type.isFn(window[name]) && `Some function ${i}.`===window[name]()
                /*
                console.log(name)
                console.log(name in window)
                console.log(Type.isFn(window[name]))
                console.log(`Some function ${i}.`===window[name]())
                */
                a.t(test); console.log(i, name, test); console.assert(test);
                /*
                console.log(jdl)
                console.log(window.someFn0)
                console.log(window.someFn1)
                console.log(window['someFn0'])
                console.log(window['someFn1'])
                console.log(window['someFn0']())
                console.log(window['someFn1']())
                */
                jdl.clear(true)
            }
        })
        return true
    })



    a.fin()
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

