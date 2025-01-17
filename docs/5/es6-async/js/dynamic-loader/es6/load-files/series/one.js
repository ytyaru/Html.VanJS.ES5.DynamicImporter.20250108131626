/*
(async function() {
    async function wait(second) {
        return new Promise(resolve=>{console.log(`start wait ${second}s`);return setTimeout(()=>{console.log(`wait ${second}s`);resolve();}, 1000 * second)});
    }
    await wait(3)
    function one() {return 1}
    window.one = one;
})();
*/
function one() {return 1}
