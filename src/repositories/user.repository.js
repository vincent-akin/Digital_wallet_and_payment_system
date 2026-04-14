import prisma from '../db/prisma.js';

export const createUser = (data) => {
    return prisma.user.create({ data });
};

export const findUserByEmail = (email) => {
    return prisma.user.findUnique({ where: { email } });
};

export const findUserById = (id) => {
    return prisma.user.findUnique({ where: { id } });
};

export const updateUser = (id, data) => {
    return prisma.user.update({ where: { id }, data });
};

export const deactivateUser = (id) => {
    return prisma.user.update({ 
        where: { id }, 
        data: { accountStatus: 'SUSPENDED' } });
};