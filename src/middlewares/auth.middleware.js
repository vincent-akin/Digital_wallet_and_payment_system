import { verifyAccessToken } from "../utils/jwt.js";
import { findUserById } from "../repositories/user.repository.js";
import { HTTP_STATUS, MESSAGES, ACCOUNT_STATUS } from "../utils/constants.js";

export const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
                success: false,
                message: MESSAGES.TOKEN_MISSING 
            });
        }

        //Extract token and verify
        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);

        // Find user by ID from token payload
        const user = await findUserById(decoded.id);
        if(!user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: MESSAGES.UNAUTHORIZED
            });
        }

        //Check if account is frozen, suspended, or deactivated
        if (user.accountStatus === ACCOUNT_STATUS.FROZEN) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: MESSAGES.ACCOUNT_FROZEN
            });
        }

        if (user.accountStatus === ACCOUNT_STATUS.SUSPENDED) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: MESSAGES.ACCOUNT_SUSPENDED
            });
        }

        // Attach user to request object
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            accountStatus: user.accountStatus
        };

        next();

    } catch (error) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: MESSAGES.UNAUTHORIZED
        });
    }
};