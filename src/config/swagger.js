import swaggerJSDoc from "swagger-jsdoc";
import swaggerValidator from "swagger-model-validator";

const options = {
    definition: {
        openapi: "3.2.0",
        info: {
            title: "WaitLess-Smart Queue & Appointment Optimization System API",
            version: "1.0.0",
            description: "WaitLess Backend API Documentation",
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT}`,
                description: "Development Server",
            },
        ],
        tags: [
            {
                name: "Users",
                description: "User Management APIs",
            },
            {
                name: "Queues",
                description: "Queue Management APIs",
            },
            {
                name: "Service Centers",
                description: "Service Center Management APIs",
            },
            {
                name: "Staff Assignments",
                description: "Staff Assignment Management APIs",
            },
            {
                name: "Notifications",
                description: "Notification management APIs",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "JWT key authorization for API",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);
swaggerValidator(swaggerSpec);

export default swaggerSpec;
