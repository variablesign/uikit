import { addClass, removeClass } from '../utils.js';
import Component from '../component.js';

class DropzoneUploader extends Component {
    constructor(element, config) {
        const _defaults = {

        };

        const _component = {
            name: 'dropzone',
            element: element, 
            defaultConfig: _defaults, 
            config: config, 
            transitions: {
                enter: false,
                leave: false
            }
        };

        super(_component);

        this._config.url = this._config.url != null ? this._config.url : this._element.form.action;

        this._dropzone = new Dropzone(this._element, this._config);

        console.log(this);
    }

    destroy() {
        super.destroy();
    }
}

export default DropzoneUploader;