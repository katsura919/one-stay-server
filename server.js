
require('dotenv').config();
const express = require('express');
const connectDB = require('./src/libs/db');
const routes = require('./src/index');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', routes);


// Start server after DB connection
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    });
