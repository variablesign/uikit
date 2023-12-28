// import { camelCase } from '../utils.js';
import Component from '../component.js';

class Password extends Component {
    constructor(element, config) {
        const _defaults = {
            letters: true,
            mixed: false,
            numbers: true,
            symbols: true,
            length: 8,
            toggle: null,
            progress: null,
            clearOnReset: true,
            hint: 'data-password-hint'
        };

        const _component = {
            name: 'password',
            element: element, 
            defaultConfig: _defaults, 
            config: config, 
            transitions: {
                enter: true,
                leave: true
            }
        };

        super(_component);

        if (!this._element) return;

        this._totalScore = 1;
        this._score = 0;
        this._visible = false;
        this._checked = [];
        this._config.letters = this._config.mixed ? false : this._config.letters;
        this._config.mixed = this._config.letters ? false : this._config.mixed;

        this._config.toggle = typeof this._config.toggle === 'string' 
            ? document.querySelector(this._config.toggle) 
            : this._config.toggle;

        this._config.progress = typeof this._config.progress === 'string' 
            ? document.querySelector(this._config.progress)
            : this._config.progress;

        this._hints = document.querySelectorAll(`[${this._config.hint}]`);

        const regex = {
            letters: /(.*[a-zA-Z])/,
            mixed: /([a-z].*[A-Z])|([A-Z].*[a-z])/,
            numbers: /([0-9])/,
            symbols: /([!,%,&,@,#,$,^,*,?,_,~])/ 
        };

        for (const key in regex) {
            if (this._config[key]) {
                this._totalScore += 1;
            }
        }

        if (this._config.progress instanceof HTMLElement) {
            this._config.progress.style.width = `0%`;
            this._config.progress.setAttribute('data-strength', 'weak');
        }

        if (this._config.toggle instanceof HTMLElement) {
            this._config.toggle.setAttribute('aria-pressed', false);
        }

        const calculateStrength = () => {
            if (this._element.value.length > (this._config.length - 1)) {
                this._score += 1;
                this._checked.push('length');
            }

            if (this._config.letters && this._element.value.match(regex.letters)) {
                this._score += 1;
                this._checked.push('letters');
            }

            if (this._config.mixed && this._element.value.match(regex.mixed)) {
                this._score += 1;
                this._checked.push('mixed');
            }

            if (this._config.numbers && this._element.value.match(regex.numbers)) {
                this._score += 1;
                this._checked.push('numbers');
            }

            if (this._config.symbols && this._element.value.match(regex.symbols)) {
                this._score += 1;
                this._checked.push('symbols');
            }
        };

        const updateCheckedHint = () => {
            if (this._hints.length === 0) return; 

            this._hints.forEach((hint) => {
                if (this._checked.includes(hint.getAttribute(this._config.hint))) {
                    hint.setAttribute('data-checked', true);
                } else {
                    hint.setAttribute('data-checked', false);
                }
            });
        };

        const onToggle = () => {
            if (!this._config.toggle) return;

            if(this._visible){
                this._element.setAttribute('type', 'password');
                this._config.toggle.setAttribute('aria-pressed', false);
                this._visible = false;

                return;
            }
                
            this._element.setAttribute('type', 'text');
            this._config.toggle.setAttribute('aria-pressed', true);
            this._visible = true;
        };

        const onInput = () => {
            this._score = 0;
            this._checked = [];
            calculateStrength();
            const level = 100/3;
            const multiplier = 100/this._totalScore;
            const percentage = this._score * multiplier;

            if (this._config.progress instanceof HTMLElement) {
                this._config.progress.style.width = `${percentage}%`;

                if (percentage > level * 2) {
                    this._config.progress.setAttribute('data-strength', 'strong');
                }
                
                if (percentage > level && percentage <= level * 2) {
                    this._config.progress.setAttribute('data-strength', 'medium');
                }
                
                if (percentage < level) {
                    this._config.progress.setAttribute('data-strength', 'weak');
                }
            }

            updateCheckedHint();
        };

        this._on(this._element, 'input', onInput);

        if (this._config.toggle instanceof HTMLElement) {
            this._on(this._config.toggle, 'click', onToggle);
        }

        if (this._config.clearOnReset) {           
            if (this._element.form) {
                this._on(this._element.form, 'reset', () => {
                    this._element.value = '';
                    onInput();
                });
            }
        }
    }

    destroy() {
        super.destroy();
    }
}

export default Password;