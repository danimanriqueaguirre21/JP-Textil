class AppError(Exception):
    status_code: int = 500
    code: str = "internal_error"
    message: str = "Internal server error"

    def __init__(self, message: str | None = None):
        super().__init__(message or self.message)
        if message:
            self.message = message


class NotFoundError(AppError):
    status_code = 404
    code = "not_found"
    message = "Resource not found"


class ConflictError(AppError):
    status_code = 409
    code = "conflict"
    message = "Conflict"


class UnauthorizedError(AppError):
    status_code = 401
    code = "unauthorized"
    message = "Unauthorized"


class ValidationError(AppError):
    status_code = 422
    code = "validation_error"
    message = "Validation error"

