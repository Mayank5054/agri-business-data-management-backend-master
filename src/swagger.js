const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Agri API",
            version: "1.0.0",
            description: "Agriculture API",
            contact: {
                name: "Agri"
            }
        },
        servers: [
            {
                url: "http://localhost:8000"
            }
        ]
    },
    apis: ["./src/swagger-doc/*.yaml"]
}

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;