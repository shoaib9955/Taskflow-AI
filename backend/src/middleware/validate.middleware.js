import ApiError from "../utils/ApiError.js";

const validate = (schema) => {
  return (req, res, next) => {
    const data = {};

    if (schema.describe().keys?.body) {
      data.body = req.body;
    }

    if (schema.describe().keys?.params) {
      data.params = req.params;
    }

    if (schema.describe().keys?.query) {
      data.query = req.query;
    }

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return next(new ApiError(400, "Validation failed", errors));
    }

    if (value.body) req.body = value.body;

    if (value.params) req.params = value.params;

    if (value.query) Object.assign(req.query, value.query);

    next();
  };
};

export default validate;
