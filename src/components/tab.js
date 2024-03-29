import { randomNumber, addClass, removeClass, setAttributes } from '../utils.js';
import Component from '../component.js';

class Tab extends Component {
    constructor(element, config) {

        const _defaults = {
            tab: 'data-tab',
            panel: 'data-panel',
            selected: 'data-selected',
            disabled: 'data-disabled',
            classes: {
                display: 'hidden'
            }
        };

        const _component = {
            name: 'tab',
            element: element, 
            defaultConfig: _defaults, 
            config: config, 
            transitions: {
                enter: true
            }
        };

        super(_component);

        if (!this._element) return;

        this._data = [];
        this._selectedIndex = 0;
        const id = this._element.id !== '' ? this._element.id : 'tab-' + randomNumber(4);
        const tabs = this._element.querySelectorAll(`[${this._config.tab}]`);
        const panels = this._element.querySelectorAll(`[${this._config.panel}]`);
        this._lastIndex = tabs.length > 0 ? tabs.length - 1 : 0; 
        this._totalTabs = tabs.length;

        /**
         * Data returned through events
         * 
         * @param {number} index 
         * @returns 
         */
        const eventData = (index) => {
            return {
                index: index,
                total: this._totalTabs,
                next: this._data[index].active.next,
                previous: this._data[index].active.previous,
                tab: this._data[index].tab,
                panel: this._data[index].panel
            };
        };

        /**
         * Get a tab panel by name 
         * 
         * @param {string} name 
         * @returns {null|object}
         */
        const getPanel = (name) => {
            let result = null;

            for (const panel of panels) {
                if (panel.getAttribute(this._config.panel) == name) {
                    result = panel;
                    break;
                }
            }

            return result;
        };

        /**
         * Remove disabled tabs
         * 
         * @returns {array}
         */
        const filter = () => {
            return this._data.map((data) => {
                if (data.disabled) {
                    return;
                }

                return data.current;
            }).filter(data => data !== undefined);
        };

        /**
         * Get the next tab index
         * 
         * @param {number} index
         * @returns {number}
         */
        this._next = (index = null) => {
            const filtered = filter();
            index = index ? index : this._selectedIndex;

            if (filtered.includes(index)) {
                return index < (filtered.length - 1) 
                    ? filtered[filtered.indexOf(index) + 1] 
                    : 0;
            }

            return index;
        };
    
        /**
         * Get the previous tab index
         * 
         * @param {number} index
         * @returns {number}
         */
        this._previous = (index = null) => {
            const filtered = filter();
            index = index ? index : this._selectedIndex;

            if (filtered.includes(index)) {
                return index > 0
                    ? filtered[filtered.indexOf(index) - 1] 
                    : filtered[filtered.length - 1];
            }

            return index;
        };

        /**
         * hide all tabs 
         */
        const hideAll = () => {
            this._data.forEach((data, index) => {
                const previous = data.selected ? data.current : null;

                if (previous !== null) {
                    this._dispatchEvent('hide', eventData(index));
                }
                
                addClass(data.panel, this._config.classes.display);

                data.selected = false;
                setAttributes(data.tab, {
                    tabindex: -1,
                    ariaSelected: false
                });

                if (previous !== null) {
                    this._dispatchEvent('hidden', eventData(index));
                }
            });
        };

        /**
         * Show a tab 
         * 
         * @param {number} index 
         * @param {boolean} focus
         */
        this._show = (index, focus = false) => {
            const data = this._data[index];
            
            if (!data || data.disabled) {
                return;
            }

            hideAll();

            this._dispatchEvent('show', eventData(index));

            data.selected = true;
            this._selectedIndex = index;
            setAttributes(data.tab, {
                tabindex: 0,
                ariaSelected: true
            });

            if (focus) {
                data.tab.focus();
            }

            removeClass(data.panel, this._config.classes.display);

            const transitioned = this._transition('transitionEnter', data.panel, data.onTransitionEnterEnd);

            if (transitioned) return;

            this._dispatchEvent('shown', eventData(index));
        };

        /**
         * Disable a single tab or all tabs
         * 
         * @param {number} index 
         */
        this._disable = (index) => {
            const disable = (data) => {
                setAttributes(data.tab, {
                    tabindex: -1,
                    ariaDisabled: true
                });

                if (data.tab.disabled !== undefined) {
                    data.tab.disabled = true;
                }
            };

            if (index != undefined) {
                disable(this._data[index]);
                this._data[index].disabled = true;
            } else {
                this._data.forEach((data) => {
                    disable(data);
                    data.disabled = true;
                });
            }
        };

        /**
         * Enable a single tab or all tabs
         * 
         * @param {number} index 
         */
        this._enable = (index) => {
            const enable = (data) => {
                setAttributes(data.tab, {
                    tabindex: 0,
                    ariaDisabled: false
                });

                if (data.tab.disabled !== undefined) {
                    data.tab.disabled = false;
                }
            };

            if (index != undefined) {
                enable(this._data[index]);
                this._data[index].disabled = false;
            } else {
                this._data.forEach((data) => {
                    enable(data);
                    data.disabled = false;
                });
            }
        };

        // Set tablist element attributes
        setAttributes(this._element, {
            role: 'tablist',
            id: id
        });

        // Set attributes and states for tabs and panels
        tabs.forEach((tab, index) => {
            const panelSuffix = '-pane';
            const name = tab.getAttribute(this._config.tab) == '' 
                ?   `${id}-${index}` 
                : tab.getAttribute(this._config.tab);

            setAttributes(tab, {
                role: 'tab',
                id: name,
                tabindex: -1,
                ariaControls: name + panelSuffix,
                ariaSelected: tab.hasAttribute(this._config.selected) ? true : false,
                ariaDisabled: tab.hasAttribute(this._config.disabled) ? true : false,
                dataIndex: index
            });

            if (tab.disabled === true && !tab.hasAttribute(this._config.disabled)) {
                setAttributes(tab, {
                    ariaDisabled: tab.disabled
                });
            }

            if (tab.disabled === false && tab.hasAttribute(this._config.disabled)) {
                tab.disabled = true;
            }

            if (tab.getAttribute('aria-selected') == 'true') {
                this._selectedIndex = index;
            }

            let panel = getPanel(name);
            panel = panel ? panel : panels[index];

            setAttributes(panel, {
                role: 'tabpanel',
                id: name + panelSuffix,
                tabindex: 0,
                ariaLabelledby: name,
                dataIndex: index
            });

            this._data.push({
                current: index,
                previous: index > 0 ? index - 1 : tabs.length - 1,
                next: index < (tabs.length - 1) ? index + 1 : 0,
                disabled: tab.getAttribute('aria-disabled') == 'true' ? true : false,
                tab: tab,
                panel: panel,
                onClick: (e) => {
                    e.preventDefault();
                    this._show(index);
                },
                onTransitionEnterEnd: (e) => {
                    this._dispatchEvent('shown', eventData(index));
                },
                onKeydown: (e) => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        this._show(this._next(), true);
                    }
            
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        this._show(this._previous(), true);
                    }

                    if (e.key === 'Home') {
                        e.preventDefault();
                        this._show(0, true);
                    }

                    if (e.key === 'End') {
                        e.preventDefault();
                        this._show(this._lastIndex, true);
                    }
                }
            });
        });

        // After the data object is created, do the following
        tabs.forEach((tab, index) => {
            this._data[index]['selected'] = this._selectedIndex == index ? true : false;  
            this._data[index]['active'] = {
                next: !this._data[index]['disabled'] ? this._next(index) : -1,
                previous: !this._data[index]['disabled'] ? this._previous(index) : -1
            };
        });

        // Add events
        this._data.forEach((data) => {
            this._on(data.tab, 'click', data.onClick);
            this._on(data.tab, 'keydown', data.onKeydown);
        });

        // Select default tab 
        this._show(this._selectedIndex);

        this._dispatchEvent('initialize');
    }

    show(index = 0) {
        this._show(parseInt(index));
    }

    first() {
        this._show(0);
    }

    last() {
        this._show(this._lastIndex);
    }

    next() {
        this._show(this._next());
    }

    previous() {
        this._show(this._previous());
    }

    enable(index) {
        this._enable(index);
    }

    disable(index) {
        this._disable(index);
    }

    destroy() {
        this._data = [];
        super.destroy();
    }
}

export default Tab;