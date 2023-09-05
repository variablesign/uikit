import { styles, addClass, removeClass } from '../utils.js';
import Component from '../component.js';
import { computePosition, offset, flip, shift, limitShift, autoUpdate } from '@floating-ui/dom';

class Dropdown extends Component {
    constructor(element, config) {

        const _defaults = {
            target: null,
            reference: null,
            autoClose: true,
            displayClass: null,
            placement: 'bottom-start',
            autoPlacement: true,
            offset: 8,
            shift: 8,
            zindex: 1000
        };

        const _component = {
            name: 'dropdown',
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

        this._isOpened = false;

        this._dropdown = this._config.target 
            ? document.querySelector(this._config.target) 
            : this._element.nextElementSibling;

        this._reference = this._config.reference instanceof HTMLElement 
            ? this._config.reference 
            : document.querySelector(this._config.reference);

        this._reference = this._reference 
            ? this._reference 
            : this._element;
            
        let autoUpdatePosition = () => void 0;

        this._element.setAttribute('aria-expanded', this._isOpened);

        const setPosition = () => {
            computePosition(this._reference, this._dropdown, {
                placement: this._config.placement,
                middleware: [ 
                    offset(this._config.offset),
                    flip(),
                    shift({ 
                        padding: this._config.shift,
                        limiter: limitShift()
                    })
                ]
            }).then(({ x, y, placement, middlewareData }) => {
                const { offset, flip, shift, hide } = middlewareData;

                Object.assign(this._dropdown.style, {
                    left: `${x}px`,
                    top: `${y}px`,
                    zIndex: this._config.zindex
                });
            });
        };

        const updatePosition = () => { 
            return autoUpdate(this._reference, this._dropdown, setPosition);
        };

        const resetPositionStyles = () => {
            styles(this._dropdown, {
                top: null,
                left: null,
                zIndex: null
            });
        };

        const eventData = {
            dropdown: this._dropdown
        };

        const onClickToggle = (e) => {
            e.preventDefault();
            this.toggle();
        };

        const onClickHide = (e) => {
            const clicked = e.target;

            if (this._element.contains(clicked)) {
                return;
            }
    
            if ([true, 'inside'].includes(this._config.autoClose) && this._dropdown.contains(clicked) && this._isOpened) {
                this.hide();
    
                return;
            }
    
            if ([true, 'outside'].includes(this._config.autoClose) && !this._dropdown.contains(clicked) && this._isOpened) {
                this.hide();
    
                return;
            }
        };
    
        const onKeydown = (e) => {
            if (e.key === 'Escape' && this._config.autoClose != false && this._isOpened) {
                this.hide();
            }
        };

        this._show = () => {
            autoUpdatePosition = updatePosition();
            this._isOpened = true;
            this._dispatchEvent('show', eventData);
            this._element.setAttribute('aria-expanded', this._isOpened);
            removeClass(this._dropdown, this._config.displayClass);

            const transitioned = this._transition('transitionEnter', this._dropdown, (e) => {
                this._dispatchEvent('shown', eventData);
            });

            if (transitioned) return;
    
            this._dispatchEvent('shown', eventData);
        };

        this._hide = () => {
            this._isOpened = false;
            this._dispatchEvent('hide', eventData);
            this._element.setAttribute('aria-expanded', this._isOpened);

            const transitioned = this._transition('transitionLeave', this._dropdown, (e) => {
                this._isOpened = false;
                this._dispatchEvent('hidden', eventData);
                autoUpdatePosition();
                resetPositionStyles();
                addClass(this._dropdown, this._config.displayClass);
            });

            if (transitioned) return;
    
            addClass(this._dropdown, this._config.displayClass);
            autoUpdatePosition();
            resetPositionStyles();
            this._dispatchEvent('hidden', eventData);
        };

        this._on(this._reference, 'click', onClickToggle);
        this._on(this._reference, 'keydown', onKeydown);
        this._on(document, 'click', onClickHide);

        this._dispatchEvent('initialize');
    }

    toggle() {
        if (this._isOpened) {
            this._hide();

            return;
        }

        this._show();
    }

    show() {
        this._show();
    }

    hide() {
        this._hide();
    }

    destroy() {
        this.hide();
        super.destroy();
    }
}

export default Dropdown;