window.addEventListener('DOMContentLoaded', async(event) => {
    console.log('DOMContentLoaded!!');
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
    a.fin()
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

