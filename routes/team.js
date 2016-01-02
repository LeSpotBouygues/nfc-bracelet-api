/**
 * Created by nana on 01/01/2016.
 */
import app from '../app';
import koaRouter from 'koa-router';
import koaBody from 'koa-body';
import jwt from 'koa-jwt';
import team from '../controllers/team';

const router = koaRouter();
const parseBody = koaBody();

router.post('/teams', parseBody, team.create);
router.get('/teams', team.list);
router.get('/teams/:idTeam', team.getById);
router.put('/teams/:idTeam', parseBody, team.update);
router.delete('/teams/:idTeam', jwt({secret: 'secret'}), team.del);

app.use(router.routes());

