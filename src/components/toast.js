import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';

const _component = 'toast';
const _defaults = {
    placement: 'bottom-start',
    offset: ['24', '24'],
    gap: 16,
    delay: 5000,
    stacking: 'bottom',
    create: null,
    template: null,
    class: null,
    zindex: 1090,
    dismiss: 'data-dismiss',
    onAction: null
};

class Toast extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this._component.allowTransitions();
        this.init();
    }

    init() {
        this._config.create = this._config.create ? this._config.create : () => void 0;
        this._container = document.body;
        this._config.zindex = parseInt(this._config.zindex) || 0;
        this._config.delay = parseInt(this._config.delay);
        this.isVisible = false;
        const stacking = {
            top: 'afterbegin',
            bottom: 'beforeend'
        };
        let timeout;

        this._config.offset = util.isNumber(this._config.offset)
            ? [this._config.offset, this._config.offset]
            : this._config.offset;

        this._config.offset = typeof this._config.offset == 'string'
            ? this._config.offset.split(' ')
            : this._config.offset;

        this._config.stacking = stacking[this._config.stacking] || 'beforeend';

        const getTemplate = () => {
            return this._config.create[this._config.template](this._config);
        };

        const setPositionStyles = (element) => {
            const positions = this._config.placement.split('-');
            const alignment = {
                start: 'left',
                end: 'right'
            };

            element.style[positions[0]] = 0;
            element.style[positions[1] ? alignment[positions[1]] : 'left'] = positions[1] ? 0 : '50%';
            element.style.transform = `translate(${positions[1] ? '0' : '-50'}%, 0%)`;
        };

        this._show = () => {
            if (!this._config.template) return;

            this._placementGroup = this._container.querySelector(`[data-toast-placement=${this._config.placement}]`);

            if (!this._placementGroup) {
                const paddingX = this._config.offset[0] || 24;
                const paddingY = this._config.offset[1] || 24;

                this._placementGroup = document.createElement('div');
                this._placementGroup.setAttribute('data-toast-placement', this._config.placement);
                setPositionStyles(this._placementGroup);
                util.styles(this._placementGroup, {
                    position: `fixed`,
                    display: `flex`,
                    flexDirection: `column`,
                    gap: `${this._config.gap}px`,
                    zIndex: this._config.zIndex,
                    padding: `${paddingX}px ${paddingY}px`
                });

                this._container.appendChild(this._placementGroup);
            }

            
            if (!this.isVisible) {    
                // Create toast            
                this._toast = document.createElement('div');
                this._toast.innerHTML = getTemplate(this._config);
                util.hide(this._toast);
                util.addClass(this._toast, this._config.class);
                util.setAttributes(this._toast, {
                    role: 'alert'
                });

                const dismissTriggers = this._toast.querySelectorAll(`[${this._config.dismiss}]`);
                const actionTriggers = this._toast.querySelectorAll(`button:not([${this._config.dismiss}])`);
                
                dismissTriggers.forEach((trigger) => {
                    this._component.on(trigger, 'click', this._hide);
                });
    
                actionTriggers.forEach((trigger) => {
                    this._component.on(trigger, 'click', () => {
                        if (typeof this._config.onAction === 'function') {
                            this._config.onAction(trigger)
                        }
                    });
                });
            }

            this._component.dispatch('show', null, this._toast);
            this._placementGroup.insertAdjacentElement(this._config.stacking, this._toast);
            util.show(this._toast);
            this.isVisible = true;

            const transitioned = this._component.transition('transitionEnter', this._toast, (e) => {
                //
            });

            if (this._config.delay >= 3000) {                
                clearTimeout(timeout);
                timeout = setTimeout(this._hide, this._config.delay);
            }

            if (transitioned) {
                return;
            }
        };

        this._hide = () => {
            this._component.dispatch('hide', null, this._toast);

            const hide = () => {
                util.hide(this._toast);
                this._toast.remove();
                this.isVisible = false;

                if (this._placementGroup.childNodes.length == 0) {
                    this._placementGroup.remove();
                }

                this._component.removeEvent();
            };
            
            const transitioned = this._component.transition('transitionLeave', this._toast, (e) => {
                hide();
            });

            if (transitioned) {
                return;
            }

            hide();
        };
    }

    show(options) {
        this.setOptions(options);
        this._show();
    }

    hide() {
        this._hide();
    }

    destroy() {
        super.destroy();
    }
}

uk.registerComponent(_component, Toast);

export {
    Toast
};