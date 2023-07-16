import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';

const _component = 'componentName';
const _defaults = {};

class ComponentClass extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this.init();
    }

    init() {
        //
    }

    destroy() {
        super.destroy();
    }
}

uk.registerComponent(_component, ComponentClass);

export default ComponentClass;