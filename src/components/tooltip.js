import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';
import { computePosition, offset, inline, flip, shift, limitShift, arrow, autoUpdate } from '@floating-ui/dom';

const _component = 'tooltip';
const _defaults = {
    title: '',
    placement: 'top',
    offset: 8,
    shift: 8,
    showDelay: 0,
    hideDelay: 0,
    trigger: ['hover', 'focus'],
    class: null,
    showArrow: true,
    html: false,
    arrowClass: null,
    animationStartClass: null,
    animationEndClass: null,
    transition: false
};

class Tooltip extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this.init();
    }

    init () {
        if (!this._element) return;

        this._config.trigger = typeof this._config.trigger == 'string' 
            ? [this._config.trigger] 
            : this._config.trigger;

        this._config.trigger = this._config.trigger instanceof Array 
            ? this._config.trigger 
            : [];

        this._config.placement = this._config.placement.replace('-start', '').replace('-end', '');
        this._config.showDelay = parseInt(this._config.showDelay);
        this._config.hideDelay = parseInt(this._config.hideDelay);
        this._id = 'tooltip-' + util.randomNumber(4);
        this._originalTitle = null;
        this._title = this._config.title; 
        this._isAnimating = false;
        let timeout;

        if (this._element.title.length > 0) {
            this._title = this._element.title;
            this._originalTitle = this._element.title;
            util.setAttributes(this._element, {
                'data-tooltip-original-title': this._element.title,
                'aria-describedby': this._id
            });
            this._element.removeAttribute('title');
        }

        this._tooltipElement = () => {
            const type = this._config.html ? 'innerHTML' : 'innerText'
            const tooltip = document.createElement('div');
            tooltip.id = this._id;
            tooltip.style.display = 'none';
            tooltip.style.position = 'absolute';
            tooltip.style.top = 0;
            tooltip.style.left = 0;
            tooltip.style.zIndex = '1000';
            tooltip.className = this._config.class ? this._config.class : '';
            tooltip.setAttribute('role', 'tooltip');

            const tooltipContent = document.createElement('div');
            tooltipContent[type] = this._title;
            tooltipContent.setAttribute('data-tooltip-content', '');
            tooltip.appendChild(tooltipContent);

            return tooltip;
        };

        this._tooltip = this._tooltipElement();
        this._tooltipContent = this._tooltip.querySelector('[data-tooltip-content]');
        this._arrowElement = () => {
            const arrow = document.createElement('div');
            arrow.style.position = 'absolute';
            arrow.style.transform = 'rotate(45deg)';
            arrow.style.backgroundColor = 'inherit';
            arrow.style.width = '8px';
            arrow.style.height = '8px';
            arrow.style.zIndex = '-1';
            arrow.className = this._config.arrowClass ? this._config.arrowClass : '';

            if (this._config.showArrow) {
                arrow.setAttribute('data-tooltip-arrow', '');
                this._tooltip.appendChild(arrow);
            }

            return arrow;
        };

        this._arrow = this._arrowElement();
        this._autoUpdatePosition = () => void 0;
        this.hasAnimation = this._hasAnimation;
        this.animationEvent = this._hasAnimation;

        this._setPosition = () => {
            computePosition(this._element, this._tooltip, {
                placement: this._config.placement,
                middleware: [ 
                    offset(this._config.offset),
                    inline(),
                    flip(),
                    shift({ 
                        padding: this._config.shift,
                        limiter: limitShift()
                    }),
                    arrow({ 
                        element: this._arrow,
                        padding: 6
                    })
                ]
            }).then(({ x, y, placement, middlewareData }) => {
                const { offset, flip, shift, arrow } = middlewareData;

                Object.assign(this._tooltip.style, {
                    left: `${x}px`,
                    top: `${y}px`,
                });

                const staticSide = {
                    top: 'bottom',
                    right: 'left',
                    bottom: 'top',
                    left: 'right',
                }[placement.split('-')[0]];

                Object.assign(this._arrow.style, {
                    left: arrow.x != null ? `${arrow.x}px` : '',
                    top: arrow.y != null ? `${arrow.y}px` : '',
                    right: '',
                    bottom: '',
                    [staticSide]: '-4px',
                });
            });
        };

        this._updatePosition = () => { 
            return autoUpdate(this._element, this._tooltip, this._setPosition);
        };

        this._onShowAnimationEnd = () => {
            this._isAnimating = false;
            this.TriggerEvent('shown');
            this.eventOff(this._tooltip, this._animationEvent, this._onShowAnimationEnd);
        };

        this._onHideAnimationEnd = () => {
            this._isAnimating = false;
            this.TriggerEvent('hidden');
            this._autoUpdatePosition();
            util.hide(this._tooltip);
            util.removeClass(this._tooltip, this._config.animationEndClass);
            this._tooltip.remove();
            this.eventOff(this._tooltip, this._animationEvent, this._onHideAnimationEnd);
        };

        this._show = (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (this._isAnimating) {
                    this._isAnimating = false;
                    util.hide(this._tooltip);
    
                    if (this._hasAnimation) {
                        util.removeClass(this._tooltip, this._config.animationEndClass);
                    }
    
                    this._tooltip.remove();
                    this.eventOff(this._tooltip, this._animationEvent, this._onHideAnimationEnd);
                }
    
                this.TriggerEvent('show');
                this._element.after(this._tooltip);
                this._autoUpdatePosition = this._updatePosition();
                
                if (!this._hasAnimation) {
                    util.addClass(this._tooltip, this._config.animationStartClass);
                    util.show(this._tooltip);
                }
    
                if (this._config.animationStartClass) {
                    this._isAnimating = true;
       
                    setTimeout(() => {
                        if (this._hasAnimation) {
                            util.show(this._tooltip);
                            util.addClass(this._tooltip, this._config.animationStartClass);
                        } else {
                            util.removeClass(this._tooltip, this._config.animationStartClass);
                            util.addClass(this._tooltip, this._config.animationEndClass);
                        }
                    });
    
                    this.eventOn(this._tooltip, this._animationEvent, this._onShowAnimationEnd);
    
                    return;
                }
    
                util.show(this._tooltip);
                this.TriggerEvent('shown');
            }, this._config.showDelay);
        };

        this._hide = (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (this._isAnimating) {
                    this._isAnimating = false;
                    util.hide(this._tooltip);
                    this._tooltip.remove();
                    this.eventOff(this._tooltip, this._animationEvent, this._onHideAnimationEnd);
                }
    
                this.TriggerEvent('hide');
    
                if (this._config.animationEndClass) {
                    this._isAnimating = true;
    
                    if (this._hasAnimation) {
                        setTimeout(() => {                        
                            util.removeClass(this._tooltip, this._config.animationStartClass);
                            util.addClass(this._tooltip, this._config.animationEndClass);
                        });
                    } else {
                        util.removeClass(this._tooltip, this._config.animationEndClass);
                        util.addClass(this._tooltip, this._config.animationStartClass);
                    }
    
                    this.eventOn(this._tooltip, this._animationEvent, this._onHideAnimationEnd);
    
                    return;
                }
    
                util.hide(this._tooltip);
                this._tooltip.remove();
                this.TriggerEvent('hidden');
            }, this._config.hideDelay);
        };

        this._toggle = (e) => {
            if (this._tooltip.isConnected) {
                this._hide();

                return;
            }

            this._show();
        }

        this._onKeydown = (e) => {
            if (e.key === 'Escape') {
                this._hide();
            }
        };

        for (let i = 0; i < this._config.trigger.length; i++) {
            if (!['click', 'focus', 'hover'].includes(this._config.trigger[i])) {
                break;
            }

            if (this._config.trigger[i] == 'click') {
                this.eventOn(this._element, 'click', this._toggle);
            }

            if (this._config.trigger[i] == 'hover') {                
                this.eventOn(this._element, 'mouseenter', this._show);
                this.eventOn(this._element, 'mouseleave', this._hide);
            }

            if (this._config.trigger[i] == 'focus') {
                this.eventOn(this._element, 'focus', this._show);
                this.eventOn(this._element, 'blur', this._hide);
            }
        }

        this.eventOn(document, 'keydown', this._onKeydown);

        this.TriggerEvent('initialize');
    }

    toggle() {
        this._toggle();
    }

    show() {
        this._show();
    }

    hide() {
        this._hide();
    }

    title(title) {
        title = title || '';
        this._tooltipContent.textContent = title;
    }

    reset() {
        this._tooltipContent.textContent = this._title;
    }

    destroy() {
        this._hide();

        if (this._element.hasAttribute('data-tooltip-original-title')) {
            this._element.setAttribute('title', this._title);
            this._element.removeAttribute('data-tooltip-original-title');
        }

        this._element.removeAttribute('aria-describedby');
        this.eventOff(document, 'keydown', this._onKeydown);
        super.destroy();
    }
}

uk.registerComponent(_component, Tooltip);