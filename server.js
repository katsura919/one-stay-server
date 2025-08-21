
require('dotenv').config();
const express = require('express');
const http = require('http');
const connectDB = require('./src/libs/db');
const { initializeSocket } = require('./src/libs/socket');
const routes = require('./src/index');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize Socket.IO
const io = initializeSocket(server);

app.use(express.json());
app.use('/api', routes);

// Start server after DB connection
connectDB()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
            console.log(`Socket.IO server initialized`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    });
