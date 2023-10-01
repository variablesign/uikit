/**
 * Parse nested dataset key
 */
export const parseNestedDatasetKey = (keys, value, data) => {
	data = data || {};
	let key = keys[0].substr( 0, 1 ).toLowerCase() + keys[0].substr( 1 );

	if (!data[key]) {
		data[key] = {};
	}

	if (keys.length > 1) {
		keys.splice(0, 1);
		data[key] = parseNestedDatasetKey(keys, value, data[key]);
	} else {
		data[key] = value;
	}

	return data;
}

/**
 * Parse nested dataset
 */
export const parseNestedDataset = (dataset) => {
	let keys = Object.keys(dataset);
	let data = {};
    let value = null;
	for (let i = 0; i < keys.length; i++) {
		let key = keys[i];
		let splat = key.split('-');

        try {
            value = JSON.parse(dataset[key]);
        } catch (error) {
            value = dataset[key];
        }

		data = parseNestedDatasetKey(splat, value, data);
	}

	return data;
}

/**
 * A native JS extend() function
 *
 * Returns a new object instead, preserving all of the original objects
 * and their properties. Supported back to IE6.
 *
 * Usage:
 * 1.- Pass in the objects to merge as arguments.
 * 2.- For a deep extend, set the first argument to `true`.
 *
 * Example:
 * const object1 = {
 *     apple: 0,
 *     banana: { weight: 52, price: 100 },
 *     cherry: 97
 * };
 * const object2 = {
 *     banana: { price: 200 },
 *     durian: 100
 * };
 * const object3 = {
 *     apple: 'yum',
 *     pie: 3.214,
 *     applePie: true
 * }
 *
 * // create a new object by combining two or more objects:
 * const newObjectShallow = extend(object1, object2, object3);
 * const newObjectDeep = extend(true, object1, object2, object3);
 *
 * All credits to author.
 * https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
 */
export const extend = (...options) => {
    let extended = {};
    let deep = false;
    let i = 0;
    let length = options.length;

    // check if a deep merge
    if (typeof options[0] === 'boolean') {
        deep = options[0];
        i ++;
    }

    // merge the object into the extended object
    let merge = (obj) => {
        for (const prop in obj) if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            // if deep merge and property is an object, merge properties
            if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]')
                extended[prop] = extend(true, extended[prop], obj[prop]);
            else
                extended[prop] = obj[prop];
        }
    };

    // loop through each object and conduct a merge
    for (; i < length; i++) {
        let obj = options[i];
        merge(obj);
    }

    return extended;
};

/**
 * Replace object keys
 */
export const replaceObjectKeys = (object, search, replace = '') => {
	object = Object.entries(object).map(([key, value]) => {
        key = key == search ? key : key.replace(search, replace)
        key = key.charAt(0).toLowerCase() + key.slice(1);
        return [key, value];
    });

	return Object.fromEntries(object);
}

/**
 * Check if string is a valid html string
 */
export const isHtmlString = (string) => {
	if (typeof string === 'string' && string.indexOf('<') > -1) {
        return true;
    }

    return false;
}

/**
 * Check if element is visible
 */
export const isVisible = (element) => {
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}

/**
 * Convert HTML string to DOM node
 */
export const stringToDom = (html) => {
	if (html instanceof HTMLElement) {
        return html;
    }

    if (isHtmlString(html)) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();

        return template.content.firstChild;
    }

    return null;
}

/**
 * Escape HTML tags
 */
export const escapeHtml = (html) => {
	return html.replace(
		/[&<>'"]/g,
		tag =>
			({
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			"'": '&#39;',
			'"': '&quot;'
			}[tag] || tag)
		);
}

/**
 * Unescape HTML tags
 */
export const unescapeHtml = (html) => {
	return html.replace(
		/&amp;|&lt;|&gt;|&#39;|&quot;/g,
		tag =>
			({
			'&amp;': '&',
			'&lt;': '<',
			'&gt;': '>',
			'&#39;': "'",
			'&quot;': '"'
			}[tag] || tag)
		);
}

/**
 * Trim HTML starting white spaces
 */
export const trimHtml = (html) => {
	let matches = html.match(/ +/g);
    let initial = matches[0].length;
    let regex = RegExp(`\n {${initial}}`, 'g');

    return html.replace(regex, '\n').trim();
}

/**
 * Checks if value is a number
 */
export const isNumber = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Show element
 */
export const showElement = (element, display = 'inherit') => {
    if (!element) return;

    element.style.display = display;
}

/**
 * Hide element
 */
export const hideElement = (element, display = 'none') => {
    if (!element) return;

    element.style.display = display;
}

/**
 * Set styles
 */
export const styles = (element, styles = {}) => {
    if (!element) return;

    for (const styleName in styles) {
        element.style[styleName] = styles[styleName];
    }
}

/**
 * Set multiple attributes on element
 */
export const setAttributes = (element, attributes = {}) => {
    if (!element) return;

    for (const attribute in attributes) {
        element.setAttribute(kebabCase(attribute), attributes[attribute]);
    }
}

/**
 * Remove multiple attributes from element
 */
export const removeAttributes = (element, attributes = []) => {
    if (!element) return;

    for (const attribute of attributes) {
        element.removeAttribute(kebabCase(attribute));
    }
}

/**
 * Add class
 */
export const addClass = (element, classNames) => {
    if (!element) return;

    classNames = classNames ? classNames.split(' ') : [];
    element.classList.add(...classNames);
}

/**
 * Remove class
 */
export const removeClass = (element, classNames) => {
    if (!element) return;

    classNames = classNames ? classNames.split(' ') : [];
    element.classList.remove(...classNames);
}

/**
 * Adds a color-scheme meta tag to the document head
 */
export const createColorSchemeMeta = (theme) => {
    const themeMetaTag = document.querySelector('meta[name="color-scheme"]');
    const meta = document.createElement('meta');

    if (!themeMetaTag) {
        meta.name = 'color-scheme';
        meta.content = theme;
        document.head.appendChild(meta);

        return;
    }

    themeMetaTag.setAttribute('content', theme);
}

/**
 * Sets the dark mode theme
 */
export const setTheme = (theme = 'dark') => {
	document.documentElement.classList.add(theme);
    createColorSchemeMeta(theme);
}

/**
 * Removes the dark mode theme
 */
export const removeTheme = (theme = 'dark') => {
	document.documentElement.classList.remove(theme);
    createColorSchemeMeta('light');
}

/**
 * Returns the first element that matches the selector
 */
export const getElement = (selector, context = document) => {
	if (selector instanceof HTMLElement) {
        return selector;
    }

    return typeof selector === 'string' 
        ? context.querySelector(selector) 
        : null;
}

/**
 * Returns multiple elements that match the selector
 */
export const getElements = (selector, context = document) => {
	if (selector instanceof HTMLElement) {
        return selector;
    }

    return typeof selector === 'string'
        ? context.querySelectorAll(selector)
        : null;
}

/**
 * Capitalize the first letter of a string
 */
export const capitalize = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Convert string to camel case
 */
export const camelCase = string => {
    return string
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
        .replace(/\s+/g, '');
}

/**
 * Convert string to kebab case
 */
export const kebabCase = string => {
    return string
        .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * Converts a string to a URL-friendly slug
 */
export const slug = string => {
    return string
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Shuffle a string 
 * 
 * @param {String} string 
 */
export const shuffle = string => {
    return [...string].sort(()=>Math.random()-.5).join('');
}

/**
 * Random string generator 
 * 
 * @param {Number} length Accepts a number between 1 and 16
 */
export const randomString = (length) => {
    length = length >= 1 && length <= 16 ? length : 16; 

    const string = String(
        Date.now().toString(24) + Math.random().toString(24)
    ).replace(/\./g, '');

    return string.substring(string.length - length);
}

/**
 * Random number generator 
 * 
 * @param {Number} length Accepts a number between 1 and 24
 */
export const randomNumber = (length) => {
    length = length >= 1 && length <= 24 ? length : 24; 

    let string = String(
        Date.now().toString() + Math.random().toString()
    ).replace(/\./g, '');
    string = shuffle(string);

    return string.substring(string.length - length);
}