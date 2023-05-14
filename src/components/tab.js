import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';

const _component = 'tab';
const _defaults = {
    tab: 'data-tab',
    panel: 'data-panel',
    activeClass: null,
    inactiveClass: null,
    disabledClass: null,
    hideClass: null,
    animationStartClass: null,
    animationEndClass: null,
    transition: false,
    selected: 'data-selected',
    disabled: 'data-disabled',
};

class Tab extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this.init();
    }

    init() {
        if (!this._element) return;

        this._data = [];
        this._selectedIndex = 0;
        const id = this._element.id !== '' ? this._element.id : 'tab-' + util.randomNumber(4);
        const tabs = this._element.querySelectorAll(`[${this._config.tab}]`);
        const panels = this._element.querySelectorAll(`[${this._config.panel}]`);
        this._lastIndex = tabs.length > 0 ? tabs.length - 1 : 0; 

        /**
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
         * Get the next tab index
         * 
         * @returns {number}
         */
        this._next = () => {
            let index = 0;
    
            for (let i = 0; i < this._data.length; i++) {

                if (this._data[i].disabled) {
                    continue;
                }
    
                if (this._data[i].selected) {
                    let next = this._data[i].next;
    
                    if (this._data[next].disabled) {
                        continue;
                    }
    
                    index = next;
                    break;
                }
    
                index = i;
            }
    
            return index;
        };
    
        /**
         * Get the previous tab index
         * 
         * @returns {number}
         */
        this._previous = () => {
            let index = this._data.length - 1;
    
            for (let i = index; i >= 0; i--) { 
                if (this._data[i].disabled) {
                    continue;
                }
    
                if (this._data[i].selected) {
                    let previous = this._data[i].previous;
    
                    if (this._data[previous].disabled) {
                        continue;
                    }
    
                    index = previous;
                    break;
                }
    
                index = i;
            }
    
            return index;
        };

        /**
         * Show a tab 
         * 
         * @param {number} index 
         */
        this._show = (index, focus = false) => {
            const current = index;

            if (this._data[current].disabled) {
                return;
            }

            this._data.forEach((data, index) => {
                util.removeClass(data.tab, this._config.activeClass);
                util.addClass(data.tab, this._config.inactiveClass);
                util.addClass(data.panel, this._config.hideClass);
                data.selected = false;
                util.setAttributes(data.tab, {
                    tabindex: -1,
                    'aria-selected': false
                });

                if (current == index) {
                    util.removeClass(data.tab, this._config.inactiveClass);
                    util.addClass(data.tab, this._config.activeClass);
                    util.removeClass(data.panel, this._config.hideClass);
                    data.selected = true;
                    util.setAttributes(data.tab, {
                        tabindex: 0,
                        'aria-selected': true
                    });

                    if (focus) {
                        data.tab.focus();
                    }
                }
            });
        };

        /**
         * Disable a single tab or all tabs
         * 
         * @param {number} index 
         */
        this._disable = (index) => {
            const disable = (data) => {
                util.removeClass(data.tab, this._config.activeClass);
                util.removeClass(data.tab, this._config.inactiveClass);
                util.addClass(data.tab, this._config.disabledClass);
                util.setAttributes(data.tab, {
                    tabindex: -1,
                    'aria-disabled': true
                });

                if (data.tab.disabled != undefined) {
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
                util.removeClass(data.tab, this._config.disabledClass);
                util.addClass(data.tab, this._config.inactiveClass);
                util.setAttributes(data.tab, {
                    tabindex: 0,
                    'aria-disabled': false
                });

                if (data.tab.disabled != undefined) {
                    data.tab.disabled = false;
                }

                if (data.selected) {
                    util.removeClass(data.tab, this._config.inactiveClass);
                    util.addClass(data.tab, this._config.activeClass);
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
        util.setAttributes(this._element, {
            role: 'tablist',
            id: id
        });

        // Set attributes and states for tabs and panels
        tabs.forEach((tab, index) => {
            const name = tab.getAttribute(this._config.tab) == '' 
                ?   `${id}-${index}` 
                : tab.getAttribute(this._config.tab);

            util.setAttributes(tab, {
                role: 'tab',
                id: name,
                tabindex: -1,
                'aria-controls': name + '-pane',
                'aria-selected': tab.hasAttribute(this._config.selected) ? true : false,
                'aria-disabled': tab.hasAttribute(this._config.disabled) ? true : false,
                'data-index': index
            });

            if (tab.disabled === true && !tab.hasAttribute(this._config.disabled)) {
                util.setAttributes(tab, {
                    'aria-disabled': tab.disabled
                });
            }

            if (tab.getAttribute('aria-selected') == 'true') {
                this._selectedIndex = index;
            }

            let panel = getPanel(name);
            panel = panel ? panel : panels[index];

            util.setAttributes(panel, {
                role: 'tabpanel',
                id: name + '-pane',
                tabindex: 0,
                'aria-labelledby': name,
                'data-index': index
            });

            if (tab.getAttribute('aria-disabled') == 'true') {
                util.addClass(tab, this._config.disabledClass);
            } else {
                util.addClass(tab, this._config.inactiveClass);
            }

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
                onKeydown: (e) => {
                    e.preventDefault();

                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                        this._show(this._next(), true);
                    }
            
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                        this._show(this._previous(), true);
                    }

                    if (e.key === 'Home') {
                        this._show(0, true);
                    }

                    if (e.key === 'End') {
                        this._show(this._lastIndex, true);
                    }
                }
            });
        });

        // Set the default tab 
        tabs.forEach((tab, index) => {
            this._data[index]['selected'] = this._selectedIndex == index ? true : false;
        });

        // Add events
        this._data.forEach((data) => {
            this._eventOn(data.tab, 'click', data.onClick);
            this._eventOn(data.tab, 'keydown', data.onKeydown);
        });

        // Select default tab 
        this._show(this._selectedIndex);

        this._triggerEvent('initialize');
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

uk.registerComponent(_component, Tab);

export {
    Tab
};