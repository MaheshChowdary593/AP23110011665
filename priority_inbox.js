const axios = require('axios');
const Log = require('./logging_middleware/logger');

const AUTH_URL = "http://20.207.122.201/evaluation-service/auth";
const NOTIFICATIONS_URL = "http://20.207.122.201/evaluation-service/notifications";

const CLIENT_ID = "705a82fc-aa41-4727-97a5-80afb9899fd2";
const CLIENT_SECRET = "mgnVpHRdtvrbnspq";
const EMAIL = "maheshchowdary_mulaguri@srmap.edu.in";
const NAME = "mulaguri mahesh chowdary";
const ROLL_NO = "ap23110011665";
const ACCESS_CODE = "QkbpxH";

const WEIGHTS = {
    "Placement": 3,
    "Result": 2,
    "Event": 1
};

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
        return res.data.access_token;
    } catch (e) {
        await Log("backend", "error", "auth", "Failed to generate token");
        throw e;
    }
}

async function fetchNotifications(token) {
    await Log("backend", "info", "service", "Fetching notifications data");
    const res = await axios.get(NOTIFICATIONS_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.notifications;
}

function getPriorityInbox(notifications, n = 10) {
    notifications.sort((a, b) => {
        const weightA = WEIGHTS[a.Type] || 0;
        const weightB = WEIGHTS[b.Type] || 0;
        
        if (weightA !== weightB) {
            return weightB - weightA;
        }
        
        const timeA = new Date(a.Timestamp).getTime();
        const timeB = new Date(b.Timestamp).getTime();
        
        return timeB - timeA;
    });
    
    return notifications.slice(0, n);
}

async function main() {
    try {
        await Log("backend", "info", "service", "Starting Priority Inbox");
        
        const token = await getToken();
        const notifications = await fetchNotifications(token);
        
        await Log("backend", "info", "service", `Fetched ${notifications.length} notifications`);
        
        const top10 = getPriorityInbox(notifications, 10);
        top10.forEach((notif, index) => {
            const num = (index + 1).toString().padStart(2, ' ');
            console.log(`\n[${num}] Type: ${notif.Type.toUpperCase()}`);
            console.log(`     ID: ${notif.ID}`);
            console.log(`     Time: ${notif.Timestamp}`);
            console.log(`     Message: ${notif.Message}`);
        });

        await Log("backend", "info", "service", "Priority Inbox processed");
    } catch (e) {
        console.error("An error occurred:", e.message);
        await Log("backend", "error", "service", "Priority Inbox failed");
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    getToken,
    fetchNotifications,
    getPriorityInbox
};
