var http     = require('http');
var fs       = require('fs');
var path     = require('path');
var Promise  = require('bluebird');
var mustache = require('mustache');

module.exports = VenusHttp;

/**
 * @class VenusHttp
 * @constructor
 * @param {Venus} venus context object
 */
function VenusHttp(venus, config) {
  this.venus      = venus;
  this.namespaces = {};
  this.config     = config || {};
  this.port       = this.config.get('plugins.venus-http.port') || 7878;
}

/**
 * Initialize plugin
 */
VenusHttp.prototype.init = function () {
  this.addNamespaceHandler('', this.onIndexRequest, this);
  this.indexTl = fs.readFileSync(path.resolve(__dirname, '..', 'tl', 'index.tl')).toString();
};

/**
 * @property name
 */
VenusHttp.prototype.name = 'venus-http';

/**
 * Venus lifecycle stage: run
 */
VenusHttp.prototype.run = function () {
  return new Promise(function (resolve, reject) {
    this.server = http.createServer(this.routeRequest.bind(this));
    this.venus.debug('Trying to listen on port %s', this.port);
    this.server.listen(this.port, function (err) {
      if (err) {
        reject(err);
      } else {
        this.venus.info('Listening on port %s', this.port);

        // do not resolve promise since this would indicate execution is complete
        // store resolve function so that we can end the plugin at a later point
        // if needed
        this.end = resolve;
      }
    }.bind(this));
  }.bind(this));
};

/**
 * Venus lifecycle stage: exit
 */
VenusHttp.prototype.exit = function () {
  this.venus.debug('Exiting now.');
};

/**
 * @method routeRequest
 * @param {http.Request} request
 * @param {http.Response} response
 */
VenusHttp.prototype.routeRequest = function (request, response) {
  var namespace, handlers, routePath, url;

  url          = request.url.split('/');
  namespace    = url[1].toLowerCase();
  routePath    = url.slice(2).join('/').toLowerCase();
  handlers     = this.namespaces[namespace];
  request.path = '/' + routePath;

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
    fn: fn,
    ctx: ctx
  });

  this.venus.info('Added namespace handler for /' + namespace);
};

/**
 * @method onIndexRequest
 * @param {http.Request} request
 * @param {http.Response} response
 */
VenusHttp.prototype.onIndexRequest = function (request, response) {
  var data = {
    namespaces: Object.keys(this.namespaces).map(function (namespace) {
        return {
          route: namespace,
          handlerCount: this.namespaces[namespace].length
        };
    }, this)
  };

  response.setHeader('Content-Type', 'text/html');
  response.write(mustache.render(this.indexTl, data));
  response.end();
};
