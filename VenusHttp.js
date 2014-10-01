var http    = require('http');
var Promise = require('bluebird');

module.exports = VenusHttp;

/**
 * @class VenusHttp
 * @constructor
 * @param {Venus} venus context object
 */
function VenusHttp(venus, config) {
  this.venus      = venus;
  this.info       = venus.info;
  this.debug      = venus.debug;
  this.error      = venus.error;
  this.namespaces = {};
  this.config     = config || {};
  this.port       = this.config.port || 7878;
};

/**
 * Initialize plugin
 */
VenusHttp.prototype.init = function () {
  this.addNamespaceHandler('', this.onIndexRequest, this);
};

/**
 * @property name
 */
VenusHttp.prototype.name = 'venus-http';

/**
 * @method onStart
 */
VenusHttp.prototype.run = function () {
  return new Promise(function (resolve, reject) {
    this.server = http.createServer(this.routeRequest.bind(this));
    this.server.listen(this.port, function (err) {
      if (err) {
        reject(err);
      } else {
        this.info('Listening on port', this.port);
        resolve();
      }
    }.bind(this));
  }.bind(this));
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

  this.info('Added namespace handler for /' + namespace);
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
