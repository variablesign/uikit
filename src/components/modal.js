import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';

const _component = 'modal';
const _defaults = {
    target: null,
    keyboard: true,
    backdrop: 'dynamic',
    backdropClass: null,
    hideClass: null,
    animationStartClass: null,
    animationEndClass: null,
    transition: false,
    dialog: 'data-dialog',
    content: 'data-content',
    close: 'data-close'
};

class Modal extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this.init();
    }

    init() {
        if (!this._element || !this._config.target) return;

        this._isOpened = false;
        this._modal = document.querySelector(this._config.target);
        this._dialog = this._modal.querySelector(`[${this._config.dialog}]`);
        this._content = this._modal.querySelector(`[${this._config.content}]`);
        this._close = this._modal.querySelectorAll(`[${this._config.close}]`);
        const id = this._modal.id !== '' ? this._modal.id : 'modal-' + util.randomNumber(4);

        util.setAttributes(this._modal, {
            id: id,
            tabindex: -1,
            role: 'dialog',
            'aria-modal': true
        });

        const onClickToggle = (e) => {
            e.preventDefault();
            this.toggle();
        };

        const onClickHide = (e) => {
            e.preventDefault();
            this._hide();
        };

        const onClickModalHide = (e) => {
            e.preventDefault();

            if (this._content.contains(e.target)) {
                return;
            }
    
            this._hide();
        };

        const onKeydown = (e) => {
            if (e.key === 'Tab' || (e.shiftKey && e.key === 'Tab')) {
                setFocus(e, e.shiftKey);
            }

            if (e.key === 'Escape') {
                this._hide();
            }
        };

        const setFocus = (e, reverse = false) => {
            let focusable = this._content.querySelectorAll('*');
            focusable = [...focusable].filter(node => node.tabIndex >= 0);
            const total = focusable.length;

            if (total == 0) {
                this._modal.focus();
                e.preventDefault();
                
                return;
            }

            if (total >= 1 && document.activeElement == focusable[total - 1]) {
                focusable[0].focus();
                e.preventDefault();

                return;
            }

            if (total >= 1 && document.activeElement == focusable[0] && reverse) {
                focusable[total - 1].focus();
                e.preventDefault();

                return;
            }
        };

        this._backdrop = document.createElement('div');
        this._backdrop.style.position = 'fixed';
        this._backdrop.style.top = 0;
        this._backdrop.style.right = 0;
        this._backdrop.style.bottom = 0;
        this._backdrop.style.left = 0;
        this._backdrop.style.opacity = 0;
        this._backdrop.style.transition = 'opacity 0.15s linear';

        if (!this._config.backdropClass) {        
            this._backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        }

        util.addClass(this._backdrop, this._config.backdropClass);

        let zIndex = parseInt(window.getComputedStyle(this._modal).zIndex);
        zIndex = isNaN(zIndex) ? 'auto' : zIndex - 1;
        this._backdrop.style.zIndex = zIndex;

        this._backdrop.setAttribute('data-modal-backdrop', `#${id}`);

        const showBackdrop = () => {
            document.body.append(this._backdrop);
            setTimeout(() => {
                this._backdrop.style.opacity = 1;
            });
        };

        const hideBackdrop = () => {
            const self = this;

            setTimeout(() => {
                self._backdrop.style.opacity = 0;
            });

            self._backdrop.addEventListener('transitionend', function _handler() {
                self._backdrop.remove();
                this.removeEventListener('transitionend', _handler);
            });
        };

        this._show = () => {
            this._isOpened = true;
            showBackdrop();
            util.removeClass(this._modal, this._config.hideClass);
            this._modal.focus();
        };

        this._hide = () => {
            this._isOpened = false;
            hideBackdrop();
            util.addClass(this._modal, this._config.hideClass);
            this._element.focus();
        };

        this._eventOn(this._element, 'click', onClickToggle);
        this._eventOn(this._modal, 'keydown', onKeydown);

        if (this._config.backdrop == 'dynamic') {
            this._eventOn(this._modal, 'mousedown', onClickModalHide);
        }

        for (const close of this._close) {
            this._eventOn(close, 'click', onClickHide);
        }

        this._triggerEvent('initialize');
    }

    show() {

    }

    hide() {

    }

    toggle() {
        if (this._isOpened) {
            this._hide();

            return;
        }

        this._show();
    }

    destroy() {
        super.destroy();
    }
}

uk.registerComponent(_component, Modal);

export {
    Modal
};