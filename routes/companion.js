/**
 * Created by superphung on 11/29/15.
 */
import app from '../app.js';
import koaRouter from 'koa-router';
import koaBody from 'koa-body';
import companion from './../controllers/companion';
import file from '../middleware/file';
import {companionsLabels} from '../models/file_labels';

const router = koaRouter();
const parseBody = koaBody();
const parseMultipart = koaBody({formidable: {uploadDir: __dirname + '/..'}, multipart: true});

router.get('/', function *() {
    this.body = 'hello world';
});
router.post('/companions', parseBody, companion.create);
router.get('/companions', companion.list);
router.get('/companions/:idCompanion', companion.getById);
router.get('/companions/:name/name', companion.getByName);
router.get('/companions/noTeam', companion.getWithNoTeam);
router.put('/companions/:idCompanion/addTask', parseBody, companion.addTask);
router.put('/companions/:idCompanion/removeTask', parseBody, companion.removeTask);
router.put('/companions/:idCompanion', parseBody, companion.update);
router.post('/companions/importData', parseMultipart, file.parse(companionsLabels, 'ressource_prenom'), companion.createFromFile);

app.use(router.routes());