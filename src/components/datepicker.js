import { isNumber } from '../utils.js';
import Component from '../component.js';
import Pikaday from  '../plugins/pikaday/1.8.2/pikaday.js';
import { computePosition, offset, flip, shift, limitShift, autoUpdate } from '@floating-ui/dom';

class Datepicker extends Component {
    constructor(element, config) {

        const _defaults = {
            bound: undefined,
            trigger: null,
            container: undefined,
            startRange: null,
            endRange: null,
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
            focus : false,
            title: null,
            autoClose: true,
            showButtons: false,
            buttonsPlacement: 'bottom',
            previous: 'Previous',
            next: 'Next',
            buttons: ['cancel', 'apply'],
            clear: 'Clear',
            today: 'Today',
            cancel: 'Cancel',
            apply: 'Apply',
            offset: 8,
            placement: 'bottom-start',
            shortWeekdays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
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
            events: [],
            disableDay: null,
            classes: {
                wrapper: '',
                header: '',
                title: '',
                weekday: '',
                days: '',
                day: '',
                previous: '',
                next: '',
                month: '',
                year: '',
                buttons: '',
                clear: '',
                today: '',
                cancel: '',
                apply: ''
            }
        };

        const _component = {
            name: 'datepicker',
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

        let autoUpdatePosition = () => void 0;
        
        this._config.trigger = typeof this._config.trigger == 'string'
            ? document.querySelector(this._config.trigger)
            : this._config.trigger;
        
        this._config.container = typeof this._config.container == 'string'
            ? document.querySelector(this._config.container)
            : this._config.container;
        
        this._config.startRangeTarget = this._config.endRangeTarget == null && typeof this._config.startRangeTarget == 'string'
            ? document.querySelector(this._config.startRangeTarget)
            : this._config.startRangeTarget;
        
        this._config.endRangeTarget = this._config.startRangeTarget == null && typeof this._config.endRangeTarget == 'string'
            ? document.querySelector(this._config.endRangeTarget)
            : this._config.endRangeTarget;

        this._config.shortWeekdays = typeof this._config.shortWeekdays == 'string'
            ? this._config.shortWeekdays.split(' ')
            : this._config.shortWeekdays;

        this._config.weekdays = typeof this._config.weekdays == 'string'
            ? this._config.weekdays.split(' ')
            : this._config.weekdays;

        this._config.months = typeof this._config.months == 'string'
            ? this._config.months.split(' ')
            : this._config.months;

        this._config.buttons = typeof this._config.buttons == 'string'
            ? this._config.buttons.split(' ')
            : this._config.buttons;

        this._config.minDate = typeof this._config.minDate == 'string'
            ? new Date(Date.parse(this._config.minDate))
            : this._config.minDate;

        this._config.maxDate = typeof this._config.maxDate == 'string'
            ? new Date(Date.parse(this._config.maxDate))
            : this._config.maxDate;

        this._config.yearRange = typeof this._config.yearRange == 'string'
            ? this._config.yearRange.split(' ')
            : this._config.yearRange;

        this._config.yearRange = this._config.yearRange instanceof Array
            ? this._config.yearRange
            : this._config.yearRange;

        this._config.defaultDate = typeof this._config.defaultDate == 'string'
            ? new Date(Date.parse(this._config.defaultDate))
            : this._config.defaultDate;

        this._hasMoment = typeof moment === 'function';
        this._hasDayjs = typeof dayjs === 'function';

        this._isRangePicker = () => {
            if (this._config.startRangeTarget || this._config.endRangeTarget) {
                return true;
            }

            return false;
        };

        const updateRangeDate = () => {
            if (!this._isRangePicker()) return;

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

        const getOrdinalNumber = (number) => {
            const length = number.length - 1;
            number = parseInt(number).toString();
            const index = number.substring(length);
            const ordinals = {
                1: 'st',
                2: 'nd',
                3: 'rd'
            };

            return ordinals[index] ? number + ordinals[index] : number + 'th';
        };
        
        // Pikaday options
        let options = {
            field: this._element,
            reposition: false,
            bound: this._config.bound,
            trigger: this._config.trigger,
            container: this._config.container,
            startRange: this._config.startRange,
            endRange: this._config.endRange,
            format: this._config.format,
            minDate: this._config.minDate,
            maxDate: this._config.maxDate,
            toString: this._config.toString,
            parse: this._config.parse,
            defaultDate: this._config.defaultDate,
            setDefaultDate: this._config.setDefaultDate,
            firstDay: this._config.firstDay,
            yearRange: this._config.yearRange,
            showDaysInNextAndPreviousMonths: this._config.showOtherDays,
            enableSelectionDaysInNextAndPreviousMonths: this._config.otherDaysSelection,
            disableDayFn: this._config.disableDay,
            blurFieldOnSelect : !this._config.focus,
            title: this._config.title,
            autoClose: this._config.autoClose,
            showButtons: this._config.showButtons,
            buttonsPlacement: this._config.buttonsPlacement,
            previous: this._config.previous,
            next: this._config.next,
            buttons: this._config.buttons,
            clear: this._config.clear,
            today: this._config.today,
            cancel: this._config.cancel,
            apply: this._config.apply,
            events: this._config.events,
            calendarClass: this._config.classes.wrapper,
            headerClass: this._config.classes.header,
            titleClass: this._config.classes.title,
            weekdayClass: this._config.classes.weekday,
            daysClass: this._config.classes.days,
            dayClass: this._config.classes.day,
            previousClass: this._config.classes.previous,
            nextClass: this._config.classes.next,
            monthClass: this._config.classes.month,
            yearClass: this._config.classes.year,
            buttonsClass: this._config.classes.buttons,
            clearClass: this._config.classes.clear,
            todayClass: this._config.classes.today,
            cancelClass: this._config.classes.cancel,
            applyClass: this._config.classes.apply,
            i18n: {
                previousMonth: this._config.previous,
                nextMonth: this._config.next,
                months: this._config.months,
                weekdays: this._config.weekdays,
                weekdaysShort: this._config.shortWeekdays
            }
        }


        options.onInitialize = () => {
            this._dispatchEvent('initialize');
        };

        options.onBeforeOpen = () => {

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
                if (!this._pikaday || this._config.bound == false) return;

                return autoUpdate(this._element, this._pikaday.el, setPosition);
            };

            autoUpdatePosition = updatePosition();
            updateRangeDate();
            this._dispatchEvent('show');
        };

        options.onOpen = () => {
            if (this._config.bound != false) {                
                this._transition('transitionEnter', this._pikaday.el, (e) => {
                    this._dispatchEvent('shown');
                });
            }
        };

        options.onBeforeClose = () => {
            this._dispatchEvent('hide');

            if (this._config.bound != false) {
                const transitioned = this._transition('transitionLeave', this._pikaday.el, (e) => {
                    this._dispatchEvent('hidden');
                    autoUpdatePosition();
                    this._pikaday.el.style.display = 'none';
                });

                if (!transitioned) {
                    this._pikaday.el.style.display = 'none';
                    this._dispatchEvent('hidden');
                    autoUpdatePosition();
                }
            }
        };

        // options.onClose = () => {
            
        // };

        options.onDraw = () => {
            this._dispatchEvent('draw');
        };

        options.onSelect = (date, hasEvent) => {
            updateRangeDate();
            this._dispatchEvent('select', { date, hasEvent });
        };

        if (!this._config.toString && this._config.format && (!this._hasMoment || !this._hasDayjs)) {
            options.toString = (date, format) => {

                let formattedDate = '';
                const tokens = {
                    ddd: options.i18n.weekdays[date.getDay()].slice(0, 3),
                    dddd: options.i18n.weekdays[date.getDay()],
                    D: date.getDate().toString(),
                    DD: date.getDate().toString().padStart(2, '0'),
                    Do: getOrdinalNumber(date.getDate().toString()),
                    M: (date.getMonth() + 1).toString(),
                    MM: (date.getMonth() + 1).toString().padStart(2, '0'),
                    MMM: options.i18n.months[date.getMonth()].slice(0, 3),
                    MMMM: options.i18n.months[date.getMonth()],
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
                    if (delimiters && delimiters.length > 0) {
                        formattedDate += part + (delimiters[index] && index < (replacedParts.length - 1) ? delimiters[index] : '');

                        return;
                    }

                    formattedDate += part;
                });

                return formattedDate;
            };
        }

        if (!this._config.parse && this._config.format && (!this._hasMoment || !this._hasDayjs)) {
            options.parse = (dateString, format) => {
                let day = '', 
                    month = '', 
                    year = '';

                let dateParts = dateString.trim()
                .replaceAll(/\W+/g, ' ')
                .split(' ')
                .filter(str => str.length > 0);

                let formatParts = format.trim()
                .replaceAll(/\W+/g, ' ')
                .split(' ')
                .filter(str => str.length > 0)
                .map(str => str.charAt(0));

                formatParts.forEach((part, index) => {
                    switch (part) {
                        case 'Y':
                            year = dateParts[index] || '';
                            break;
                            
                        case 'M':
                            if (isNumber(dateParts[index])) {
                                month = dateParts[index] ? parseInt(dateParts[index]) - 1 : dateParts[index];
                            } else {
                                month = dateParts[index] || '';
                            }
                            break;

                        case 'D':
                            day = parseInt(dateParts[index]) || '';
                            break;
                    }
                });

                const date = (`${year} ${month} ${day}`).trim();

                return new Date(Date.parse(date));
            }
        }

        // Day.js toString function
        if (!this._config.toString && this._config.format && this._hasDayjs) {
            options.toString = (date, format) => {
                return dayjs(date).format(format);
            };
        }

        // Day.js parse function
        if (!this._config.parse && this._config.format && this._hasDayjs) {
            options.parse = (dateString, format) => {
                return dayjs(dateString, format).toDate();
            }
        }

        // Init Pikaday
        this._pikaday = new Pikaday(options);
    }

    toString(format) {
        if (this._hasMoment) {
            return moment(this._pikaday.getDate()).format(format);
        } else if (this._hasDayjs) {
            return dayjs(this._pikaday.getDate()).format(format);
        } else {
            return this._pikaday.toString(format);
        }
    }

    getDate() {
        if (this._hasMoment) {
            return this._pikaday.getDate() ? moment(this._pikaday.getDate()) : null;
        } else if (this._hasDayjs) {
            return this._pikaday.getDate() ? dayjs(this._pikaday.getDate()) : null;
        } else {
            return this._pikaday.getDate();
        }
    }

    setDate(date, silent = false) {

        if (this._isRangePicker()) {
            this._pikaday._o.minDate = null;
            this._pikaday._o.maxDate = null;
        }
        
        if (this._hasMoment || this._hasDayjs) {
            this._pikaday.setDate(date.toDate(), silent);
        } else {
            this._pikaday.setDate(date, silent);
        }
    }

    gotoDate(date) {
        if (this._hasMoment || this._hasDayjs) {
            this._pikaday.gotoDate(date.toDate());
        } else {
            this._pikaday.gotoDate(date);
        }
    }

    gotoToday() {
        this._pikaday.gotoDate(new Date());
    }

    gotoMonth(month) {
        month = parseInt(month) || month;
        this._pikaday.gotoMonth(month);
    }

    gotoYear(year) {
        if (year.toString().length != 4) return;

        this._pikaday.gotoYear(year);
    }

    setMinDate(date) {
        if (this._hasMoment || this._hasDayjs) {
            this._pikaday.setMinDate(date.toDate());
        } else {
            date = typeof date == 'string' ? new Date(Date.parse(date)) : date;
            this._pikaday.setMinDate(date);
        }
    }

    setMaxDate(date) {
        if (this._hasMoment || this._hasDayjs) {
            this._pikaday.setMaxDate(date.toDate());
        } else {
            date = typeof date == 'string' ? new Date(Date.parse(date)) : date;
            this._pikaday.setMaxDate(date);
        }
    }

    setStartRange(date) {
        if (this._hasMoment || this._hasDayjs) {
            this._pikaday.setStartRange(date.toDate());
        } else {
            date = typeof date == 'string' ? new Date(Date.parse(date)) : date;
            this._pikaday.setStartRange(date);
        }
    }

    setEndRange(date) {
        if (this._hasMoment || this._hasDayjs) {
            this._pikaday.setEndRange(date.toDate());
        } else {
            date = typeof date == 'string' ? new Date(Date.parse(date)) : date;
            this._pikaday.setEndRange(date);
        }
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

    update() {
        this._pikaday.draw();
    }

    destroy() {
        this._pikaday.destroy()
        super.destroy();
    }
}

export default Datepicker;