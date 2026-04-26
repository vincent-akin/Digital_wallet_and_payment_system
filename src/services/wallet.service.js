import prisma from '../db/prisma.js';
import { findWalletByUserId, findWalletById, findWalletWithLock, updateWalletBalance } from '../repositories/wallet.repository.js';
import { HTTP_STATUS, MESSAGES } from '../utils/constants.js';

export const getWallet = async (userId) => {
    const wallet = await findWalletByUserId(userId);
    if (!wallet) {
        const error = new Error(MESSAGES.WALLET_NOT_FOUND);
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
    }
    return wallet;
};

export const fundWallet = async (userId, amount) => {
    const wallet = await findWalletByUserId(userId);
    if (!wallet) {
        const error = new Error(MESSAGES.WALLET_NOT_FOUND);
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
        // Lock the wallet row
        const [lockedWallet] = await findWalletWithLock(wallet.id, tx);

        // Calculate new balance
        const newBalance = Number(lockedWallet.balance) + Number(amount);

        // Update balance
        const updated = await updateWalletBalance(wallet.id, newBalance, tx);

        // Create transaction record
        const transaction = await tx.transaction.create({
            data: {
                type: 'DEPOSIT',
                status: 'SUCCESS',
                amount,
                idempotencyKey: `${userId}-deposit-${Date.now()}`,
                receiverWalletId: wallet.id,
            },
        });

        // Create ledger entry
        await tx.ledgerEntry.create({
            data: {
                walletId: wallet.id,
                transactionId: transaction.id,
                type: 'CREDIT',
                amount,
                balanceAfter: newBalance,
            },
        });

        return { wallet: updated, transaction };
    });

    return result;
};

export const transferFunds = async (senderUserId, receiverWalletId, amount) => {
    const senderWallet = await findWalletByUserId(senderUserId);
    if (!senderWallet) {
        const error = new Error(MESSAGES.WALLET_NOT_FOUND);
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
    }

    // Prevent self transfer
    if (senderWallet.id === receiverWalletId) {
        const error = new Error(MESSAGES.SELF_TRANSFER);
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
    }

    const receiverWallet = await findWalletById(receiverWalletId);
    if (!receiverWallet) {
        const error = new Error(MESSAGES.WALLET_NOT_FOUND);
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
        // Lock both wallets - always lock in consistent order to prevent deadlocks
        const walletIds = [senderWallet.id, receiverWalletId].sort();
        const [lockedWallet1] = await findWalletWithLock(walletIds[0], tx);
        const [lockedWallet2] = await findWalletWithLock(walletIds[1], tx);

        // Map back to sender/receiver
        const lockedSender = lockedWallet1.id === senderWallet.id ? lockedWallet1 : lockedWallet2;
        const lockedReceiver = lockedWallet1.id === receiverWalletId ? lockedWallet1 : lockedWallet2;

        // Check sufficient funds
        if (Number(lockedSender.balance) < Number(amount)) {
            const error = new Error(MESSAGES.INSUFFICIENT_FUNDS);
            error.statusCode = HTTP_STATUS.BAD_REQUEST;
            throw error;
        }

        // Calculate new balances
        const senderNewBalance = Number(lockedSender.balance) - Number(amount);
        const receiverNewBalance = Number(lockedReceiver.balance) + Number(amount);

        // Update both balances
        await updateWalletBalance(senderWallet.id, senderNewBalance, tx);
        await updateWalletBalance(receiverWalletId, receiverNewBalance, tx);

        // Create transaction record
        const transaction = await tx.transaction.create({
            data: {
                type: 'TRANSFER',
                status: 'SUCCESS',
                amount,
                idempotencyKey: `${senderUserId}-transfer-${Date.now()}`,
                senderWalletId: senderWallet.id,
                receiverWalletId,
            },
        });

        // Create ledger entries for both wallets
        await tx.ledgerEntry.create({
            data: {
                walletId: senderWallet.id,
                transactionId: transaction.id,
                type: 'DEBIT',
                amount,
                balanceAfter: senderNewBalance,
            },
        });

        await tx.ledgerEntry.create({
            data: {
                walletId: receiverWalletId,
                transactionId: transaction.id,
                type: 'CREDIT',
                amount,
                balanceAfter: receiverNewBalance,
            },
        });

        return transaction;
    });

    return result;
};