import { setAttributes } from '../utils.js';
import Component from '../component.js';

class Pincode extends Component {
    constructor(element, config) {
        const _defaults = {
            target: 'input',
            numeric: true,
            type: 'number',
            mask: true,
            maskDelay: 500,
            focus: true,
            autoSubmit: false
        };

        const _component = {
            name: 'pincode',
            element: element, 
            defaultConfig: _defaults, 
            config: config, 
            transitions: {
                enter: false,
                leave: false
            }
        };

        super(_component);

        if (!this._element) return;

        const targets = this._element.querySelectorAll(this._config.target);
        this._config.type = !this._config.numeric ? 'text' : this._config.type;
        this._config.maskDelay = parseInt(this._config.maskDelay);
        this._data = [];
        this._total = targets.length;
        this._filled = 0;
        this._value = '';
        this._index = 0;
        this._form = this._element.closest('form');

        targets.forEach((target, index) => {

            // Set attributes
            setAttributes(target, {
                autocomplete: 'off',
                ariaInvalid: false,
                dataIndex: index,
                required: target.required ? '' : ''
            });

            // Set input type if numeric
            if (this._config.numeric && target.type !== this._config.type) {
                target.type = this._config.type;
            }

            // Focus if input is first
            if (this._config.focus && index === 0) {
                target.focus();
            }

            // Enable editing only for first input on load
            if (index !== 0) {
                target.disabled = true;
            }

            this._data.push({
                filled: false,
                invalid: false,
                input: target,
                index: index,
                value: target.value
            });
        });

        const maskValue = (input) => {
            if (!this._config.mask || !input) return;

            setTimeout(() => {
                input.type = input.value.length > 0 ? 'password' : this._config.type;
            }, this._config.maskDelay);
        };

        const getValue = (input) => {
            return input.value.slice(-1); 
        };

        const combineValues = () => {
            let value = '';

            this._data.forEach((data) => {
                value += data.value;
            });

            this._filled = this._data.filter((data) => data.filled).length;

            this._value = value;
        };

        const setValue = (reverse = false) => {
            const index = this._index;
            const current = this._data[index].input;
            const previous = this._total > index && index !== 0 
                ? this._data[index - 1].input
                : null;
            const next = index < (this._total - 1) && current.value.length > 0 
                ? this._data[index + 1].input
                : null;

            current.value = reverse ? '' : getValue(current);
            this._data[index].filled = current.value.length > 0 ? true : false;
            this._data[index].value = current.value;

            if (reverse && previous) {
                previous.value = '';
                previous.focus();
                this._data[index - 1].filled = false;
                this._data[index - 1].value = previous.value;
                current.disabled = true;
            }
            
            if (!reverse && next) {
                next.disabled = false;
                next.focus();
            }

            maskValue(reverse ? previous : current);
            combineValues();
        };

        const emitInputEvent = () => {
            this._dispatchEvent('input', { 
                filled: this._total === this._filled,
                value: this._value 
            });
        };

        const emitFilledEvent = () => {
            if (this._total === this._filled) {
                this._dispatchEvent('filled', { value: this._value });

                if (this._config.autoSubmit && this._form) {
                    const submitter = this._form.querySelector('[type=submit]');
                    this._form.requestSubmit(submitter);
                }
            }
        };

        const onInput = (e) => {
            setValue();
            emitInputEvent();
            emitFilledEvent();
        };

        const onFocus = (e) => {
            this._index = parseInt(e.target.dataset.index);
        };

        const onBlur = (e) => {
            //
        };

        const onKeyup = (e) => {
            if (['Backspace', 'Delete'].includes(e.key)) {
                setValue(true);
            }
        };

        const onReset = (e) => {
            this._index = 0;
            this._filled = 0;
            this._value = '';

            this._data.forEach((data) => {
                data.filled = false;
                data.invalid = false;
                data.value = '';
            });
        };

        this._data.forEach((data) => {
            this._on(data.input, 'input', onInput);
            this._on(data.input, 'focus', onFocus);
            this._on(data.input, 'blur', onBlur);
            this._on(data.input, 'keyup', onKeyup);
        });

        if (this._form) {            
            this._on(this._form, 'reset', onReset);
        }

        this._dispatchEvent('initialize');
    }

    destroy() {
        super.destroy();
    }
}

export default Pincode;