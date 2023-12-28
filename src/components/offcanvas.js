import Component from '../component.js';
import Modal from './modal.js';

class Offcanvas extends Component {
    constructor(element, config) {

        const _defaults = {
            target: null,
            keyboard: true,
            focus: false,
            backdropFadeDuration: 200,
            backdropClose: true,
            hideBackdrop: false,
            dialog: 'data-dialog',
            content: 'data-content',
            close: 'data-close',
            backdrop: 'data-backdrop',
            autoCloseDelay: 0,
            history: false,
            allowScroll: false,
            zindex: 1045,
            namespace: 'offcanvas',
            classes: {
                backdrop: null,
                display: 'hidden'
            }
        };

        const _component = {
            name: 'offcanvas',
            alias: 'modal',
            element: element, 
            defaultConfig: _defaults, 
            config: config, 
            transitions: {
                enter: true,
                leave: true
            }
        };

        super(_component);

        this._lockConfig({
            autoCloseDelay: 0
        });

        this.modal = new Modal(this._element, this._config);
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

export default Offcanvas;