import config from './config';

window.UIkit = window.UIkit || {};

HTMLElement.prototype.storeUikitInstance = function(component, instance) {
    if (!this.uikitInstance) {
        this.uikitInstance = {};
    }

    this.uikitInstance[component] = instance;
};

UIkit.config = config;
UIkit.globalConfig = {};
UIkit.store = {};