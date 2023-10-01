import config from './config.js';
import { extend, getElement, kebabCase } from './utils.js';

window.UIkit = window.UIkit || {};

HTMLElement.prototype.storeUikitInstance = function(component, instance) {
    if (!this[config.elementPropName]) {
        this[config.elementPropName] = {};
    }

    this[config.elementPropName][component] = instance;
};

UIkit.config = config;
UIkit.globalConfig = {};
UIkit.store = {};
UIkit.components = [];

UIkit.setConfig = (options) => {
    options = options instanceof Object ? options : {};
    UIkit.globalConfig = extend(UIkit.globalConfig, options);
};

UIkit.register = (components) => {
    for (const name in components) {
        UIkit[name] = (...args) => {
            const element = args[0] instanceof HTMLElement 
                ? args[0] 
                : typeof args[0] === 'string' 
                ? getElement(args[0]) 
                : null;
    
            const options = (args[1] instanceof Object) && !(args[1] instanceof HTMLElement) 
                ? args[1] 
                : args.length === 1 && (args[0] instanceof Object) && !(args[0] instanceof HTMLElement) 
                ? args[0] 
                : undefined;
    
            if (element) {
                if (element[config.elementPropName]) {
                    if ((!options || Object.keys(options).length === 0) && element[config.elementPropName][name]) {
                        return element[config.elementPropName][name];
                    }
        
                    if (options && Object.keys(options).length > 0 && element[config.elementPropName][name]) {
                        element[config.elementPropName][name]?.destroy();
                    }
                }
            }
        
            const instance = (args[0] instanceof Object) && !(args[0] instanceof HTMLElement) 
                ? new components[name](options)
                : new components[name](element, options);
    
            if (element) {
                element.storeUikitInstance(name, instance);
            }
        
            return instance;
        };

        // Add to autoload list
        UIkit.components.push(name);
    }
};

UIkit.autoload = (filter, context) => {
    context = context ?? document;
    const components = filter instanceof Array ? filter : UIkit.components;

    components.forEach((component) => {
        const componentName = kebabCase(component);
        const elements = context.querySelectorAll(`[data-${config.prefix}-${componentName}=true]`);

        elements.forEach((element) => {
            try {
                window.UIkit[component](element);
            } catch (error) {
                console.error(error);
            }
        });
    });
};