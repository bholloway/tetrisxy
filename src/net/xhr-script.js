import Q from 'q';

/**
 * http://stackoverflow.com/a/35247060
 */
export default function xhrScript(url) {
  var deferred = Q.defer();

  var request = new XMLHttpRequest();
  events(true);
  request.open('GET', url, true);
  request.overrideMimeType('application/javascript');
  request.send();

  return deferred.promise;

  function onProgress(event) {
    if (event.lengthComputable) {
      deferred.notify(event.loaded / event.total);
    }
  }

  function onComplete() {

    // must check for bad response
    if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
      events(false);

      // add script before any remaining scripts so it executes next
      var head           = document.getElementsByTagName('head')[0],
          injectedScript = document.createElement('script');
      injectedScript.innerHTML = request.responseText;
      head.appendChild(injectedScript);

      // resolve
      deferred.resolve();
    }
    else {
      onError();
    }
  }

  function onError() {
    events(false);
    deferred.reject('Error loading ' + url);
  }

  function onCancel() {
    events(false);
    deferred.reject('Aborted ' + url);
  }

  function events(isAttach) {
    var methodName = isAttach ? 'addEventListener' : 'removeEventListener';
    request[methodName]("progress", onProgress);
    request[methodName]("load", onComplete);
    request[methodName]("error", onError);
    request[methodName]("abort", onCancel);
  }
}
