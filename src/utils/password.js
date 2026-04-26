import pkg from 'bcrypt';
import config from '../config/index.js';
const bcrypt = pkg;

export const hashPassword = (password) => {
    return bcrypt.hash(password, config.security.saltRounds);
};

export const comparePassword = (password, hash) => {
    return bcrypt.compare(password, hash);
};