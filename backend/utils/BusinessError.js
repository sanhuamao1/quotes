class BusinessError extends Error {
  constructor(message, code = -1, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

module.exports = BusinessError;