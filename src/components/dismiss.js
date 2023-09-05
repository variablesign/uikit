import { hideElement } from '../utils.js';
import Component from '../component.js';

class Dismiss extends Component {
    constructor(element, config) {

        const _defaults = {
            target: null,
            remove: false,
            delay: 0
        };

        const _component = {
            name: 'dismiss',
            element: element, 
            defaultConfig: _defaults, 
            config: config, 
            transitions: {
                leave: true
            }
        };

        super(_component);

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
            this._dispatchEvent('hide', eventData);

            const transitioned = this._transition('transitionLeave', this._target, (e) => {
                this._dispatchEvent('hidden', eventData);
                hideElement(this._target);
                removeTarget();
            });

            if (transitioned) return;

            hideElement(this._target);
            removeTarget();
            this._dispatchEvent('hidden', eventData);
        };

        const onClose = (e) => {
            e.preventDefault();
            this._close(e);
        };

        this._on(this._element, 'click', onClose);

        if (this._config.delay != 0 && this._config.delay >= 3000) {           
            clearTimeout(timeout); 
            setTimeout(() => {
                this._close();
            }, this._config.delay);
        }

        this._dispatchEvent('initialize');
    }

    close() {
        this._close();
    }

    destroy() {
        super.destroy();
    }
}

export default Dismiss;