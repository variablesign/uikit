import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';

const _component = 'toggle';
const _defaults = {
    addClass: null,
    removeClass: null,
    target: null
};

class Toggle extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this.init();
    }

    init() {
        const customToggles = this._createConfig(['sidebar'], [
            'addClass', 
            'removeClass', 
            'target'
        ]);
        console.log(customToggles);
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