import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';

const _component = 'dismiss';
const _defaults = {
    target: null,
    remove: false,
    delay: 0
};

class Dismiss extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this._component.allowTransitions(false);
        this.init();
    }

    init() {
        if (!this._element) return;
        
        let timeout;
        this._config.delay = parseInt(this._config.delay);

        this._config.target = typeof this._config.target == 'string'
            ? this._element.closest(this._config.target) 
            : this._config.target;
        
        this._target = this._config.target instanceof HTMLElement
            ? this._config.target
            : this._element.parentNode;

        const eventData = { 
            target: this._target, 
            config: this._config
        };

        const removeTarget = () => {
            if (this._config.remove) {
                this._target.remove();
            }
        };

        if (!this._element.hasAttribute('aria-label')) {
            this._element.setAttribute('aria-label', 'Close');
        }

        this._close = () => {
            this._component.dispatch('hide', eventData);

            const transitioned = this._component.transition('transitionLeave', this._target, (e) => {
                this._component.dispatch('hidden', eventData);
                util.hide(this._target);
                removeTarget();
            });

            if (transitioned) {
                return;
            }

            util.hide(this._target);
            removeTarget();
            this._component.dispatch('hidden', eventData);
        };

        const onClose = (e) => {
            e.preventDefault();
            this._close(e);
        };

        this._component.on(this._element, 'click', onClose);

        if (this._config.delay != 0 && this._config.delay >= 3000) {           
            clearTimeout(timeout); 
            setTimeout(() => {
                this._close();
            }, this._config.delay);
        }

        this._component.dispatch('initialize');
    }

    close() {
        this._close();
    }

    destroy() {
        super.destroy();
    }
}

uk.registerComponent(_component, Dismiss);

export {
    Dismiss
};