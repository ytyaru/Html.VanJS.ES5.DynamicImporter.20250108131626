// Promiseが実装されているが、try が未実装の場合、近似コードを実装する
if (typeof Promise.try === 'undefined') {
  Promise.try = function (func) {
    return new this((resolve, reject) => {
      try {
        resolve(func());
      } catch (error) {
        reject(error);
      }
    });
  };
}
