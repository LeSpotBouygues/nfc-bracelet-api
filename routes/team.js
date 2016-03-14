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
router.get('/teams/:idTeam/companions', team.listCompanions);
router.put('/teams/:idTeam/addCompanion', parseBody, team.addCompanion);
router.put('/teams/:idTeam/removeCompanion', parseBody, team.removeCompanion);
router.put('/teams/:idTeam/addTask', parseBody, team.addTask);
router.put('/teams/:idTeam/removeTask', parseBody, team.removeTask);
router.put('/teams/:idTeam', parseBody, team.update);
router.delete('/teams/:idTeam', team.del);

app.use(router.routes());

