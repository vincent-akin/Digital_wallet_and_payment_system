import bcrypt from 'bcryptjs';
import config from '../config/index.js';

export const hashPassword = async (password) => {
    return bcrypt.hashPassword(password, config.security.saltRounds);
};

export const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};