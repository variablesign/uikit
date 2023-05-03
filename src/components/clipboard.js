import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';

const _component = 'clipboard';
const _defaults = {
    action: 'copy',
    parent: null,
    target: null,
    text: null,
    attribute: null,
    container: null,
    clearSelection: false
};

class Clipboard extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this.init();
    }

    init () {
        if (!this._element || typeof ClipboardJS !== 'function') return;

        this._target = null;
        this._container = this._config.container 
            ? document.querySelector(this._config.container) 
            : document.body;

        this._target = (trigger) => {
            if (this._config.target == 'next') {
                return this._element.nextElementSibling.firstElementChild;
            }

            if (this._config.target == 'previous') {
                return this._element.previousElementSibling.firstElementChild;
            }

            if (this._config.parent && this._config.target) {
                let parent = trigger.closest(this._config.parent);

                this._target = parent.querySelector(this._config.target);
            }

            if (!this._config.parent && this._config.target) {
                this._target = document.querySelector(this._config.target);
            }

            return this._target ? this._target : trigger;
        };

        this._text = (trigger) => {
            if (this._config.attribute) {
                return trigger.getAttribute(this._config.attribute);
            }
            
            if (this._config.text) {
                return this._config.text;
            }

            if (this._target && this._target.offsetParent == null) {
                return this._target.textContent;
            }
        };

        this._clipboard = new ClipboardJS(this._element, {
            action: this._config.action,
            container: this._container,
            target: this._target,
            text: this._text
        });

        this._clipboard.on('success', (e) => {
            this._triggerEvent('success', e);

            if (this._config.clearSelection) {
                e.clearSelection();
            }
        });
          
        this._clipboard.on('error', (e) => {
            this._triggerEvent('error');
        });
    }

    destroy() {
        this._clipboard.destroy();
        super.destroy();
    }
}

uk.registerComponent(_component, Clipboard);