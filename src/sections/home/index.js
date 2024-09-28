import { Section } from "../section";

export class Home extends Section {
    constructor(options = {}) {
    const n = ((options) => {
        const o = { ...options };
        o.classes = [
          ...(o.classes || [])];
        o.events = o.events ? o.events : {};
        o.styles = o.styles ? o.styles : {};
        o.attributes = o.attributes ? o.attributes : {};
        o.showHeader = false;
        o.sectionId = "home";
        return o;
      })(options);
      super(n);
      this.build(n);
    }

    build(options = {}) {

    }
}