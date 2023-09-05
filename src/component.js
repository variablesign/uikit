import { getElement, parseNestedDataset, replaceObjectKeys, extend, addClass, removeClass, capitalize } from './utils.js';

export default class Component {
    constructor(options) {

        /**
         * Component data object.
         */
        this._component = extend(true, {
            name: null,
            element: null,
            defaultConfig: {},
            config: {},
            transitions: {
                enter: false,
                leave: false
            }
        }, options);
        
        /**
         * The global component config.
         */
        const globalConfig = UIkit.globalConfig[this._component.name] || {};
        
        /**
         * The component element.
         */
        this._element = getElement(this._component.element);
        
        /**
         * The timeout ID.
         */
        this._timeout = undefined;

        /**
         * Get component config from dataset.
         */
        const getDatasetConfig = () => {
            const config = {};
            let dataset = this._element ? this._element.dataset : null;
            dataset = dataset ? parseNestedDataset(dataset) : {};

            for (const key in dataset) {
                if (key.substring(0, this._component.name.length) === this._component.name) {
                    config[key] = dataset[key];
                }
            }

            return replaceObjectKeys(config, this._component.name);
        };

        /**
         * Merge classes with the `-merge` suffix
         * and remove classes with the `-undo` suffix
         * 
         * @param {object} newConfig
         */
        const mergeConfig = (newConfig) => {
            const config = {};

            for (const key in newConfig) {
                if (['classUndo', 'ClassUndo'].includes(key.substring(key.length - 9))) {
                    const newKey = key.replace('classUndo', 'class').replace('ClassUndo', 'Class');
                    const newClass = (newConfig[key] || '').split(' ');
                    const oldClass = (this._config[newKey] || '').split(' ');
                    config[newKey] = oldClass.filter((item) => !newClass.includes(item)).join(' ');
                }
            }

            for (const key in newConfig) {
                if (['classMerge', 'ClassMerge'].includes(key.substring(key.length - 10))) {
                    const newKey = key.replace('classMerge', 'class').replace('ClassMerge', 'Class');
                    const oldClass = (config[newKey] || this._config[newKey] || '').split(' ');
                    const newClass = (newConfig[key] || '').split(' ');
                    config[newKey] = oldClass.concat(newClass.filter((item) => oldClass.indexOf(item) < 0)).join(' ');
                }
            }

            for (const key in newConfig) {
                if (!['classUndo', 'ClassUndo'].includes(key.substring(key.length - 9)) || !['classMerge', 'ClassMerge'].includes(key.substring(key.length - 10))) {
                    config[key] = newConfig[key];
                }
            }
            
            return config;
        };

        /**
         * Merge all configurations.
         */
        this._config = extend(
            true,
            this._component.defaultConfig,
            globalConfig
        );
        
        this._config = extend(
            true,
            this._config,
            mergeConfig(this._component.config),
            mergeConfig(getDatasetConfig())
        );

        /**
         * Lock the listed config to the provided values.
         * 
         * @param {object} config
         */
        this._lockConfig = (config) => {
            config = config instanceof Object ? config : {};

            this._config = extend(true, this._config, config);
        };

        /**
         * Get the current transition state.
         */
        this._isTransitioning = false;

        /**
         * Events storage.
         */
        this._events = {};

        /**
         * Enable the use of enter transitions config for component.
         */
        if (this._component.transitions.enter) {
            this._config = extend({
                transitionEnter: null,
                transitionEnterStart: null,
                transitionEnterEnd: null
            }, this._config);
        }

        /**
         * Enable the use of leave transitions config for component.
         */
        if (this._component.transitions.leave) {
            this._config = extend({
                transitionLeave: null,
                transitionLeaveStart: null,
                transitionLeaveEnd: null
            }, this._config);
        }

        /**
         * Check if component is using the transition options.
         */
        this._hasTransition = this._config.transitionEnter || this._config.transitionLeave 
            ? true 
            : false;

        /**
         * Run a transition/animation.
         * 
         * @param {string} type transitionEnter/transitionLeave
         * @param {HTMLElement} element 
         * @param {function} callback
         * @returns 
         */
        this._transition = (type, element, callback) => {
            let transitionEvent = 'transitionend';
            callback =  typeof callback === 'function' ? callback : () => void 0;

            if (!this._config[`${type}`]) {
                return false;
            }

            const transitionCleanup = (element) => {
                const transitions = ['transitionEnter', 'transitionLeave'];
    
                for (const transition of transitions) {
                    removeClass(element, this._config[`${transition}`]);
                    removeClass(element, this._config[`${transition}Start`]);
                    removeClass(element, this._config[`${transition}End`]);
                }
            };

            transitionCleanup(element);
            addClass(element, this._config[`${type}`]);
            addClass(element, this._config[`${type}Start`]);

            let animationDuration = parseFloat(window.getComputedStyle(element).animationDuration);

            transitionEvent = isNaN(animationDuration) || animationDuration <= 0 
                ? transitionEvent 
                : 'animationend';
            
            const _handler = (e) => {
                this._isTransitioning = false;
                callback(e);
                removeClass(element, this._config[`${type}`]);
                removeClass(element, this._config[`${type}End`]);
            }

            this._one(element, transitionEvent.replace('end', 'start'), () => {
                this._isTransitioning = true;
            });
 
            this._one(element, transitionEvent, _handler);

            window.requestAnimationFrame(() => {
                removeClass(element, this._config[`${type}Start`]);
                addClass(element, this._config[`${type}End`]);
            });

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
        this._storeEvent = (target, eventName, handler, options) => {
            options = typeof options === 'boolean' ? { useCapture: options } : options;
            const eventItem = extend({
                once: false,
                passive: false,
                useCapture: false,
                type: eventName,
                listener: handler,
                target: target
            }, options);

            if (!this._events[eventName]) {
                this._events[eventName] = [ eventItem ];

                return;
            }

            this._events[eventName].push(eventItem);
        };

        /**
         * Remove stored events.
         * 
         * @param {string} eventName 
         * @param {HTMLElement} target 
         */
        this._removeEvent = (eventName = null, target = null) => {
            for (const name in this._events) {

                if (eventName !== null && eventName !== name) {
                    continue;
                }

                for (const item of this._events[name]) {

                    item.target.removeEventListener(item.type, item.listener, {
                        once: item.once,
                        passive: item.passive,
                        useCapture: item.useCapture
                    });

                    if (target !== null && target === item.target) {
                        this._events[name].splice(this._events[name].indexOf(item), 1);

                        if (this._events[name].length === 0) {
                            delete this._events[name];
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
        this._prefixedEventName = (eventName) => {
            return UIkit.config.prefix + '.' + this._component.name + '.' + eventName;
        };

        /**
         * Create new configs to be used by the component.
         * 
         * @param {array} configNames 
         * @param {array} allowedOptions 
         * @returns 
         */
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
                    const newOption = capitalize(option);

                    config[name + newOption] = null;
                    items[name][option] = name == '' ? option : name + newOption;
                }
            }

            this._config = extend(
                true,
                config,
                replaceObjectKeys(this._element ? this._element.dataset : {}, this._component.name)
            );

            return items;
        };

        /**
         * Remove stored instance on element.
         * 
         * @param {HTMLElement} context 
         * @param {string} component 
         */
        this._removeInstance = (element, component) => {
            if (!element) return;

            if (element[UIkit.config.elementPropName]) {
                delete element[UIkit.config.elementPropName][component];
            }
        };

        /**
         * Dispatch custom event.
         * 
         * @param {string} eventName 
         * @param {object} detail 
         * @param {HTMLElement} context 
         */
        this._dispatchEvent = (eventName, detail = null, context = null) => {
            const element = context || this._element;
            const callbackName = 'on' + capitalize(eventName);
            const callback = this._config[callbackName];

            if (callback instanceof Function) {
                callback(detail);
            }

            if (!element) return;

            element.dispatchEvent(new CustomEvent(this._prefixedEventName(eventName), { detail }));
        }

        /**
         * Add event listener.
         * 
         * @param {HTMLElement} target 
         * @param {string} eventName 
         * @param {function} handler 
         * @param {boolean|object} options 
         */
        this._on = (target, eventName, handler, options = false) => {
            target.addEventListener(eventName, handler, options);
            this._storeEvent(target, eventName, handler, options);
        }

        /**
         * Remove event listener.
         * 
         * @param {HTMLElement} target 
         * @param {string} eventName 
         * @param {function} handler 
         * @param {boolean|object} options 
         */
        this._off = (target, eventName, handler, options = false) => {
            this._removeEvent(eventName, target);
            target.removeEventListener(eventName, handler, options);
        }

        /**
         * Add event listener to be executed once.
         * 
         * @param {HTMLElement} target 
         * @param {string} eventName 
         * @param {function} handler 
         */
        this._one = (target, eventName, handler) => {
            target.addEventListener(eventName, handler, { once : true });
        }

        /**
         * Timer to execute to call a function.
         * 
         * @param {function} handler 
         * @param {number} timeout 
         */
        this._setTimeout = (handler, timeout) => {
            clearTimeout(this._timeout);
            this._timeout = setTimeout(handler, timeout);
        }
    }

    /**
     * Removes all events and stored data.
     */
    destroy() {
        this._removeEvent();
        this._removeInstance(this._element, this._component.name);
    }

    /**
     * Retrieves component options
     * 
     * @param {string} key 
     * @returns
     */
    config(key = null) {
        if (key) {
            return this._config[key];
        }

        return this._config;
    }

    /**
     * Add event listener.
     * 
     * @param {string} eventName 
     * @param {function} handler 
     * @param {boolean|object} options 
     */
    on(eventName, handler, options = false) {
        this._element.addEventListener(this._prefixedEventName(eventName), handler, options);
        this._storeEvent(this._element, this._prefixedEventName(eventName), handler, options);
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
            this._removeEvent(this._prefixedEventName(eventName));
        }

        this._element.removeEventListener(this._prefixedEventName(eventName), handler, options);
    }

    /**
     * Add event listener to be executed once.
     * 
     * @param {string} eventName 
     * @param {function} handler 
     */
    one(eventName, handler) {
        this._element.addEventListener(this._prefixedEventName(eventName), handler, { once : true });
    }
}