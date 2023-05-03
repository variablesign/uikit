import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';

const _component = 'theme';
const themeChannel = new BroadcastChannel('theme-channel');
const _defaults = {
    theme: 'system',
    target: document.documentElement,
    optionAttribute: 'color-theme',
    attribute: 'data-theme',
    class: 'dark',
    storage: 'theme'
};

class Theme extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this.init();
    }

    init () {
        this._theme = this._config.theme;
        this._target = this._config.target instanceof HTMLElement ? this._config.target : document.querySelector(this._config.target);

        this._updateTheme = () => { 
            this._target.setAttribute(this._config.optionAttribute, this._theme);

            if (this._theme != 'system') {
                if (this._theme == 'dark') {
                    util.addClass(this._target, this._config.class);
                } else {
                    util.removeClass(this._target, this._config.class);
                }

                localStorage.setItem(this._config.storage, this._theme);
                this._target.setAttribute(this._config.attribute, this._theme);
                this._triggerEvent('change', { theme: this._theme }, document);

                return;
            }

            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                util.addClass(this._target, this._config.class);
                this._target.setAttribute(this._config.attribute, 'dark');
            } else {
                util.removeClass(this._target, this._config.class);
                this._target.setAttribute(this._config.attribute, 'light');
            }

            localStorage.removeItem(this._config.storage);
            this._triggerEvent('change', { theme: this._theme }, document);
        };

        this._onClickChangeTheme = (e) => {
            e.preventDefault();
            this._updateTheme();
            this._triggerEvent('broadcast', { theme: this._theme }, document);
        };

        if (this._element) {   
            this._eventOn(this._element, 'click', this._onClickChangeTheme);
        }
    }

    theme(theme) {
        this._theme = theme || this._theme;
        this._updateTheme();
    }

    destroy() {
        this._target.removeAttribute(this._config.optionAttribute);
        this._target.removeAttribute(this._config.attribute);
        util.removeClass(this._target, this._config.class);
        localStorage.removeItem(this._config.storage);
        super.destroy();

        if (this._element) {   
            this._eventOff(this._element, 'click', this._onClickChangeTheme);
        }
    }
}

uk.registerComponent(_component, Theme);

// Auto detect & set theme on load
const theme = UIkit.theme();

if (localStorage.getItem(theme._config.storage)) {
    theme.theme(localStorage.getItem(theme._config.storage));
}

if (localStorage.getItem(theme._config.storage) == null) {
    theme.theme('system');
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (localStorage.getItem(theme._config.storage) == null) {
        theme.theme('system');
    }
});

document.addEventListener(uk.getConfig('prefix') + '.theme.broadcast', (e) => {
    themeChannel.postMessage(e.detail.theme);
});

themeChannel.addEventListener('message', (e) => {
    theme.theme(e.data);
});