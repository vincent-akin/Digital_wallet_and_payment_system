import { getWallet, fundWallet, transferFunds } from '../services/wallet.service.js';
import { HTTP_STATUS, MESSAGES } from '../utils/constants.js';

export const getWalletController = async (req, res) => {
    try {
        const wallet = await getWallet(req.user.id);
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Wallet retrieved successfully',
            data: wallet,
        });
    } catch (error) {
        return res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || MESSAGES.INTERNAL_ERROR,
        });
    }
};

export const fundWalletController = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Invalid amount',
            });
        }

        const result = await fundWallet(req.user.id, amount);
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Wallet funded successfully',
            data: result,
        });
    } catch (error) {
        return res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || MESSAGES.INTERNAL_ERROR,
        });
    }
};

export const transferController = async (req, res) => {
    try {
        const { receiverWalletId, amount } = req.body;

        if (!receiverWalletId || !amount || Number(amount) <= 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Receiver wallet ID and valid amount are required',
            });
        }

        const result = await transferFunds(req.user.id, receiverWalletId, amount);
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGES.TRANSACTION_SUCCESS,
            data: result,
        });
    } catch (error) {
        return res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || MESSAGES.INTERNAL_ERROR,
        });
    }
};