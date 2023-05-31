import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';
import { computePosition, offset, flip, shift, limitShift, autoUpdate } from '@floating-ui/dom';

const _component = 'dropdown';
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

class Dropdown extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this._component.allowTransitions();
        this.init();
    }

    init() {
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
            util.styles(this._dropdown, {
                top: null,
                left: null,
                zIndex: null
            });
        };

        const eventData = {
            dropdown: this._dropdown,
            config: this._config
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
            if (e.key === 'Escape' && this._config.autoClose != false) {
                this.hide();
            }
        };

        this._show = () => {
            autoUpdatePosition = updatePosition();
            this._isOpened = true;
            this._component.dispatch('show', eventData);
            this._element.setAttribute('aria-expanded', this._isOpened);
            util.removeClass(this._dropdown, this._config.displayClass);

            const transitioned = this._component.transition('transitionEnter', this._dropdown, (e) => {
                this._component.dispatch('shown', eventData);
            });

            if (transitioned) {
                return;
            }
    
            this._component.dispatch('shown', eventData);
        };

        this._hide = () => {
            this._isOpened = false;
            this._component.dispatch('hide', eventData);
            this._element.setAttribute('aria-expanded', this._isOpened);

            const transitioned = this._component.transition('transitionLeave', this._dropdown, (e) => {
                this._isOpened = false;
                this._component.dispatch('hidden', eventData);
                autoUpdatePosition();
                resetPositionStyles();
                util.addClass(this._dropdown, this._config.displayClass);
            });

            if (transitioned) {
                return;
            }
    
            util.addClass(this._dropdown, this._config.displayClass);
            autoUpdatePosition();
            resetPositionStyles();
            this._component.dispatch('hidden', eventData);
        };

        this._component.on(this._reference, 'click', onClickToggle);
        this._component.on(this._reference, 'keydown', onKeydown);
        this._component.on(document, 'click', onClickHide);

        this._component.dispatch('initialize');
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

uk.registerComponent(_component, Dropdown);

export {
    Dropdown
};