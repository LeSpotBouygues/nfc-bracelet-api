/**
 * Created by nana on 11/12/2015.
 */
import app from '../app.js';
import koaRouter from 'koa-router';
import koaBody from 'koa-body';
import task from '../controllers/task';

const router = koaRouter();
const parseMultipart = koaBody({formidable: {uploadDir: __dirname + '/..'}, multipart: true});

router.get('/task', task.getList);
router.post('/task/import', parseMultipart, task.importTask);

app.use(router.routes());