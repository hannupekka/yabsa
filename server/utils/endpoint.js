const createJsonRoute = func => (req, res, next) => {
  try {
    func(req, res)
      .then(result => res.json(result))
      .catch(next);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createJsonRoute
};
