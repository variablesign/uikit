import { addClass, removeClass, setAttributes } from '../utils.js';
import Component from '../component.js';

class Toggle extends Component {
    constructor(element, config) {

        const _defaults = {
            addClass: null,
            removeClass: null,
            target: null
        };

        const _component = {
            name: 'toggle',
            element: element, 
            defaultConfig: _defaults, 
            config: config
        };

        super(_component);
        
        if (!this._element) return;

        this._config.create = typeof this._config.create == 'string'
            ? this._config.create.split(' ')
            : this._config.create;

        const toggles = this._createConfig(this._config.create, [
            'addClass', 
            'removeClass', 
            'target'
        ]);

        this._toggled = false;
        setAttributes(this._element, {
            ariaPressed: this._toggled,
            role: 'button'
        });

        const toggleState = (options) => {
            options.targets.forEach((target) => {
                const eventName = parseFloat(window.getComputedStyle(target).animationDuration) > 0
                    ? 'animationend'
                    : parseFloat(window.getComputedStyle(target).transitionDuration) > 0
                        ? 'transitionend'
                        : null;

                this._dispatchEvent('toggle', { toggled: this._toggled, config: this._config }, target);

                if (target.dataset.toggled == 'true') {
                    this._toggled = false;
                    this._element.setAttribute('aria-pressed', this._toggled);
                    target.setAttribute('data-toggled', false);
                    addClass(target, options.removeClass);
                    removeClass(target, options.addClass);
                } else {
                    this._toggled = true;
                    this._element.setAttribute('aria-pressed', this._toggled);
                    target.setAttribute('data-toggled', true);
                    removeClass(target, options.removeClass);
                    addClass(target, options.addClass);
                }

                if (eventName) {  
                    this._one(target, eventName, () => {
                        this._dispatchEvent('toggled', { toggled: this._toggled, config: this._config }, target);
                    });

                    return;
                }

                this._dispatchEvent('toggled', { toggled: this._toggled, config: this._config }, target);
            });    
        };
        
        this._toggle = () => {
            for (const key in toggles) {
                const options = {
                    addClass: this._config[toggles[key]['addClass']],
                    removeClass: this._config[toggles[key]['removeClass']],
                    targets: this._config[toggles[key]['target']] 
                        ? document.querySelectorAll(this._config[toggles[key]['target']])
                        : [ this._element ]
                };
                
                toggleState(options);
            }           
        };

        const toggle = (e) => {
            e.preventDefault();
            this._toggle();
        };

        this._on(this._element, 'click', toggle);

        this._dispatchEvent('initialize');
    }

    toggle() {
        this._toggle();
    }

    destroy() {
        super.destroy();
    }
}

export default Toggle;