import { addClass, removeClass } from '../utils.js';
import Component from '../component.js';

class ComponentClass extends Component {
    constructor(element, config) {
        const _defaults = {};

        const _component = {
            name: 'componentName',
            element: element, 
            defaultConfig: _defaults, 
            config: config, 
            transitions: {
                enter: true,
                leave: true
            }
        };

        super(_component);

        // Your code and private methods
    }

    destroy() {
        super.destroy();
    }
}

export default ComponentClass;