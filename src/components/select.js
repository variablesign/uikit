import { styles, stringToDom, showElement, hideElement } from '../utils.js';
import Component from '../component.js';
import { computePosition, offset, flip, autoUpdate } from '@floating-ui/dom';
import TomSelect from '../plugins/tomselect/2.2.2/tom-select.js';
import TomSelect_remove_button from '../plugins/tomselect/2.2.2/plugins/remove_button/plugin.js';
import TomSelect_clear_button from '../plugins/tomselect/2.2.2/plugins/clear_button/plugin.js';
import TomSelect_checkbox_options from '../plugins/tomselect/2.2.2/plugins/checkbox_options/plugin.js';
import TomSelect_caret_position from '../plugins/tomselect/2.2.2/plugins/caret_position/plugin.js';
import TomSelect_input_autogrow from '../plugins/tomselect/2.2.2/plugins/input_autogrow/plugin.js';
import TomSelect_no_active_items from '../plugins/tomselect/2.2.2/plugins/no_active_items/plugin.js';
import TomSelect_no_backspace_delete from '../plugins/tomselect/2.2.2/plugins/no_backspace_delete/plugin.js';

class Select extends Component {
    constructor(element, config) {

        const _defaults = {
            remote: null,
            loadOnce: false,
            loadFresh: false,
            preload: false,
            valueField: "value",
            labelField: "text",
            searchField: ["text"],
            maxOptions: 50,
            maxItems: null,
            lock: false,
            placeholder: null,
            selectedOptions: null,
            persist: true,
            create: false,
            allowEmptyOption: false,
            clearOnReset: true,
            offset: 8,
            zindex: 1000,
            arrowLabel: null,
            hidePlaceholder: false,
            loader: null,
            removeButton: false,
            removeButtonTitle: '',
            removeButtonLabel: '&times;',
            clearButton: false,
            clearButtonTitle: '',
            clearButtonLabel: '&times;',
            checkbox: false,
            caretPosition: false,
            backspaceDelete: true,
            itemSelection: true,
            disableSearch: false,
            blurOnSelect: false,
            createFilter: null,
            createNotFound: false,
            classes: {
                wrapper: '',
                input: '',
                dropdownWrapper: '',
                dropdown: '',
                item: '',
                itemSingle: '',
                option: '',
                optgroup: '',
                optgroupLabel: '',
                createOption: '',
                highlight: '',
                arrow: '',
                removeButton: '',
                clearButton: '',
                checkbox: '',
                noResults: '',
                loading: '',
                loader: ''
            },
            createText: 'Add <strong>:value...</strong>',
            searchText: 'No results found for ":value"'
        };

        const _component = {
            name: 'select',
            element: element, 
            defaultConfig: _defaults, 
            config: config, 
            transitions: {
                enter: true,
                leave: true
            }
        };

        super(_component);

        // Load plugins
        TomSelect.define('remove_button', TomSelect_remove_button);
        TomSelect.define('clear_button', TomSelect_clear_button);
        TomSelect.define('checkbox_options', TomSelect_checkbox_options);
        TomSelect.define('caret_position', TomSelect_caret_position);
        TomSelect.define('input_autogrow', TomSelect_input_autogrow);
        TomSelect.define('no_active_items', TomSelect_no_active_items);
        TomSelect.define('no_backspace_delete', TomSelect_no_backspace_delete);

        if (!this._element) return;

        const mode = ['select-one'].includes(this._element.type) ? 'single' : 'multi';
        let autoUpdatePosition = () => void 0;
        let plugins = {};
        this._selectedRemote = [];

        if (this._config.selectedOptions != null) {            
            this._config.selectedOptions = this._config.selectedOptions instanceof Array 
                ? this._config.selectedOptions 
                : String(this._config.selectedOptions).split(' ');
        }

        this._config.searchField = this._config.searchField instanceof Array 
            ? this._config.searchField 
            : this._config.searchField.split(' ');

        const setPosition = () => {
            computePosition(this._tomSelect.control, this._tomSelect.dropdown_content, {
                placement: 'bottom-start',
                middleware: [ 
                    offset(this._config.offset),
                    flip()
                ]
            }).then(({ x, y, placement, middlewareData }) => {
                const { offset, flip } = middlewareData;

                Object.assign(this._tomSelect.dropdown_content.style, {
                    left: `${x}px`,
                    top: `${y}px`,
                    zIndex: this._config.zindex
                });
            });
        };

        const updatePosition = () => { 
            return autoUpdate(this._tomSelect.control, this._tomSelect.dropdown_content, setPosition);
        };

        const resetPositionStyles = () => {
            styles(this._tomSelect.dropdown_content, {
                top: null,
                left: null,
                zIndex: null
            });
        };

        const clearButtonVisibility = () => {
            if (this._config.clearButton) {
                const clearButton = this._tomSelect.control.querySelector('[data-ts-clear]');
                
                if (this._tomSelect.items.length > 0) {
                    showElement(clearButton);
                } else {
                    hideElement(clearButton);
                }
            }
        };

        const showLoader = (show = true) => {
            if (!this._config.remote) return;

            const loader = this._tomSelect.control.querySelector('[data-ts-loader]');

            if (loader) {
                if (show) {
                    showElement(loader);
                } else {
                    hideElement(loader);
                }
            }
        };

        const getText = (key, value) => {
            return this._config[key].replace(':value', value);
        };

        const hasValue = (value) => {
            let result = false;

            for (const key in this._tomSelect.options) {
                if (value.toLowerCase() == key.toLowerCase()) {
                    result = true;

                    break;
                }
            }

            return result;
        };

        // Enable caret position and auto grow plugin
        if (this._config.caretPosition) {
            plugins.caret_position = {};
            plugins.input_autogrow = {};
        }

        // Enable plugin to disable selection of items
        if (!this._config.itemSelection) {
            plugins.no_active_items = {};
        }

        // Enable plugin to disable deleting items with backspace key
        if (!this._config.backspaceDelete) {
            plugins.no_backspace_delete = {};
        }

        // Show/hide remove button plugin
        if (this._config.removeButton && mode === 'multi') {
            plugins.remove_button = {
                label: this._config.removeButtonLabel,
                title: this._config.removeButtonTitle,
                className: this._config.classes.removeButton
            };
        }

        // Show/hide clear button plugin
        if (this._config.clearButton) {
            plugins.clear_button = {
                html: () => {
                    const disabled = this._element.disabled ? 'disabled' : '';
                    
                    return `<button type="button" class="${this._config.classes.clearButton}" title="${this._config.clearButtonTitle}" aria-label="clear" data-multiple="${mode === 'multi'}" ${disabled} data-ts-clear style="display: none">${this._config.clearButtonLabel}</button>`;
                }
            };
        }

        // Show/hide option checkbox plugin
        if (this._config.checkbox && mode === 'multi') {
            plugins.checkbox_options = {
                className: this._config.classes.checkbox
            };
        }

        // Get selected options when using remote data 
        if (this._config.remote && this._config.loadOnce && this._element.tagName === 'SELECT') {
            [...this._element.selectedOptions].forEach((option) => {
                this._selectedRemote.push(option.value);

                // Remove option 
                option.remove();
            });
        }

        // Create if option is not found 
        if (this._config.createNotFound) {
            this._config.create = (input, callback) => {
                if (hasValue(input)) return false;
                
                callback({value:input, text:input});
            };
        }

        let options = {
            valueField: this._config.valueField,
            labelField: this._config.labelField,
            searchField: this._config.searchField,
            maxOptions: this._config.maxOptions,
            maxItems: mode === 'single' ? 1 : this._config.maxItems,
            preload: this._config.preload,
            create: this._config.create,
            persist: this._config.persist,
            allowEmptyOption: this._config.allowEmptyOption,
            createFilter: this._config.createFilter,
            controlClass: this._config.classes.wrapper,
            controlInput: `<input type="text" autocomplete="off" size="1" class="${this._config.classes.input}" ${this._config.disableSearch ? 'readonly' : ''} />`,
            dropdownContentClass: this._config.classes.dropdown,
            dropdownClass: this._config.classes.dropdownWrapper,
            itemClass: mode === 'multi' ? this._config.classes.item : this._config.classes.itemSingle,
            optionClass: this._config.classes.option,
            hidePlaceholder: this._config.hidePlaceholder,
            highlightClass: this._config.classes.highlight,
            plugins: plugins
        };

        if (this._config.placeholder) {
            options.placeholder = this._config.placeholder;
        }

        options.onFocus = () => {  
            if (this._config.caretPosition && this._tomSelect.settings.mode === 'multi') {
                this._tomSelect.control_input.style.minWidth = '1px';
                this._tomSelect.control_input.setAttribute('data-minimize', true);
                this._tomSelect.settings.placeholder = '';
                this._tomSelect.inputState();
            }

            this._dispatchEvent('focus');
        };

        options.onBlur = () => {  
            if (this._config.caretPosition && this._tomSelect.settings.mode === 'multi') {
                this._tomSelect.control_input.style.minWidth = null;
                this._tomSelect.control_input.setAttribute('data-minimize', false);
                this._tomSelect.settings.placeholder = this._config.placeholder;
                this._tomSelect.inputState();
            }

            // Restore hidden selected item
            if (this._tomSelect.items.length === 1 && this._tomSelect.settings.mode === 'single') {
                showElement(this._tomSelect.control.firstElementChild);
            }

            this._dispatchEvent('blur');
        };

        options.onType = (string) => {
            // Hide selected item when typing and is single select
            if (this._tomSelect.items.length === 1 && this._tomSelect.settings.mode === 'single') {
                if (string.length > 0) {
                    hideElement(this._tomSelect.control.firstElementChild);
                } else {
                    showElement(this._tomSelect.control.firstElementChild);
                }
            }

            this._dispatchEvent('type', { string });
        };

        options.onChange = (value) => {  
            // Show/hide clear button based on number of items
            clearButtonVisibility();

            if (this._config.blurOnSelect && this._tomSelect.settings.mode === 'single') {
                this._tomSelect.blur();
            }

            this._dispatchEvent('change', { value });
        };

        options.onDropdownOpen = (dropdown) => {
            autoUpdatePosition = updatePosition();

            if (this._arrow) this._arrow.setAttribute('data-opened', true);

            this._dispatchEvent('dropdownOpen', { dropdown });
        };

        options.onDropdownClose = (dropdown) => {
            autoUpdatePosition();
            resetPositionStyles();

            if (this._arrow) this._arrow.setAttribute('data-opened', false);

            if (this._config.remote && this._config.loadFresh && !this._config.loadOnce) {                            
                this._tomSelect.clearOptions();
            }

            this._dispatchEvent('dropdownClose', { dropdown });
        };

        options.onItemAdd = (value, item) => {
            this._dispatchEvent('itemAdd', { value, item, data: this._tomSelect.options[value] });
        };

        options.onItemRemove = (value, item) => {
            if (this._config.remote && this._config.loadFresh && !this._config.loadOnce) {                            
                this._tomSelect.removeOption(value);
                this._tomSelect.refreshOptions();
            }

            this._dispatchEvent('itemRemove', { value, item, data: this._tomSelect.options[value] });
        };

        options.onLoad = (options, optgroup) => {
            showLoader(false);

            this._dispatchEvent('load', { options, optgroup });
        };

        options.render = {
            option: (data, escape) => {
                return `<div>${escape(data[this._config.labelField])}</div>`;
            },
            item: (data, escape) => {
                return `<div>${escape(data[this._config.labelField])}</div>`;
            },
            option_create: (data, escape) => {
                if (this._config.createNotFound && hasValue(escape(data.input))) return;

                return `<div class="create ${this._config.classes.createOption}">${getText('createText', escape(data.input))}</div>`;
            },
            no_results: (data, escape) => {
                return `<div class="${this._config.classes.noResults}">${getText('searchText', escape(data.input))}</div>`;
            },
            not_loading: (data, escape) => {
                // no default content
            },
            optgroup: (data) => {
                const optgroup = document.createElement('div');
                optgroup.className = this._config.classes.optgroup;
                optgroup.appendChild(data.options);

                return optgroup;
            },
            optgroup_header: (data, escape) => {
                return `<div class="${this._config.classes.optgroupLabel}">${escape(data.label)}</div>`;
            },
            loading: (data, escape) => {
                return `<div class="${this._config.classes.loading}">Loading...</div>`;
            },
            dropdown: () => {
                return `<div></div>`;
            }
        };

        // If remote url is set 
        if (this._config.remote) {
            options.load = async (query, callback) => {
                const columns = this._config.searchField.join(',');
                const url = `${this._config.remote}?q=${encodeURIComponent(query)}&columns=${columns}`;
                showLoader();

                await fetch(url)
                    .then(response => response.json())
                    .then(json => {
                        callback(json);

                        // Set selected items after load
                        if (this._config.remote && this._config.loadOnce && this._element.tagName === 'SELECT') {
                            if (this._config.selectedOptions != null) {            
                                this._selectedRemote = this._config.selectedOptions;
                            }

                            if (this._tomSelect.settings.mode === 'single') {
                                this._tomSelect.addItem(this._selectedRemote[0]);
                                this._tomSelect.updateOption(this._selectedRemote[0]);
                            } else {
                                this._tomSelect.addItems(this._selectedRemote);
                            }
                        }

                        // showLoader(false);
                    }).catch(()=>{
                        callback();
                    });
            };

            options.shouldLoad = (query) => {
                if (this._config.loadOnce) return;
            
                if (this._config.loadOnce) {
                    return true;
                }

                return query.length > 1;
            };
        }

        // Init TomSelect
        this._tomSelect = new TomSelect(this._element, options);

        // Sync placeholder
        this._config.placeholder = this._config.placeholder || this._tomSelect.settings.placeholder;

        // Set a data minimize attribute for caret position plugin
        this._tomSelect.control_input.setAttribute('data-minimize', false);

        // Show arrow if single select 
        if (this._config.arrowLabel && this._tomSelect.settings.mode === 'single') {
            const arrow = stringToDom(`<div data-ts-arrow data-opened="false"></div>`);
            arrow.className = this._config.classes.arrow;
            arrow.innerHTML = this._config.arrowLabel;

            this._tomSelect.control.appendChild(arrow);
            this._arrow = arrow;
        }

        // Add loader to control element
        if (this._config.remote && this._config.loader) {
            const multiple = this._tomSelect.settings.mode === 'multi';
            const fragment = `<div class="${this._config.classes.loader}" data-multiple="${multiple}" data-ts-loader style="display:none">${this._config.loader}</div>`;
            this._tomSelect.control_input.insertAdjacentHTML('afterend', fragment);
        }

        // Show/hide clear button based on number of items
        clearButtonVisibility();

        // Call the lock() method if lock option is true
        if (this._config.lock) this._tomSelect.lock();

        // Clear on form reset
        if (this._config.clearOnReset) {              
            if (this._tomSelect.input.form) {
                this._on(this._tomSelect.input.form, 'reset', () => {
                    this._tomSelect.clear();
                });
            }
        }

        this._dispatchEvent('initialize');
    }

    addItem(value, silent = false) {
        this._tomSelect.addItem(value, silent);
    }

    clear(silent = false) {
        this._tomSelect.clear(silent);
    }

    destroy() {
        super.destroy();
    }
}

export default Select;