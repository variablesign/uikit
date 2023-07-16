import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';

const _component = 'scroll';
const _defaults = {
    trigger: 'auto',
    target: null,
    container: null
};

class Scroll extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this.init();
    }

    init() {
        const handler = {};
        const container = this._config.container ? document.querySelector(this._config.container) : this._element;
        const target = container.querySelector(this._config.target);

        handler['auto'] = () => {
            if (target) {
                const middle = container.offsetHeight / 2;
                container.scrollTop = target.offsetTop - middle;
            }
        };

        handler[this._config.trigger]();
    }

    destroy() {
        super.destroy();
    }
}

uk.registerComponent(_component, Scroll);

export default Scroll;