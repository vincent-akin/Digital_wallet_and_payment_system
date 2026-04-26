import { HTTP_STATUS, MESSAGES } from "../utils/constants";

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: MESSAGES.FORBIDDEN
            });
        }
        next();
    };
};