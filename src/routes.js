import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';

import authMiddlewares from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/user', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddlewares);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
