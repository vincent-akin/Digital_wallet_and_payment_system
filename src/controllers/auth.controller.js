import { registerUser, loginUser, updateUserService, deactivateUserService } from "../services/auth.service.js";
import { HTTP_STATUS, MESSAGES } from "../utils/constants.js";

export const register = async(req, res) => {
    try {
            const result = await registerUser(req.body);

            return res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: MESSAGES.REGISTRATION_SUCCESS,
                data: result
            });
    } catch (error) {
        return res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};

export const login = async(req, res) => {
    try {
        const result = await loginUser(req.body);

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGES.LOGIN_SUCCESS,
            data: result
        });
    } catch (error) {
        return res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};

export const updateUser = async(req, res) => {
    try {
        const result = await updateUserService(req.user.id, req.body);

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGES.UPDATE_SUCCESS,
            data: result
        });

    } catch (error) {
        return res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};

export const deactivateUser = async(req, res) => {
    try {
        await deactivateUserService(req.user.id);

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGES.DEACTIVATION_SUCCESS
        });
    } catch (error) {
        return res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};