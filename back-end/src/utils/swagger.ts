import express from 'express';
import {Router} from 'express';
import swaggerUI from 'swagger-ui-express';
import YAML from 'yamljs';


const swaggerDocument = YAML.load('../swagger.yaml');
const swaggerRouter = Router();

swaggerRouter.use('/', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

export default swaggerRouter;