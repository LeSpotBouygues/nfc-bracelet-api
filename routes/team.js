/**
 * Created by nana on 01/01/2016.
 */
import app from '../app';
import koaRouter from 'koa-router';
import koaBody from 'koa-body';
import team from '../controllers/team';

const router = koaRouter();
const parseBody = koaBody();

router.post('/teams', parseBody, team.create);
router.put('/teams/:idTeam', parseBody, team.update);

app.use(router.routes());

