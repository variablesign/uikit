import { randomNumber, removeClass, hideElement, showElement, setAttributes } from '../utils.js';
import Component from '../component.js';

class Accordion extends Component {
    constructor(element, config) {

        const _defaults = {
            toggle: false,
            displayClass: null,
            trigger: 'data-trigger',
            panel: 'data-panel'
        };

        const _component = {
            name: 'accordion',
            element: element, 
            defaultConfig: _defaults, 
            config: config, 
            transitions: {
                enter: true,
                leave: true
            }
        };

        super(_component);

        if (!this._element) return;

        this._data = [];
        const id = this._element.id !== '' ? this._element.id : 'accordion-' + randomNumber(4);
        const triggers = this._element.querySelectorAll(`[${this._config.trigger}]`);
        const panels = this._element.querySelectorAll(`[${this._config.panel}]`);

        /**
         * Data returned through events
         * 
         * @param {number} index 
         * @returns 
         */
        const eventData = (index) => {
            return {
                trigger: this._data[index].tab,
                panel: this._data[index].panel,
                opened: this._data[index].isVisible
            };
        };

        /**
         * Remove animation styles 
         * 
         * @param {HTMLElement} element 
         */
        const removeAnimationStyles = (element) => {
            element.style.height = null;
        };

        /**
         * Show panel
         * 
         * @param {number} index 
         */
        const show = (index) => {
            const data = this._data[index];

            if (!data) return;

            if (this._config.toggle) {
                hideAll(index);
            }

            this._dispatchEvent('show', eventData(index));

            data.isVisible = !data.isVisible;
            setAttributes(data.trigger, {
                ariaExpanded: true
            });

            showElement(data.panel);
            
            const transitioned = this._transition('transitionEnter', data.panel, (e) => {
                showElement(data.panel, null);
                removeAnimationStyles(data.panel);
                this._dispatchEvent('shown', eventData(index));
            });

            if (transitioned) {
                window.requestAnimationFrame(() => {
                    const panelHeight = data.panel.offsetHeight;
                    data.panel.style.height = `0px`;

                    window.requestAnimationFrame(() => {
                        data.panel.style.height = `${panelHeight}px`;
                    });
                });

                return;
            }

            this._dispatchEvent('shown', eventData(index));
        };

        /**
         * Hide panel
         * 
         * @param {number} index 
         */
        const hide = (index) => {
            const data = this._data[index];

            if (!data) return;

            this._dispatchEvent('hide', eventData(index));

            data.isVisible = !data.isVisible;
            setAttributes(data.trigger, {
                ariaExpanded: false
            });

            if (this._hasTransition) {                
                data.panel.style.height = `${data.panel.offsetHeight}px`;
    
                window.requestAnimationFrame(() => {
                    data.panel.style.height = `0px`;
                });
            }

            const transitioned = this._transition('transitionLeave', data.panel, (e) => {
                hideElement(data.panel);
                removeAnimationStyles(data.panel);
                this._dispatchEvent('hidden', eventData(index));
            });

            if (transitioned) {
                return;
            }

            hideElement(data.panel);
            this._dispatchEvent('hidden', eventData(index));
        };

        /**
         * Hide all visible panels 
         * 
         * @param {number} excludeIndex 
         */
        const hideAll = (excludeIndex) => {
            const current = this._data[excludeIndex];

            for (const data of this._data) {
                if (data.isVisible && data.index !== excludeIndex && current.parent === data.parent) {
                    hide(data.index);
                }
            }
        };

        /**
         * Show/hide panel
         * 
         * @param {number} index 
         */
        const toggle = (index) => {
            if (this._component.isTransitioning) return;

            const data = this._data[index];

            if (!data) return;

            if (data.isVisible) {
                hide(data.index);

                return;
            }

            show(data.index);
        };

        // Set attributes and states
        triggers.forEach((trigger, index) => {
            const panel = panels[index];
            const panelSuffix = '-panel';

            const isVisible = panel.offsetParent !== null 
                ? true 
                : false

            const name = trigger.getAttribute(this._config.trigger) == '' 
                ?   `${id}-${index}` 
                : trigger.getAttribute(this._config.trigger);

            setAttributes(trigger, {
                id: name,
                ariaControls: name + panelSuffix,
                ariaExpanded: isVisible
            });

            setAttributes(panel, {
                role: 'region',
                id: name + panelSuffix,
                ariaLabelledby: name
            });

            // Remove display class and hide panels
            if (panel.classList.contains(this._config.displayClass)) {                
                hideElement(panel);
                removeClass(panel, this._config.displayClass);
            }

            // Store accordion data
            this._data.push({
                index,
                trigger,
                panel,
                isVisible,
                parent: trigger.closest(`[${this._config.panel}]`)
            });

            // Attach click event
            this._on(trigger, 'click', (e) => {
                e.preventDefault();
                toggle(index);
            });
        });

        this._dispatchEvent('initialize');
    }

    destroy() {
        super.destroy();
    }
}

export default Accordion;