/**
 * Bellek içi sabit pencereli istek sınırlayıcı.
 * Tek instance'lı dağıtım için yeterli; harici bağımlılık gerektirmez.
 */
function createRateLimiter({ windowMs = 60_000, max = 240 } = {}) {
  const hits = new Map();

  // Süresi dolan kayıtlar birikmesin diye pencere başına bir kez temizlenir.
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, windowMs);
  sweep.unref?.();

  return function rateLimit(req, res, next) {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    let entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    entry.count += 1;

    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', Math.max(0, max - entry.count));
    res.setHeader('RateLimit-Reset', Math.ceil((entry.resetAt - now) / 1000));

    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({ error: 'Çok fazla istek gönderildi. Biraz sonra tekrar deneyin.' });
    }

    next();
  };
}

module.exports = { createRateLimiter };
