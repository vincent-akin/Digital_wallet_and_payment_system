import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export const generateAccessToken = (payload) => {
    return jwt.sign(payload, config.jwt.accessSecret, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: '7d' });
};

export const verifyAccessToken = (token) => {
    return jwt.verify(token, config.jwt.accessSecret);
};

export const verifyRefreshToken = (token) => {
    return jwt.verify(token, config.jwt.refreshSecret);
};