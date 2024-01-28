import Modal from './modal.js';

class Offcanvas extends Modal {
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

        super(
            element, 
            Object.assign(_defaults, config), 
            { 
                name: 'offcanvas'
            }
        );

        // this._lockConfig({
        //     autoCloseDelay: 0
        // });
    }
}

export default Offcanvas;