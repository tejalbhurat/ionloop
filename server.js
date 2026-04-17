require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const energyService = require('./services/energyService');

const app = express();
const PORT = process.env.PORT || 3000;

const path = require('path');

// Middleware
app.use(cors()); // Enable CORS for frontend connection
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../')));

// Start Simulation Engine
energyService.startSimulation();

// Mount API Routes
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`IONLOOP Backend running on http://localhost:${PORT}`);

});
