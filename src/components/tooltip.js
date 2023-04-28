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
    animationEndClass: null
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
        this.timeout = null;
        this._isAnimating = false;

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

        const transShowEnd = () => {
            this.TriggerEvent('shown');
            this._isAnimating = false;
            this._tooltip.removeEventListener('transitionend', transShowEnd);
        };

        const transHideEnd = () => {
            this.TriggerEvent('hidden');
            this._autoUpdatePosition();
            util.hide(this._tooltip);
            this._tooltip.remove();
            this._isAnimating = false;
            this._tooltip.removeEventListener('transitionend', transHideEnd);
        };

        const showTooltip = () => {
            if (this._isAnimating) {
                util.hide(this._tooltip);
                this._tooltip.remove();
                this._isAnimating = false;
                console.log('(`.`) bug fixed');
                this._tooltip.removeEventListener('transitionend', transHideEnd);
            }
            console.log('mouseenter :-->');
            console.log('Show 1: is animating... ' + this._isAnimating);
            const self = this;
            this.TriggerEvent('show');
            this._element.after(this._tooltip);
            this._autoUpdatePosition = this._updatePosition();
            
            if (!this._hasAnimation(this._tooltip)) {
                util.addClass(this._tooltip, this._config.animationStartClass);
            }

            if (this._config.animationStartClass) {
                // this._animation({
                //     target: this._tooltip,
                //     start() { 
                //         util.show(self._tooltip);

                //         if (self._hasAnimation(self._tooltip)) {
                //             util.addClass(self._tooltip, self._config.animationStartClass);
    
                //             return;
                //         }
    
                //         util.removeClass(self._tooltip, self._config.animationStartClass);
                //         util.addClass(self._tooltip, self._config.animationEndClass);
                //     },
                //     end(e) {
                //         self.TriggerEvent('shown');
                //     }
                // });

                this._isAnimating = true;
                util.show(self._tooltip);
                setTimeout(() => {
                    util.removeClass(self._tooltip, self._config.animationStartClass);
                    util.addClass(self._tooltip, self._config.animationEndClass);
                });
                console.log('Show 2: is animating... ' + this._isAnimating);
                this._tooltip.addEventListener('transitionend', transShowEnd);
                return;
            }

            util.show(this._tooltip);
            this.TriggerEvent('shown');
        }

        const hideTooltip = () => {
            if (this._isAnimating) {
                util.hide(this._tooltip);
                this._tooltip.remove();
                this._isAnimating = false;
                console.log('(`.`) bug fixed');
            }
            console.log('<--: mouseleave');
            console.log('Hide 1: is animating... ' + this._isAnimating);
            const self = this;
            this.TriggerEvent('hide');

            if (this._config.animationEndClass) {
                // this._animation({
                //     target: this._tooltip,
                //     start() {
                //         if (self._hasAnimation(self._tooltip)) {
                //             util.removeClass(self._tooltip, self._config.animationStartClass);
                //             util.addClass(self._tooltip, self._config.animationEndClass);
    
                //             return;
                //         }
    
                //         util.removeClass(self._tooltip, self._config.animationEndClass);
                //         util.addClass(self._tooltip, self._config.animationStartClass);
                //     },
                //     end(e) {
                //         self.TriggerEvent('hidden');
                //         self._autoUpdatePosition();
                        
                //         if (self._hasAnimation(self._tooltip)) {
                //             util.removeClass(self._tooltip, self._config.animationEndClass);
                //         }
                        
                //         util.hide(self._tooltip);
                //         self._tooltip.remove();
                //     }
                // });

                this._isAnimating = true;
                setTimeout(() => {
                    util.removeClass(self._tooltip, self._config.animationEndClass);
                    util.addClass(self._tooltip, self._config.animationStartClass);
                });
                console.log('Hide 2: is animating... ' + this._isAnimating);
                this._tooltip.addEventListener('transitionend', transHideEnd);
                return;
            }

            util.hide(this._tooltip);
            this._tooltip.remove();
            this.TriggerEvent('hidden');
        }

        const onKeydown = (e) => {
            if (e.key === 'Escape') {
                hideTooltip();
            }
        };

        this._show = (e) => {
            clearTimeout(this.timeout);
            this.timeout = setTimeout(showTooltip, this._config.showDelay);
        };

        this._hide = (e) => {
            clearTimeout(this.timeout);
            this.timeout = setTimeout(hideTooltip, this._config.hideDelay);
        };

        this._toggle = (e) => {
            if (this._tooltip.isConnected) {
                this._hide();

                return;
            }

            this._show();
        }

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

        // TODO: This causes a bug when using transitions 
        // where after pressing escape key once, the tooltip with 
        // transition will automatically hide when hovered
        this.eventOn(document, 'keydown', onKeydown);

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
        super.destroy();
    }
}

uk.registerComponent(_component, Tooltip);