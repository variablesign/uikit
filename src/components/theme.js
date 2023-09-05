import { addClass, removeClass } from '../utils.js';
import Component from '../component.js';

class Theme extends Component {
    constructor(element, config) {

        const _defaults = {
            theme: 'system',
            target: document.documentElement,
            optionAttribute: 'color-theme',
            attribute: 'data-theme',
            class: 'dark',
            storage: 'theme'
        };

        const _component = {
            name: 'theme',
            element: element, 
            defaultConfig: _defaults, 
            config: config
        };

        super(_component);

        this._theme = this._config.theme;
        this._target = this._config.target instanceof HTMLElement ? this._config.target : document.querySelector(this._config.target);

        this._updateTheme = () => { 
            this._target.setAttribute(this._config.optionAttribute, this._theme);

            if (this._theme != 'system') {
                if (this._theme == 'dark') {
                    addClass(this._target, this._config.class);
                } else {
                    removeClass(this._target, this._config.class);
                }

                localStorage.setItem(this._config.storage, this._theme);
                this._target.setAttribute(this._config.attribute, this._theme);
                this._dispatchEvent('change', { theme: this._theme }, document);

                return;
            }

            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                addClass(this._target, this._config.class);
                this._target.setAttribute(this._config.attribute, 'dark');
            } else {
                removeClass(this._target, this._config.class);
                this._target.setAttribute(this._config.attribute, 'light');
            }

            localStorage.removeItem(this._config.storage);
            this._dispatchEvent('change', { theme: this._theme }, document);
        };

        this._onClickChangeTheme = (e) => {
            e.preventDefault();
            this._updateTheme();
            this._dispatchEvent('broadcast', { theme: this._theme }, document);
        };

        if (this._element) {   
            this._on(this._element, 'click', this._onClickChangeTheme);
        }
    }

    theme(theme) {
        this._theme = theme || this._theme;
        this._updateTheme();
    }

    destroy() {
        this._target.removeAttribute(this._config.optionAttribute);
        this._target.removeAttribute(this._config.attribute);
        removeClass(this._target, this._config.class);
        localStorage.removeItem(this._config.storage);
        super.destroy();

        if (this._element) {   
            this._off(this._element, 'click', this._onClickChangeTheme);
        }
    }
}

export default Theme;