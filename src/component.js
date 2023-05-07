import * as util from './utils.js';
import uk from "./uikit.js";

export default class Component {
    constructor(element, config, defaults, component) {
        this._component = component;
        this._element = util.getElement(element);
        this._config = util.extendObjects(
            defaults, 
            config, 
            util.replaceObjectKeys(this._element ? this._element.dataset : {}, this._component)
        );
        this._eventListeners = {};

        this._hasAnimation = this._config.transition 
            ? false 
            : this._config.animationStartClass ? true : false;

        this._animationEvent = this._config.transition 
            ? 'transitionend' 
            : 'animationend';

        this._storeEventListener = (target, eventName, handler, options) => {
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

        this._removeStoredEventListeners = (eventName = null) => {
            for (const name in this._eventListeners) {

                if (eventName !== null && eventName !== name) {
                    continue;
                }

                for (const item of this._eventListeners[name]) {
                    this._eventOff(
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

        this._prefixedEventName = (eventName) => {
            return uk.getConfig('prefix') + '.' + this._component + '.' + eventName;
        };

        this._createConfig = (configNames = [], allowedOptions = []) => {
            configNames = configNames instanceof Array ? configNames : [];
            allowedOptions = allowedOptions instanceof Array ? allowedOptions : [];
            configNames.push('');
            const config = {};
            const items = {};

            for (let name of configNames) {
                name = name.replace(/[^a-z0-9]/gi, '').toLowerCase().trim();
                items[name] = {};

                for (let option of allowedOptions) {
                    const newOption = util.capitalize(option);

                    config[name + newOption] = null;
                    items[name][option] = name == '' ? option : name + newOption;
                }
            }

            this._config = util.extendObjects(
                config,
                util.replaceObjectKeys(this._element ? this._element.dataset : {}, this._component)
            );

            return items;
        };
    }

    destroy() {
        this._removeStoredEventListeners();
        uk.removeInstance(this._element, this._component);
    }

    _eventOn(target, eventName, handler, options = false) {
        target.addEventListener(eventName, handler, options);
        this._storeEventListener(target, eventName, handler, options);
    }

    _eventOff(target, eventName, handler, options = false) {
        if (handler === undefined && options === false) {
            this._removeStoredEventListeners(eventName);
        }

        target.removeEventListener(eventName, handler, options);
    }

    _eventOne(target, eventName, handler) {
        target.removeEventListener(eventName, handler, { once : true });
    }

    on(eventName, handler, options = false) {
        this._element.addEventListener(this._prefixedEventName(eventName), handler, options);
        this._storeEventListener(this._element, this._prefixedEventName(eventName), handler, options);
    }

    off(eventName, handler, options = false) {

        if (handler === undefined && options === false) {
            this._removeStoredEventListeners(this._prefixedEventName(eventName));
        }

        this._element.removeEventListener(this._prefixedEventName(eventName), handler, options);
    }

    one(eventName, handler) {
        this._element.addEventListener(this._prefixedEventName(eventName), handler, { once : true });
    }

    _triggerEvent = (eventName, detail = null, context = null) => {
        const element = context || this._element;
        const callbackName = 'on' + util.capitalize(eventName);
        const callback = this._config[callbackName];

        if (callback instanceof Function) {
            callback(detail);
        }

        element.dispatchEvent(new CustomEvent(this._prefixedEventName(eventName), { detail }));
    }
}