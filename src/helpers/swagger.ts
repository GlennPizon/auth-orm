// You'll likely use a library like 'swagger-ui-express' and 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerDefinition from '../../../swagger.yaml'; // Adjust path as needed

const options = {
    swaggerDefinition,
    apis: [`${__dirname}/../accounts/accounts.controller.ts`], // Point to your controller files
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: any) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};