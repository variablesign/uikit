import config from './config';
import * as util from './utils.js';

UIkit.setConfig = (options, componentConfig = true) => {
    options = options instanceof Object ? options : null;

    if (!options) {
        return;
    }

    if (componentConfig) {
        UIkit.globalConfig = util.extendObjects(UIkit.globalConfig, options);

        return;
    }

    UIkit.config = util.extendObjects(UIkit.config, options);
};

UIkit.autoload = (filter = [], context = null) => {
    context = context ?? document;
    const components = filter.length > 0 ? filter : getConfig('autoload');

    components.forEach((component) => {
        const componentName = util.kebabCase(component);
        const elements = context.querySelectorAll(`[data-${getConfig('prefix')}-${componentName}=true]`);

        elements.forEach((element) => {
            try {
                window.UIkit[component](element);
            } catch (error) {
                console.error(error);
            }
        });
    });
};

const getConfig = (key) => {
    return UIkit.config[key] || null;
};

const setGlobalComponent = (component) => {
    if (!config.global instanceof Object) return;

    for (const key in config.global) {
        if (config.global[key] == component && !window[key]) {
            window[key] = UIkit[component];
        }
    }
};

const registerComponent = (component, constructor) => {
    UIkit[component] = (element, config) => {
        if ((element instanceof Object) && !(element instanceof HTMLElement)) {
            config = element;
            element = null;
        }

        if (element?.uikitInstance) {
            if ((!config || Object.keys(config).length === 0) && element.uikitInstance[component]) {
                return element.uikitInstance[component];
            }

            if (config && Object.keys(config).length > 0 && element.uikitInstance[component]) {
                element.uikitInstance[component]?.destroy();
            }
        }

        // if (UIkit.globalConfig[component]) {
        //     config = util.extendObjects(config, UIkit.globalConfig[component]);
        // }
    
        const instance = new constructor(element, config);

        element = util.getElement(element);

        if (element) {
            element.storeUikitInstance(component, instance);
        }
    
        return instance;
    };

    setGlobalComponent(component);
};

const removeInstance = (element, component) => {
    if (element?.uikitInstance) {
        delete element.uikitInstance[component];
    }
};

export default {
    getConfig,
    registerComponent,
    removeInstance
};