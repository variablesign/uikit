import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';
import Pikaday from  '../plugins/pikaday/1.8.2/pikaday.js';
import { computePosition, offset, flip, shift, limitShift, autoUpdate } from '@floating-ui/dom';

const _component = 'datepicker';
const _defaults = {
    trigger: null,
    startRangeTarget: null,
    endRangeTarget: null,
    format: null,
    minDate: null,
    maxDate: null,
    toString: null,
    parse: null,
    defaultDate: null,
    setDefaultDate: false,
    firstDay: 0,
    yearRange: 10,
    showOtherDays: false,
    otherDaysSelection: false,
    blurFieldOnSelect : true,
    title: null,
    autoClose: true,
    showButtons: false,
    buttonsPlacement: 'bottom',
    previous: 'Previous',
    next: 'Next',
    buttons: ['cancel', 'apply'], // ['clear', 'cancel', 'today', 'apply']
    clear: 'Clear',
    today: 'Today',
    cancel: 'Cancel',
    apply: 'Apply',
    offset: 8,
    placement: 'bottom-start',
    weekdays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    events: [],
    calendarClass: '',
    headerClass: '',
    titleClass: '',
    weekdayClass: '',
    daysClass: '',
    dayClass: '',
    previousClass: '',
    nextClass: '',
    monthClass: '',
    yearClass: '',
    buttonsClass: '',
    clearClass: '',
    todayClass: '',
    cancelClass: '',
    applyClass: '',
};

class Datepicker extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this._component.allowTransitions();
        this.init();
    }

    init() {
        let autoUpdatePosition = () => void 0;
        
        this._config.trigger = typeof this._config.trigger == 'string'
            ? document.querySelector(this._config.trigger)
            : this._config.trigger;
        
        this._config.startRangeTarget = this._config.endRangeTarget == null && typeof this._config.startRangeTarget == 'string'
            ? document.querySelector(this._config.startRangeTarget)
            : this._config.startRangeTarget;
        
        this._config.endRangeTarget = this._config.startRangeTarget == null && typeof this._config.endRangeTarget == 'string'
            ? document.querySelector(this._config.endRangeTarget)
            : this._config.endRangeTarget;

        this._config.buttons = typeof this._config.buttons == 'string'
            ? this._config.buttons.split(' ')
            : this._config.buttons;

        const isRangePicker = () => {
            if (this._config.startRangeTarget || this._config.endRangeTarget) {
                return true;
            }

            return false;
        };

        const updateRangeDate = () => {
            if (!isRangePicker()) return;

            const date = this._pikaday.getDate();
            const range = UIkit.datepicker(this._config.startRangeTarget || this._config.endRangeTarget);

            if (this._config.endRangeTarget) {  
                range.hide();  
                this._pikaday.setStartRange(date);
                range.setStartRange(date);
                range.setMinDate(date);

                if (range.getDate()) {
                    this._pikaday.setEndRange(range.getDate());
                }
            } 
            
            if (this._config.startRangeTarget) {
                range.hide();
                this._pikaday.setEndRange(date);
                range.setEndRange(date);
                range.setMaxDate(date);

                if (range.getDate()) {
                    this._pikaday.setStartRange(range.getDate());
                }
            }
        };
        
        // Pikaday config
        let config = {
            field: this._element,
            reposition: false,
            showDaysInNextAndPreviousMonths: this._config.showOtherDays,
            enableSelectionDaysInNextAndPreviousMonths: this._config.otherDaysSelection,
            i18n: {
                previousMonth: this._config.previous,
                nextMonth: this._config.next,
                months: [
                    'January', 
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December'
                ],
                weekdays: [
                    'Sunday', 
                    'Monday', 
                    'Tuesday', 
                    'Wednesday', 
                    'Thursday', 
                    'Friday', 
                    'Saturday'
                ],
                weekdaysShort: this._config.weekdays
            }
        }


        config.onInitialize = () => {
            this._component.dispatch('initialize');
        };

        config.onBeforeOpen = () => {
            
            this._pikaday.el.style.display = 'none';

            const setPosition = () => {
                computePosition(this._element, this._pikaday.el, {
                    placement: this._config.placement,
                    middleware: [ 
                        offset(this._config.offset),
                        flip(),
                        shift({ 
                            padding: this._config.offset,
                            limiter: limitShift()
                        })
                    ]
                }).then(({ x, y, placement, middlewareData }) => {
                    const { offset, flip, shift, hide } = middlewareData;
    
                    Object.assign(this._pikaday.el.style, {
                        left: `${x}px`,
                        top: `${y}px`,
                        zIndex: 9999
                    });
                });
            };
    
            const updatePosition = () => { 
                if (!this._pikaday) return;

                return autoUpdate(this._element, this._pikaday.el, setPosition);
            };

            autoUpdatePosition = updatePosition();
            updateRangeDate();
            this._component.dispatch('show');
        };

        config.onOpen = () => {
            this._pikaday.el.style.display = 'block';
            
            this._component.transition('transitionEnter', this._pikaday.el, (e) => {
                this._component.dispatch('shown');
            });
        };

        config.onBeforeClose = () => {
            this._component.dispatch('hide');

            const transitioned = this._component.transition('transitionLeave', this._pikaday.el, (e) => {
                this._component.dispatch('hidden');
                autoUpdatePosition();
                this._pikaday.el.style.display = 'none';
            });

            if (!transitioned) {
                this._pikaday.el.style.display = 'none';
                this._component.dispatch('hidden');
                autoUpdatePosition();
            }
        };

        config.onClose = () => {
            
        };

        config.onDraw = () => {
            this._component.dispatch('draw');
        };

        config.onSelect = (e) => {
            updateRangeDate();
            this._component.dispatch('select');
        };

        if (!this._config.toString && this._config.format) {
            this._config.toString = (date, format) => {

                let formattedDate = '';
                const tokens = {
                    ddd: config.i18n.weekdays[date.getDay()].slice(0, 3),
                    dddd: config.i18n.weekdays[date.getDay()],
                    D: date.getDate().toString(),
                    DD: date.getDate().toString().padStart(2, '0'),
                    M: (date.getMonth() + 1).toString(),
                    MM: (date.getMonth() + 1).toString().padStart(2, '0'),
                    MMM: config.i18n.months[date.getMonth()].slice(0, 3),
                    MMMM: config.i18n.months[date.getMonth()],
                    YY: date.getFullYear().toString().slice(2),
                    YYYY: date.getFullYear().toString()
                };

                const delimiters = format.trim().match(/\W+/g);

                const parts = format.trim()
                    .replaceAll(/\W+/g, ' ')
                    .split(' ')
                    .filter(str => str.length > 0);

                const replacedParts = parts.map((part) => {
                     return tokens[part];
                }).filter(part => part);

                replacedParts.forEach((part, index) => {
                    formattedDate += part + (delimiters[index] && index < (replacedParts.length - 1) ? delimiters[index] : '');
                });

                return formattedDate;
            };
        }

        if (!this._config.parse && this._config.format) {
            this._config.parse = (dateString, format) => {
                return new Date(Date.parse(dateString));
            }
        }

        config = util.extendObjects(config, this._config);

        // Init Pikaday
        this._pikaday = new Pikaday(config);
    }

    toString(format) {
        return this._pikaday.toString(format);
    }

    getMoment() {
        return this._pikaday.getMoment();
    }

    setMoment(date) {
        this._pikaday.setMoment(date);
    }

    getDate() {
        return this._pikaday.getDate();
    }

    setDate(date) {
        this._pikaday.setDate(date);
    }

    gotoDate(date) {
        this._pikaday.gotoDate(date);
    }

    gotoToday() {
        this._pikaday.gotoDate(new Date());
    }

    gotoMonth(month) {
        this._pikaday.gotoMonth(month);
    }

    gotoYear(year) {
        this._pikaday.gotoYear(year);
    }

    setMinDate(date) {
        this._pikaday.setMinDate(date);
    }

    setMaxDate(date) {
        this._pikaday.setMaxDate(date);
    }

    setMinDate(date) {
        this._pikaday.setMinDate(date);
    }

    setStartRange(date) {
        this._pikaday.setStartRange(date);
    }

    setEndRange(date) {
        this._pikaday.setEndRange(date);
    }

    nextMonth() {
        this._pikaday.nextMonth();
    }

    previousMonth() {
        this._pikaday.prevMonth();
    }

    show() {
        this._pikaday.show();
    }

    hide() {
        this._pikaday.hide();
    }

    clear() {
        this._pikaday.clear();
    }

    destroy() {
        this._pikaday.destroy()
        super.destroy();
    }
}

uk.registerComponent(_component, Datepicker);

export {
    Datepicker
};