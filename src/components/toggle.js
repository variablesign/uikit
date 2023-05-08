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
        const toggles = this._createConfig(this._config.create, [
            'addClass', 
            'removeClass', 
            'target'
        ]);

        this._toggled = false;
        util.setAttributes(this._element, {
            'aria-pressed': this._toggled,
            'role': 'button'
        });
        
        this._toggle = () => {
            for (const key in toggles) {
                const addClass = this._config[toggles[key]['addClass']];
                const removeClass = this._config[toggles[key]['removeClass']];
                const targets = this._config[toggles[key]['target']] 
                    ? document.querySelectorAll(this._config[toggles[key]['target']])
                    : [ this._element ];
                
                targets.forEach((target) => {
                    if (target.dataset.toggled == 'true') {
                        util.removeClass(target, addClass);
                        util.addClass(target, removeClass);
                        this._toggled = false;
                        this._element.setAttribute('aria-pressed', this._toggled);
                        target.setAttribute('data-toggled', false);
                    } else {
                        util.removeClass(target, removeClass);
                        util.addClass(target, addClass);
                        this._toggled = true;
                        this._element.setAttribute('aria-pressed', this._toggled);
                        target.setAttribute('data-toggled', true);
                    }
                });
            }
        };

        const toggle = (e) => {
            e.preventDefault();
            this._toggle();
        };

        this._eventOn(this._element, 'click', toggle);

        this._triggerEvent('initialize');
    }

    destroy() {
        super.destroy();
    }
}

uk.registerComponent(_component, Toggle);

export {
    Toggle
};