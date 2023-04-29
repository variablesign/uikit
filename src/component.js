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
        this._hasAnimation = this._config.transition ? false : true;
        this._animationEvent = this._config.transition ? 'transitionend' : 'animationend';

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

    eventOn(target, eventName, handler, options = false) {
        target.addEventListener(eventName, handler, options);
        this.storeEventListener(target, eventName, handler, options);
    }

    eventOff(target, eventName, handler, options = false) {
        if (handler === undefined && options === false) {
            this.removeStoredEventListeners(eventName);
        }

        target.removeEventListener(eventName, handler, options);
    }

    eventOne(target, eventName, handler) {
        target.removeEventListener(eventName, handler, { once : true });
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