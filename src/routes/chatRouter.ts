import { Router, Response, Request } from 'express';
import {Task} from "../models/tasks";
import { AI_createTask} from '../controllers/tasksController';




const chatRouter = Router();

chatRouter.post('/', AI_createTask);

export default chatRouter;