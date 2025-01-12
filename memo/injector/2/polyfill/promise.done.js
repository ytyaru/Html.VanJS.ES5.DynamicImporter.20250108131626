// https://www.promisejs.org/
// https://www.promisejs.org/polyfills/promise-done-7.0.4.js
// should work in any browser without browserify
if (typeof Promise.prototype.done !== 'function') {
  Promise.prototype.done = function (onFulfilled, onRejected) {
    var self = arguments.length ? this.then.apply(this, arguments) : this
    self.then(null, function (err) {
      setTimeout(function () {
        throw err
      }, 0)
    })
  }
}
