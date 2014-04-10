var http = require('http');

module.exports = VenusHttp;

/**
 * @class VenusHttp
 * @constructor
 * @param {Venus} venus context object
 */
function VenusHttp(venus) {
  this.venus      = venus;
  this.info       = venus.info;
  this.debug      = venus.debug;
  this.namespaces = {};
  this.config     = venus.config['venus-http'] || {};
  this.port       = this.config.port || 7878;

  this.bindEvents(venus);
  this.addNamespaceHandler('', this.onIndexRequest, this);
};

/**
 * @method bindEvents
 * @param {Venus} venus context object
 */
VenusHttp.prototype.bindEvents = function (venus) {
  var events = this.venus.events;

  venus.on(events.VC_START, this.onStart.bind(this));
  venus.on('venus-http:register-namespace', this.onRegisterNamespace.bind(this));
};

/**
 * @method onStart
 */
VenusHttp.prototype.onStart = function () {
  this.server = http.createServer(this.routeRequest.bind(this));
  this.server.listen(this.port);
  this.info('Listening on port', this.info.yellow(this.port));
};

/**
 * @method routeRequest
 * @param {http.Request} request
 * @param {http.Response} response
 */
VenusHttp.prototype.routeRequest = function (request, response) {
  var namespace, handlers, path, url;

  url          = request.url.split('/');
  namespace    = url[1].toLowerCase();
  path         = url.slice(2).join('/').toLowerCase();
  handlers     = this.namespaces[namespace];
  request.path = '/' + path;

  if (!handlers) {
    response.end('VenusHttp: No handlers for namespace "' + namespace + '"');
  } else {
    handlers.forEach(function (handler) {
      handler.fn.call(handler.ctx, request, response);
    });
  }
};

/**
 * @method onRegisterNamespace
 */
VenusHttp.prototype.onRegisterNamespace = function (namespace, fn, ctx) {
  this.addNamespaceHandler(namespace, fn, ctx);
};

/**
 * @method addNamespaceHandler
 */
VenusHttp.prototype.addNamespaceHandler = function (namespace, fn, ctx) {
  var handlers = this.namespaces[namespace];

  if (!handlers) {
    handlers = this.namespaces[namespace] = [];
  }

  handlers.push({
    fn  : fn,
    ctx : ctx
  });

  this.info('Added namespace handler for', this.info.yellow('/' + namespace));
};

/**
 * @method onIndexRequest
 * @param {http.Request} request
 * @param {http.Response} response
 */
VenusHttp.prototype.onIndexRequest = function (request, response) {
  response.write('VenusHttp registered namespace handlers:\n');

  Object.keys(this.namespaces).forEach(function (namespace) {
    response.write('\n/' + namespace + ' (' + this.namespaces[namespace].length + ')');
  }, this);

  response.end();
};
