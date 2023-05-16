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
	var keys = Object.keys(dataset);
	var data = {};
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		var value = dataset[key];
		var splat = key.split('-');

		data = parseNestedDatasetKey(splat, value, data);
	}

	return data;
}

/**
 * Merge objects into one
 */
export const extendObjects = (...objects) => {
	let obj;
	let item;
	let objectsList = [];

	for (let index in objects) {
		item = objects[index] ? parseNestedDataset(objects[index]) : {};
		obj = Object.fromEntries(
			Object.entries(item).map(([key, value]) => {
				try {
					value = JSON.parse(value);
				} catch (error) {
					value = value;
				}
				return [key, value];
			})
		);
		
		objectsList.push(obj);
	}

	return Object.assign(...objectsList);
}

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
export const show = (element, display = 'block') => {
    element.style.display = display;
}

/**
 * Hide element
 */
export const hide = (element, display = 'none') => {
    element.style.display = display;
}

/**
 * Set multiple attributes on element
 */
export const setAttributes = (element, attributes = {}) => {
    for (const attribute in attributes) {
        element.setAttribute(attribute, attributes[attribute]);
    }
}

/**
 * Remove multiple attributes from element
 */
export const removeAttributes = (element, attributes = []) => {
    for (const attribute of attributes) {
        element.removeAttribute(attribute);
    }
}

/**
 * Add class
 */
export const addClass = (element, classNames) => {
    classNames = classNames ? classNames.split(' ') : [];
    element.classList.add(...classNames);
}

/**
 * Remove class
 */
export const removeClass = (element, classNames) => {
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

    return context.querySelector(selector);
}

/**
 * Returns multiple elements that match the selector
 */
export const getElements = (selector, context = document) => {
	if (selector instanceof HTMLElement) {
        return selector;
    }

    return context.querySelectorAll(selector);
}

/**
 * Capitalize the first letter of a string
 */
export const capitalize = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
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