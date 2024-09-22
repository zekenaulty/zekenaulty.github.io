export class DOM {
  // Stores the current theme stylesheet element
  static currentThemeLink = null;

  // Method to switch between Bootswatch themes at runtime
  static switchTheme(themeName = 'darkly') {
    const themeUrl = `https://cdn.jsdelivr.net/npm/bootswatch@5/dist/${themeName}/bootstrap.min.css`;

    if (DOM.currentThemeLink) {
      DOM.currentThemeLink.href = themeUrl;
    } else {
      DOM.currentThemeLink = DOM.stylesheet(themeUrl, 'bootswatch-theme');
    }
  }

  static stylesheet(path, id) {
    let e = document.getElementById(id);
    if (!e) {
      e = document.createElement('link');
      e.id = id;
      e.rel = 'stylesheet';
      e.href = path;
      DOM.head.appendChild(e);
    } else {
      e.href = path;
    }
    return e;
  }

  static get head() {
    return document.head;
  }

  static get body() {
    return document.body;
  }

  static element(tag, options = {}) {
    const { parent, classes, text, html, attributes, events, children, styles } = options;
    const e = document.createElement(tag);

    tag = tag.toLowerCase();

    if (text) e.textContent = text;
    if (html) e.innerHTML = html;
    if (classes) DOM.addClasses(e, classes);
    if (attributes) DOM.addAttributes(e, attributes);
    if (events) DOM.addEvents(e, events);
    if (styles) Object.assign(e.style, styles);

    if (children && tag !== 'select') {
      children.forEach(child => {
        DOM.append(child, e);
      });
    } else if (tag === 'select' && options.options) {
      options.options.forEach((item, index) => {
        const op = document.createElement("option");
        Object.assign(op, item);
        op.id = index;
        e.add(op);
      });
    }

    if (parent) DOM.append(e, parent);

    return e;
  }

  static addAttributes(e, attributes) {
    Object.keys(attributes).forEach(key => {
      e.setAttribute(key, attributes[key]);
    });
  }

  static addEvents(e, events) {
    Object.keys(events).forEach(eventType => {
      e.addEventListener(eventType, events[eventType]);
    });
  }

  static addClasses(e, classes) {
    if (Array.isArray(classes)) {
      e.classList.add(...classes);
    } else if (classes) {
      e.classList.add(classes);
    }
  }

  static append(e, to) {
    to ? to.appendChild(e) : DOM.body.appendChild(e);
  }

  static remove(e) {
    if (e && e.parentNode) {
      e.parentNode.removeChild(e);
    }
  }

}
