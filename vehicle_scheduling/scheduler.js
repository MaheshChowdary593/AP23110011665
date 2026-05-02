const axios = require('axios');
const Log = require('../logging_middleware/logger');

const AUTH_URL = "http://20.207.122.201/evaluation-service/auth";
const DEPOTS_URL = "http://20.207.122.201/evaluation-service/depots";
const VEHICLES_URL = "http://20.207.122.201/evaluation-service/vehicles";

const CLIENT_ID = "705a82fc-aa41-4727-97a5-80afb9899fd2";
const CLIENT_SECRET = "mgnVpHRdtvrbnspq";
const EMAIL = "maheshchowdary_mulaguri@srmap.edu.in";
const NAME = "mulaguri mahesh chowdary";
const ROLL_NO = "ap23110011665";
const ACCESS_CODE = "QkbpxH";

async function getToken() {
    await Log("backend", "info", "auth", "Generating token");
    try {
        const res = await axios.post(AUTH_URL, {
            clientID: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            email: EMAIL,
            name: NAME,
            rollNo: ROLL_NO,
            accessCode: ACCESS_CODE
        });
        await Log("backend", "info", "auth", "Token generated successfully");
        return res.data.access_token;
    } catch (e) {
        await Log("backend", "error", "auth", "Failed to generate token");
        throw e;
    }
}

async function fetchDepots(token) {
    await Log("backend", "info", "service", "Fetching depots");
    const res = await axios.get(DEPOTS_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.depots;
}

async function fetchVehicles(token) {
    await Log("backend", "info", "service", "Fetching vehicles");
    const res = await axios.get(VEHICLES_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.vehicles;
}

function solveKnapsack(vehicles, capacity) {
    const n = vehicles.length;
    const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        const v = vehicles[i - 1];
        for (let w = 0; w <= capacity; w++) {
            if (v.Duration <= w) {
                dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - v.Duration] + v.Impact);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    let res = dp[n][capacity];
    let w = capacity;
    const selectedTaskIDs = [];
    let totalDuration = 0;

    for (let i = n; i > 0 && res > 0; i--) {
        if (res !== dp[i - 1][w]) {
            const v = vehicles[i - 1];
            selectedTaskIDs.push(v.TaskID);
            res -= v.Impact;
            w -= v.Duration;
            totalDuration += v.Duration;
        }
    }

    return {
        maxImpact: dp[n][capacity],
        selectedTaskIDs: selectedTaskIDs,
        totalDuration: totalDuration
    };
}

async function main() {
    try {
        await Log("backend", "info", "service", "Starting Vehicle Scheduler");
        
        const token = await getToken();

        const depots = await fetchDepots(token);
        const totalCapacity = depots.reduce((acc, d) => acc + d.MechanicHours, 0);
        await Log("backend", "info", "service", `Capacity: ${totalCapacity}`);
        
        const vehicles = await fetchVehicles(token);
        await Log("backend", "info", "service", `Vehicles: ${vehicles.length}`);
        
        await Log("backend", "info", "service", "Calculating schedule");
        const result = solveKnapsack(vehicles, totalCapacity);
        
        await Log("backend", "info", "service", `Total Mechanic Hours Budget : ${totalCapacity}`);
        await Log("backend", "info", "service", `Hours Used By Selected Tasks: ${result.totalDuration}`);
        await Log("backend", "info", "service", `Maximum Operational Impact  : ${result.maxImpact}`);
        await Log("backend", "info", "service", `Number of Tasks Selected    : ${result.selectedTaskIDs.length}`);
        await Log("backend", "info", "service", "Selected Task IDs:");
        
        result.selectedTaskIDs.forEach((id, index) => {
            console.log(`  ${index + 1}. ${id}`);
        });
        
        await Log("backend", "info", "service", `Completed. Max Impact: ${result.maxImpact}`);
    } catch (e) {
        console.error("An error occurred:", e.message);
        await Log("backend", "error", "service", "Scheduler failed");
    }
}

main();
