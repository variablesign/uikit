import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';

const _component = 'toggle';
const _defaults = {
    addClass: null,
    removeClass: null
};

class Toggle extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this.init();
    }

    init() {
        // your awesome code
    }

    destroy() {
        super.destroy();
    }
}

uk.registerComponent(_component, Toggle);

export {
    Toggle
};