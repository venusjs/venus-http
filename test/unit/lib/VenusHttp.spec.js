var VenusHttp = v.lib('VenusHttp');

describe('VenusHttp', function () {
  var plugin;

  before(function () {
    var venus = v.mock('venus')();
    var config = v.mock('config')();

    plugin = new VenusHttp(venus, config);
  });

  describe('#addNamespaceHandler', function () {
    it('should route request', function (done) {
      plugin.addNamespaceHandler('sample', function (request, response) {
        v.assert.equal(this.name, 'myctx');
        done();
      }, { name: 'myctx' });

      plugin.routeRequest({ url: '/sample' }, { end: v.spy() });
    });
  });
});
