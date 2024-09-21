import { DOM } from './dom.js';

export class Component extends EventTarget {
    static MOUNTED = new CustomEvent('mounted');
    static UNMOUNTED = new CustomEvent('unmounted');
    static SHOWN = new CustomEvent('shown');
    static HIDDEN = new CustomEvent('hidden');

    constructor(options = {}) {
        const { tag = 'div', parent = DOM.body, classes, text, html, attributes, events, children } = options;
        super();
        this.tag = tag;
        this.parent = parent;
        this.e = document.createElement(tag);

        if (text) this.e.textContent = text;
        if (html) this.e.innerHTML = html;
        if (classes) DOM.addClasses(this.e, classes);
        if (attributes) DOM.addAttributes(this.e, attributes);
        if (events) DOM.addEvents(this.e, events);
        if (children) {
            children.forEach(child => {
                DOM.append(child, this.e);
            });
        }
    }

    mount() {
        if (this.parent) DOM.append(this.e, this.parent);
        this.dispatchEvent(this.constructor.MOUNTED);
    }

    unmount() {
        DOM.remove(this.e);
        this.dispatchEvent(this.constructor.UNMOUNTED);
    }

    show(dStyle = 'd-block') {
        this.e.classList.remove('d-none', 'fade');
        this.e.classList.add(dStyle, 'show');
        this.dispatchEvent(this.constructor.SHOWN);
    }

    hide(dStyle = 'd-block') {
        this.e.classList.remove(dStyle, 'show');
        this.e.classList.add('d-none');
        this.dispatchEvent(this.constructor.HIDDEN);
    }

    toggle(dStyle = 'd-block') {
        if (this.e.classList.contains('d-none')) {
            this.show(dStyle);
        } else {
            this.hide(dStyle);
        }
    }

    fade(dStyle = 'd-block', interval = 300) {
        if (this.e.classList.contains('d-none')) {
            this.e.classList.remove('d-none');
            this.e.classList.add(dStyle, 'show');
            setTimeout(() => {
                this.e.classList.add('fade');
            }, 10);
        } else {
            this.e.classList.remove('fade');
            setTimeout(() => {
                this.e.classList.remove(dStyle, 'show');
                this.e.classList.add('d-none');
            }, interval);
        }
    }

    setText(content) {
        this.e.textContent = content;
    }

    setHTML(content) {
        this.e.innerHTML = content;
    }

    addClass(classes) {
        this.e.classList.add(...classes.split(' '));
    }

    removeClass(classes) {
        this.e.classList.remove(...classes.split(' '));
    }

    toggleClass(className) {
        this.e.classList.toggle(className);
    }

    setAttribute(attr, value) {
        this.e.setAttribute(attr, value);
    }

    removeAttribute(attr) {
        this.e.removeAttribute(attr);
    }

    on(eventType, callback) {
        this.e.addEventListener(eventType, callback);
    }

    off(eventType, callback) {
        this.e.removeEventListener(eventType, callback);
    }

    trigger(eventName) {
        const event = new Event(eventName);
        this.e.dispatchEvent(event);
    }

    updateAttributes(attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            this.e.setAttribute(key, value);
        });
    }

    /**
     * Adds a child component or DOM element to this component.
     * Handles both raw DOM nodes and other Component instances.
     * @param {Component|HTMLElement} child - The child to be added
     */
    addChild(child) {
        if (child instanceof Component) {
            // If it's a Component, append its `e` DOM node
            this.e.appendChild(child.e);
            this.children.push(child); // Add the component to the child mapping
        } else if (child instanceof HTMLElement) {
            // If it's a raw DOM element, append it directly
            this.e.appendChild(child);
        } else {
            throw new Error("Child must be a Component or HTMLElement");
        }
    }

    /**
     * Removes a child component or DOM element from this component.
     * Automatically detects whether the child is a Component or a DOM node.
     * @param {Component|HTMLElement} child - The child to be removed
     */
    removeChild(child) {
        if (child instanceof Component) {
            // If it's a Component, remove its `e` DOM node
            this.e.removeChild(child.e);
            this.children = this.children.filter(c => c !== child); // Remove from child mapping
        } else if (child instanceof HTMLElement) {
            this.e.removeChild(child);
        } else {
            throw new Error("Child must be a Component or HTMLElement");
        }
    }

    enable() {
        this.e.removeAttribute('disabled');
    }

    disable() {
        this.e.setAttribute('disabled', true);
    }

    updateStyles(styles) {
        Object.assign(this.e.style, styles);
    }

    popover(options) {
        new bootstrap.Popover(this.e, options);
    }

    tooltip(options) {
        new bootstrap.Tooltip(this.e, options);
    }

    collapseToggle() {
        const collapseInstance = bootstrap.Collapse.getOrCreateInstance(this.e);
        collapseInstance.toggle();
    }

    scrollTo(behavior = 'smooth') {
        this.e.scrollIntoView({ behavior });
    }
}
