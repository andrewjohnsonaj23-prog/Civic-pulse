"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const issues_1 = __importDefault(require("./routes/issues"));
const jobs_1 = __importDefault(require("./routes/jobs"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3001;
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION:', reason);
    process.exit(1);
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'CivicPulse Backend is running',
        timestamp: new Date().toISOString()
    });
});
app.use('/api/issues', issues_1.default);
app.use('/api/jobs', jobs_1.default);
const server = app.listen(PORT, '0.0.0.0', () => {
    const addr = server.address();
    console.log('Server address object:', JSON.stringify(addr));
    console.log(`🚀 CivicPulse Backend running on http://localhost:${PORT}`);
    console.log(`   Issues API active on /api/issues/my-feed`);
    console.log(`   Jobs API active on /api/jobs/status`);
});
server.on('error', (err) => {
    console.error('SERVER ERROR:', err);
    process.exit(1);
});
