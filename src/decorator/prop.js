/**
 * ES7 class property decorator for React props.
 *
 * Call the factory with the indicated parameters to receive the decorator proper.
 *
 * @param {function} type A property checking function, typically from React.PropTypes
 * @param {*} [initialValue] Optional initialisation for the property
 * @returns {decorator} An ES7 class property decorator function
 */
export default function prop(type, initialValue) {
  let useInitial = (arguments.length > 1);

  return function decorator(target, key) {
    let klass     = target.constructor,
        propTypes = klass.propTypes = klass.propTypes || {};
    propTypes[key] = type;

    return {
      // getter is called to get initial value and values thereafter
      //  props may not be initialised
      get() {
        let useDefault = !this.props || (typeof this.props[key] === 'undefined');
        return useDefault ? initialValue : this.props[key];
      },
      // setter will be called on initially but not thereafter
      //  must be present to avoid errors
      set(value) {
      }
    };
  }
}
