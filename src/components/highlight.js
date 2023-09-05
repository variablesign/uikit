import Component from '../component.js';

class Highlight extends Component {
    constructor(element, config) {

        const _defaults = {};

        const _component = {
            name: 'highlight',
            element: element, 
            defaultConfig: _defaults, 
            config: config
        };

        super(_component);

        // Prevent highlighting twice
        if (this._element.classList.contains('hljs')) {
            return;
        }

        // Store original code before highlighting 
        this._code = this._element.innerHTML;

        hljs.highlightElement(this._element);
    }

    destroy() {
        this._element.innerHTML = this._code;
        super.destroy();
    }
}

export default Highlight;
