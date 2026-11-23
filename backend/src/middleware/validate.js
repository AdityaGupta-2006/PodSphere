function validate(validatorFn) {
  return function (req, res, next) {
    if (typeof validatorFn !== "function") return next();
    const error = validatorFn(req.body);
    if (error) {
      return res.status(400).json({ error });
    }
    next();
  };
}

module.exports = validate;
