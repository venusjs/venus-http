module.exports = function () {
  return {
    info: v.spy(),
    debug: v.spy(),
    error: v.spy()
  };
};
