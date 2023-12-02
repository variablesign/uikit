import { deepClone, stringToDom, showElement, hideElement, camelCase, addClass, removeClass } from '../utils.js';
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

        let controller;
        this._isLoading = false;
        this._sections = {
            table: this._element.querySelector(`[${this._config.table}]`), 
            search: this._element.querySelector(`[${this._config.search}]`), 
            length: this._element.querySelector(`[${this._config.length}]`), 
            info: this._element.querySelector(`[${this._config.info}]`), 
            pagination: this._element.querySelector(`[${this._config.pagination}]`), 
            loader: this._element.querySelector(`[${this._config.loader}]`),
            region: this._element.querySelectorAll(`[${this._config.region}]`)
        };

        // Append loader if available
        if (this._sections.loader && this._config.loaderLabel) {
            this._sections.loader.appendChild(stringToDom(this._config.loaderLabel));
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
         * Get the value of a search parameter by key
         * 
         * @param {string} key 
         * @param {string} defaultValue 
         * @returns {?string}
         */
        const getRequest = (key, defaultValue) => {
            const url = parseUrl(this._config.url);

            return url.searchParams.get(key) ?? defaultValue ?? null;
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

            // for (const name of allowedParams) {
            //     if (browserParams[name]) {
            //         params[name] = browserParams[name];
            //     }
            // }

            this._config.url = parseUrl(this._config.url, Object.assign(params, browserParams)).href;
        };

        /**
         * Override search params with current browser URL params
         */
        const overrideUrl = (url) => {
            const sourceUrl = new URL(this._config.url);
            const allowedParams = Object.values(this._config.request);
            const params = {};
            const browserParams = Object.fromEntries(  
                new URLSearchParams(window.location.search)
            );

            // for (const name of allowedParams) {
            //     if (browserParams[name]) {
            //         params[name] = browserParams[name];
            //     }
            // }

            this._config.url = parseUrl(sourceUrl.origin + sourceUrl.pathname, Object.assign(params, browserParams)).href;
        };

        /**
         * Update current browser URL
         */
        const pushHistoryState = (previousUrl) => {
            const params = parseUrl(this._config.url);

            if (!this._config.pushState || params.search == '') return;

            history.pushState({ prevUrl: previousUrl }, '',  params.search);
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
                hideElement(this._sections.loader);

                return
            }
            
            showElement(this._sections.loader);
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
            this._abort();

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
            this._abort();

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
            this._abort();

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
            this._abort();

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
            this._abort();

            this._config.url = parseUrl(this._config.url, {
                [this._config.request.page]: null,
                [this._config.request.search]: keyword || '',
            }).href;

            this._draw();
        };

        const populateSearch = (data) => {
            if (!this._sections.search) return;
            
            if (!this._sections.search.hasAttribute('data-populated') && data.has_records) {
                this._sections.search.innerHTML = data.html.search;
                this._sections.search.setAttribute('data-populated', true);
                const searchInput = this._element.querySelector(`[${this._config.searchInput}]`);
    
                this._on(searchInput, 'input', (e) => {
                    this._setTimeout(() => {
                        this._search(searchInput.value);
                    }, this._config.searchDelay);
                });

                return;
            }

            const searchInput = this._element.querySelector(`[${this._config.searchInput}]`);

            if (!searchInput) return;

            if (!getRequest(this._config.request.search) && searchInput.value != '') {
                searchInput.value = '';
            }
        };

        const populateTable = (data) => {
            if (!this._sections.table) return;

            this._sections.table.innerHTML = data.html.table;
            const triggers = this._sections.table.querySelectorAll(`[${this._config.order}]`);

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
            if (!this._sections.info) return;

            this._sections.info.innerHTML = data.has_records ? data.html.info : '';
        };

        const populatePagination = (data) => {
            if (!this._sections.pagination) return;

            this._sections.pagination.innerHTML = data.has_records ? data.html.pagination : '';
            const triggers = this._sections.pagination.querySelectorAll(`[${this._config.index}]`);

            triggers.forEach((element) => {
                this._on(element, 'click', (e) => {
                    e.preventDefault();
                    const index = getDataset(element, this._config.index);
                    this._goToIndex(index);
                });
            });
        };

        const populateLength = (data) => {
            if (!this._sections.length) return;

            this._sections.length.innerHTML = data.has_records ? data.html.length : '';
            const triggers = this._sections.length.querySelectorAll(`[${this._config.pageLength}]`);

            triggers.forEach((element) => {
                this._on(element, 'click', (e) => {
                    e.preventDefault();
                    const length = getDataset(element, this._config.pageLength);
                    this._pageLength(length);
                });
            });
        };

        const regionVisibility = (data) => {
            this._sections.region = this._element.querySelectorAll(`[${this._config.region}]`);

            this._sections.region.forEach((element) => {
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

        this._abort = () => {
            if (this._isLoading) {
                controller.abort();
            }
        };

        this._draw = async (url) => {
            controller = new AbortController();
            const signal = controller.signal;
            const prevUrl = window.location.href;

            url = url || this._config.url;
            this._events = {};
            loading();
            this._isLoading = true;
            this._dispatchEvent('processing');

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
                    this._isLoading = false;
                    this._dispatchEvent('processing');
                    pushHistoryState(prevUrl);
                })
                .finally(() => {
                    this._dispatchEvent('draw');
                })
                .catch((message) => {
                    this._debug(message);
                });
        };

        this._reload = () => {
            this._draw();
        };

        // Initialize
        mergeUrl();
        this._draw();
        this._location = deepClone(window.location);
        this._dispatchEvent('initialize');

        // Listen fetch abort event
        controller.signal.addEventListener('abort', () => {
            loading(true);
            this._isLoading = false;
            this._dispatchEvent('processing');
        });

        this._onPopstate = async (e) => {
            if (this._location.pathname == e.target.location.pathname) {
                if (!this._isLoading) {
                    const originalPushState = this._config.pushState;
                    overrideUrl(e.target.location.href);
                    this._config.pushState = false;
                    await this._draw();
                    this._config.pushState = originalPushState;
                }
            }
        };

        // this._off(window, 'popstate', this._onPopstate);
        this._on(window, 'popstate', this._onPopstate);
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

    isLoading() {
        return this._isLoading;
    }

    destroy() {
        super.destroy();
    }
}

export default DataTable;