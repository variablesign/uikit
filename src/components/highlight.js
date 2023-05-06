import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';

const _component = 'highlight';
const _defaults = {};

class Highlight extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this.init();
    }

    init() {
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

uk.registerComponent(_component, Highlight);

export {
    Highlight
};
