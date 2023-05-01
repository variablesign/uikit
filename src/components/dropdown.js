import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';
import { computePosition, offset, flip, shift, limitShift, autoUpdate } from '@floating-ui/dom';

const _component = 'dropdown';
const _defaults = {
    target: null,
    reference: null,
    autoClose: true,
    hideClass: null,
    animationStartClass: null,
    animationEndClass: null,
    placement: 'bottom-start',
    autoPlacement: true,
    offset: 8,
    shift: 8,
    onInitialize: null,
    onShow: null,
    onShown: null,
    onHide: null,
    onHidden: null
};

class Dropdown extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this.init();
    }

    init () {
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
                    top: `${y}px`
                });
            });
        };

        const updatePosition = () => { 
            return autoUpdate(this._reference, this._dropdown, setPosition);
        };

        const resetPositionStyles = () => {
            this._dropdown.style.top = null;
            this._dropdown.style.left = null;
        };

        const eventData = {
            dropdown: this._dropdown
        };

        const onClickToggle = (e) => {
            e.preventDefault();
            this.toggle();
    
            return;
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

        const onShowAnimationEnd = () => {
            this.TriggerEvent('shown', eventData);
            this.eventOff(this._dropdown, this._animationEvent, onShowAnimationEnd);
        };

        const onHideAnimationEnd = () => {
            this.TriggerEvent('hidden', eventData);
            autoUpdatePosition();
            resetPositionStyles();
            util.addClass(this._dropdown, this._config.hideClass);
            util.removeClass(this._dropdown, this._config.animationEndClass);
            this._isOpened = false;
            this.eventOff(this._dropdown, this._animationEvent, onHideAnimationEnd);
        };

        this._show = (e) => {
            autoUpdatePosition = updatePosition();
            this.TriggerEvent('show', eventData);
            this._isOpened = true;
    
            if (!this._hasAnimation) {
                util.addClass(this._dropdown, this._config.animationStartClass);
                util.removeClass(this._dropdown, this._config.hideClass);
            }
    

            if (this._config.animationStartClass) {
                setTimeout(() => {
                    if (this._hasAnimation) {
                        util.removeClass(this._dropdown, this._config.hideClass);
                        util.addClass(this._dropdown, this._config.animationStartClass);
                    } else {
                        util.removeClass(this._dropdown, this._config.animationStartClass);
                        util.addClass(this._dropdown, this._config.animationEndClass);
                    }
                });

                this.eventOn(this._dropdown, this._animationEvent, onShowAnimationEnd);

                return;
            }
    
            this.TriggerEvent('shown', eventData);
        };

        this._hide = (e) => {
            this.TriggerEvent('hide', eventData);
    
            if (this._config.animationEndClass) {
                if (this._hasAnimation) {
                    setTimeout(() => {                        
                        util.removeClass(this._dropdown, this._config.animationStartClass);
                        util.addClass(this._dropdown, this._config.animationEndClass);
                    });
                } else {
                    util.removeClass(this._dropdown, this._config.animationEndClass);
                    util.addClass(this._dropdown, this._config.animationStartClass);
                }

                this.eventOn(this._dropdown, this._animationEvent, onHideAnimationEnd);

                return;
            }
    
            util.addClass(this._dropdown, this._config.hideClass);
            this._isOpened = false;
            autoUpdatePosition();
            resetPositionStyles();
            this.TriggerEvent('hidden', eventData);
        };

        this.eventOn(this._element, 'click', onClickToggle);
        this.eventOn(this._element, 'keydown', onKeydown);
        this.eventOn(document, 'click', onClickHide);

        this.TriggerEvent('initialize');
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