const axios = require("axios");

const LOG_API = "http://20.207.122.201/evaluation-service/logs";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJtYWhlc2hjaG93ZGFyeV9tdWxhZ3VyaUBzcm1hcC5lZHUuaW4iLCJleHAiOjE3Nzc3MDE2OTUsImlhdCI6MTc3NzcwMDc5NSwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjQ3ZWZjNTIxLTk5NjctNDE2Yy1hMTY2LTg1MTEwZDY4YTJjOCIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6Im11bGFndXJpIG1haGVzaCBjaG93ZGFyeSIsInN1YiI6IjcwNWE4MmZjLWFhNDEtNDcyNy05N2E1LTgwYWZiOTg5OWZkMiJ9LCJlbWFpbCI6Im1haGVzaGNob3dkYXJ5X211bGFndXJpQHNybWFwLmVkdS5pbiIsIm5hbWUiOiJtdWxhZ3VyaSBtYWhlc2ggY2hvd2RhcnkiLCJyb2xsTm8iOiJhcDIzMTEwMDExNjY1IiwiYWNjZXNzQ29kZSI6IlFrYnB4SCIsImNsaWVudElEIjoiNzA1YTgyZmMtYWE0MS00NzI3LTk3YTUtODBhZmI5ODk5ZmQyIiwiY2xpZW50U2VjcmV0IjoibWduVnBIUmR0dnJibnNwcSJ9.II5b6lxA2fcFhpVizIoIr1pCTJ7oI7huCk1zYsNlPjc";
const VALID_STACK = ["backend"];
const VALID_LEVEL = ["debug", "info", "warn", "error", "fatal"];
const VALID_PACKAGE = [
  "cache", "controller", "cron_job", "db",
  "domain", "handler", "repository", "route", "service",
  "auth", "config", "middleware", "utils"
];

async function Log(stack, level, pkg, message) {
    try {

        if (!VALID_STACK.includes(stack)) return;
        if (!VALID_LEVEL.includes(level)) return;
        if (!VALID_PACKAGE.includes(pkg)) return;

        await axios.post(
            LOG_API,
            { stack, level, package: pkg, message },
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

    } catch (err) {
        console.error("Log error:", err.message);
    }
}

module.exports = Log;