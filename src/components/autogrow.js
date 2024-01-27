import Component from '../component.js';

class Autogrow extends Component {
    constructor(element, config) {
        const _defaults = {
            type: null
        };

        const _component = {
            name: 'autogrow',
            element: element, 
            defaultConfig: _defaults, 
            config: config, 
            transitions: {
                enter: false,
                leave: false
            }
        };

        super(_component);

        if (!this._element || !this._config.type) return;

        const textareaInput = () => {
            this._element.style.minHeight = 'auto';
		    this._element.style.minHeight = this._element.scrollHeight + 'px';
        };

        if (this._config.type == 'textarea') {
            this._on(this._element, 'input', textareaInput);

            this._setTimeout(textareaInput);
        }

        this._dispatchEvent('initialize');
    }

    destroy() {
        super.destroy();
    }
}

export default Autogrow;