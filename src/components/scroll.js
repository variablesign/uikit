import Component from '../component.js';

class Scroll extends Component {
    constructor(element, config) {

        const _defaults = {
            trigger: 'auto',
            target: null,
            container: null
        };

        const _component = {
            name: 'scroll',
            element: element, 
            defaultConfig: _defaults, 
            config: config
        };

        super(_component);

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

export default Scroll;