/**
 * Created by nana on 11/12/2015.
 */
import app from '../app.js';
import koaRouter from 'koa-router';
import koaBody from 'koa-body';
import task from '../controllers/task';
import file from '../middleware/file';
import {tasksLabels} from '../models/file_labels';

const router = koaRouter();
const parseBody = koaBody();
const parseMultipart = koaBody({formidable: {uploadDir: __dirname + '/..'}, multipart: true});

router.post('/tasks', parseBody, task.create);
router.get('/tasks', task.list);
router.get('/tasks/open', task.getList);
router.get('/tasks/close', task.listClose);
router.get('/tasks/:idChief/affected', task.listAffected);
router.get('/tasks/:idChief/inProgress', task.listInProgress);
router.put('/tasks/:idTask', parseBody, task.update);
router.delete('/tasks/:idTask', task.del);
router.post('/tasks/importData', parseMultipart, file.parse(tasksLabels, 'id interne'), task.createFromFile);

app.use(router.routes());