export default function prop(type, defaultValue) {
  var useDefault = (arguments.length > 1);

  return function decorator(target, key) {
    var klass     = target.constructor,
        propTypes = klass.propTypes = klass.propTypes || {};
    propTypes[key] = type;

    return {
      // getter is called to get initial value and values thereafter
      //  props may not be initialised
      get() {
        var useDefault = !this.props || (typeof this.props[key] === 'undefined');
        return useDefault ? defaultValue : this.props[key];
      },
      // setter will be called on initially but not thereafter
      //  must be present to avoid errors
      set(value) {
      }
    };
  }
}
