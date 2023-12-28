import { getElement } from '../utils.js';
import Component from '../component.js';

class Fetch extends Component {
    constructor(element, config) {
        const _defaults = {
            url: null,
            method: 'get',
            data: null,
            delay: 1000,
            csrfToken: null,
            value: 'value',
            target: null
        };

        const _component = {
            name: 'fetch',
            element: element, 
            defaultConfig: _defaults, 
            config: config, 
            transitions: {
                enter: false,
                leave: false
            }
        };

        super(_component);

        if (!this._element || !this._config.url) return;

        this._config.target = getElement(this._config.target); 
        this._isLoading = false;
        this._response = null;

        this._fetch = async () => {
            this._isLoading = true;
            this._dispatchEvent('send');
            const response = await fetch(this._config.url, {
                method: this._config.method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this._config.csrfToken
                },
                body: this._config.data ? JSON.stringify(this._config.data) : null
            }).catch((message) => {
                this._debug(message);
            }).finally(() => {
                this._isLoading = false;
                this._dispatchEvent('success', { response });
            });

            if (response.status != 200) {
                this._dispatchEvent('fail', { message: response.statusText, response });
            }

            this._response = response;
        
            return await response.json();
        };

        const onClick = (e) => {
            if (this._isLoading) return;

            this._fetch().then((data) => {
                if (this._config.target instanceof HTMLElement && data[this._config.value]) {
                    this._config.target.innerHTML = data[this._config.value];
                }

                this._dispatchEvent('done', { data, response: this._response });
            });
        };

        if (this._element.type == 'button') {
            this._on(this._element, 'click', onClick);
        }

        this._dispatchEvent('initialize');
    }

    destroy() {
        super.destroy();
    }
}

export default Fetch;