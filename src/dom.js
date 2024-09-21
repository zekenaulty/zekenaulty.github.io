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
    const { parent, classes, text, html, attributes, events, children } = options;
    const e = document.createElement(tag);

    if (text) e.textContent = text;
    if (html) e.innerHTML = html;
    if (classes) DOM.addClasses(e, classes);
    if (attributes) DOM.addAttributes(e, attributes);
    if (events) DOM.addEvents(e, events);
    if (children) {
      children.forEach(child => {
        DOM.append(child, e);
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
    //console.log(to);
    to ? to.appendChild(e) : DOM.body.appendChild(e);
  }

  static remove(e) {
    if (e && e.parentNode) {
      e.parentNode.removeChild(e);
    }
  }

  // Layout Components
  static container(options = {}) {
    const { fluid } = options;
    const classes = ['container'];
    if (fluid) classes.push('container-fluid');
    return DOM.element('div', { ...options, classes });
  }

  static row(options = {}) {
    const classes = ['row', ...(options.classes || [])];
    return DOM.element('div', { ...options, classes });
  }

  static col(options = {}) {
    const { size } = options;
    const classes = size ? [`col-${size}`] : ['col'];
    if (options.classes) classes.push(...options.classes);
    return DOM.element('div', { ...options, classes });
  }

  // Content Components

  static typography(tag, options = {}) {
    return DOM.element(tag, options);
  }

  static image(options = {}) {
    const { src, alt, classes } = options;
    return DOM.element('img', {
      ...options,
      classes: ['img-fluid', ...(classes || [])],
      attributes: { src, alt },
    });
  }

  static table(options = {}) {
    const classes = ['table', ...(options.classes || [])];
    return DOM.element('table', { ...options, classes });
  }

  static figure(options = {}) {
    const figure = DOM.element('figure', options);
    return figure;
  }

  // Forms

  static form(options = {}) {
    return DOM.element('form', options);
  }

  static formGroup(options = {}) {
    return DOM.element('div', { ...options, classes: ['mb-3', ...(options.classes || [])] });
  }

  static input(options = {}) {
    const { type = 'text', value, placeholder, name, id } = options;
    return DOM.element('input', {
      ...options,
      attributes: { type, value, placeholder, name, id },
      classes: ['form-control', ...(options.classes || [])],
    });
  }

  static select(options = {}) {
    return DOM.element('select', {
      ...options,
      classes: ['form-select', ...(options.classes || [])],
    });
  }

  static option(options = {}) {
    const { value, text, selected } = options;
    const attributes = { value };
    if (selected) attributes.selected = 'selected';
    return DOM.element('option', {
      ...options,
      text,
      attributes,
    });
  }

  static textarea(options = {}) {
    const { placeholder, name, id, rows } = options;
    return DOM.element('textarea', {
      ...options,
      attributes: { placeholder, name, id, rows },
      classes: ['form-control', ...(options.classes || [])],
    });
  }

  static checkbox(options = {}) {
    const { labelText, name, id, checked } = options;
    const wrapper = DOM.element('div', { classes: ['form-check'] });
    const input = DOM.element('input', {
      parent: wrapper,
      attributes: { type: 'checkbox', name, id },
      classes: ['form-check-input'],
    });
    if (checked) input.checked = true;
    const label = DOM.element('label', {
      parent: wrapper,
      attributes: { for: id },
      classes: ['form-check-label'],
      text: labelText,
    });
    return wrapper;
  }

  static radio(options = {}) {
    const { labelText, name, id, value, checked } = options;
    const wrapper = DOM.element('div', { classes: ['form-check'] });
    const input = DOM.element('input', {
      parent: wrapper,
      attributes: { type: 'radio', name, id, value },
      classes: ['form-check-input'],
    });
    if (checked) input.checked = true;
    const label = DOM.element('label', {
      parent: wrapper,
      attributes: { for: id },
      classes: ['form-check-label'],
      text: labelText,
    });
    return wrapper;
  }

  static inputGroup(options = {}) {
    return DOM.element('div', { ...options, classes: ['input-group', ...(options.classes || [])] });
  }

  static floatingLabel(options = {}) {
    const { labelText, inputElement } = options;
    const wrapper = DOM.element('div', { classes: ['form-floating'] });
    if (inputElement) DOM.append(inputElement, wrapper);
    DOM.element('label', { parent: wrapper, text: labelText });
    return wrapper;
  }

  // Components

  static alert(options = {}) {
    const { text, dismissible } = options;
    const classes = ['alert', 'alert-warning', ...(options.classes || [])];
    if (dismissible) classes.push('alert-dismissible', 'fade', 'show');

    const alert = DOM.element('div', { ...options, classes, text });
    if (dismissible) {
      const button = DOM.element('button', {
        parent: alert,
        classes: ['btn-close'],
        attributes: { type: 'button', 'data-bs-dismiss': 'alert', 'aria-label': 'Close' },
      });
    }
    return alert;
  }

  static badge(options = {}) {
    const { text } = options;
    const classes = ['badge', 'bg-primary', ...(options.classes || [])];
    return DOM.element('span', { ...options, classes, text });
  }

  static breadcrumb(options = {}) {
    const nav = DOM.element('nav', { attributes: { 'aria-label': 'breadcrumb' }, ...options });
    const ol = DOM.element('ol', { parent: nav, classes: ['breadcrumb'] });
    if (options.items && Array.isArray(options.items)) {
      options.items.forEach(item => {
        const liClasses = ['breadcrumb-item'];
        if (item.active) liClasses.push('active');
        const li = DOM.element('li', { parent: ol, classes: liClasses });
        if (item.href) {
          DOM.element('a', { parent: li, attributes: { href: item.href }, text: item.text });
        } else {
          li.textContent = item.text;
        }
      });
    }
    return nav;
  }

  static button(options = {}) {
    const classes = ['btn', ...(options.classes || ['btn-primary'])];
    return DOM.element('button', { ...options, classes });
  }

  static buttonGroup(options = {}) {
    const classes = ['btn-group', ...(options.classes || [])];
    const attributes = { role: 'group', ...(options.attributes || {}) };
    return DOM.element('div', { ...options, classes, attributes });
  }

  static card(options = {}) {
    const card = DOM.element('div', { ...options, classes: ['card', ...(options.classes || [])] });
    return card;
  }

  static carousel(options = {}) {
    const { id, items, controls, indicators } = options;
    const carousel = DOM.element('div', {
      classes: ['carousel', 'slide'],
      attributes: { 'data-bs-ride': 'carousel', id },
    });

    if (indicators && items && items.length > 0) {
      const ol = DOM.element('ol', { parent: carousel, classes: ['carousel-indicators'] });
      items.forEach((item, index) => {
        const li = DOM.element('li', {
          parent: ol,
          attributes: {
            'data-bs-target': `#${id}`,
            'data-bs-slide-to': index,
          },
          classes: index === 0 ? ['active'] : [],
        });
      });
    }

    const inner = DOM.element('div', { parent: carousel, classes: ['carousel-inner'] });
    if (items && items.length > 0) {
      items.forEach((item, index) => {
        const itemClasses = ['carousel-item'];
        if (index === 0) itemClasses.push('active');
        const carouselItem = DOM.element('div', { parent: inner, classes: itemClasses });
        if (item.imgSrc) {
          DOM.element('img', {
            parent: carouselItem,
            classes: ['d-block', 'w-100'],
            attributes: { src: item.imgSrc, alt: item.alt },
          });
        }
        if (item.caption) {
          const caption = DOM.element('div', { parent: carouselItem, classes: ['carousel-caption'] });
          caption.innerHTML = item.caption;
        }
      });
    }

    if (controls) {
      // Previous control
      DOM.element('a', {
        parent: carousel,
        classes: ['carousel-control-prev'],
        attributes: {
          href: `#${id}`,
          role: 'button',
          'data-bs-slide': 'prev',
        },
        children: [
          DOM.element('span', { classes: ['carousel-control-prev-icon'], attributes: { 'aria-hidden': 'true' } }),
          DOM.element('span', { classes: ['visually-hidden'], text: 'Previous' }),
        ],
      });

      // Next control
      DOM.element('a', {
        parent: carousel,
        classes: ['carousel-control-next'],
        attributes: {
          href: `#${id}`,
          role: 'button',
          'data-bs-slide': 'next',
        },
        children: [
          DOM.element('span', { classes: ['carousel-control-next-icon'], attributes: { 'aria-hidden': 'true' } }),
          DOM.element('span', { classes: ['visually-hidden'], text: 'Next' }),
        ],
      });
    }

    return carousel;
  }

  static collapse(options = {}) {
    const { targetId, toggleText } = options;
    const button = DOM.button({
      text: toggleText || 'Toggle',
      attributes: { 'data-bs-toggle': 'collapse', 'data-bs-target': `#${targetId}`, 'aria-expanded': 'false', 'aria-controls': targetId },
    });
    const content = DOM.element('div', {
      classes: ['collapse'],
      attributes: { id: targetId },
      ...options,
    });
    return { button, content };
  }

  static dropdown(options = {}) {
    const { buttonText, menuItems } = options;
    const dropdown = DOM.element('div', { classes: ['dropdown', ...(options.classes || [])] });
    const button = DOM.button({
      parent: dropdown,
      text: buttonText,
      classes: ['btn', 'dropdown-toggle'],
      attributes: { 'data-bs-toggle': 'dropdown', 'aria-expanded': 'false' },
    });
    const menu = DOM.element('ul', { parent: dropdown, classes: ['dropdown-menu'] });
    menuItems.forEach(item => {
      const li = DOM.element('li', { parent: menu });
      DOM.element('a', { parent: li, classes: ['dropdown-item'], attributes: { href: item.href }, text: item.text });
    });
    return dropdown;
  }

  static listGroup(options = {}) {
    const listGroup = DOM.element('ul', { classes: ['list-group', ...(options.classes || [])], ...options });
    if (options.items && Array.isArray(options.items)) {
      options.items.forEach(item => {
        const liClasses = ['list-group-item'];
        if (item.active) liClasses.push('active');
        DOM.element('li', { parent: listGroup, classes: liClasses, text: item.text });
      });
    }
    return listGroup;
  }

  static modal(options = {}) {
    const { id, title, bodyContent, footerContent, onClose } = options;

    const modal = DOM.element('div', {
      classes: ['modal', 'fade'],
      attributes: { id, tabindex: '-1', 'aria-labelledby': `${id}Label`, 'aria-hidden': 'true' },
    });

    const modalDialog = DOM.element('div', {
      parent: modal,
      classes: ['modal-dialog'],
    });

    const modalContent = DOM.element('div', {
      parent: modalDialog,
      classes: ['modal-content'],
    });

    if (title) {
      const modalHeader = DOM.element('div', {
        parent: modalContent,
        classes: ['modal-header'],
      });
      DOM.element('h5', {
        parent: modalHeader,
        classes: ['modal-title'],
        attributes: { id: `${id}Label` },
        text: title,
      });
      DOM.element('button', {
        parent: modalHeader,
        classes: ['btn-close'],
        attributes: { type: 'button', 'data-bs-dismiss': 'modal', 'aria-label': 'Close' },
      });
    }

    if (bodyContent) {
      DOM.element('div', {
        parent: modalContent,
        classes: ['modal-body'],
        html: bodyContent,
      });
    }

    if (footerContent) {
      DOM.element('div', {
        parent: modalContent,
        classes: ['modal-footer'],
        html: footerContent,
      });
    }

    // Append modal to body
    DOM.append(modal, document.body);

    // Event listener for closing
    if (onClose) {
      modal.addEventListener('hidden.bs.modal', onClose);
    }

    // Initialize modal using Bootstrap's JavaScript API
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    return modal;
  }

  static nav(options = {}) {
    const { items, tabs, pills } = options;
    const classes = ['nav', ...(options.classes || [])];
    if (tabs) classes.push('nav-tabs');
    if (pills) classes.push('nav-pills');

    const nav = DOM.element('ul', { classes, ...options });
    if (items && Array.isArray(items)) {
      items.forEach(item => {
        const liClasses = ['nav-item'];
        const li = DOM.element('li', { parent: nav, classes: liClasses });
        DOM.element('a', {
          parent: li,
          classes: ['nav-link', ...(item.active ? ['active'] : [])],
          attributes: { href: item.href },
          text: item.text,
        });
      });
    }
    return nav;
  }

  static navbar(options = {}) {
    const { brandText, brandHref, items, classes, schema, background, size } = options;
    const navbar = DOM.element('nav', {
      classes: [
        'navbar',
        `navbar-expand-${size ? size : 'lg'}`,
        `navbar-${schema ? schema : 'dark'}`,
        `bg-${background ? background : 'primary'}`,
        ...(classes ? classes : [])]
    });
    const container = DOM.container({ parent: navbar, fluid: true });

    if (brandText) {
      DOM.element('a', {
        parent: container,
        classes: ['navbar-brand'],
        attributes: { href: brandHref || '#' },
        text: brandText,
      });
    }

    navbar.toggleButton = DOM.element('button', {
      parent: container,
      classes: ['navbar-toggler'],
      attributes: {
        type: 'button',
        'data-bs-toggle': 'collapse',
        'data-bs-target': '#navbarSupportedContent',
        'aria-controls': 'navbarSupportedContent',
        'aria-expanded': 'false',
        'aria-label': 'Toggle navigation',
      },
      children: [DOM.element('span', { classes: ['navbar-toggler-icon'] })],
    });

    const collapseDiv = DOM.element('div', {
      parent: container,
      classes: ['collapse', 'navbar-collapse'],
      attributes: { id: 'navbarSupportedContent' },
    });

    if (items && Array.isArray(items)) {
      const navUl = DOM.element('ul', { parent: collapseDiv, classes: ['navbar-nav', 'me-auto', 'mb-2', 'mb-lg-0'] });
      items.forEach(item => {
        const li = DOM.element('li', { parent: navUl, classes: ['nav-item'] });
        DOM.element('a', {
          parent: li,
          classes: ['nav-link', ...(item.active ? ['active'] : [])],
          attributes: { href: item.href },
          text: item.text,
        });
      });
    }

    if (options.parent) {
      DOM.append(navbar, options.parent);
    }
    return navbar;
  }

  static pagination(options = {}) {
    const { pages, currentPage } = options;
    const ul = DOM.element('ul', { classes: ['pagination', ...(options.classes || [])], ...options });
    for (let i = 1; i <= pages; i++) {
      const liClasses = ['page-item'];
      if (i === currentPage) liClasses.push('active');
      const li = DOM.element('li', { parent: ul, classes: liClasses });
      DOM.element('a', {
        parent: li,
        classes: ['page-link'],
        attributes: { href: '#', 'data-page': i },
        text: i.toString(),
        events: options.pageClick ? { click: options.pageClick } : {},
      });
    }
    return ul;
  }

  static progress(options = {}) {
    const { value, max } = options;
    const progress = DOM.element('div', { classes: ['progress'], ...options });
    const bar = DOM.element('div', {
      parent: progress,
      classes: ['progress-bar'],
      attributes: { role: 'progressbar', style: `width: ${(value / max) * 100}%`, 'aria-valuenow': value, 'aria-valuemin': '0', 'aria-valuemax': max },
    });
    return progress;
  }

  static spinner(options = {}) {
    const { type = 'border', text } = options;
    const classes = [`spinner-${type}`, ...(options.classes || [])];
    const spinner = DOM.element('div', { classes, attributes: { role: 'status' }, ...options });
    if (text) {
      DOM.element('span', { parent: spinner, classes: ['visually-hidden'], text });
    }
    return spinner;
  }

  static toast(options = {}) {
    const { headerText, bodyText, delay = 5000 } = options;
    const toast = DOM.element('div', {
      classes: ['toast', 'fade', 'show'],
      attributes: { role: 'alert', 'aria-live': 'assertive', 'aria-atomic': 'true' },
      ...options,
    });

    const header = DOM.element('div', { parent: toast, classes: ['toast-header'] });
    DOM.element('strong', { parent: header, classes: ['me-auto'], text: headerText });
    DOM.element('small', { parent: header, text: 'Just now' });
    DOM.element('button', {
      parent: header,
      classes: ['btn-close'],
      attributes: { type: 'button', 'data-bs-dismiss': 'toast', 'aria-label': 'Close' },
    });

    DOM.element('div', { parent: toast, classes: ['toast-body'], text: bodyText });

    // Append to toast container or body
    const toastContainer = document.querySelector('.toast-container') || DOM.element('div', { classes: ['toast-container', 'position-fixed', 'bottom-0', 'end-0', 'p-3'], parent: DOM.body });
    DOM.append(toast, toastContainer);

    // Initialize toast using Bootstrap's JavaScript API
    const bootstrapToast = new bootstrap.Toast(toast, { delay });
    bootstrapToast.show();

    return toast;
  }

  static tooltip(element, options = {}) {
    const { title, placement } = options;
    element.setAttribute('data-bs-toggle', 'tooltip');
    element.setAttribute('data-bs-placement', placement || 'top');
    element.setAttribute('title', title);

    // Initialize tooltip using Bootstrap's JavaScript API
    const bootstrapTooltip = new bootstrap.Tooltip(element);
    return bootstrapTooltip;
  }

  static popover(element, options = {}) {
    const { title, content, placement } = options;
    element.setAttribute('data-bs-toggle', 'popover');
    element.setAttribute('data-bs-placement', placement || 'top');
    element.setAttribute('title', title);
    element.setAttribute('data-bs-content', content);

    // Initialize popover using Bootstrap's JavaScript API
    const bootstrapPopover = new bootstrap.Popover(element);
    return bootstrapPopover;
  }

  // Additional methods can be added for other components following this pattern
}
