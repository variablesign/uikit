import { randomNumber, removeClass, showElement, hideElement } from '../utils.js';
import Component from '../component.js';
import { computePosition, offset, inline, flip, shift, limitShift, arrow, autoUpdate } from '@floating-ui/dom';

class Tooltip extends Component {
    constructor(element, config) {
        
        const _defaults = {
            target: null,
            content: '',
            placement: 'top',
            container: null,
            offset: 8,
            shift: 8,
            showDelay: 0,
            hideDelay: 0,
            trigger: ['hover', 'focus'],
            class: null,
            displayClass: null,
            arrow: true,
            arrowPadding: 8,
            html: false,
            arrowClass: null,
            zindex: 1080
        };

        const _component = {
            name: 'tooltip',
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

        this._config.target = typeof this._config.target == 'string'
            ? document.querySelector(this._config.target)
            : null;

        this._config.container = typeof this._config.container == 'string'
            ? document.querySelector(this._config.container)
            : this._config.container instanceof HTMLElement
            ? this._config.container
            : document.body;

        this._config.trigger = typeof this._config.trigger == 'string' 
            ? this._config.trigger.split(' ') 
            : this._config.trigger instanceof Array 
            ? this._config.trigger 
            : [];

        this._config.showDelay = parseInt(this._config.showDelay);
        this._config.hideDelay = parseInt(this._config.hideDelay);
        this._content = this._config.content; 
        this._contentType = 'innerText';
        this._isShown = false;
        const _id = 'tooltip-' + randomNumber(4);
        let tooltip, tooltipContent, tooltipArrow;

        if (this._element.hasAttribute('title')) {
            this._content = this._element.title;
            this._element.setAttribute('data-tooltip-original-title', this._element.title);
            this._element.removeAttribute('title');
        }

        if (this._element.hasAttribute('aria-label') && !this._element.hasAttribute('title')) {
            this._content = this._element.getAttribute('aria-label');
        }
        
        // Create tooltip
        if (this._config.target) {
            tooltip = this._config.target;

            tooltip.setAttribute('id', tooltip.hasAttribute('id') ? tooltip.id : _id);
            tooltip.style.display = 'none';
            tooltip.style.zIndex = this._config.zindex;
            removeClass(tooltip, this._config.displayClass);

            tooltipContent = tooltip.querySelector('[data-content]');
            tooltipArrow = tooltip.querySelector('[data-arrow]');

            if (!this._config.arrow && tooltipArrow) {
                tooltipArrow.style.display = 'none';
            }

            this._content = tooltipContent?.innerHTML || this._content; 
            this._contentType = 'innerHTML';
            tooltip.remove();
        } else {
            const type = this._config.html ? 'innerHTML' : 'innerText'
            this._contentType = type;
            tooltip = document.createElement('div');
            tooltip.id = _id;
            tooltip.style.display = 'none';
            tooltip.style.position = 'absolute';
            tooltip.style.top = 0;
            tooltip.style.left = 0;
            tooltip.style.zIndex = this._config.zindex;
            tooltip.className = this._config.class ? this._config.class : '';
            tooltip.setAttribute('role', 'tooltip');

            tooltipContent = document.createElement('div');
            tooltipContent[type] = this._content;
            tooltipContent.setAttribute('data-content', '');
            tooltip.appendChild(tooltipContent);

            if (this._config.arrow) {
                tooltipArrow = document.createElement('div');
                tooltipArrow.style.position = 'absolute';
                tooltipArrow.style.transform = 'rotate(45deg)';
                tooltipArrow.style.backgroundColor = 'inherit';
                tooltipArrow.style.width = '8px';
                tooltipArrow.style.height = '8px';
                tooltipArrow.style.zIndex = '-1';
                tooltipArrow.className = this._config.arrowClass ? this._config.arrowClass : '';
                tooltipArrow.setAttribute('data-arrow', '');
                tooltip.appendChild(tooltipArrow);
            }
        }

        if (this._content.length == 0) return;

        this._tooltip = tooltip;
        this._tooltipContent = tooltipContent;
        this._tooltipArrow = this._config.arrow ? tooltipArrow : null;

        this._element.setAttribute('aria-describedby', _id);

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

        this._show = () => {
            this._setTimeout(() => {
                this._dispatchEvent('show');

                if (!this._config.container.contains(this._tooltip)) {
                    this._config.container.appendChild(this._tooltip);
                }

                autoUpdatePosition = updatePosition();
                showElement(this._tooltip);
                this._isShown = true;

                const transitioned = this._transition('transitionEnter', this._tooltip, (e) => {
                    this._dispatchEvent('shown');
                });

                if (transitioned) {
                    return;
                }
    
                showElement(this._tooltip);
                this._dispatchEvent('shown');

            }, this._config.showDelay);
        };

        this._hide = () => {
            if (!this._isShown) {
                clearTimeout(this._timeout);

                return;
            }
            
            this._setTimeout(() => {
                this._dispatchEvent('hide');

                const transitioned = this._transition('transitionLeave', this._tooltip, (e) => {
                    this._dispatchEvent('hidden');
                    autoUpdatePosition();
                    hideElement(this._tooltip);
                    this._isShown = false;
                    this._tooltip.remove();
                });

                if (transitioned) {
                    return;
                }
    
                hideElement(this._tooltip);
                this._isShown = false;
                this._tooltip.remove();
                this._dispatchEvent('hidden');

            }, this._config.hideDelay);
        };

        this._toggle = (e) => {
            if (this._isShown) {
                this._hide();

                return;
            }

            this._show();
        }

        const onKeydown = (e) => {
            if (e.key === 'Escape' && this._isShown) {
                this._hide();
            }
        };

        const onHoverDestroy = (e) => {
            this.destroy();
        };

        for (let i = 0; i < this._config.trigger.length; i++) {
            if (!['click', 'focus', 'hover', 'once'].includes(this._config.trigger[i])) {
                break;
            }

            if (this._config.trigger[i] == 'click') {
                this._on(this._element, 'click', this._toggle);
            }

            if (this._config.trigger[i] == 'hover') {                
                this._on(this._element, 'mouseenter', this._show);
                this._on(this._element, 'mouseleave', this._hide);
            }

            if (this._config.trigger[i] == 'focus') {
                this._on(this._element, 'focusin', this._show);
                this._on(this._element, 'focusout', this._hide);
            }

            if (i == 0 && this._config.trigger[i] == 'once') {                
                this._on(this._element, 'mouseenter', onHoverDestroy);
                this._on(this._element, 'focusin', onHoverDestroy);
            }
        }

        this._on(document, 'keydown', onKeydown);

        this._dispatchEvent('initialize');

        if (this._config.trigger.length == 1 && this._config.trigger[0] == 'once') {                
            this.show();
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

export default Tooltip;