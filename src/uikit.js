import './core.js';
import Accordion from './components/accordion.js'; 
import Autogrow from './components/autogrow.js'; 
import Checkbox from './components/checkbox.js'; 
import Clipboard from './components/clipboard.js';
import DataTable from './components/datatable.js';
import Datepicker from './components/datepicker.js'; 
import Dismiss from './components/dismiss.js';
import Dropdown from './components/dropdown.js';
import DropzoneUploader from './components/dropzone.js';
import Fetch from './components/fetch.js';
import Highlight from './components/highlight.js';
import Input from './components/input.js';
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

// Register components for auto loading
UIkit.register({
    'accordion': Accordion,
    'autogrow': Autogrow,
    'checkbox': Checkbox,
    'clipboard': Clipboard,
    'datatable': DataTable,
    'datepicker': Datepicker,
    'dismiss': Dismiss,
    'dropdown': Dropdown,
    'dropzone': DropzoneUploader,
    'fetch': Fetch,
    'highlight': Highlight,
    'input': Input,
    'modal': Modal,
    'offcanvas': Offcanvas,
    'password': Password,
    'pincode': Pincode,
    'tab': Tab,
    'theme': Theme,
    'toast': Toast,
    'toggle': Toggle,
    'tooltip': Tooltip,
    'scroll': Scroll,
    'scrollspy': Scrollspy,
    'select': Select
});