import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';

const _component = 'modal';
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
    zindex: 1055,
    storage: 'modal'
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
        this._config.zindex = parseInt(this._config.zindex) || 0;
        this._config.storage = util.kebabCase(this._config.storage);
        this._modal = document.querySelector(this._config.target);
        this._dialog = this._modal.querySelector(`[${this._config.dialog}]`);
        this._content = this._modal.querySelector(`[${this._config.content}]`);
        this._initialFocus = this._modal;
        this._finalFocus = this._element;
        this._config.backdropFadeDuration = parseInt(this._config.backdropFadeDuration) / 1000;
        this._config.autoCloseDelay = parseInt(this._config.autoCloseDelay);
        const modalId = this._modal.id !== '' ? this._modal.id : 'modal-' + util.randomNumber(4);
        const closeTriggers = this._modal.querySelectorAll(`[${this._config.close}]`);
        const minimumAutoCloseDelay = 3000;
        let autoCloseTimer;
        UIkit.store[this._config.storage] = UIkit.store[this._config.storage] ? UIkit.store[this._config.storage] : {};

        // Set modal attributes.
        util.setAttributes(this._modal, {
            id: modalId,
            tabindex: -1,
            role: 'dialog',
            ariaModal: true
        });

        // Set modal styles.
        util.styles(this._modal, {
            zIndex: this._config.zindex
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
            content: this._content,
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
         * Get all focusable elements.
         * 
         * @param {object} self 
         */
        const getFocusable = (self) => {
            const focusable = self._content.querySelectorAll('*');

            return [...focusable].filter(node => node.tabIndex >= 0);
        };

        /**
         * Focus on a target element.
         * 
         * @param {object} e event object
         * @param {object} self 
         * @param {boolean} reverse 
         * @returns 
         */
        const setFocus = (e, self, reverse = false) => {
            let focusable = getFocusable(self);
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

            if (UIkit.store[this._config.storage].openedModals instanceof Array) {
                UIkit.store[this._config.storage].openedModals.push(data);

                return;
            }

            UIkit.store[this._config.storage].openedModals = [data];
            UIkit.store[this._config.storage].firstModal = data._modal;
            UIkit.store[this._config.storage].firstModalTrigger = data._element;
        };

        /**
         * Remove stored modal data.
         * 
         * @param {HTMLElement} modal 
         */
        const removeModal = (modal) => {
            if (UIkit.store[this._config.storage].openedModals instanceof Array) {
                UIkit.store[this._config.storage].openedModals.forEach((data, index) => {
                    if (data._modal == modal) {
                        UIkit.store[this._config.storage].openedModals.splice(index, 1);
                    }
                });
            }
        };

        /**
         * Get the total opened modals.
         */
        const getTotalModals = () => {
            return UIkit.store[this._config.storage].openedModals ? UIkit.store[this._config.storage].openedModals.length : 0;
        };

        /**
         * Check if is the first opened modal.
         * 
         * @param {HTMLElement} modal 
         */
        const isFirstModal = (modal) => {
            return UIkit.store[this._config.storage].firstModal == modal;
        };

        /**
         * Get the first modal trigger.
         */
        const getFirstModalTrigger = () => {
            return UIkit.store[this._config.storage].firstModalTrigger;
        };

        /**
         * Remove all stored modals.
         */
        const clearModals = () => {
            // delete UIkit.store[this._config.storage];
            delete UIkit.store[this._config.storage].openedModals;
            delete UIkit.store[this._config.storage].firstModal;
            delete UIkit.store[this._config.storage].firstModalTrigger;
        };

        /**
         * Get previously opened modal.
         * 
         * @param {HTMLElement} modal 
         * @returns
         */
        const getPreviousModal = (modal) => {
            let previousModal = null;

            if (UIkit.store[this._config.storage].openedModals instanceof Array && UIkit.store[this._config.storage].openedModals.length > 0) {
                UIkit.store[this._config.storage].openedModals.forEach((data, index) => {
                    if (data._modal == modal) {
                        previousModal = UIkit.store[this._config.storage].openedModals[index - 1];
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
         * Set opened dialog attribute.
         */
        const setOpenedDialogsAttribute = () => {
            let attributes = document.body.dataset.openedDialogs || '';
            attributes = attributes.split(',');
            attributes = attributes.filter(attribute => attribute != '');

            if (attributes.indexOf(this._config.storage) === -1) {
                attributes.push(this._config.storage);
                let value = attributes.length > 1 ? attributes.join(',') : this._config.storage;
                document.body.setAttribute(`data-opened-dialogs`, value);
            }  
        };

        /**
         * Remove opened dialog attribute.
         */
        const removeOpenedDialogsAttribute = () => {
            let attributes = document.body.dataset.openedDialogs || '';
            attributes = attributes.split(',');

            if (attributes.indexOf(this._config.storage) !== -1) {
                attributes.splice(attributes.indexOf(this._config.storage), 1);

                if (attributes.length > 0) {                    
                    let value = attributes.length > 1 ? attributes.join(',') : attributes[0];
                    document.body.setAttribute(`data-opened-dialogs`, value);
                } else {
                    document.body.removeAttribute(`data-opened-dialogs`);
                }
            }  
        };

        /**
         * Hide scrollbar. 
         */
        const hideScrollbar = () => {
            if (this._config.allowScroll) return;
            
            // Hide modal scrollbar
            this._modal.style.overflow = `hidden`;

            // Restore scrollbar and right margin
            if (!document.body.dataset.openedDialogs) {                
                util.styles(document.body, {
                    overflow: null,
                    marginRight: null
                });
            }
        };

        /**
         * Check if document body has overflow and margin styles. 
         */
        const hasOverflowMargin = () => {
            return Boolean(document.body.style.overflow && document.body.style.marginRight);
        };

        /**
         * Restore modal scrollbar.
         * 
         * @param {object} self 
         */
        const restoreModalScrollbar = (self) => {
            if (self._config.allowScroll) return;

            self._modal.style.overflow = null;
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
                zIndex: this._config.zindex - 5
            });
    
            util.addClass(backdrop, this._config.backdropClass);
            util.setAttributes(backdrop, {
                [`${this._config.backdrop}`]: this._config.storage
            });

            return backdrop;
        };

        /**
         * Show backdrop.
         */
        const showBackdrop = () => {
            this._backdrop = document.querySelector(`[${this._config.backdrop}="${this._config.storage}"]`) || backdrop();

            if (!this._config.hideBackdrop) {
                document.body.append(this._backdrop);
            }

            // Hide scrollbar and set right margin
            if (getTotalModals() == 0 && !this._config.allowScroll && !hasOverflowMargin()) {                
                const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
                util.styles(document.body, {
                    overflow: `hidden`,
                    marginRight: `${scrollBarWidth}px`
                });
            }

            window.requestAnimationFrame(() => {
                this._backdrop.style.opacity = 1
            });
            
            if (!this._previous) {
                storeModal(this);

                setOpenedDialogsAttribute();
            }
        };

        /**
         * Hide and remove backdrop.
         */
        const hideBackdrop = () => {
            if ((!this._backdrop || getTotalModals() > 1) && !this._config.hideBackdrop) return;

            removeOpenedDialogsAttribute();

            if (!this._config.history) {
                this._finalFocus = getFirstModalTrigger();
            }

            const transitionEndEvent = () => { 
                hideScrollbar();
                clearModals();
                this._backdrop.remove();
                this._component.off(this._backdrop, 'transitionend', transitionEndEvent);
            };

            window.requestAnimationFrame(() => {
                this._backdrop.style.opacity = 0
            });

            if (this._config.hideBackdrop && getTotalModals() == 1) {
                hideScrollbar();
                clearModals();
            }

            this._component.on(this._backdrop, 'transitionend', transitionEndEvent);
        };

        /**
         * Forcefully remove backdrop.
         */
        const removeBackdrop = () => {
            const animationDuration = parseFloat(window.getComputedStyle(this._dialog).animationDuration) || 0;
            const transitionDuration = parseFloat(window.getComputedStyle(this._dialog).transitionDuration) || 0;
   
            if (transitionDuration >= this._config.backdropFadeDuration || animationDuration >= this._config.backdropFadeDuration) {
                return;
            }

            if ((isFirstModal(this._modal) && this._config.history) || !this._config.history) {
                clearModals();
                this._backdrop.remove();
            }
        };

        /**
         * Show the modal.
         * 
         * @param {object} self 
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

            if (self._config.focus && getFocusable(self).length > 0) {
                self._initialFocus = getFocusable(self)[0];
            }

            util.removeClass(self._modal, self._config.displayClass);
            
            const transitioned = self._component.transition('transitionEnter', self._dialog, (e) => {
                focus(self._initialFocus);
                self._component.dispatch('shown', eventData);
                autoCloseModal();
            });
            
            if (transitioned) {
                return;
            }
            
            focus(self._initialFocus);
            self._component.dispatch('shown', eventData);
            autoCloseModal();
        };

        /**
         * Hide the modal.
         * 
         * @param {object} self 
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
                if (getTotalModals() < 1) focus(self._finalFocus);

                restoreModalScrollbar(self);
                self._component.dispatch('hidden', eventData);

                removeBackdrop();
            });

            if (transitioned) {
                return;
            }

            util.addClass(self._modal, self._config.displayClass);
            clearTimeout(autoCloseTimer);
            
            // If last modal is closed
            if (getTotalModals() < 1) focus(self._finalFocus);

            restoreModalScrollbar(self);
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

    show() {
        this._show(this);
    }

    hide() {
        this._hide(this);
    }

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