module.exports = VenusHttp;

/**
 * @class VenusHttp
 * @constructor
 * @param {Venus} venus context object
 */
function VenusHttp(venus, log) {
  this.venus = venus;
  this.log   = log;

  this.bindEvents(venus);
};

/**
 * @method bindEvents
 * @param {Venus} venus context object
 */
VenusHttp.prototype.bindEvents = function (venus) {
  var events = this.venus.events;

  venus.on(events.VC_START, this.onStart.bind(this));
};

/**
 * @method onStart
 */
VenusHttp.prototype.onStart = function () {
  this.log('init venus http');
};
