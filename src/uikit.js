import * as util from "./utils.js";

UIkit.setConfig = (options, component) => {
    options = typeof options === 'object' ? options : null;

    if (!options) {
        return;
    }

    if (component) {
        UIkit.globalConfig[component] = options;

        return;
    }

    UIkit.config = util.extendObjects(config, options);
};

UIkit.autoload = (context = null, filter = []) => {
    context = context ?? document;
    const targets = context.querySelectorAll('[data-' + getConfig('prefix') + ']');
    filter = filter instanceof Array && filter.length > 0 ? filter : [];

    for (let i = 0; i < targets.length; i++) {
        let dataset = util.extendObjects(targets[i].dataset || {});

        const components = dataset[getConfig('prefix')] instanceof Array 
            ? dataset[getConfig('prefix')]
            : [dataset[getConfig('prefix')]];

        for (let x = 0; x < components.length; x++) {
            const name = components[x].replace(/-([a-z])/g, (x, up) => up.toUpperCase());

            if (filter.length > 0 && !filter.includes(name)) {
                continue;
            }

            try {
                const config = util.replaceObjectKeys(targets[i].dataset, name);
                window.UIkit[name](targets[i], config);

            } catch (error) {
                console.error(`"${name}" is not a function or does not exist.`);
                console.error(error);
            }
        }

    }
};

const getConfig = (key) => {
    return UIkit.config[key] || null;
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

        if (UIkit.globalConfig[component]) {
            config = util.extendObjects(config, UIkit.globalConfig[component]);
        }
    
        const instance = new constructor(element, config);

        element = util.getElement(element);

        if (element) {
            element.storeUikitInstance(component, instance);
        }
    
        return instance;
    };
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