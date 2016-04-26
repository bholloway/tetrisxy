export default function state(initialValue) {

  return function decorator(target, key) {
    return {

      // state may require initialisation
      get() {
        if (!this.state || !(key in this.state)) {
          this.state = this.state || {};
          this.state[key] = initialValue;
        }
        return this.state[key];
      },

      // for hot module replacement only
      //  component.setState() must be called separately
      set(value) {
        if (this.state) {
          this.state[key] = value;
        }
      }
    };
  }
}
