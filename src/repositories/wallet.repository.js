import prisma from '../db/prisma.js';

export const createWallet = (data, tx = prisma) => {
    return tx.wallet.create({ data });
};

export const findWalletByUserId = (userId, tx = prisma) => {
    return tx.wallet.findUnique({ where: { userId } });
};

export const findWalletById = (id, tx = prisma) => {
    return tx.wallet.findUnique({ where: { id } });
};

export const findWalletWithLock = (id, tx) => {
    return tx.$queryRaw`
        SELECT * FROM "Wallet" 
        WHERE id = ${id} 
        FOR UPDATE
    `;
};

export const updateWalletBalance = (id, balance, tx = prisma) => {
    return tx.wallet.update({
        where: { id },
        data: { balance },
    });
};

export const findTransactionById = (id, tx = prisma) => {
    return tx.transaction.findUnique({ where: { id } });
};

export const updateTransactionStatus = (id, status, tx = prisma) => {
    return tx.transaction.update({
        where: { id },
        data: { status },
    });
};