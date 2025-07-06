import swaggerJSDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Student API',
            version: '1.0.0',
            description: 'API documentation for the Student Management System'
        },
    },
    apis: ['./src/pages/api/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);