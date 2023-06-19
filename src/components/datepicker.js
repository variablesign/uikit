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
    firstDay: 0,
    yearRange: 10,
    showWeekNumber: false,
    showOtherDays: true,
    otherDaysSelection: true,
    blurFieldOnSelect : false,
    title: null,
    autoClose: true,
    showButtons: false,
    buttonsPlacement: 'bottom',
    previous: 'Previous',
    next: 'Next',
    buttons: ['cancel', 'apply'], // ['clear', 'cancel', 'today', 'apply']
    clearButton: 'Clear',
    todayButton: 'Today',
    cancelButton: 'Cancel',
    applyButton: 'Set Date',
    offset: 8,
    placement: 'bottom-start',
    weekdays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    events: ['Sat Jun 24 2023'],
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
    clearButtonClass: '',
    todayButtonClass: '',
    cancelButtonClass: '',
    applyButtonClass: '',
};

class Datepicker extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
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
            const picker = UIkit.datepicker(this._config.startRangeTarget || this._config.endRangeTarget);

            if (this._config.endRangeTarget) {        
                this._pikaday.setStartRange(date);
                picker.setStartRange(date);
                picker.setMinDate(date);
            } 
            
            if (this._config.startRangeTarget) {
                this._pikaday.setEndRange(date);
                picker.setEndRange(date);
                picker.setMaxDate(date);
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
            
        };

        config.onOpen = () => {

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
        };

        config.onClose = () => {
            autoUpdatePosition();
        };

        config.onSelect = (e) => {
            updateRangeDate();
        };

        config = util.extendObjects(config, this._config);

        this._pikaday = new Pikaday(config);
    }

    toString(format) {
        this._pikaday.toString(format);
    }

    getMoment() {
        this._pikaday.getMoment();
    }

    setMoment(date) {
        this._pikaday.setMoment(date);
    }

    getDate() {
        this._pikaday.getDate();
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