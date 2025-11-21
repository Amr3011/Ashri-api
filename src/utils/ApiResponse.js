/**
 * Standard API Response Helpers
 * Ensures consistent response format across all endpoints
 */

class ApiResponse {
  /**
   * Success response
   * @param {Object} res - Express response object
   * @param {Number} statusCode - HTTP status code
   * @param {String} message - Success message
   * @param {*} data - Response data
   */
  static success(res, statusCode = 200, message, data = null) {
    const response = {
      success: true,
      message,
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Error response
   * @param {Object} res - Express response object
   * @param {Number} statusCode - HTTP status code
   * @param {String} message - Error message
   * @param {Array} errors - Array of validation errors
   */
  static error(res, statusCode = 500, message, errors = null) {
    const response = {
      success: false,
      message,
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Paginated response
   * @param {Object} res - Express response object
   * @param {Array} data - Array of items
   * @param {Number} page - Current page
   * @param {Number} limit - Items per page
   * @param {Number} total - Total items count
   */
  static paginated(res, data, page, limit, total) {
    return res.status(200).json({
      success: true,
      count: data.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data,
    });
  }
}

module.exports = ApiResponse;
