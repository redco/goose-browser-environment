const AbstractEnvironment = require('goose-abstract-environment');
const debug = require('debug')('BrowserEnvironment');
const vow = require('vow');

class BrowserEnvironment extends AbstractEnvironment {
  constructor(options) {
    debug('Initializing..');
    super(options);
  }

  evaluateJs() {
    const args = Array.prototype.slice.call(arguments, 0);

    const evalFunc = args.pop();
    if (typeof evalFunc !== 'function') {
      throw new Error('You must pass function as last argument to PhantomEnvironment.evaluateJs');
    }

    const result = evalFunc(...args);
    return vow.resolve(result);
  }

  back() {
    window.history.back();
  }
}

module.exports = BrowserEnvironment;