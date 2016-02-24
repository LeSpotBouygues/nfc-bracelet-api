/**
 * Created by nana on 07/02/2016.
 */
/**
 * Created by nana on 11/12/2015.
 */
import app from '../app.js';
import koaRouter from 'koa-router';
import koaBody from 'koa-body';
import history from '../controllers/history';

const router = koaRouter();
const parseBody = koaBody();

router.post('/history', parseBody, history.create);
router.post('/history/fromRange', parseBody, history.getRange);

app.use(router.routes());