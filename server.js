const express = require("express");
const Log = require("./logging_middleware/logger");
const priorityInbox = require("./priority_inbox");

const app = express();

app.get("/", async (req, res) => {
    await Log("backend", "info", "route", "Home route accessed");
    res.send("Hello");
});

app.get("/notifications", async (req, res) => {
    try {
        await Log("backend", "info", "route", "Notifications route accessed");
        const token = await priorityInbox.getToken();
        const notifications = await priorityInbox.fetchNotifications(token);
        const top10 = priorityInbox.getPriorityInbox(notifications, 10);
        res.json(top10);
    } catch (e) {
        await Log("backend", "error", "route", "Failed to load notifications");
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});