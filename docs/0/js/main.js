window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOMContentLoaded!!');
    /*
    const {h1, p, a} = van.tags
    const author = 'ytyaru'
    van.add(document.querySelector('main'), 
        h1(a({href:`https://github.com/${author}/Html.VanJS.ES5.DynamicImporter.20250108131626/`}, 'ES5.DynamicImporter')),
        p('ES5でも動作する動的インポートAPIを作る。'),
//        p('Create a dynamic import API that also works with ES5.'),
    )
    van.add(document.querySelector('footer'),  new Footer('ytyaru', '../').make())
    */
    const a = new Assertion()
    a.t(()=>{
        const jdl = new JsDynamicLoader()
        console.log(jdl)
        return Type.isIns(jdl, JsDynamicLoader)
            && ''===jdl.basePath
            && Type.isEmpty(jdl.fullPaths)
            && jdl.isLoaded
    })
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
    a.fin()
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

