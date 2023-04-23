import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';
import { computePosition, offset, flip, shift, autoUpdate } from '@floating-ui/dom';

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
    shift: 8
};

class Dropdown extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this.init();
    }

    init () {
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
            
        this._autoUpdatePosition = () => void 0;

        this._setPosition = () => {
            computePosition(this._reference, this._dropdown, {
                placement: this._config.placement,
                middleware: [ 
                    offset(this._config.offset),
                    flip(),
                    shift({ 
                        padding: this._config.shift 
                    })
                ]
            }).then(({ x, y, placement, middlewareData }) => {
                const { offset, flip, shift } = middlewareData;

                Object.assign(this._dropdown.style, {
                    left: `${x}px`,
                    top: `${y}px`,
                });
            });
        };

        this._updatePosition = () => { 
            return autoUpdate(this._reference, this._dropdown, this._setPosition);
        };

        this._resetPositionStyles = () => {
            this._dropdown.style.top = null;
            this._dropdown.style.left = null;
        };

        this._eventData = {
            dropdown: this._dropdown,
            reference: this._reference
        };

        this._onClickToggle = (e) => {
            e.preventDefault();
            this.toggle();
    
            return;
        };
    
        this._onClickHide = (e) => {
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
    
        this._onKeydown = (e) => {
            if (e.key === 'Escape' && this._config.autoClose != false) {
                this.hide();
            }
        };

        this.eventOn(this._element, 'click', this._onClickToggle);
        this.eventOn(this._element, 'keydown', this._onKeydown);
        this.eventOn(document, 'click', this._onClickHide);
    }

    toggle() {
        if (this._isOpened) {
            this.hide();

            return;
        }

        this.show();
    }

    show() {
        this._autoUpdatePosition = this._updatePosition();
        this.TriggerEvent('show', this._eventData);
        this._isOpened = true;

        if (!this._hasAnimation(this._dropdown)) {
            util.addClass(this._dropdown, this._config.animationStartClass);
            util.removeClass(this._dropdown, this._config.hideClass);
        }

        if (this._config.animationStartClass) {
            this._animation(
                this._dropdown, 
                () => {
                    if (this._hasAnimation(this._dropdown)) {
                        util.removeClass(this._dropdown, this._config.hideClass);
                        util.addClass(this._dropdown, this._config.animationStartClass);

                        return;
                    }

                    util.removeClass(this._dropdown, this._config.animationStartClass);
                    util.addClass(this._dropdown, this._config.animationEndClass);
                },
                (e) => {
                    this.TriggerEvent('shown', this._eventData);
                }
            );

            return;
        }

        this.TriggerEvent('shown', this._eventData);
    }

    hide() {
        this.TriggerEvent('hide', this._eventData);

        if (this._config.animationEndClass) {
            this._animation(
                this._dropdown, 
                () => {
                    if (this._hasAnimation(this._dropdown)) {
                        util.removeClass(this._dropdown, this._config.animationStartClass);
                        util.addClass(this._dropdown, this._config.animationEndClass);

                        return;
                    }

                    util.removeClass(this._dropdown, this._config.animationEndClass);
                    util.addClass(this._dropdown, this._config.animationStartClass);
                },
                (e) => {
                    this.TriggerEvent('hidden', this._eventData);
                    this._autoUpdatePosition();
                    this._resetPositionStyles();
                    util.addClass(this._dropdown, this._config.hideClass);
                    this._isOpened = false;

                    if (this._hasAnimation(this._dropdown)) {
                        util.removeClass(this._dropdown, this._config.animationEndClass);
                    }
                }
            );

            return;
        }

        util.addClass(this._dropdown, this._config.hideClass);
        this._isOpened = false;
        this._autoUpdatePosition();
        this._resetPositionStyles();
        this.TriggerEvent('hidden', this._eventData);
    }

    destroy() {
        this.hide();
        this.eventOff(this._element, 'click', this._onClickToggle);
        this.eventOff(this._element, 'keydown', this._onKeydownHide);
        this.eventOff(document, 'click', this._onClickHide);
        super.destroy();
    }
}

uk.registerComponent(_component, Dropdown);