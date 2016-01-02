/**
 * Created by nana on 05/12/2015.
 */
import app from '../app.js';
import koaRouter from 'koa-router';

import auth from './../middleware/auth';
import Companion from '../controllers/companion';

const router = koaRouter();

router.post('/login', auth.webApp, Companion.createToken);
router.post('/loginWithBracelet', auth.bracelet, Companion.createToken);

app.use(router.routes());
