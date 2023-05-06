import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';
import { computePosition, offset, inline, flip, shift, limitShift, arrow, autoUpdate } from '@floating-ui/dom';

const _component = 'tooltip';
const _defaults = {
    target: null,
    content: '',
    placement: 'top',
    offset: 8,
    shift: 8,
    showDelay: 0,
    hideDelay: 0,
    trigger: ['hover', 'focus'],
    class: null,
    hideClass: null,
    arrow: true,
    arrowPadding: 8,
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

    init() {
        if (!this._element) return;

        this._config.target = typeof this._config.target == 'string'
            ? document.querySelector(this._config.target)
            : null;

        this._config.trigger = typeof this._config.trigger == 'string' 
            ? [this._config.trigger] 
            : this._config.trigger;

        this._config.trigger = this._config.trigger instanceof Array 
            ? this._config.trigger 
            : [];

        // this._config.placement = this._config.placement.replace('-start', '').replace('-end', '');
        this._config.showDelay = parseInt(this._config.showDelay);
        this._config.hideDelay = parseInt(this._config.hideDelay);
        this._id = 'tooltip-' + util.randomNumber(4);
        this._originalTitle = null;
        this._content = this._config.content; 
        this._contentType = 'innerText';
        this._isAnimating = false;
        let tooltip, tooltipContent, tooltipArrow, timeout;

        if (this._element.title.length > 0) {
            this._content = this._element.title;
            this._originalTitle = this._element.title;
            this._element.setAttribute('data-tooltip-original-title', this._element.title);
            this._element.removeAttribute('title');
        }

        // Create tooltip
        if (this._config.target) {
            tooltip = this._config.target;

            this._id = tooltip.hasAttribute('id') ? tooltip.id : this._id;
            tooltip.setAttribute('id', this._id);
            tooltip.style.display = 'none';
            util.removeClass(tooltip, this._config.hideClass);

            tooltipContent = tooltip.querySelector('[data-content]');
            tooltipArrow = tooltip.querySelector('[data-arrow]');

            if (!this._config.arrow && tooltipArrow) {
                tooltipArrow.style.display = 'none';
            }

            this._content = tooltipContent.innerHTML || this._content; 
            this._contentType = 'innerHTML';
            tooltip.remove();
        } else {
            const type = this._config.html ? 'innerHTML' : 'innerText'
            this._contentType = type;
            tooltip = document.createElement('div');
            tooltip.id = this._id;
            tooltip.style.display = 'none';
            tooltip.style.position = 'absolute';
            tooltip.style.top = 0;
            tooltip.style.left = 0;
            tooltip.style.zIndex = '1000';
            tooltip.className = this._config.class ? this._config.class : '';
            tooltip.setAttribute('role', 'tooltip');

            tooltipContent = document.createElement('div');
            tooltipContent[type] = this._content;
            tooltipContent.setAttribute('data-content', '');
            tooltip.appendChild(tooltipContent);

            tooltipArrow = document.createElement('div');
            tooltipArrow.style.position = 'absolute';
            tooltipArrow.style.transform = 'rotate(45deg)';
            tooltipArrow.style.backgroundColor = 'inherit';
            tooltipArrow.style.width = '8px';
            tooltipArrow.style.height = '8px';
            tooltipArrow.style.zIndex = '-1';
            tooltipArrow.className = this._config.arrowClass ? this._config.arrowClass : '';

            if (this._config.arrow) {
                tooltipArrow.setAttribute('data-arrow', '');
                tooltip.appendChild(tooltipArrow);
            }
        }

        this._tooltip = tooltip;
        this._tooltipContent = tooltipContent;
        this._tooltipArrow = tooltipArrow;

        this._element.setAttribute('aria-describedby', this._id);

        let autoUpdatePosition = () => void 0;

        const setPosition = () => {
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
                        element: this._tooltipArrow,
                        padding: this._config.arrowPadding
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

                if (this._tooltipArrow) {                    
                    Object.assign(this._tooltipArrow.style, {
                        left: arrow.x != null ? `${arrow.x}px` : '',
                        top: arrow.y != null ? `${arrow.y}px` : '',
                        right: '',
                        bottom: '',
                        [staticSide]: `${-this._tooltipArrow.offsetHeight / 2}px`,
                    });
                }
            });
        };

        const updatePosition = () => { 
            return autoUpdate(this._element, this._tooltip, setPosition);
        };

        const onShowAnimationEnd = () => {
            this._isAnimating = false;
            this._triggerEvent('shown');
            this._eventOff(this._tooltip, this._animationEvent, onShowAnimationEnd);
        };

        const onHideAnimationEnd = () => {
            this._isAnimating = false;
            this._triggerEvent('hidden');
            autoUpdatePosition();
            util.hide(this._tooltip);
            util.removeClass(this._tooltip, this._config.animationEndClass);
            this._tooltip.remove();
            this._eventOff(this._tooltip, this._animationEvent, onHideAnimationEnd);
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
                    this._eventOff(this._tooltip, this._animationEvent, onHideAnimationEnd);
                }
    
                this._triggerEvent('show');
                this._element.after(this._tooltip);
                autoUpdatePosition = updatePosition();
                
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
    
                    this._eventOn(this._tooltip, this._animationEvent, onShowAnimationEnd);
    
                    return;
                }
    
                util.show(this._tooltip);
                this._triggerEvent('shown');
            }, this._config.showDelay);
        };

        this._hide = (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (this._isAnimating) {
                    this._isAnimating = false;
                    util.hide(this._tooltip);
                    this._tooltip.remove();
                    this._eventOff(this._tooltip, this._animationEvent, onHideAnimationEnd);
                }
    
                this._triggerEvent('hide');
    
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
    
                    this._eventOn(this._tooltip, this._animationEvent, onHideAnimationEnd);
    
                    return;
                }
    
                util.hide(this._tooltip);
                this._tooltip.remove();
                this._triggerEvent('hidden');
            }, this._config.hideDelay);
        };

        this._toggle = (e) => {
            if (this._tooltip.isConnected) {
                this._hide();

                return;
            }

            this._show();
        }

        const onKeydown = (e) => {
            if (e.key === 'Escape') {
                this._hide();
            }
        };

        for (let i = 0; i < this._config.trigger.length; i++) {
            if (!['click', 'focus', 'hover'].includes(this._config.trigger[i])) {
                break;
            }

            if (this._config.trigger[i] == 'click') {
                this._eventOn(this._element, 'click', this._toggle);
            }

            if (this._config.trigger[i] == 'hover') {                
                this._eventOn(this._element, 'mouseenter', this._show);
                this._eventOn(this._element, 'mouseleave', this._hide);
            }

            if (this._config.trigger[i] == 'focus') {
                this._eventOn(this._element, 'focus', this._show);
                this._eventOn(this._element, 'blur', this._hide);
            }
        }

        this._eventOn(document, 'keydown', onKeydown);

        this._triggerEvent('initialize');
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

    content(content) {
        content = content || '';
        this._tooltipContent[this._contentType] = content;
    }

    reset() {
        this._tooltipContent[this._contentType] = this._content;
    }

    destroy() {
        this._hide();

        if (this._element.hasAttribute('data-tooltip-original-title')) {
            this._element.setAttribute('title', this._content);
            this._element.removeAttribute('data-tooltip-original-title');
        }

        this._element.removeAttribute('aria-describedby');
        super.destroy();
    }
}

uk.registerComponent(_component, Tooltip);

export {
    Tooltip
};