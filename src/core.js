window.UIkit = window.UIkit || {};

HTMLElement.prototype.storeUikitInstance = function(component, instance) {
    if (!this.uikitInstance) {
        this.uikitInstance = {};
    }

    this.uikitInstance[component] = instance;
};

let config = {
    prefix: 'uk'
};

UIkit.config = config;
UIkit.globalConfig = {};