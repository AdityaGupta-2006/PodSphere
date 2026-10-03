const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.json({ message: "Backend is running" });
});

app.listen(5000, "127.0.0.1", () => {
    console.log("SERVER IS RUNNING");
});