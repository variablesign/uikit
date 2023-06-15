import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';
import { Modal } from './modal.js';

const _component = 'offcanvas';
const _defaults = {
    target: null,
    keyboard: true,
    focus: false,
    backdropClass: null,
    backdropFadeDuration: 150,
    backdropClose: true,
    hideBackdrop: false,
    displayClass: null,
    dialog: 'data-dialog',
    content: 'data-content',
    close: 'data-close',
    backdrop: 'data-backdrop',
    autoCloseDelay: 0,
    history: false,
    allowScroll: false,
    zindex: 1045,
    namespace: 'offcanvas'
};

class Offcanvas extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this._component.allowTransitions();
        this.init();
    }

    init() {
        this.modal = new Modal(this._element, this._config);

        // Accessible event data
        const eventData = {
            content: this.modal._content,
            config: this._config
        };

        this.modal.on('initialize', () => {
            this._component.dispatch('initialize');
        });

        this.modal.on('show', () => {
            this._component.dispatch('show', eventData);
        });

        this.modal.on('shown', () => {
            this._component.dispatch('shown', eventData);
        });

        this.modal.on('hidePrevented', () => {
            this._component.dispatch('hidePrevented', eventData);
        });

        this.modal.on('hide', () => {
            this._component.dispatch('hide', eventData);
        });

        this.modal.on('hidden', () => {
            this._component.dispatch('hidden', eventData);
        });
    }

    show() {
        this.modal.show();
    }

    hide() {
        this.modal.hide();
    }

    destroy() {
        this.modal.destroy();
    }
}

uk.registerComponent(_component, Offcanvas);

export {
    Offcanvas
};