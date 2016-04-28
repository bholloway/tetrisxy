/**
 * ES7 class property decorator for React props.
 *
 * Call the factory with the indicated parameters to receive the decorator proper.
 *
 * @param {function} type A property checking function, typically from React.PropTypes
 * @param {*} [defaultValue] Optional initialisation for the property
 * @returns {decorator} An ES7 class property decorator function
 */
export default function prop(type, defaultValue) {
  let useInitial = (arguments.length > 1);

  return function decorator(target, key) {
    let klass     = target.constructor,
        propTypes = klass.propTypes = klass.propTypes || {},
        defaultProps = klass.defaultProps = klass.defaultProps || {};

    // setup this property
    propTypes[key] = type;
    defaultProps[key] = defaultValue;

    return {
      // getter is called to get initial value and values thereafter
      //  props may not be initialised
      get() {
        return !this.props ? defaultValue : this.props[key];
      },
      // setter will be called on initially but not thereafter
      //  must be present to avoid errors
      set(value) {
      }
    };
  };
}