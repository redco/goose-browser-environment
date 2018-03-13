const AbstractEnvironment = require('goose-abstract-environment');
const debug = require('debug')('BrowserEnvironment');

/* eslint-disable class-methods-use-this,prefer-rest-params */

class BrowserEnvironment extends AbstractEnvironment {
  constructor(options) {
    debug('Initializing..');
    super(options);
  }

  async evaluateJs() {
    const args = Array.prototype.slice.call(arguments, 0);

    const evalFunc = args.pop();
    if (typeof evalFunc !== 'function') {
      throw new Error('You must pass function as last argument to BrowserEnvironment.evaluateJs');
    }

    const result = evalFunc(...args);
    return Promise.resolve(result);
  }

  async back() {
    window.history.back();
    return Promise.resolve();
  }

  /**
   * Prepare environment
   * @returns {Promise}
   */
  async prepare() {
    debug('Preparing...');
    await this._injectVendors();
    return Promise.resolve();
  }

  _triggerMouseEvent(node, eventType) {
    const clickEvent = document.createEvent('MouseEvents');
    clickEvent.initEvent(eventType, true, true);
    node.dispatchEvent(clickEvent);
  }

  async mousedown(selector) {
    this._triggerMouseEvent(document.querySelector(selector), 'mousedown');
    return Promise.resolve();
  }

  async mouseup(selector) {
    this._triggerMouseEvent(document.querySelector(selector), 'mouseup');
    return Promise.resolve();
  }

  async mouseClick(selector) {
    this.mousedown(selector);
    this.mouseup(selector);
    this._triggerMouseEvent(document.querySelector(selector), 'click');
    return Promise.resolve();
  }

  async mouseMove(selector) {
    const position = this._getElementPosition(selector);
    const node = document.querySelector(selector);
    const mouseMoveEvent = document.createEvent('MouseEvents');

    mouseMoveEvent.initMouseEvent(
      'mousemove', //event type : click, mousedown, mouseup, mouseover, mousemove, mouseout.
      true, //canBubble
      false, //cancelable
      window, //event's AbstractView : should be window
      1, // detail : Event's mouse click count
      position.x, // screenX
      position.y, // screenY
      position.y, // clientX
      position.y, // clientY
      false, // ctrlKey
      false, // altKey
      false, // shiftKey
      false, // metaKey
      0, // button : 0 = click, 1 = middle button, 2 = right button
      null // relatedTarget : Only used with some event types (e.g. mouseover and mouseout). In other cases, pass null.
    );

    node.dispatchEvent(mouseMoveEvent);
    return Promise.resolve();
  }

  async _getElementPosition(selector) {
    const position = await this.evaluateJs(selector, /* @covignore */ (selector) => { // eslint-disable-line no-shadow
      const node = Sizzle(selector)[0]; // eslint-disable-line no-undef
      if (!node) {
        return null;
      }

      const rect = node.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    });

    if (!position) {
      throw new Error('Position of element ' + selector + ' was not found');
    }
    debug('Element position is %o', position);
    return position;
  }

  _injectFiles(filePaths) {
    throw new Error('You must redefine _injectFiles');
  }
}

module.exports = BrowserEnvironment;
