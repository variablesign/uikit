import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';

const _component = 'close';
const _defaults = {
    target: null,
    remove: true
};

class Close extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this._useTransitions();
        this.init();
    }

    init() {
        if (!this._element) return;
        
        this._target = this._config.target 
            ? this._element.closest(this._config.target) 
            : this._element.parentNode;

        const eventData = { target: this._target };

        const removeTarget = () => {
            if (this._config.remove) {
                this._target.remove();
            }
        };

        this._close = () => {
            this._triggerEvent('hide', eventData);

            const transitioned = this._transition('transitionLeave', this._target, (e) => {
                this._triggerEvent('hidden', eventData);
                util.hide(this._target);
                removeTarget();
            });

            if (transitioned) {
                return;
            }

            util.hide(this._target);
            removeTarget();
            this._triggerEvent('hidden', eventData);
        };

        const onClose = (e) => {
            e.preventDefault();
            this._close(e);
        };

        this._eventOn(this._element, 'click', onClose);

        this._triggerEvent('initialize');
    }

    close() {
        this._close();
    }

    destroy() {
        super.destroy();
    }
}

uk.registerComponent(_component, Close);

export {
    Close
};