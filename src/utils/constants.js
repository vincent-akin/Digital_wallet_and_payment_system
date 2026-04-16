export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    FORBIDDEN: 403,
    UNAUTHORIZED: 401,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    GATEWAY_TIMEOUT: 504,
    INTERNAL_SERVER_ERROR: 500
};

export const MESSAGES = {
    //Authentication
    REGISTER_SUCCESS: 'User registered successfully.',
    LOGIN_SUCCESS: 'Login successful.',
    LOGOUT_SUCCESS: 'Logout successful.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
    EMAIL_EXISTS: 'Email already exists.',
    UNAUTHORIZED: 'Unauthorized access.',
    FORBIDDEN: 'Forbidden access.',

    //User Management
    USER_NOT_FOUND: 'User not found.',
    ACCOUNT_FROZEN: 'Account is frozen. Please contact support.',
    ACCOUNT_SUSPENDED: 'Account is suspended. Please contact support.',
    ACCOUNT_DEACTIVATED: 'Account is deactivated. Please contact support.',
    PROFILE_UPDATED: 'Profile updated successfully.',
    PASSWORD_CHANGED: 'Password changed successfully.',
    INVALID_PASSWORD: 'Invalid current password.',
    USER_DELETED: 'User account deleted successfully.',

    //Wallet Management
    WALLET_NOT_FOUND: 'Wallet not found.',
    WALLET_CREATED: 'Wallet created successfully.',
    WALLET_UPDATED: 'Wallet updated successfully.',
    WALLET_DELETED: 'Wallet deleted successfully.',
    INSUFFICIENT_FUNDS: 'Insufficient funds in wallet.',
    SELF_TRANSFER: 'Cannot transfer to the same wallet.',

    //Transactions
    TRANSACTION_SUCCESS: 'Transaction completed successfully.',
    TRANSACTION_FAILED: 'Transaction failed. Please try again.',
    TRANSACTION_NOT_FOUND: 'Transaction not found.',
    ALREADY_PROCESSED: 'Transaction has already been processed.',
    ALREADY_REVERSED: 'Transaction has already been reversed.',
    DUPLICATE_REQUEST: 'Duplicate transaction request. Please wait and try again.',

    //General
    INTERNAL_ERROR: 'An internal server error occurred. Please try again later.',
};