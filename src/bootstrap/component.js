import { DOM } from '../dom.js';

export class Component extends EventTarget {
    constructor(options = {}) {
        const { tag = 'div', parent = undefined } = options;
        super();
        this.tag = tag;

        if(parent) 
            this.parent = parent;

        this.e = DOM.element(tag, options);
        this.DOM = DOM;
        this.mounted = false;

        if(this.parent)
            this.mounted = true;
    }

    mount(parent) {
        if (this.mounted) this.unmount();
        if (parent) this.parent = parent;
        if (this.parent) {
            DOM.append(this.e, this.e.parent);
            this.mounted = true;
        } else { 
            console.error(`Component.mount: ${typeof this}, failed to mount => no parent.`);
            this.mounted = false; 
        }

        return this.mounted;
    }

    unmount() {
        DOM.remove(this.e);
        this.mounted = false;
    }

    show(dStyle = 'd-block') {
        this.e.classList.remove('d-none', 'fade');
        this.e.classList.add(dStyle, 'show');
    }

    hide(dStyle = 'd-block') {
        this.e.classList.remove(dStyle, 'show');
        this.e.classList.add('d-none');
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

    addChildren(children) {
        if (children) {
            children.forEach(child => {
                this.addChild(child);
            });
        }
    }

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
