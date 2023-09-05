import Component from '../component.js';

class Scrollspy extends Component {
    constructor(element, config) {

        const _defaults = {
            type: 'navigation',
            root: document,
            rootMargin: '0px',
            threshold: 0,
            offset: 0,
            trigger: null,
            target: null
        };

        const _component = {
            name: 'scrollspy',
            element: element, 
            defaultConfig: _defaults, 
            config: config
        };

        super(_component);

        this._triggers = document.querySelectorAll(this._config.trigger);
        this._targets = document.querySelectorAll(this._config.target);
        this._activeNav = null;

        this._scroller = this._config.root == window || this._config.root == document
            ? window 
            : document.querySelector(this._config.root);

        this._config.root = this._scroller == window 
            ? document.documentElement 
            : this._scroller;

        const callback = {};
        let initialScrollPosition = this._config.root.scrollTop;

        this._setActiveNavState = () => {
            for (const target of this._targets) {
                if (target.hash == '#' + this._activeNav) {
                    target.setAttribute('aria-current', true);
                } else {
                    target.setAttribute('aria-current', false);
                }
            }
        };

        this._onScrollNavigation = (e) => {
            this._setTimeout(() => {  
                const scrollPosition = this._config.root.scrollTop;

                if (this._triggers.length > 0) {      
                    if (scrollPosition < (this._triggers[0].offsetTop - this._config.offset)) {
                        this._activeNav = null;
                        this._setActiveNavState();
                    } else {
                        for (const trigger of this._triggers) {
                            if (scrollPosition >= (trigger.offsetTop - this._config.offset)) {
                                this._activeNav = trigger.id;
                                this._setActiveNavState();
                            }
                        }
                    }
                }

            }, 50);
        };

        // Type: Navigation
        if (this._config.type === 'navigation') { 
            this._onScrollNavigation();   
            this._on(this._scroller, 'scroll', this._onScrollNavigation);
        }

        // Navigation callback
        /* callback.navigation = (entries, observer) => {
            const skippedEntries = entries.filter(entry => entry.boundingClientRect.top < 0);
            const skippedEntriesTop = skippedEntries.map(entry => entry.boundingClientRect.top);
            const lastSkippedEntry = Math.max(...skippedEntriesTop);
            const lastSkippedEntryIndex = skippedEntriesTop.indexOf(lastSkippedEntry);
            const lastEntry = lastSkippedEntryIndex != -1 ? skippedEntries[lastSkippedEntryIndex] : null;

            for (const entry of entries) {
                const currentScrollPosition = window.scrollY;

                // On load
                if (currentScrollPosition == initialScrollPosition) {
                    let initialEntry = null;


                    for (const loadedEntry of entries) {
                        if (loadedEntry.isIntersecting) {
                            initialEntry = loadedEntry;
                            break;
                        }
                    }

                    if (initialEntry) {
                        this._setActiveNavState(initialEntry.target.id);
                        break;
                    }

                    if (lastEntry && !initialEntry) {
                        this._setActiveNavState(lastEntry.target.id);
                        break;
                    }
                } 

                // Scrolling down
                if (currentScrollPosition > initialScrollPosition) {
                    if (entry.isIntersecting) {
                        this._setActiveNavState(entry.target.id);
                    }
                } 
                
                // Scrolling up
                if (currentScrollPosition < initialScrollPosition) {
                    if (entry.isIntersecting) {
                        this._setActiveNavState(entry.target.id);
                    } else {
                        const index = [...this._triggers].indexOf(entry.target);
                        const current = index > 0 ? this._triggers[index - 1].id : null;
                        this._setActiveNavState(current);
                    }
                }

                initialScrollPosition = currentScrollPosition;
            }
        };
        
        this._observer = new IntersectionObserver(callback[this._config.type], this._config);  

        this._triggers.forEach((item) => {
            this._observer.observe(item);
        }); */
    }

    destroy() {
        // this._setActiveNavState();
        // this._triggers.forEach((item) => {
        //     this._observer.unobserve(item);
        // });
        super.destroy();
    }
}

export default Scrollspy;