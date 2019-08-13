import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import MyMeetupController from './app/controllers/MyMeetupController';
import SubscriptionsController from './app/controllers/SubscriptionsController';

import authMiddlewares from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddlewares);

routes.put('/user', UserController.update);

routes.post('/meetups', MeetupController.store);
routes.put('/meetup/:id', MeetupController.update);
routes.get('/meetups', MeetupController.index);
routes.get('/mymeetups', MyMeetupController.index);
routes.delete('/meetup/:id', MeetupController.delete);

routes.get('/subscriptions', SubscriptionsController.index);
routes.post('/subscriptions/:meetupId', SubscriptionsController.store);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
