import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';

const _component = 'toggle';
const _defaults = {
    addClass: null,
    removeClass: null,
    target: null
};

class Toggle extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this.init();
    }

    init() {
        if (!this._element) return;

        const toggles = this._component.createConfig(this._config.create, [
            'addClass', 
            'removeClass', 
            'target'
        ]);

        this._toggled = false;
        util.setAttributes(this._element, {
            'aria-pressed': this._toggled,
            'role': 'button'
        });

        const toggleState = (options) => {
            options.targets.forEach((target) => {
                const eventName = parseFloat(window.getComputedStyle(target).animationDuration) > 0
                    ? 'animationend'
                    : parseFloat(window.getComputedStyle(target).transitionDuration) > 0
                        ? 'transitionend'
                        : null;

                this._component.dispatch('toggle', { toggled: this._toggled, config: this._config }, target);

                if (target.dataset.toggled == 'true') {
                    this._toggled = false;
                    this._element.setAttribute('aria-pressed', this._toggled);
                    target.setAttribute('data-toggled', false);
                    util.addClass(target, options.removeClass);
                    util.removeClass(target, options.addClass);
                } else {
                    this._toggled = true;
                    this._element.setAttribute('aria-pressed', this._toggled);
                    target.setAttribute('data-toggled', true);
                    util.removeClass(target, options.removeClass);
                    util.addClass(target, options.addClass);
                }

                const handler = () => {
                    this._component.dispatch('toggled', { toggled: this._toggled }, target);
                    this._component.off(target, eventName, handler);
                };

                if (eventName) {  
                    this._component.on(target, eventName, handler);

                    return;
                }

                this._component.dispatch('toggled', { toggled: this._toggled, config: this._config }, target);
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

        this._component.on(this._element, 'click', toggle);

        this._component.dispatch('initialize');
    }

    toggle() {
        this._toggle();
    }

    destroy() {
        super.destroy();
    }
}

uk.registerComponent(_component, Toggle);

export {
    Toggle
};