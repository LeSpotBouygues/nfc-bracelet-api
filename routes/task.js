/**
 * Created by nana on 11/12/2015.
 */
import app from '../app.js';
import koaRouter from 'koa-router';
import koaBody from 'koa-body';
import task from '../controllers/task';

const router = koaRouter();
const parseBody = koaBody();
const parseMultipart = koaBody({formidable: {uploadDir: __dirname + '/..'}, multipart: true});

router.post('/tasks', parseBody, task.create);
router.get('/tasks', task.getList);
router.get('/tasks/open', task.getList);
router.get('/tasks/close', task.listClose);
router.put('/tasks/:idTask', parseBody, task.update);
router.delete('/tasks/:idTask', task.del);
router.post('/tasks/import', parseMultipart, task.importTask);

app.use(router.routes());