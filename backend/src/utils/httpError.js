// A small Error class that carries an HTTP status code (and optional details).
// Controllers `throw new HttpError(404, "Task not found")` and the central
// error handler turns it into a JSON response.
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

module.exports = HttpError;
