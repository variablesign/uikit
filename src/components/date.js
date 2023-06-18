import * as util from '../utils.js';
import uk from '../uikit.js';
import Component from '../component.js';
import Pikaday from  '../plugins/pikaday/pikaday.js';
import { computePosition, offset, flip, shift, limitShift, autoUpdate } from '@floating-ui/dom';

const _component = 'date';
const _defaults = {
    format: null,
    showOtherDays: true,
    otherDaysSelection: true,
    blurFieldOnSelect : false,
    heading: null,
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
    events: [],
    wrapperClass: '',
    headingClass: '',
    titleClass: '',
    weekdayClass: '',
    allDaysClass: '',
    dayClass: '',
    todayClass: '',
    selectedClass: '',
    otherDaysClass: '',
    otherDaysDisabledClass: '',
    previousClass: '',
    nextClass: '',
    monthClass: '',
    yearClass: '',
    monthArrow: '',
    yearArrow: '',
    monthSelectClass: '',
    yearSelectClass: '',
    buttonsClass: '',
    clearButtonClass: '',
    todayButtonClass: '',
    cancelButtonClass: '',
    applyButtonClass: '',
    eventClass: '',
    selectedEventClass: ''
};

class Date extends Component {
    constructor(element, config) {
        super(element, config, _defaults, _component);
        this.init();
    }

    init() {
        let autoUpdatePosition = () => void 0;
        this._config.buttons = typeof this._config.buttons == 'string'
            ? this._config.buttons.split(' ')
            : this._config.buttons;
        
        // Pikaday config
        let config = {
            field: this._element,
            reposition: false,
            showDaysInNextAndPreviousMonths: this._config.showOtherDays,
            enableSelectionDaysInNextAndPreviousMonths: this._config.otherDaysSelection,
            isTodayClass: this._config.todayClass,
            isSelectedClass: this._config.selectedClass,
            isOutsideMonthClass: this._config.otherDaysClass,
            isSelectedDisabledClass: this._config.otherDaysDisabledClass,
            hasEventClass: this._config.eventClass,
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
                return autoUpdate(this._element, this._pikaday.el, setPosition);
            };

            autoUpdatePosition = updatePosition();
        };

        config.onClose = () => {
            autoUpdatePosition();
        };

        config.onSelect = (e) => {
            
        };

        config = util.extendObjects(config, this._config);

        this._pikaday = new Pikaday(config);
    }

    destroy() {
        this._pikaday.destroy()
        super.destroy();
    }
}

uk.registerComponent(_component, Date);

export {
    Date
};