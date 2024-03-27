import { getElements, addClass, removeClass } from '../utils.js';
import Component from '../component.js';

class Input extends Component {
    constructor(element, config) {
        const _defaults = {
            classes: {
                display: 'hidden'
            }
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

        /**
         * Get actions from dataset and store them 
         * 
         * @param {DOMStringMap} dataset 
         */
        const setActions = (dataset) => {
            for (const key in dataset) {
                const renamedKey = key.replace(this._component.name, '');

                if (typeof actions[renamedKey] === 'function') {
                    actions[renamedKey](dataset[key]);
                }
            }
        };

        const actionHandler = (selector, callback) => {
            getElements(selector).forEach((element) => {
                callback(element);
            });
        };

        actions['Enable'] = (selector) => {
            actionHandler(selector, (element) => {
                element.disabled = false;
            });
        };

        actions['Disable'] = (selector) => {
            actionHandler(selector, (element) => {
                element.disabled = true;
            });
        };

        actions['Show'] = (selector) => {
            actionHandler(selector, (element) => {
                removeClass(element, this._config.classes.display);
            });
        };

        actions['Hide'] = (selector) => {
            actionHandler(selector, (element) => {
                addClass(element, this._config.classes.display);
            });
        };

        types['select-one'] = (e) => {
            setActions(e.target.selectedOptions[0].dataset);
        };

        types['radio'] = types['checkbox'] = (e) => {
            setActions(e.target.dataset);
        };

        this._on(this._element, guessType().event, types[guessType().type]);

        this._dispatchEvent('initialize');
    }

    destroy() {
        super.destroy();
    }
}

export default Input;