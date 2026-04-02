import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

//core middlewares
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

//health
app.get("/health", (req, res) => {
    res.status(200).json({ 
        success: true,
        message: "Server is healthy" 
    });
});

export default app;