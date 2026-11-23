const requestCounts = new Map();

function rateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const max = options.max || 100;
  const message = options.message || "Too many requests. Please try again later.";

  return function (req, res, next) {
    const ip = req.ip || req.connection?.remoteAddress || "global";
    const now = Date.now();

    const record = requestCounts.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    requestCounts.set(ip, record);

    if (record.count > max) {
      return res.status(429).json({ error: message });
    }

    next();
  };
}

module.exports = rateLimiter;
