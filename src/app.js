const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config()
const cors = require('cors');
const { initConnection } = require('./config/database');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger'); // Adjust the path if needed
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(express.static(path.resolve(__dirname, '../view')));

databaseConfig = require('./config/database');

initConnection();


app.get("/uploads/:file", (req, res) => {
    res.sendFile(path.join(__dirname, "../uploads", req.params.file));
})

app.get("/terms-and-conditions", (req, res) => {
    res.sendFile(path.join(__dirname, "view/terms-and-conditions.html"));
})

app.get("/privacy-policy", (req, res) => {
    res.sendFile(path.join(__dirname, "view/privacy-policy.html"));
})

app.use('/api', require('./route'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, "../view", "index.html"));
  });

module.exports = app;