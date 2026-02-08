module.exports = function (req, res, next) {
    console.log(`[Admin Middleware] Checking role for user: ${req.user?.id}, Role: ${req.user?.role}`);
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        console.log(`[Admin Middleware] Access Denied for role: ${req.user?.role}`);
        res.status(403).json({ msg: 'Access denied: Admins only' });
    }
};
