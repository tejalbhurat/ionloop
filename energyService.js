class EnergyService {
    constructor() {
        // Initial state
        this.state = {
            solar: 5,        // 0-10 kWh
            battery: 50,     // 0-100%
            hydrogen: 50,    // 0-100%
            demand: 5,       // 0-10
            activeEnergySource: 'battery', // 'solar', 'battery', 'hydrogen', 'combined'
            totalEnergyGenerated: 1000,
            totalConsumption: 800,
            efficiency: 92
        };
        this.simulationInterval = null;
    }

    // Generate random float between min and max
    getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Simulate live changing values
    simulateTick() {
        // Solar varies between 0 and 10 based on "weather" (just random drift)
        let solarChange = this.getRandom(-1, 1);
        this.state.solar = Math.max(0, Math.min(10, this.state.solar + solarChange));

        // Demand varies slightly
        let demandChange = this.getRandom(-0.5, 0.5);
        this.state.demand = Math.max(0, Math.min(10, this.state.demand + demandChange));

        // Battery and Hydrogen deplete or charge based on active source and demand
        if (this.state.activeEnergySource === 'solar') {
            // Charging battery/h2 if solar is high, else steady
            if (this.state.solar > this.state.demand) {
                this.state.battery = Math.min(100, this.state.battery + 1);
                if (this.state.battery === 100) {
                    this.state.hydrogen = Math.min(100, this.state.hydrogen + 0.5);
                }
            }
        } else if (this.state.activeEnergySource === 'battery') {
            this.state.battery = Math.max(0, this.state.battery - (this.state.demand * 0.1));
        } else if (this.state.activeEnergySource === 'hydrogen') {
            this.state.hydrogen = Math.max(0, this.state.hydrogen - (this.state.demand * 0.1));
        } else if (this.state.activeEnergySource === 'combined') {
            this.state.battery = Math.max(0, this.state.battery - (this.state.demand * 0.05));
            this.state.hydrogen = Math.max(0, this.state.hydrogen - (this.state.demand * 0.05));
        }

        // Run AI switching logic to update active source
        this.optimizeEnergySource();
        
        // Update aggregates
        this.state.totalEnergyGenerated += this.state.solar * 0.1;
        this.state.totalConsumption += this.state.demand * 0.1;
        this.state.efficiency = Math.max(70, Math.min(99, 90 + this.getRandom(-2, 2)));
    }

    startSimulation() {
        if (!this.simulationInterval) {
            console.log("Starting energy simulation engine...");
            // Run every 3 seconds
            this.simulationInterval = setInterval(() => {
                this.simulateTick();
            }, 3000);
        }
    }

    stopSimulation() {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
    }

    getStatus() {
        return {
            solar: parseFloat(this.state.solar.toFixed(2)),
            battery: parseFloat(this.state.battery.toFixed(2)),
            hydrogen: parseFloat(this.state.hydrogen.toFixed(2)),
            demand: parseFloat(this.state.demand.toFixed(2)),
            activeEnergySource: this.state.activeEnergySource
        };
    }

    getSummary() {
        return {
            totalEnergyGenerated: parseFloat(this.state.totalEnergyGenerated.toFixed(2)),
            totalConsumption: parseFloat(this.state.totalConsumption.toFixed(2)),
            efficiency: parseFloat(this.state.efficiency.toFixed(2)),
            activeSource: this.state.activeEnergySource
        };
    }

    getAlerts() {
        const alerts = [];
        if (this.state.battery < 20) {
            alerts.push({ type: 'warning', message: 'Battery level is critically low (<20%)' });
        }
        if (this.state.hydrogen < 20) {
            alerts.push({ type: 'warning', message: 'Hydrogen reserve is critically low (<20%)' });
        }
        if (this.state.demand > 8) {
            alerts.push({ type: 'alert', message: 'High energy demand detected' });
        }
        return alerts;
    }

    // AI Decision Engine
    optimizeEnergySource(customInput = null) {
        // Allow overriding state with custom input for testing the optimize endpoint
        const inputs = customInput || this.state;
        
        const { solar, battery, hydrogen, demand } = inputs;
        let selectedSource = 'battery';
        let efficiencyScore = 0;
        let reasoning = '';

        if (demand > 8) {
            selectedSource = 'combined';
            efficiencyScore = 85;
            reasoning = 'High demand detected. Combining multiple energy sources to ensure stability.';
        } else if (solar >= demand) {
            selectedSource = 'solar';
            efficiencyScore = 98;
            reasoning = 'Solar availability exceeds demand. Utilizing pure solar power.';
        } else if (battery >= 20) {
            selectedSource = 'battery';
            efficiencyScore = 92;
            reasoning = 'Sufficient battery charge available. Discharging battery.';
        } else if (hydrogen > 0) {
            selectedSource = 'hydrogen';
            efficiencyScore = 88;
            reasoning = 'Battery low. Engaging hydrogen fuel cell generation.';
        } else {
            selectedSource = 'grid'; // Fallback
            efficiencyScore = 70;
            reasoning = 'All internal reserves depleted. Falling back to external grid if available.';
        }

        // If it's the internal simulation tick, update the state
        if (!customInput) {
            this.state.activeEnergySource = selectedSource;
        }

        return {
            activeEnergySource: selectedSource,
            efficiencyScore,
            reasoning
        };
    }
}

module.exports = new EnergyService();
