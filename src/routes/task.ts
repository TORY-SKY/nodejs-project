// import { Router } from 'express';
import { Router, Response, Request } from 'express';
import { getTasks, createTask, deleteTask, updateTask} from '../controllers/tasksController';
import {Task} from "../models/tasks"
import sql from "../services/db"

const router = Router();

// router.get('/api/tasks', async (req: Request, res: Response, next ) =>{
// 	try{
// 		const tasks = await sql<Task[]>`
//             SELECT * FROM tasks 
//             ORDER BY created_at DESC;
//         `;
//         console.log(tasks);
//         res.json(tasks);
// 	} catch (error){
// 		// Always pass errors to your Express error handler
// 		console.log("error");
// 		next(error);
// 	}
// })
router.get('/', getTasks);
router.post('/', createTask);
router.delete('/:id', deleteTask);
router.patch('/:id', updateTask);

export default router;
