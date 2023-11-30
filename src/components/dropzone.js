import { getElement } from '../utils.js';
import Component from '../component.js';

class DropzoneUploader extends Component {
    constructor(element, config) {
        const _defaults = {
            url: null,
            create: null,
            template: null,
            customTemplate: null,
            autoProcessQueue: false,
            maxFiles: null,
            csrfToken: null,
            headers: null,
            previewsContainer: null,
            resizeWidth: null,
            resizeHeight: null,
            clickable: true,
            parallelUploads: 2,
            disablePreviews: false,
            maxFilesize: 256,
            filesizeBase: 1000,
            hiddenInputContainer: 'body'
        };

        const _component = {
            name: 'dropzone',
            element: element, 
            defaultConfig: _defaults, 
            config: config, 
            transitions: {
                enter: false,
                leave: false
            }
        };

        super(_component);

        if (!this._element || !this._config.url) return;

        this._config.create = this._config.create ? this._config.create : () => void 0;
        this._config.url = this._config.url != null ? this._config.url : this._element.form.action;

        this._config.previewsContainer = getElement(this._config.previewsContainer);

        const getTemplate = () => {
            return this._config.create[this._config.template](this._config);
        };

        if (this._config.csrfToken) {
            this._config.headers = Object.assign(this._config.headers ?? {}, {
                'X-CSRF-TOKEN': this._config.csrfToken
            });
        }

        if (this._config.template) {
            this._config.previewTemplate = getTemplate();
        }

        if (this._config.customTemplate) {
            this._config.previewTemplate = this._config.customTemplate;
        }

        this._dropzone = new Dropzone(this._element, this._config);

        // this._on(this._dropzone.hiddenFileInput, 'input', (e) => {

        //     if (this._config.maxFiles == 1) {
        //         this._dropzone.previewsContainer.innerHTML = '';
        //     }

        //     this._dispatchEvent('select', { target: e.target });
        // });

        this._dropzone.on('addedfile', (file) => {
            // const queued = this._dropzone.getQueuedFiles();

            // if (queued.length > 0 && this._config.maxFiles == 1) {
            //     this._dropzone.removeFile(queued[0]);
            // }

            this._dispatchEvent('addedFile', { file });
        });

        // this._dropzone.on('addedfiles', (files) => {
        //     console.log(files);
        // });

        this._dropzone.on('uploadprogress', (file, progress, bytesSent) => {
            this._dispatchEvent('uploadProgress', { file, progress, bytesSent });
        });

        this._dropzone.on('totaluploadprogress', (totalUploadProgress, totalBytes, totalBytesSent) => {
            this._dispatchEvent('totalUploadProgress', { totalUploadProgress, totalBytes, totalBytesSent });
        });

        this._dropzone.on('removedfile', (file) => this._dispatchEvent('removedFile', { file }));
        this._dropzone.on('error', (file, message) => this._dispatchEvent('error', { file, message }));
        this._dropzone.on('errormultiple', (files) => this._dispatchEvent('errorMultiple', { files }));
        this._dropzone.on('sending', (file, xhr, formData) => this._dispatchEvent('sending', { file, xhr, formData }));
        this._dropzone.on('sendingmultiple', (files) => this._dispatchEvent('sendingMultiple', { files }));
        this._dropzone.on('processing', (file) => this._dispatchEvent('processing', { file }));
        this._dropzone.on('processingmultiple', (files) => this._dispatchEvent('processingMultiple', { files }));
        this._dropzone.on('complete', (file) => this._dispatchEvent('complete', { file }));
        this._dropzone.on('completemultiple', (file) => this._dispatchEvent('completeMultiple', { file }));
        this._dropzone.on('cancel', (file) => this._dispatchEvent('cancel', { file }));
        this._dropzone.on('canceledmultiple', (file) => this._dispatchEvent('canceledMultiple', { file }));
        this._dropzone.on('queuecomplete', () => this._dispatchEvent('queueComplete'));
        this._dropzone.on('drop', () => this._dispatchEvent('drop'));
        this._dropzone.on('dragstart', () => this._dispatchEvent('dragstart'));
        this._dropzone.on('dragend', () => this._dispatchEvent('dragend'));
        this._dropzone.on('dragenter', () => this._dispatchEvent('dragenter'));
        this._dropzone.on('dragover', () => this._dispatchEvent('dragover'));
        this._dropzone.on('dragleave', () => this._dispatchEvent('dragleave'));
        this._dropzone.on('paste', () => this._dispatchEvent('paste'));

        this._dispatchEvent('initialize');
    }

    getQueuedFiles() {
        return this._dropzone.getQueuedFiles();
    }

    getAcceptedFiles() {
        return this._dropzone.getAcceptedFiles();
    }

    getRejectedFiles() {
        return this._dropzone.getRejectedFiles();
    }

    /**
     * Get queued or uploading files
     */
    getActiveFiles() {
        return this._dropzone.getActiveFiles();
    }

    getAddedFiles() {
        return this._dropzone.getAddedFiles();
    }

    getUploadingFiles() {
        return this._dropzone.getUploadingFiles();
    }

    getFiles() {
        return this._dropzone.files;
    }

    getFilesWithStatus(status) {
        return this._dropzone.getFilesWithStatus(status);
    }

    addFile(mockFile, imageUrl, callback, crossOrigin, resizeThumbnail) {
        if (imageUrl === undefined && mockFile.dataURL) {
            imageUrl = mockFile.dataURL;
        }

        this._dropzone.displayExistingFile(mockFile, imageUrl, callback, crossOrigin, resizeThumbnail);
    }

    removeFile(file) {
        this._dropzone.removeFile(file);
    }

    removeAllFiles(cancelUpload = false) {
        this._dropzone.removeAllFiles(cancelUpload);
    }
    
    destroy() {
        this._dropzone.disable();
        super.destroy();
    }
}

export default DropzoneUploader;