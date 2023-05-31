import * as util from './utils.js';
import uk from "./uikit.js";

export default class Component {
    constructor(element, config, defaults, component) {

        /**
         * The component element.
         */
        this._element = util.getElement(element);

        /**
         * Merge all configurations.
         */
        this._config = util.extendObjects(
            defaults, 
            config, 
            util.replaceObjectKeys(this._element ? this._element.dataset : {}, component)
        );

        /**
         * Get the current transition state.
         */
        this.isTransitioning = false;

        /**
         * Events storage.
         */
        let events = {};

        /**
         * Makes the transition options available for the component.
         * 
         * @param {boolean} enter allow enter transitions
         * @param {boolean} leave allow leave transitions
         */
        const allowTransitions = (enter = true, leave = true) => {
            const config = {};

            if (enter) {
                config.transitionEnter = this._config.transitionEnter || null;
                config.transitionEnterStart = this._config.transitionEnterStart || null;
                config.transitionEnterEnd = this._config.transitionEnterEnd || null;
            }

            if (leave) {
                config.transitionLeave = this._config.transitionLeave || this._config.transitionEnter || null;
                config.transitionLeaveStart = this._config.transitionLeaveStart || null;
                config.transitionLeaveEnd = this._config.transitionLeaveEnd || null;
            }

            this._config = util.extendObjects(this._config, config);
        };

        /**
         * Remove leftover transition classes.
         * 
         * @param {HTMLElement} element 
         */
        const transitionCleanup = (element) => {
            const transitions = ['transitionEnter', 'transitionLeave'];

            for (const transition of transitions) {
                util.removeClass(element, this._config[`${transition}`]);
                util.removeClass(element, this._config[`${transition}Start`]);
                util.removeClass(element, this._config[`${transition}End`]);
            }
        };

        /**
         * Run a transition/animation.
         * 
         * @param {string} type transitionEnter/transitionLeave
         * @param {HTMLElement} element 
         * @param {function} callback 
         * @returns 
         */
         const transition = (type, element, callback) => {
            let transitionEvent = 'transitionend';
            callback =  typeof callback === 'function' ? callback : () => void 0;

            if (!this._config[`${type}`]) {
                return false;
            }

            transitionCleanup(element);
            
            util.addClass(element, this._config[`${type}`]);
            util.addClass(element, this._config[`${type}Start`]);

            window.requestAnimationFrame(() => {
                util.removeClass(element, this._config[`${type}Start`]);
                util.addClass(element, this._config[`${type}End`]);
            });

            let animationDuration = parseFloat(window.getComputedStyle(element).animationDuration);

            transitionEvent = isNaN(animationDuration) || animationDuration <= 0 
                ? transitionEvent 
                : 'animationend';

            const _handler = (e) => {
                this.isTransitioning = false;
                callback(e);
                util.removeClass(element, this._config[`${type}`]);
                util.removeClass(element, this._config[`${type}End`]);
                off(element, transitionEvent, _handler);
            }

            if (this.isTransitioning) {
                this.isTransitioning = false;
                removeEvent(transitionEvent, element);

                return true;
            }

            on(element, transitionEvent, _handler);
            this.isTransitioning = true;

            return true;
        };

        /**
         * Store events.
         * 
         * @param {HTMLElement} target 
         * @param {string} eventName 
         * @param {function} handler 
         * @param {boolean|object} options 
         * @returns 
         */
        const storeEvent = (target, eventName, handler, options) => {
            options = typeof options === 'boolean' ? { useCapture: options } : options;
            const eventItem = util.extendObjects({
                once: false,
                passive: false,
                useCapture: false,
                type: eventName,
                listener: handler,
                target: target
            }, options);

            if (!events[eventName]) {
                events[eventName] = [ eventItem ];

                return;
            }

            events[eventName].push(eventItem);
        };

        /**
         * Remove stored events.
         * 
         * @param {string} eventName 
         * @param {HTMLElement} target 
         */
        const removeEvent = (eventName = null, target = null) => {
            for (const name in events) {

                if (eventName !== null && eventName !== name) {
                    continue;
                }

                for (const item of events[name]) {

                    item.target.removeEventListener(item.type, item.listener, {
                        once: item.once,
                        passive: item.passive,
                        useCapture: item.useCapture
                    });

                    if (target !== null && target === item.target) {
                        events[name].splice(events[name].indexOf(item), 1);

                        if (events[name].length === 0) {
                            delete events[name];
                        }
                    }
                }
            }
        };

        /**
         * Generate a prefixed event name.
         * 
         * @param {string} eventName 
         * @returns 
         */
        const prefixedEventName = (eventName) => {
            return uk.getConfig('prefix') + '.' + component + '.' + eventName;
        };

        /**
         * Create new configs to be used by the component.
         * 
         * @param {array} configNames 
         * @param {array} allowedOptions 
         * @returns 
         */
        const createConfig = (configNames = [], allowedOptions = []) => {
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
                util.replaceObjectKeys(this._element ? this._element.dataset : {}, component)
            );

            return items;
        };

        /**
         * Dispatch custom event.
         * 
         * @param {string} eventName 
         * @param {object} detail 
         * @param {HTMLElement} context 
         */
        const dispatch = (eventName, detail = null, context = null) => {
            const element = context || this._element;
            const callbackName = 'on' + util.capitalize(eventName);
            const callback = this._config[callbackName];
    
            if (callback instanceof Function) {
                callback(detail);
            }
    
            element.dispatchEvent(new CustomEvent(prefixedEventName(eventName), { detail }));
        }

        /**
         * Add event listener.
         * 
         * @param {HTMLElement} target 
         * @param {string} eventName 
         * @param {function} handler 
         * @param {boolean|object} options 
         */
        const on = (target, eventName, handler, options = false) => {
            target.addEventListener(eventName, handler, options);
            storeEvent(target, eventName, handler, options);
        }
    
        /**
         * Remove event listener.
         * 
         * @param {HTMLElement} target 
         * @param {string} eventName 
         * @param {function} handler 
         * @param {boolean|object} options 
         */
        const off = (target, eventName, handler, options = false) => {
            removeEvent(eventName, target);
            target.removeEventListener(eventName, handler, options);
        }
    
        /**
         * Add event listener to be executed once.
         * 
         * @param {HTMLElement} target 
         * @param {string} eventName 
         * @param {function} handler 
         */
        const one = (target, eventName, handler) => {
            target.addEventListener(eventName, handler, { once : true });
        }

        // Component data object
        this._component = {
            allowTransitions,
            transition,
            prefixedEventName,
            createConfig,
            storeEvent,
            removeEvent,
            dispatch,
            on,
            off,
            one,
            events,
            name: component,
        };
    }

    /**
     * Removes all events and stored data.
     */
    destroy() {
        this._component.removeEvent();
        uk.removeInstance(this._element, this._component.name);
    }

    /**
     * Add event listener.
     * 
     * @param {string} eventName 
     * @param {function} handler 
     * @param {boolean|object} options 
     */
    on(eventName, handler, options = false) {
        this._element.addEventListener(this._component.prefixedEventName(eventName), handler, options);
        this._component.storeEvent(this._element, this._component.prefixedEventName(eventName), handler, options);
    }

    /**
     * Remove event listener.
     * 
     * @param {string} eventName 
     * @param {function} handler 
     * @param {boolean|object} options 
     */
    off(eventName, handler, options = false) {

        if (handler === undefined && options === false) {
            this._component.removeEvent(this._component.prefixedEventName(eventName));
        }

        this._element.removeEventListener(this._component.prefixedEventName(eventName), handler, options);
    }

    /**
     * Add event listener to be executed once.
     * 
     * @param {string} eventName 
     * @param {function} handler 
     */
    one(eventName, handler) {
        this._element.addEventListener(this._component.prefixedEventName(eventName), handler, { once : true });
    }
}