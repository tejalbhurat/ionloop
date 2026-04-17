const express = require('express');
const router = express.Router();
const energyService = require('../services/energyService');

// GET /energy/status
// Returns current live energy data and active source
router.get('/energy/status', (req, res) => {
    try {
        const status = energyService.getStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch energy status' });
    }
});

// POST /energy/optimize
// Returns AI decision result based on inputs
router.post('/energy/optimize', (req, res) => {
    try {
        // Use custom inputs if provided, otherwise use current state
        const customInput = Object.keys(req.body).length > 0 ? req.body : null;
        const optimizationResult = energyService.optimizeEnergySource(customInput);
        res.json(optimizationResult);
    } catch (error) {
        res.status(500).json({ error: 'Failed to run AI optimization' });
    }
});

// GET /dashboard/summary
// Returns high-level metrics for dashboard
router.get('/dashboard/summary', (req, res) => {
    try {
        const summary = energyService.getSummary();
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard summary' });
    }
});

// GET /alerts
// Returns system alerts
router.get('/alerts', (req, res) => {
    try {
        const alerts = energyService.getAlerts();
        res.json({ alerts });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

// POST /contact
// Stores frontend contact form submissions
router.post('/contact', (req, res) => {
    try {
        const { name, email, message } = req.body;
        // In a real app, this would save to a DB or send an email
        console.log(`Received contact form from ${name} (${email})`);
        res.status(201).json({ success: true, message: 'Message received successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process contact form' });
    }
});

module.exports = router;
