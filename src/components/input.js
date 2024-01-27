import { getElement } from '../utils.js';
import Component from '../component.js';

class Input extends Component {
    constructor(element, config) {
        const _defaults = {
            
        };

        const _component = {
            name: 'input',
            element: element, 
            defaultConfig: _defaults, 
            config: config, 
            transitions: {
                enter: false,
                leave: false
            }
        };

        super(_component);

        if (!this._element) return;

        const types = {};
        const actions = {};

        const guessType = () => {
            if (['radio', 'checkbox', 'select-one'].includes(this._element.type)) {
                return  {
                    event: 'change',
                    type: this._element.type
                };
            }

            if (['input'].includes(this._element.localName)) {
                return  {
                    event: 'input',
                    type: this._element.localName
                };
            }
        };

        actions['Enable'] = (selector) => {
            const target = getElement(selector);
            target.disabled = false;
        };

        actions['Disable'] = (selector) => {
            const target = getElement(selector);
            target.disabled = true;
        };

        types['select-one'] = (e) => {
            const data = e.target.selectedOptions[0].dataset;

            for (const key in data) {
                const newKey = key.replace(this._component.name, '');

                if (typeof actions[newKey] === 'function') {
                    actions[newKey](data[key]);
                }
            }
        };

        this._on(this._element, guessType().event, types[guessType().type]);

        this._dispatchEvent('initialize');
    }

    destroy() {
        super.destroy();
    }
}

export default Input;