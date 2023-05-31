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
    close: 'data-close',
    modalZindex: 1055,
    backdropZindex: 1050
};

class Modal extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this._component.allowTransitions();
        this.init();
    }

    init() {
        if (!this._element || !this._config.target) return;

        this._isOpened = false;
        this._modal = document.querySelector(this._config.target);
        this._dialog = this._modal.querySelector(`[${this._config.dialog}]`);
        this._content = this._modal.querySelector(`[${this._config.content}]`);
        this._config.backdropFadeDuration = parseInt(this._config.backdropFadeDuration) / 1000;
        const id = this._modal.id !== '' ? this._modal.id : 'modal-' + util.randomNumber(4);
        const closeTriggers = this._modal.querySelectorAll(`[${this._config.close}]`);

        // Set modal attributes.
        util.setAttributes(this._modal, {
            id: id,
            tabindex: -1,
            role: 'dialog',
            ariaModal: true
        });

        // Set modal styles.
        util.styles(this._modal, {
            zIndex: this._config.modalZindex
        });

        // Search for all elements that can close the modal 
        // and set the following attributes.
        closeTriggers.forEach((close) => {
            util.setAttributes(close, {
                role: 'button',
                ariaLabel: close.innerText.trim()!= '' ? close.innerText.trim() : 'Close'
            });
        });

        /**
         * Toggle modal when target is clicked.
         */
        const onClickToggle = (e) => {
            e.preventDefault();
            this.toggle();
        };

        /**
         * Hide modal when target is clicked.
         */
        const onClickHide = (e) => {
            e.preventDefault();
            this._hide();
        };

        /**
         * Hide modal when clicked outside.
         */
        const onClickModalHide = (e) => {
            e.preventDefault();

            if (this.isTransitioning || this._content.contains(e.target)) return;
    
            this._hide();
        };

        /**
         * Move focus within modal.
         */
        const onKeydown = (e) => {
            if (e.key === 'Tab' || (e.shiftKey && e.key === 'Tab')) {
                setFocus(e, e.shiftKey);
            }

            if (e.key === 'Escape') {
                this._hide();
            }
        };

        /**
         * Focus on a target element.
         * 
         * @param {object} e event object
         * @param {boolean} reverse 
         * @returns 
         */
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

        /**
         * Create a backdrop.
         * 
         * @returns 
         */
        const backdrop = () => {
            const backdrop = document.createElement('div');
            
            if (!this._config.backdropClass) {        
                backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            }
    
            util.styles(backdrop, {
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                opacity: 0,
                transition: `opacity ${this._config.backdropFadeDuration}s linear`,
                zIndex: this._config.backdropZindex
            });
    
            util.addClass(backdrop, this._config.backdropClass);
            backdrop.setAttribute('data-modal-backdrop', `#${id}`);

            return backdrop;
        };

        /**
         * Show backdrop.
         */
        const showBackdrop = () => {
            this._backdrop = backdrop();

            document.body.append(this._backdrop);

            window.requestAnimationFrame(() => {
                this._backdrop.style.opacity = 1
            });
        };

        /**
         * Hide and remove backdrop.
         */
        const hideBackdrop = () => {
            if (!this._backdrop) return;

            const transitionEndEvent = () => {
                this._backdrop.remove();
                this._component.off(this._backdrop, 'transitionend', transitionEndEvent);
            };

            window.requestAnimationFrame(() => {
                this._backdrop.style.opacity = 0
            });

            this._component.on(this._backdrop, 'transitionend', transitionEndEvent);
        };

        /**
         * Show the modal.
         */
        this._show = () => {
            this._isOpened = true;
            this._component.dispatch('show');
            showBackdrop();
            util.removeClass(this._modal, this._config.displayClass);
            
            const transitioned = this._component.transition('transitionEnter', this._dialog, (e) => {
                this._modal.focus();
                this._component.dispatch('shown');
            });
            
            if (transitioned) {
                return;
            }
            
            this._modal.focus();
            this._component.dispatch('shown');
        };

        /**
         * Hide the modal.
         */
        this._hide = () => {
            this._isOpened = false;
            this._component.dispatch('hide');
            hideBackdrop();

            const transitioned = this._component.transition('transitionLeave', this._dialog, (e) => {
                util.addClass(this._modal, this._config.displayClass);
                this._element.focus();
                this._component.dispatch('hidden');
            });

            if (transitioned) {
                return;
            }

            util.addClass(this._modal, this._config.displayClass);
            this._element.focus();
            this._component.dispatch('hidden');
        };

        /**
         * Events.
         */
        this._component.on(this._element, 'click', onClickToggle);
        this._component.on(this._modal, 'keydown', onKeydown);

        if (this._config.backdrop == 'dynamic') {
            this._component.on(this._modal, 'click', onClickModalHide);
        }

        for (const close of closeTriggers) {
            this._component.on(close, 'click', onClickHide);
        }

        this._component.dispatch('initialize');
    }

    /**
     * Shows the modal.
     */
    show() {
        this._show();
    }

    /**
     * Hides the modal.
     */
    hide() {
        this._hide();
    }

    /**
     * Shows/hides the modal.
     */
    toggle() {
        if (this._isOpened) {
            this._hide();

            return;
        }

        this._show();
    }

    /**
     * Removes all events and stored data.
     */
    destroy() {
        super.destroy();
    }
}

uk.registerComponent(_component, Modal);

export {
    Modal
};