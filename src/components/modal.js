import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';

const _component = 'modal';
const _defaults = {
    target: null,
    keyboard: true,
    backdrop: 'dynamic',
    backdropClass: null,
    backdropFadeDuration: 150,
    displayClass: null,
    dialog: 'data-dialog',
    content: 'data-content',
    close: 'data-close'
};

class Modal extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this._useTransitions();
        this.init();
    }

    init() {
        if (!this._element || !this._config.target) return;

        this._isOpened = false;
        this._modal = document.querySelector(this._config.target);
        this._dialog = this._modal.querySelector(`[${this._config.dialog}]`);
        this._content = this._modal.querySelector(`[${this._config.content}]`);
        this._close = this._modal.querySelectorAll(`[${this._config.close}]`);
        this._config.backdropFadeDuration = parseInt(this._config.backdropFadeDuration) / 1000;
        const id = this._modal.id !== '' ? this._modal.id : 'modal-' + util.randomNumber(4);

        util.setAttributes(this._modal, {
            id: id,
            tabindex: -1,
            role: 'dialog',
            ariaModal: true
        });

        this._close.forEach((close) => {
            util.setAttributes(close, {
                role: 'button',
                ariaLabel: close.innerText.trim()!= '' ? close.innerText.trim() : 'Close'
            });
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
      
            if (this._transitioning || this._content.contains(e.target)) return;
    
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

        // Create backdrop element
        this._backdrop = document.createElement('div');
        this._backdrop.style.position = 'fixed';
        this._backdrop.style.top = 0;
        this._backdrop.style.right = 0;
        this._backdrop.style.bottom = 0;
        this._backdrop.style.left = 0;
        this._backdrop.style.opacity = 0;
        this._backdrop.style.transition = `opacity ${this._config.backdropFadeDuration}s linear`;

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

            window.requestAnimationFrame(() => {
                this._backdrop.style.opacity = 1
            });
        };

        const hideBackdrop = () => {
            const transitionEndEvent = () => {
                this._backdrop.remove();
                this._eventOff(this._backdrop, 'transitionend', transitionEndEvent);
            };

            window.requestAnimationFrame(() => {
                this._backdrop.style.opacity = 0
            });

            this._eventOn(this._backdrop, 'transitionend', transitionEndEvent);
        };

        this._show = () => {
            this._isOpened = true;
            this._triggerEvent('show');
            showBackdrop();
            util.removeClass(this._modal, this._config.displayClass);
            
            const transitioned = this._transition('transitionEnter', this._dialog, (e) => {
                this._modal.focus();
                this._triggerEvent('shown');
            });
            
            if (transitioned) {
                return;
            }
            
            this._modal.focus();
            this._triggerEvent('shown');
        };

        this._hide = () => {
            this._isOpened = false;
            this._triggerEvent('hide');
            hideBackdrop();

            const transitioned = this._transition('transitionLeave', this._dialog, (e) => {
                util.addClass(this._modal, this._config.displayClass);
                this._element.focus();
                this._triggerEvent('hidden');
            });

            if (transitioned) {
                return;
            }

            util.addClass(this._modal, this._config.displayClass);
            this._element.focus();
            this._triggerEvent('hidden');
        };

        this._eventOn(this._element, 'click', onClickToggle);
        this._eventOn(this._modal, 'keydown', onKeydown);

        if (this._config.backdrop == 'dynamic') {
            this._eventOn(this._modal, 'click', onClickModalHide);
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