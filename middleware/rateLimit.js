const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
  windowMs: 60 * 1000, // 24 hrs in milliseconds
  max: 30,
  message: `You have exceeded the 30 requests in 1 min limit!`,
  keyGenerator: function (req) {
    return req.user._id;
  },
});
