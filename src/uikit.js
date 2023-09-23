import './core.js';
import Accordion from './components/accordion.js'; 
import Datepicker from './components/datepicker.js'; 
import Dismiss from './components/dismiss.js';
import Dropdown from './components/dropdown.js';
import Modal from './components/modal.js';
import Offcanvas from './components/offcanvas.js';
import Password from './components/password.js';
import Pincode from './components/pincode.js';
import Tab from './components/tab.js';
import Theme from  './components/theme.js';
import Toast from './components/toast.js';
import Toggle from './components/toggle.js';
import Tooltip from './components/tooltip.js';
import Scroll from './components/scroll.js';
import Scrollspy from './components/scrollspy.js';
import Select from './components/select.js';
import DataTable from './components/datatable.js';
import Clipboard from './components/clipboard.js';
import Highlight from './components/highlight.js';

// Register components for auto loading
UIkit.register({
    'accordion': Accordion,
    'datepicker': Datepicker,
    'dismiss': Dismiss,
    'dropdown': Dropdown,
    'modal': Modal,
    'offcanvas': Offcanvas,
    'tab': Tab,
    'theme': Theme,
    'toast': Toast,
    'toggle': Toggle,
    'tooltip': Tooltip,
    'scroll': Scroll,
    'scrollspy': Scrollspy,
    'select': Select,
    'password': Password,
    'pincode': Pincode,
    'datatable': DataTable,
    'clipboard': Clipboard,
    'highlight': Highlight
});