import { stringToDom, showElement, hideElement, camelCase, addClass, removeClass } from '../utils.js';
import Component from '../component.js';

class DataTable extends Component {
    constructor(element, config) {
        const _defaults = {
            id: null,
            url: null,
            pushState: true,
            table: null,
            search: null,
            searchInput: null,
            searchDelay: 500,
            checkbox: null,
            pagination: null,
            info: null,
            length: null,
            region: null,
            loader: null,
            loaderLabel: null,
            pageLength: null,
            index: null,
            order: null,
            direction: null,
            request: {
                page: 'page',
                search: 'search',
                orderColumn: 'order_column',
                orderDirection: 'order_direction',
                perPage: 'per_page'
            },
            classes: {
                display: 'hidden'
            }
        };

        const _component = {
            name: 'datatable',
            element: element, 
            defaultConfig: _defaults, 
            config: config, 
            transitions: {
                enter: false,
                leave: false
            }
        };

        super(_component);

        // Id attribute on element if not set 
        if (!this._element.hasAttribute('id') && this._config.id) {
            this._element.id = this._config.id
        }

        const tableSection = this._element.querySelector(`[${this._config.table}]`);
        const searchSection = this._element.querySelector(`[${this._config.search}]`);
        const lengthSection = this._element.querySelector(`[${this._config.length}]`);
        const infoSection = this._element.querySelector(`[${this._config.info}]`);
        const paginationSection = this._element.querySelector(`[${this._config.pagination}]`);
        const loaderSection = this._element.querySelector(`[${this._config.loader}]`);
        const regionSections = this._element.querySelectorAll(`[${this._config.region}]`);

        // Append loader if available
        if (loaderSection && this._config.loaderLabel) {
            loaderSection.appendChild(stringToDom(this._config.loaderLabel));
        }

        /**
         * Retrieves or modifies URL parameters
         * 
         * @param {string} url 
         * @param {object} param 
         * @returns {URL}
         */
        const parseUrl = (url, param) => {
            const instance = new URL(url);

            if (param instanceof Object) {
                for (const key in param) {
                    if (param[key] === null) {
                        instance.searchParams.delete(key);
                    } else {
                        instance.searchParams.set(key, param[key]);
                    }
                }
            }

            return instance;
        };

        /**
         * Merge search params with current URL in browser
         */
        const mergeUrl = () => {
            const allowedParams = Object.values(this._config.request);
            const params = {};
            const browserParams = Object.fromEntries(  
                new URLSearchParams(window.location.search)
            );

            for (const name of allowedParams) {
                if (browserParams[name]) {
                    params[name] = browserParams[name];
                }
            }

            this._config.url = parseUrl(this._config.url, params).href;
        };

        /**
         * Update current browser URL
         */
        const pushHistoryState = () => {
            if (!this._config.pushState) return;

            history.pushState(null, '', parseUrl(this._config.url).search);
        };

        /**
         * Retrieves a dataset value from an element
         * 
         * @param {HTMLElement} element 
         * @param {string} key 
         * @returns {?string}
         */
        const getDataset = (element, key) => {
            key = camelCase(key.replace('data-', '')).replaceAll('-', '');

            return element.dataset[key] || null;
        };

        /**
         * Show or hide loader
         * 
         * @param {boolean} hide 
         */
        const loading = (hide = false) => {
            if (hide) {
                hideElement(loaderSection);

                return
            }
            
            showElement(loaderSection);
        };

        /**
         * Get all child checkboxes
         * 
         * @returns {NodeList}
         */
        const getCheckboxes = () => {    
            return this._element.querySelectorAll(`[${this._config.checkbox}=child]:not(:disabled)`);
        };

        /**
         * Get all checked checkboxes
         * 
         * @returns {NodeList}
         */
        const getChecked = () => {    
            return this._element.querySelectorAll(`[${this._config.checkbox}=child]:checked:not(:disabled)`);
        };

        /**
         * Get all unchecked checkboxes
         * 
         * @returns {NodeList}
         */
        const getUnchecked = () => {    
            return this._element.querySelectorAll(`[${this._config.checkbox}=child]:not(:checked):not(:disabled)`);
        };

        /**
         * Get the parent checkbox
         * 
         * @returns {?HTMLElement}
         */
        const getParentCheckbox = () => {    
            return this._element.querySelector(`[${this._config.checkbox}=parent]`);
        };

        /**
         * Get the form data for all checked checkbox
         * 
         * @returns {FormData}
         */
        const getCheckedFormData = () => {    
            const formData = new FormData();

            getChecked().forEach((checkbox) => {
                formData.append(checkbox.name, checkbox.value);
            });

            return formData;
        };

        /**
         * Check all unchecked checkboxes
         */
        this._select = () => {    
            getUnchecked().forEach((checkbox) => {
                checkbox.checked = true;
            });

            if (getParentCheckbox()) {
                getParentCheckbox().checked = true;
                getParentCheckbox().indeterminate = false;
            }
        };

        /**
         * Uncheck all checked checkboxes
         */
        this._deselect = () => {    
            getChecked().forEach((checkbox) => {
                checkbox.checked = false;
            });

            if (getParentCheckbox()) {
                getParentCheckbox().checked = false;
                getParentCheckbox().indeterminate = false;
            }
        };

        /**
         * Changes to a set pageText
         * 
         * @param {number} index 
         */
        this._goToIndex = (index) => {    
            this._config.url = parseUrl(this._config.url, {
                [this._config.request.page]: index || ''
            }).href;

            this._draw();
        };

        /**
         * Changes the current page to display
         * 
         * @param {number} page 
         */
        this._index = (page) => {    
            this._config.url = parseUrl(this._config.url, {
                [this._config.request.page]: page
            }).href;

            this._draw();
        };

        /**
         * Changes the number of records to display
         * 
         * @param {number} length 
         */
        this._pageLength = (length) => {    
            this._config.url = parseUrl(this._config.url, {
                [this._config.request.page]: null,
                [this._config.request.perPage]: length || ''
            }).href;

            this._draw();
        };

        /**
         * Changes the order of records
         * 
         * @param {string} column 
         * @param {string} direction 
         */
        this._orderColumn = (column, direction) => {    
            this._config.url = parseUrl(this._config.url, {
                [this._config.request.orderColumn]: column || '',
                [this._config.request.orderDirection]: direction || '',
            }).href;

            this._draw();
        };

        /**
         * Searches for records
         * 
         * @param {string} keyword 
         */
        this._search = (keyword) => {    
            this._config.url = parseUrl(this._config.url, {
                [this._config.request.page]: null,
                [this._config.request.search]: keyword || '',
            }).href;

            this._draw();
        };

        const populateSearch = (data) => {
            if (!searchSection) return;
            
            if (!searchSection.hasAttribute('data-populated') && data.has_records) {
                searchSection.innerHTML = data.html.search;
                searchSection.setAttribute('data-populated', true);
                const searchInput = this._element.querySelector(`[${this._config.searchInput}]`);
    
                this._on(searchInput, 'input', (e) => {
                    this._setTimeout(() => {
                        this._search(searchInput.value);
                    }, this._config.searchDelay);
                });
            }
        };

        const populateTable = (data) => {
            if (!tableSection) return;

            tableSection.innerHTML = data.html.table;
            const triggers = tableSection.querySelectorAll(`[${this._config.order}]`);

            triggers.forEach((element) => {
                this._on(element, 'click', (e) => {
                    e.preventDefault();
                    const column = getDataset(element, this._config.order);
                    const direction = getDataset(element, this._config.direction);
                    this._orderColumn(column, direction);
                });
            });
        };

        const populateInfo = (data) => {
            if (!infoSection) return;

            infoSection.innerHTML = data.has_records ? data.html.info : '';
        };

        const populatePagination = (data) => {
            if (!paginationSection) return;

            paginationSection.innerHTML = data.has_records ? data.html.pagination : '';
            const triggers = paginationSection.querySelectorAll(`[${this._config.index}]`);

            triggers.forEach((element) => {
                this._on(element, 'click', (e) => {
                    e.preventDefault();
                    const index = getDataset(element, this._config.index);
                    this._goToIndex(index);
                });
            });
        };

        const populateLength = (data) => {
            if (!lengthSection) return;

            lengthSection.innerHTML = data.has_records ? data.html.length : '';
            const triggers = lengthSection.querySelectorAll(`[${this._config.pageLength}]`);

            triggers.forEach((element) => {
                this._on(element, 'click', (e) => {
                    e.preventDefault();
                    const length = getDataset(element, this._config.pageLength);
                    this._pageLength(length);
                });
            });
        };

        const regionVisibility = (data) => {
            const regionSections = this._element.querySelectorAll(`[${this._config.region}]`);

            regionSections.forEach((element) => {
                if (data.has_records) {
                    removeClass(element, this._config.classes.display);
                } else {
                    addClass(element, this._config.classes.display);
                }
            });
        };

        const rowSelection = () => {
            const parent = getParentCheckbox();
            const children = getCheckboxes();
            const total = children.length;
            const onSelectEventData = () => {
                return {
                    formData: getCheckedFormData(),
                    selected: getChecked(),
                    deselected: getUnchecked()
                }
            };

            children.forEach((checkbox) => {
                this._on(checkbox, 'change', (e) => {
                    const totalChecked = getChecked().length;
                    const totalUnchecked = getUnchecked().length;
                    parent.indeterminate = totalUnchecked > 0 && totalUnchecked !== total;
                    
                    if (checkbox.checked) {
                        parent.checked = totalUnchecked === 0;
                    } else {
                        parent.checked = totalChecked === total;
                    }

                    this._dispatchEvent('select', onSelectEventData());
                });
            });

            if (getUnchecked().length > 0 && getUnchecked().length !== total) {
                parent.indeterminate = true;
            }

            if (parent) {                
                this._on(parent, 'change', (e) => {
                    if (parent.checked) {
                        this._select();
                    } else {
                        this._deselect();
                    }
    
                    this._dispatchEvent('select', onSelectEventData());
                });
            }
        };

        this._draw = async (url) => {
            if (window.controller) window.controller.abort();
            
            url = url || this._config.url;
            this._events = {};
            window.controller = new AbortController();
            window.signal = window.controller.signal;
            loading();
            this._dispatchEvent('processing', { processing: true });

            await fetch(url, { signal: signal }) 
                .then(response => {
                    if (!response.ok) {
                        throw new Error(response.statusText);
                    }

                    return response.json();
                })
                .then(data => {
                    populateSearch(data);
                    populateTable(data);
                    populateInfo(data)
                    populatePagination(data);
                    populateLength(data);
                    regionVisibility(data)
                    rowSelection();
                    loading(true);
                    this._dispatchEvent('processing', { processing: false });
                    pushHistoryState();
                })
                .finally(() => {
                    //
                })
                .catch((error) => console.error(error));
        };

        this._reload = () => {
            this._draw();
        };

        // Initialize
        mergeUrl();
        this._draw();
        this._dispatchEvent('initialize');
    }

    reload() {
        this._reload();
    }

    perPage(length) {
        this._pageLength(length);
    }

    index(page) {
        page = parseInt(page) || 1;
        this._index(page);
    }

    select() {
        this._select();
    }

    deselect() {
        this._deselect();
    }

    order(column, direction) {
        this._orderColumn(column, direction);
    }

    search(keyword) {
        this._search(keyword);
    }

    destroy() {
        super.destroy();
    }
}

export default DataTable;