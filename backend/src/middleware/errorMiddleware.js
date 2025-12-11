function errorhandler(err, req, res, next) {
  console.error(err); // basic logging
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ success: false, error: message });
}
module.exports = errorhandler;
