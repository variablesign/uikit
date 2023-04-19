import * as util from './utils.js';
import uk from "./uikit.js";

export default class Component {
    constructor(element, config, defaults, component) {
        this._config = config;
        this._defaults = defaults;
        this._component = component;
        this._element = util.getElement(element);
        this._extendOptions();

        this._hasAnimation = (element) => {
            return parseFloat(window.getComputedStyle(element).animationDuration) > 0 
                ? true 
                : false;
        };

        this._animation = (element, animationHandler, animationEndHandler, timeout = 0) => {
            const eventName = this._hasAnimation(element)
                ? 'animationend'
                : 'transitionend';

            setTimeout(animationHandler, timeout);

            element.addEventListener(eventName, function _handler(e) {
                animationEndHandler(e);
                element.removeEventListener(eventName, _handler);
            });
        };
    }

    _extendOptions() {
        this._config = util.extendObjects(
            this._defaults, 
            this._config, 
            util.replaceObjectKeys(this._element ? this._element.dataset : {}, this._component)
        );
    }

    _prefixedEventName(eventName) {
        return uk.getConfig('prefix') + '.' + this._component + '.' + eventName;
    }

    destroy() {
        uk.removeInstance(this._element, this._component);
    }

    eventOn(target, type, handler, options) {
        target.addEventListener(type, handler, options);
    }

    eventOff(target, type, handler, options) {
        target.removeEventListener(type, handler, options);
    }

    eventOne(target, type, handler) {
        target.removeEventListener(type, handler, { once : true });
    }

    on(eventName, handler) {
        this._element.addEventListener(this._prefixedEventName(eventName), handler);
    }

    off(eventName, handler) {
        this._element.addEventListener(this._prefixedEventName(eventName), handler);
    }

    one(eventName, handler) {
        this._element.addEventListener(this._prefixedEventName(eventName), handler, { once : true });
    }

    TriggerEvent = (eventName, detail = null, context = null) => {
        const element = context || this._element;

        if (detail && typeof detail === 'object') {
            detail = {
                detail: detail
            }
        }

        element.dispatchEvent(new CustomEvent(this._prefixedEventName(eventName), detail));
    }
}