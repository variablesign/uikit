import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';

const _component = 'toast';
const _defaults = {
    placement: 'bottom-start',
    offset: ['24', '24'],
    gap: 16,
    delay: 5000,
    stacked: false,
    create: null,
    template: null,
    class: null,
    zindex: 1090,
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

        this._config.offset = util.isNumber(this._config.offset)
            ? [this._config.offset, this._config.offset]
            : this._config.offset;

        this._config.offset = typeof this._config.offset == 'string'
            ? this._config.offset.split(' ')
            : this._config.offset;

        const getTemplate = (options) => {
            return options.create[options.template](options);
        };

        const setPositionStyles = (element, options) => {
            const positions = options.placement.split('-');
            const alignment = {
                start: 'left',
                end: 'right'
            };

            element.style[positions[0]] = 0;
            element.style[positions[1] ? alignment[positions[1]] : 'left'] = positions[1] ? 0 : '50%';
            element.style.transform = `translate(${positions[1] ? '0' : '-50'}%, 0%)`;
        };

        const getToast = (options) => {
            const toast = document.createElement('div');
            toast.innerHTML = getTemplate(options);
            util.addClass(toast, options.class);
            util.setAttributes(toast, {
                role: 'alert'
            });

            return toast;
        };

        this._show = (options) => {
            this._placementGroup = document.querySelector(`[data-toast-placement=${options.placement}]`);
            
            if (!this._placementGroup) {
                const paddingX = options.offset[0] || 24;
                const paddingY = options.offset[1] || 24;

                this._placementGroup = document.createElement('div');
                this._placementGroup.setAttribute('data-toast-placement', options.placement);
                setPositionStyles(this._placementGroup, options);
                util.styles(this._placementGroup, {
                    position: `fixed`,
                    overflow: `hidden`,
                    display: `flex`,
                    flexDirection: `column`,
                    gap: `${options.gap}px`,
                    zIndex: options.zIndex,
                    padding: `${paddingX}px ${paddingY}px`
                });

                this._container.appendChild(this._placementGroup);
            }

            this._toast = getToast(options);
            const dismissTriggers = this._toast.querySelectorAll('[data-uk-dismiss=true]');

            dismissTriggers.forEach((trigger) => {
                const dismiss = UIkit.dismiss(trigger, {
                    target: this._toast,
                    remove: true,
                    delay: options.delay
                });
            });

            this._placementGroup.appendChild(this._toast);
        };
    }

    show(options) {
        options = typeof options == 'object' ? options : {};
        options = this.config([options]);

        this._show(options);
    }

    hide() {
        
    }

    destroy() {
        super.destroy();
    }
}

uk.registerComponent(_component, Toast);

export {
    Toast
};