import { addClass, removeClass } from '../utils.js';
import Component from '../component.js';

class Checkbox extends Component {
    constructor(element, config) {
        const _defaults = {
            target: null,
            total: null,
            checked: null,
            related: 'data-related'
        };

        const _component = {
            name: 'checkbox',
            element: element, 
            defaultConfig: _defaults, 
            config: config, 
            transitions: {
                enter: false,
                leave: false
            }
        };

        super(_component);

        if (!this._element || !this._config.target) return;

        this._checkboxes = document.querySelectorAll(this._config.target);
        this._checkboxes = [...this._checkboxes].filter((checkbox) => {
            return checkbox.disabled === false;
        });
        this._total = this._checkboxes.length;
        this._totalChecked = 0;
        this._config.checked = document.querySelectorAll(this._config.checked);
        this._config.total = document.querySelectorAll(this._config.total);

        if (this._config.total.length > 0) {
            this._config.total.forEach((element) => {
                element.innerHTML = this._total;
            });
        }

        const updateTotalChecked = () => {
            const filtered = [...this._checkboxes].filter((checkbox) => {
                return checkbox.checked === true;
            });

            this._totalChecked = filtered.length;

            if (this._config.checked.length > 0) {
                this._config.checked.forEach((element) => {
                    element.innerHTML = this._totalChecked;
                });
            }
        };

        const updateParent = () => {
            if (this._totalChecked > 0 && this._totalChecked < this._total) {
                this._element.indeterminate = true;
            }
    
            if (this._total === this._totalChecked) {
                this._element.checked = true;
                this._element.indeterminate = false;
            }    
    
            if (this._totalChecked === 0) {
                this._element.checked = false;
                this._element.indeterminate = false;
            }    
        };

        this._checkboxes.forEach((checkbox) => {

            this._on(checkbox, 'change', (e) => {
                if (checkbox.hasAttribute(this._config.related)) {
                    const related = checkbox.getAttribute(this._config.related);
                    const targets = document.querySelectorAll(related);
    
                    if (targets.length > 0) {
                        const filtered = [...targets].filter((item) => {
                            return item.disabled === false;
                        });
    
                        filtered.forEach((relatedCheckbox) => {
                            if (checkbox.checked) {
                                relatedCheckbox.checked = true;
                            }
                        });
                    }
                }

                updateTotalChecked();
                updateParent();
            });
        });

        this._on(this._element, 'change', (e) => {
            const state = this._element.checked;
            const filtered = [...this._checkboxes].filter((checkbox) => {
                return checkbox.disabled === false;
            });

            filtered.forEach((checkbox) => {
                checkbox.checked = state;
            });
            
            updateTotalChecked();
        });

        updateTotalChecked();
        updateParent();
    }

    destroy() {
        super.destroy();
    }
}

export default Checkbox;