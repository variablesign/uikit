import * as util from './utils.js';
import uk from "./uikit.js";

export default class Component {
    constructor(element, config, defaults, component) {
        this._config = config;
        this._defaults = defaults;
        this._component = component;
        this._element = util.getElement(element);
        this._extendOptions();
        this._eventListeners = {};

        this._hasAnimation = (element) => {
            return parseFloat(window.getComputedStyle(element).animationDuration) > 0 
                ? true 
                : false;
        };

        this._animation = (options) => {
            options = util.extendObjects({
                name: null,
                target: null,
                timeout: 0,
                start() { void 0 },
                end(e) { void 0 }
            }, options);

            const eventName = this._hasAnimation(options.target)
                ? 'animationend'
                : 'transitionend';
            
            setTimeout(options.start, options.timeout);

            options.target.addEventListener(eventName, function _handler(e) {
                options.end(e);
                options.target.removeEventListener(eventName, _handler);
            });
        };

        this.getParameters = (params) => {
            return Object.values(params || {});
        }; 

        this.storeEventListener = (target, eventName, handler, options) => {
            options = typeof options === 'boolean' ? { useCapture: options } : options;
            const eventItem = util.extendObjects({
                once: false,
                passive: false,
                useCapture: false,
                type: eventName,
                listener: handler,
                target: target
            }, options);

            if (!this._eventListeners[eventName]) {
                this._eventListeners[eventName] = [ eventItem ];

                return;
            }

            this._eventListeners[eventName].push(eventItem);
        };

        this.removeStoredEventListeners = (eventName = null) => {
            for (const name in this._eventListeners) {

                if (eventName !== null && eventName !== name) {
                    continue;
                }

                for (const item of this._eventListeners[name]) {
                    this.eventOff(
                        item.target, 
                        item.type, 
                        item.listener,
                        {
                            once: item.once,
                            passive: item.passive,
                            useCapture: item.useCapture
                        }
                    );
                }
            }
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
        this.removeStoredEventListeners();
        uk.removeInstance(this._element, this._component);
    }

    eventOn(target, type, handler, options = false) {
        target.addEventListener(type, handler, options);
        this.storeEventListener(target, type, handler, options);
    }

    eventOff(target, type, handler, options = false) {
        target.removeEventListener(type, handler, options);
    }

    eventOne(target, type, handler) {
        target.removeEventListener(type, handler, { once : true });
    }

    on(eventName, handler, options = false) {
        this._element.addEventListener(this._prefixedEventName(eventName), handler, options);
        this.storeEventListener(this._element, this._prefixedEventName(eventName), handler, options);
    }

    off(eventName, handler, options = false) {

        if (handler === undefined && options === false) {
            this.removeStoredEventListeners(this._prefixedEventName(eventName));
        }

        this._element.removeEventListener(this._prefixedEventName(eventName), handler, options);
    }

    one(eventName, handler) {
        this._element.addEventListener(this._prefixedEventName(eventName), handler, { once : true });
    }

    TriggerEvent = (eventName, detail = null, context = null) => {
        const element = context || this._element;
        const callbackName = 'on' + util.capitalize(eventName);
        const callback = this._config[callbackName];

        if (callback instanceof Function) {
            callback(detail);
        }

        element.dispatchEvent(new CustomEvent(this._prefixedEventName(eventName), { detail }));
    }
}