import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';

const _component = 'scrollspy';
const _defaults = {};

class Scrollspy extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this.init();
    }

    init () {
        // your awesome code
    }

    destroy() {
        super.destroy();
    }
}

uk.registerComponent(_component, Scrollspy);