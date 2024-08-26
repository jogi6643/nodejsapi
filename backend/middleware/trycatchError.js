module.exports = (trycatachfunction) => (req, res, next) => {
    Promise.resolve(trycatachfunction(req, res, next)).catch(next);
  };
  