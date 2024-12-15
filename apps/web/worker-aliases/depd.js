module.exports = function depd(namespace) {
  Object.defineProperty(process, 'versions', {
    value: {
      node: '18.19.0',
    },
    writable: true,
    enumerable: true,
    configurable: true
  });
  function deprecate(message) {
    // No operation (noop)
  }

  deprecate.function = function(fn, message) {
    return function(...args) {
      // No operation (noop)
      return fn.apply(this, args);
    };
  };

  deprecate.property = function(obj, prop, message) {
    // No operation (noop)
    // Simply return the original property without modification
    return obj[prop];
  };

  return deprecate;
}