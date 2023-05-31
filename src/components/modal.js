import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';

const _component = 'modal';
const _defaults = {
    target: null,
    keyboard: true,
    backdropClass: null,
    backdropFadeDuration: 150,
    backdropClose: true,
    displayClass: null,
    dialog: 'data-dialog',
    content: 'data-content',
    close: 'data-close',
    backdrop: 'data-modal-backdrop',
    autoCloseDelay: 0,
    history: false,
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
        this._previous = false;
        this._modal = document.querySelector(this._config.target);
        this._dialog = this._modal.querySelector(`[${this._config.dialog}]`);
        this._content = this._modal.querySelector(`[${this._config.content}]`);
        this._config.backdropFadeDuration = parseInt(this._config.backdropFadeDuration) / 1000;
        this._config.autoCloseDelay = parseInt(this._config.autoCloseDelay);
        const modalId = this._modal.id !== '' ? this._modal.id : 'modal-' + util.randomNumber(4);
        const closeTriggers = this._modal.querySelectorAll(`[${this._config.close}]`);
        const minimumAutoCloseDelay = 3000;
        let autoCloseTimer;

        // Set modal attributes.
        util.setAttributes(this._modal, {
            id: modalId,
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

        // Accessible event data
        const eventData = {
            trigger: this._element,
            modal: this._modal,
            content: this._content,
            dialog: this._dialog,
            config: this._config
        };

        /**
         * Show modal when target is clicked.
         */
        const onClickShow = (e) => {
            e.preventDefault();
            this._show(this);
        };

        /**
         * Hide modal when target is clicked.
         */
        const onClickHide = (e) => {
            e.preventDefault();
            this._previous = true;
            this._hide(this);
        };

        /**
         * Hide modal when clicked outside.
         */
        const onClickModalHide = (e) => {
            e.preventDefault();

            if (this.isTransitioning || this._content.contains(e.target)) return;

            if (!this._config.backdropClose) {
                this._component.dispatch('hidePrevented', eventData);

                return;
            }
    
            this._previous = true;
            this._hide(this);
        };

        /**
         * Hide modal when clicked outside.
         */
        const autoCloseModal = () => {
            if (this._config.autoCloseDelay >= minimumAutoCloseDelay) {
                clearTimeout(autoCloseTimer);
                autoCloseTimer = setTimeout(() => {
                    this._hide(this);
                }, this._config.autoCloseDelay);
            }
        };

        /**
         * Move focus within modal.
         */
        const onKeydown = (e) => {
            if (e.key === 'Tab' || (e.shiftKey && e.key === 'Tab')) {
                setFocus(e, this, e.shiftKey);
            }

            if (!this._config.keyboard) {
                this._component.dispatch('hidePrevented', eventData);
            }

            if (e.key === 'Escape' && this._config.keyboard) {
                this._previous = true;
                this._hide(this);
            }
        };

        /**
         * Focus on a target element.
         * 
         * @param {object} e event object
         * @param {boolean} reverse 
         * @returns 
         */
        const setFocus = (e, self, reverse = false) => {
            let focusable = self._content.querySelectorAll('*');
            focusable = [...focusable].filter(node => node.tabIndex >= 0);
            const total = focusable.length;

            if (total == 0) {
                self._modal.focus();
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
         * Stores modal data.
         * 
         * @param {object} data 
         */
        const storeModal = (data) => {

            if (UIkit.store.openedModals instanceof Array) {
                UIkit.store.openedModals.push(data);

                return;
            }

            UIkit.store.openedModals = [data];
        };

        /**
         * Remove stored modal data.
         * 
         * @param {HTMLElement} modal 
         */
        const removeModal = (modal) => {
            if (UIkit.store.openedModals instanceof Array) {
                UIkit.store.openedModals.forEach((data, index) => {
                    if (data._modal == modal) {
                        UIkit.store.openedModals.splice(index, 1);
                    }
                });
            }
        };

        /**
         * Get the total opened modals.
         */
        const getTotalModals = () => {
            return UIkit.store.openedModals ? UIkit.store.openedModals.length : 0;
        };

        /**
         * Remove all stored modals.
         */
        const clearModals = () => {
            delete UIkit.store.openedModals;
        };

        /**
         * Get previously opened modal.
         * 
         * @param {HTMLElement} modal 
         * @returns
         */
        const getPreviousModal = (modal) => {
            let previousModal = null;

            if (UIkit.store.openedModals instanceof Array && UIkit.store.openedModals.length > 0) {
                UIkit.store.openedModals.forEach((data, index) => {
                    if (data._modal == modal) {
                        previousModal = UIkit.store.openedModals[index - 1];
                    }
                });
            }

            return previousModal;
        };

        /**
         * Focus on an element.
         * 
         * @param {HTMLElement} element 
         */
        const focus = (element) => {
            element.focus();
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
            backdrop.setAttribute(`${this._config.backdrop}`, '');

            return backdrop;
        };

        /**
         * Show backdrop.
         */
        const showBackdrop = () => {
            this._backdrop = document.querySelector(`[${this._config.backdrop}]`) || backdrop();
            document.body.append(this._backdrop);

            window.requestAnimationFrame(() => {
                this._backdrop.style.opacity = 1
            });
            
            if (!this._previous) {
                storeModal(this);
            }
        };

        /**
         * Hide and remove backdrop.
         */
        const hideBackdrop = () => {
            if (!this._backdrop || getTotalModals() > 1) {
                // removeModal(this._modal);

                return;
            }

            const transitionEndEvent = () => {
                clearModals();
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
        this._show = (self) => {
            self._isOpened = true;
            self._component.dispatch('show', eventData);
            showBackdrop();

            const previousInstance = getPreviousModal(self._modal);

            if (previousInstance && !this._previous) {
                self._hide(previousInstance);
            }

            this._previous = false;

            util.removeClass(self._modal, self._config.displayClass);
            
            const transitioned = self._component.transition('transitionEnter', self._dialog, (e) => {
                focus(self._modal);
                self._component.dispatch('shown', eventData);
                autoCloseModal();
            });
            
            if (transitioned) {
                return;
            }
            
            focus(self._modal);
            self._component.dispatch('shown', eventData);
            autoCloseModal();
        };

        /**
         * Hide the modal.
         */
        this._hide = (self) => {

            self._isOpened = false;
            self._component.dispatch('hide', eventData);
            hideBackdrop();

            const previousInstance = getPreviousModal(self._modal);

            if (previousInstance && this._previous) {
                removeModal(self._modal);
                self._show(previousInstance);
            }

            this._previous = false;

            if (!self._config.history) {
                removeModal(self._modal);
            }

            const transitioned = self._component.transition('transitionLeave', self._dialog, (e) => {
                util.addClass(self._modal, self._config.displayClass);
                clearTimeout(autoCloseTimer);

                // If last modal is closed
                if (getTotalModals() < 1) focus(self._element);

                self._component.dispatch('hidden', eventData);
            });

            if (transitioned) {
                return;
            }

            util.addClass(self._modal, self._config.displayClass);
            clearTimeout(autoCloseTimer);
            
            // If last modal is closed
            if (getTotalModals() < 1) focus(self._element);

            self._component.dispatch('hidden', eventData);
        };

        /**
         * Events.
         */
        this._component.on(this._element, 'click', onClickShow);
        this._component.on(this._modal, 'keydown', onKeydown);
        this._component.on(this._modal, 'click', onClickModalHide);

        for (const close of closeTriggers) {
            this._component.on(close, 'click', onClickHide);
        }

        this._component.dispatch('initialize');
    }

    /**
     * Shows the modal.
     */
    show() {
        this._show(this);
    }

    /**
     * Hides the modal.
     */
    hide() {
        this._hide(this);
    }

    /**
     * Removes all events and stored data.
     */
    destroy() {
        this._hide(this);
        this._backdrop?.remove();
        this._component.transitionCleanup(this._dialog);
        delete UIkit.store.openedModals;
        util.addClass(this._modal, this._config.displayClass);
        util.removeAttributes(this._modal, [ 'id', 'tabindex', 'role', 'ariaModal' ]);
        util.styles(this._modal, { zIndex: null });
        super.destroy();
    }
}

uk.registerComponent(_component, Modal);

export {
    Modal
};