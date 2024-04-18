require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const app = express();

const routes = require('./routes');

// Middleware for security
app.use(helmet());

// Allow the domains in the env to make requests to the API
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
app.use(cors({
    origin: allowedOrigins
}));

// Routes
app.use('/api/v1', routes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});
