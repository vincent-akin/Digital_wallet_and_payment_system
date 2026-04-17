import prisma from '../db/prisma.js';
import { createUser, deactivateUser, findUserByEmail, findUserById } from '../repositories/user.repository.js';
import { createWallet } from '../repositories/wallet.repository.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { HTTP_STATUS, MESSAGES } from '../utils/constants.js';

export const registerUser = async(data) => {
    const { email, password } = data;

    // Check if email already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        const error = new Error(MESSAGES.EMAIL_EXISTS);
        error.statusCode = HTTP_STATUS.CONFLICT;
        throw error;
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the user and wallet in one atomic transaction
    const user = await prisma.$transaction(async (tx) => {
        
    const newUser = await createUser({ email, password: hashedPassword }, tx);
        await createWallet({ userId: newUser.id }, tx);
        return newUser;
    });

    // Generate tokens
    const payload = { id: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    };
};

export const loginUser = async({ email, password }) => {
    //find user by email
    const user = await findUserByEmail(email);

    if (!user) {
        const error = new Error(MESSAGES.INVALID_CREDENTIALS);
        error.statusCode = HTTP_STATUS.UNAUTHORIZED;
        throw error;
    }

    // Check if account is frozen, suspended, or deactivated
    if (user.accountStatus === 'frozen') {
        const error = new Error(MESSAGES.ACCOUNT_FROZEN);
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
    }

    if (user.accountStatus === 'suspended') {
        const error = new Error(MESSAGES.ACCOUNT_SUSPENDED);
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
    }

    //compare password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        const error = new Error(MESSAGES.INVALID_CREDENTIALS);
        error.statusCode = HTTP_STATUS.UNAUTHORIZED;
        throw error;
    }

    // Generate tokens
    const payload = { id: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    };

};

export const updateUserService = async(id, data) => {
    const user = await findUserById(id);

    if (!user) {
        const error = new Error(MESSAGES.USER_NOT_FOUND);
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
    }

    //Prevent password or roles from being updated through this endpoint
    delete data.password;
    delete data.role;

    const updated = await updateUser(id, data);

    return {
        id: updated.id,
        email: updated.email,
        role: updated.role,
        kycStatus: updated.kycStatus,
        accountStatus: updated.accountStatus,
    };
};

export const deactivateUserService = async(id) => {
    const user = await findUserById(id);

    if (!user) {
        const error = new Error(MESSAGES.USER_NOT_FOUND);
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
    }

    await deactivateUser(id);
};