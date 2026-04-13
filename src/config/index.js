import 'dotenv/config';

const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,

    database: {
        url: process.env.DATABASE_URL,
    },

    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
    },

    security: {
        saltRounds: Number(process.env.SALT_ROUNDS) || 10,
    }
};

export default config;