import { isNumber, styles, addClass, setAttributes, showElement, hideElement } from '../utils.js';
import Component from '../component.js';

class Toast extends Component {
    constructor(config) {

        const _defaults = {
            placement: 'bottom-start',
            offset: ['24', '24'],
            gap: 16,
            delay: 5000,
            stack: false,
            create: null,
            template: null,
            zindex: 1090,
            dismiss: 'data-dismiss',
            classes: {
                wrapper: null
            },
            onAction: null,
            onClose: null
        };

        const _component = {
            name: 'toast',
            defaultConfig: _defaults, 
            config: config, 
            transitions: {
                enter: true,
                leave: true
            }
        };

        super(_component);

        this._config.create = this._config.create ? this._config.create : () => void 0;
        this._container = document.body;
        this._config.zindex = parseInt(this._config.zindex) || 0;
        this._config.delay = parseInt(this._config.delay);
        this.isVisible = false;
        let timeout;

        this._config.offset = isNumber(this._config.offset)
            ? [this._config.offset, this._config.offset]
            : this._config.offset;

        this._config.offset = typeof this._config.offset == 'string'
            ? this._config.offset.split(' ')
            : this._config.offset;

        this._config.gap = parseInt(this._config.gap) || 16;
        const stackingPosition = this._config.placement.includes('top') ? 'afterbegin' : 'beforeend';

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

        this._hide = () => {
            clearTimeout(timeout);

            const hide = () => {
                hideElement(this._toast);
                this._toast.remove();
                this.isVisible = false;

                if (this._placementGroup.childNodes.length == 0) {
                    this._placementGroup.remove();
                }

                if (typeof this._config.onClose === 'function') {
                    this._config.onClose(trigger)
                }

                this._removeEvent();
            };
            
            const transitioned = this._transition('transitionLeave', this._toast, (e) => {
                hide();
            });

            if (transitioned) return;

            hide();
        };

        const show = () => {
            if (!this._config.template) return;

            this._placementGroup = this._container.querySelector(`[data-toast-placement=${this._config.placement}]`);

            if (!this._placementGroup) {
                const paddingX = this._config.offset[0] || 24;
                const paddingY = this._config.offset[1] || 24;
                const alignment = this._config.placement.split('-');

                this._placementGroup = document.createElement('div');
                this._placementGroup.setAttribute('data-toast-placement', this._config.placement);
                setPositionStyles(this._placementGroup);
                styles(this._placementGroup, {
                    position: `fixed`,
                    display: `flex`,
                    flexDirection: `column`,
                    alignItems: alignment[1] || 'center',
                    gap: `${this._config.gap}px`,
                    zIndex: this._config.zindex,
                    padding: `${paddingX}px ${paddingY}px`
                });

                this._container.appendChild(this._placementGroup);
            }
            
            if (!this.isVisible) {    
                // Create toast            
                this._toast = document.createElement('div');
                this._toast.innerHTML = getTemplate(this._config);
                hideElement(this._toast);
                addClass(this._toast, this._config.classes.wrapper);
                setAttributes(this._toast, {
                    role: 'alert'
                });

                const dismissTriggers = this._toast.querySelectorAll(`[${this._config.dismiss}]`);
                const actionTriggers = this._toast.querySelectorAll(`button:not([${this._config.dismiss}])`);
                
                dismissTriggers.forEach((trigger) => {
                    if (!trigger.hasAttribute('aria-label')) {
                        trigger.setAttribute('aria-label', 'Close');
                    }

                    this._on(trigger, 'click', this._hide);
                });
    
                actionTriggers.forEach((trigger) => {
                    this._on(trigger, 'click', () => {
                        if (typeof this._config.onAction === 'function') {
                            this._config.onAction(trigger)
                        }
                    });
                });
            }

            if (!this._config.stack) {
                this._placementGroup.innerHTML = '';
            }

            this._placementGroup.insertAdjacentElement(stackingPosition, this._toast);
            showElement(this._toast);
            this.isVisible = true;

            const transitioned = this._transition('transitionEnter', this._toast);

            if (this._config.delay >= 3000) {                
                timeout = setTimeout(this._hide, this._config.delay);
            }
            
            if (transitioned) return;
        };

        show();
    }

    hide() {
        this._hide();
    }

    destroy() {
        super.destroy();
    }
}

export default Toast;