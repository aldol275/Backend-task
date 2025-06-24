const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Learning Progress Tracker API",
      version: "1.0.0",
      description: "API documentation for the backend system",
    },
    tags: [
      {
        name: "Users",
        description: "User authentication and registration",
      },
      {
        name: "Courses",
        description: "Course creation and management",
      },
    ],
    servers: [
      {
        url: "http://localhost:3002",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./Routes/*.js"], // Make sure your route files have proper Swagger comments
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = { swaggerUi, swaggerSpec };

