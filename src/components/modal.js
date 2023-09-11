import {
    randomNumber,
    kebabCase,
    styles,
    addClass,
    removeClass,
    setAttributes,
    removeAttributes
} from '../utils.js';
import Component from '../component.js';

class Modal extends Component {
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
            zindex: 1055,
            namespace: 'modal',
            classes: {
                backdrop: null,
                display: 'hidden'
            }
        };

        const _component = {
            name: 'modal',
            element: element, 
            defaultConfig: _defaults, 
            config: config, 
            transitions: {
                enter: true,
                leave: true
            }
        };

        super(_component);
        
        if (!this._element || !this._config.target) return;

        this._isOpened = false;
        this._previous = false;
        this._config.zindex = parseInt(this._config.zindex) || 0;
        this._config.namespace = kebabCase(this._config.namespace);
        this._modal = document.querySelector(this._config.target);

        if (!this._modal) return;

        this._dialog = this._modal.querySelector(`[${this._config.dialog}]`);
        this._content = this._modal.querySelector(`[${this._config.content}]`);
        this._initialFocus = this._modal;
        this._finalFocus = this._element;
        this._config.backdropFadeDuration = parseInt(this._config.backdropFadeDuration) / 1000;
        this._config.autoCloseDelay = parseInt(this._config.autoCloseDelay);
        const modalId = this._modal.id !== '' ? this._modal.id : 'modal-' + randomNumber(4);
        const closeTriggers = this._modal.querySelectorAll(`[${this._config.close}]`);
        const minimumAutoCloseDelay = 3000;
        UIkit.store[this._config.namespace] = UIkit.store[this._config.namespace] ? UIkit.store[this._config.namespace] : {};

        // Set modal attributes.
        setAttributes(this._modal, {
            id: modalId,
            tabindex: -1,
            role: 'dialog',
            ariaModal: true
        });

        // Set modal styles.
        styles(this._modal, {
            zIndex: this._config.zindex
        });

        // Search for all elements that can close the modal 
        // and set the following attributes.
        closeTriggers.forEach((close) => {
            setAttributes(close, {
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

            if (this._isTransitioning || this._content.contains(e.target)) return;

            if (!this._config.backdropClose) {
                this._dispatchEvent('hidePrevented', eventData);

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
                this._setTimeout(() => {
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

            if (e.key === 'Escape' && !this._config.keyboard) {
                this._dispatchEvent('hidePrevented', eventData);

                return;
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

            if (UIkit.store[this._config.namespace].openedModals instanceof Array) {
                UIkit.store[this._config.namespace].openedModals.push(data);

                return;
            }

            UIkit.store[this._config.namespace].openedModals = [data];
            UIkit.store[this._config.namespace].firstModal = data._modal;
            UIkit.store[this._config.namespace].firstModalTrigger = data._element;
        };

        /**
         * Remove stored modal data.
         * 
         * @param {HTMLElement} modal 
         */
        const removeModal = (modal) => {
            if (UIkit.store[this._config.namespace].openedModals instanceof Array) {
                UIkit.store[this._config.namespace].openedModals.forEach((data, index) => {
                    if (data._modal == modal) {
                        UIkit.store[this._config.namespace].openedModals.splice(index, 1);
                    }
                });
            }
        };

        /**
         * Get the total opened modals.
         */
        const getTotalModals = () => {
            return UIkit.store[this._config.namespace].openedModals ? UIkit.store[this._config.namespace].openedModals.length : 0;
        };

        /**
         * Check if is the first opened modal.
         * 
         * @param {HTMLElement} modal 
         */
        const isFirstModal = (modal) => {
            return UIkit.store[this._config.namespace].firstModal == modal;
        };

        /**
         * Get the first modal trigger.
         */
        const getFirstModalTrigger = () => {
            return UIkit.store[this._config.namespace].firstModalTrigger;
        };

        /**
         * Remove all stored modals.
         */
        const clearModals = () => {
            // delete UIkit.store[this._config.namespace];
            delete UIkit.store[this._config.namespace].openedModals;
            delete UIkit.store[this._config.namespace].firstModal;
            delete UIkit.store[this._config.namespace].firstModalTrigger;
        };

        /**
         * Get previously opened modal.
         * 
         * @param {HTMLElement} modal 
         * @returns
         */
        const getPreviousModal = (modal) => {
            let previousModal = null;

            if (UIkit.store[this._config.namespace].openedModals instanceof Array && UIkit.store[this._config.namespace].openedModals.length > 0) {
                UIkit.store[this._config.namespace].openedModals.forEach((data, index) => {
                    if (data._modal == modal) {
                        previousModal = UIkit.store[this._config.namespace].openedModals[index - 1];
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

            if (attributes.indexOf(this._config.namespace) === -1) {
                attributes.push(this._config.namespace);
                let value = attributes.length > 1 ? attributes.join(',') : this._config.namespace;
                document.body.setAttribute(`data-opened-dialogs`, value);
            }  
        };

        /**
         * Remove opened dialog attribute.
         */
        const removeOpenedDialogsAttribute = () => {
            let attributes = document.body.dataset.openedDialogs || '';
            attributes = attributes.split(',');

            if (attributes.indexOf(this._config.namespace) !== -1) {
                attributes.splice(attributes.indexOf(this._config.namespace), 1);

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
                styles(document.body, {
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
            
            if (!this._config.classes.backdrop) {        
                backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            }
    
            styles(backdrop, {
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                zIndex: this._config.zindex - 5
            });

            if (this._hasTransition) {
                styles(backdrop, {
                    opacity: 0,
                    transition: `opacity ${this._config.backdropFadeDuration}s linear`,
                });
            }
    
            addClass(backdrop, this._config.classes.backdrop);
            setAttributes(backdrop, {
                [`${this._config.backdrop}`]: this._config.namespace
            });

            return backdrop;
        };

        /**
         * Show backdrop.
         */
        const showBackdrop = () => {
            this._backdrop = document.querySelector(`[${this._config.backdrop}="${this._config.namespace}"]`) || backdrop();

            if (!this._config.hideBackdrop) {
                document.body.append(this._backdrop);
            }

            // Hide scrollbar and set right margin
            if (getTotalModals() == 0 && !this._config.allowScroll && !hasOverflowMargin()) {                
                const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
                styles(document.body, {
                    overflow: `hidden`,
                    marginRight: `${scrollBarWidth}px`
                });
            }

            if (this._hasTransition) {
                window.requestAnimationFrame(() => {
                    this._backdrop.style.opacity = 1
                });
            }
            
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

            if (this._config.hideBackdrop && getTotalModals() == 1) {
                hideScrollbar();
                clearModals();
            }

            if (!this._hasTransition) {
                hideScrollbar();
                clearModals();
                this._backdrop.remove();

                return;
            }

            const transitionEndEvent = () => { 
                hideScrollbar();
                clearModals();
                this._backdrop.remove();
                this._off(this._backdrop, 'transitionend', transitionEndEvent);
            };

            window.requestAnimationFrame(() => {
                this._backdrop.style.opacity = 0
            });

            this._on(this._backdrop, 'transitionend', transitionEndEvent);
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
            self._dispatchEvent('show', eventData);
            showBackdrop();

            const previousInstance = getPreviousModal(self._modal);

            if (previousInstance && !this._previous) {
                self._hide(previousInstance);
            }

            this._previous = false;

            if (self._config.focus && getFocusable(self).length > 0) {
                self._initialFocus = getFocusable(self)[0];
            }

            removeClass(self._modal, self._config.classes.display);
            
            const transitioned = self._transition('transitionEnter', self._dialog, (e) => {
                focus(self._initialFocus);
                self._dispatchEvent('shown', eventData);
                autoCloseModal();
            });
            
            if (transitioned) return;
            
            focus(self._initialFocus);
            self._dispatchEvent('shown', eventData);
            autoCloseModal();
        };

        /**
         * Hide the modal.
         * 
         * @param {object} self 
         */
        this._hide = (self) => {

            self._isOpened = false;
            self._dispatchEvent('hide', eventData);
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

            const transitioned = self._transition('transitionLeave', self._dialog, (e) => {
                addClass(self._modal, self._config.classes.display);

                // If last modal is closed
                if (getTotalModals() < 1) focus(self._finalFocus);

                restoreModalScrollbar(self);
                self._dispatchEvent('hidden', eventData);

                removeBackdrop();
            });

            if (transitioned) return;

            addClass(self._modal, self._config.classes.display);
            
            // If last modal is closed
            if (getTotalModals() < 1) focus(self._finalFocus);

            restoreModalScrollbar(self);
            self._dispatchEvent('hidden', eventData);
        };

        /**
         * Events.
         */
        this._on(this._element, 'click', onClickShow);
        this._on(this._modal, 'keydown', onKeydown);
        this._on(this._modal, 'click', onClickModalHide);

        for (const close of closeTriggers) {
            this._on(close, 'click', onClickHide);
        }

        this._dispatchEvent('initialize');
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
        this._transitionCleanup(this._dialog);
        delete UIkit.store.openedModals;
        addClass(this._modal, this._config.classes.display);
        removeAttributes(this._modal, [ 'id', 'tabindex', 'role', 'ariaModal' ]);
        styles(this._modal, { zIndex: null });
        super.destroy();
    }
}

export default Modal;