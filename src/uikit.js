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

UIkit.autoload = (context = null) => {
    context = context ?? document;

    context.querySelectorAll('[data-' + getConfig('prefix') + ']').forEach((element) => {
        
        // Convert to array
        const types = typeof(element.dataset[getConfig('prefix')]) == 'object' 
            ? element.dataset[getConfig('prefix')] 
            : element.dataset[getConfig('prefix')].replaceAll(' ', '').split(',');

        // Load single or multiple component types 
        // E.g. elements with multiple component types such as data-uk="component1, component2"
        types.forEach((type) => {

            // Convert component name (example-component) to camel case (exampleComponent)
            const name = type ? type.replace(/-([a-z])/g, (x, up) => up.toUpperCase()) : '';

            try {
                // Load all data attributes of the element as options and rename valid ones
                // E.g. <div data-uk="image-resize" data-image-resize-width="100"></div>
                // Returns { width: 100 } without the component name
                const options = util.replaceObjectKeys(element.dataset, name);
                
                window.UIkit[name](element, options);

            } catch (error) {
                console.error(`"${name}" is not a function or does not exist.`);
                console.error(error);
            }
        });
    });
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