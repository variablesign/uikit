import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';

const _component = 'toggle';
const _defaults = {
    addClass: null,
    removeClass: null,
    target: null,
    animationStartClass: null,
    animationEndClass: null,
    transition: false,
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
            'target',
            'animationStartClass',
            'animationEndClass',
            'transition'
        ]);

        this._toggled = false;
        util.setAttributes(this._element, {
            'aria-pressed': this._toggled,
            'role': 'button'
        });

        // const toggleAnimationEnd = () => {
        //     this._triggerEvent('shown', eventData);
        //     this._eventOff(this._dropdown, this._animationEvent, toggleAnimationEnd);
        // };

        // const toggledAnimationEnd = () => {
        //     this._triggerEvent('hidden', eventData);
        //     autoUpdatePosition();
        //     resetPositionStyles();
        //     util.addClass(this._dropdown, this._config.hideClass);
        //     util.removeClass(this._dropdown, this._config.animationEndClass);
        //     this._isOpened = false;
        //     this._eventOff(this._dropdown, this._animationEvent, toggledAnimationEnd);
        // };

        const toggleState = (options) => {
            options.targets.forEach((target) => {
                if (target.dataset.toggled == 'true') {
                    this._toggled = false;
                    this._element.setAttribute('aria-pressed', this._toggled);
                    target.setAttribute('data-toggled', false);
                    util.removeClass(target, options.addClass);
                    util.addClass(target, options.removeClass);
                } else {
                    this._toggled = true;
                    this._element.setAttribute('aria-pressed', this._toggled);
                    target.setAttribute('data-toggled', true);

                    if (options.animationStartClass) {
                        setTimeout(() => {
                            util.removeClass(target, options.removeClass);
                            util.addClass(target, options.addClass);
                            util.addClass(target, this._config.animationStartClass);
                        });
        
                        this._eventOn(target, this._animationEvent, onShowAnimationEnd);
        
                        return;
                    }

                    util.removeClass(target, options.removeClass);
                    util.addClass(target, options.addClass);
                }
            });

            console.log('toggled');
            this._triggerEvent('toggled');
        };
        
        this._toggle = () => {
            console.log('toggle');
            this._triggerEvent('toggle');

            for (const key in toggles) {
                const options = {
                    addClass: this._config[toggles[key]['addClass']],
                    removeClass: this._config[toggles[key]['removeClass']],
                    animationStartClass: this._config[toggles[key]['animationStartClass']],
                    animationEndClass: this._config[toggles[key]['animationEndClass']],
                    transition: this._config[toggles[key]['transition']],
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