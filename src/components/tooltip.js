import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';
import { computePosition, offset, inline, flip, shift, arrow, autoUpdate } from '@floating-ui/dom';

const _component = 'tooltip';
const _defaults = {
    title: '',
    placement: 'top',
    offset: 8,
    shift: 8,
    delay: 0,
    trigger: ['hover', 'focus'],
    class: null,
    showArrow: true,
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
        this._config.trigger = typeof this._config.trigger == 'string' 
            ? [this._config.trigger] 
            : this._config.trigger;

        this._triggers = this._config.trigger instanceof Array 
            ? this._config.trigger 
            : [];

        this._config.placement = this._config.placement.replace('-start', '').replace('-end', '');
        this._delay = parseInt(this._config.delay);
        this._id = 'tooltip' + util.randomNumber(6);
        this._originalTitle = null;
        this._title = this._config.title; 

        if (this._element.title.length > 0) {
            this._title = this._element.title;
            this._originalTitle = this._element.title;
            this._element.setAttribute('data-tooltip-original-title', this._element.title);
            this._element.removeAttribute('title');
        }

        this._tooltipElement = () => {
            const tooltip = document.createElement('div');
            tooltip.id = this._id;
            tooltip.style.display = 'none';
            tooltip.style.position = 'absolute';
            tooltip.style.top = 0;
            tooltip.style.left = 0;
            tooltip.style.zIndex = '1000';
            tooltip.className = this._config.class ? this._config.class : '';

            const tooltipContent = document.createElement('div');
            tooltipContent.textContent = this._title;
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
                        padding: this._config.shift 
                    }),
                    arrow({ 
                        element: this._arrow,
                        //padding: 6
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

        this._show = (e) => {
            console.log('show');
            this.TriggerEvent('show');
            this._element.after(this._tooltip);
            this._autoUpdatePosition = this._updatePosition();
            
            // setTimeout(() => {
                if (!this._hasAnimation(this._tooltip)) {
                    util.addClass(this._tooltip, this._config.animationStartClass);
                    util.show(this._tooltip);
                }

                if (this._config.animationStartClass) {
                    this._animation(
                        this._tooltip, 
                        () => {   
                            if (this._hasAnimation(this._tooltip)) {
                                util.show(this._tooltip);
                                util.addClass(this._tooltip, this._config.animationStartClass);
        
                                return;
                            }
        
                            util.removeClass(this._tooltip, this._config.animationStartClass);
                            util.addClass(this._tooltip, this._config.animationEndClass);
                        },
                        (e) => {
                            console.log('shown - anime');
                            this.TriggerEvent('shown');
                        }
                    );
        
                    return;
                }

                console.log('shown');
                this.TriggerEvent('shown');
            // }, this._delay);
        }

        this._hide = (e) => {
            console.log('hide');
            this.TriggerEvent('hide');

            // setTimeout(() => {

                if (this._config.animationEndClass) {
                    this._animation(
                        this._tooltip, 
                        () => {
                            if (this._hasAnimation(this._tooltip)) {
                                util.removeClass(this._tooltip, this._config.animationStartClass);
                                util.addClass(this._tooltip, this._config.animationEndClass);
        
                                return;
                            }
        
                            util.removeClass(this._tooltip, this._config.animationEndClass);
                            util.addClass(this._tooltip, this._config.animationStartClass);
                        },
                        (e) => {
                            console.log('hidden - anime');
                            this.TriggerEvent('hidden');
                            this._autoUpdatePosition();
                            
                            if (this._hasAnimation(this._tooltip)) {
                                util.hide(this._tooltip);
                                util.removeClass(this._tooltip, this._config.animationEndClass);
                            }

                            this._tooltip.remove();
                        }
                    );
        
                    return;
                }

                console.log('hidden');
                this._tooltip.remove();
                this.TriggerEvent('hidden');
            // }, this._delay);
        }

        this._toggle = (e) => {
            if (this._tooltip.isConnected) {
                this._hide();

                return;
            }

            this._show();
        }

        for (let i = 0; i < this._triggers.length; i++) {
            if (!['click', 'focus', 'hover'].includes(this._triggers[i])) {
                break;
            }

            if (this._triggers[i] == 'click') {
                this.eventOn(this._element, 'click', this._toggle);
            }

            if (this._triggers[i] == 'hover') {                
                this.eventOn(this._element, 'mouseenter', this._show);
                this.eventOn(this._element, 'mouseleave', this._hide);
            }

            if (this._triggers[i] == 'focus') {
                this.eventOn(this._element, 'focus', this._show);
                this.eventOn(this._element, 'blur', this._hide);
            }
        }

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
        this.eventOff(this._element, 'click', this._toggle);
        this.eventOff(this._element, 'mouseenter', this._show);
        this.eventOff(this._element, 'mouseleave', this._hide);
        this.eventOff(this._element, 'focus', this._show);
        this.eventOff(this._element, 'blur', this._hide);

        if (this._element.hasAttribute('data-tooltip-original-title')) {
            this._element.setAttribute('title', this._title);
            this._element.removeAttribute('data-tooltip-original-title')
        }

        super.destroy();
    }
}

uk.registerComponent(_component, Tooltip);