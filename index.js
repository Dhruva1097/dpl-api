const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'DPL11 API',
            version: '1.0.0',
            description: 'API documentation for DPL11',
        },
        servers: [
            {
                url: 'http://13.232.24.130:3000/',
            },
        ],
    },
    apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
const router = require('./routes')
const bodyParser = require('body-parser')
var request = require('request');
request.gzip = true;
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// const winston = require('winston');
const services = require('./services')
const db = require('./models')
const fileUpload = require('express-fileupload');
const { group_filling, level_filling_update } = require('./controllers/contests');
// require('./cron');
require('dotenv').config()

const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Swagger setup
// Applying Middlewares
// services.getSeriesSportsData()
// services.getFixturesSportsData()
// services.getTeamsSportsData()
// services.getSquadSportsData()
// services.getPerformanceSquad()
// services.getLineUpSquads()
// services.getLiveScoreSportsData()
// services.update_team_points()
// services.getLiveScore()

// group_filling()
// level_filling_update()

app.get("/", (req, res) => {
    res.send("DPL11 Backend")
})
const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers":"*",
};
app.use((req, res, next) => {
    res.header(headers);
    next();
});
// app.use(bodyParser.json({ type: ['application/json', 'application/gzip'] }))

app.use(express.urlencoded({
    extended: false, // Whether to use algorithm that can handle non-flat data strutures  
    limit: 10000, // Limit payload size in bytes   
    parameterLimit: 2, // Limit number of form items on payload
}));

app.use(express.json())
app.use(upload.any())
// app.use(fileUpload({ useTempFile: true }))
// app.use(express.urlencoded({extended:true}))
app.use('/', router)

db.sequelize.sync().then(() => {
    app.listen((process.env.NODE_ENV_PORT || 3000), () => {
        console.log(`DPL11  Running Successfully on port ${process.env.NODE_ENV_PORT || 3000}`)
    })
}).catch((err) => {
    console.log(err.message);
})
