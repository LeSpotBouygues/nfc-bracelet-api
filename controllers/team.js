/**
 * Created by nana on 01/01/2016.
 */

import * as db from '../models/data_models';

function *create() {
    const body = this.request.body;
    this.assert(body.chief, 400, 'missing params');
    let companion;
    try {
        companion = yield db.Companion.findById(body.chief).exec();
    } catch (err) {}
    this.assert(companion, 400, 'companion does not exist');
    const team = yield db.Team.findOne({chief: body.chief});
    this.assert(!team, 400, 'chief already have a team');
    companion.chief = true;
    yield companion.save();
    this.body = yield db.Team.create(body);
}

function *list() {
    this.body = yield db.Team.find().populate('companions tasks chief').exec();
}

function *getById() {
    let team;
    try {
        team = yield db.Team.findById(this.params.idTeam).populate('companions tasks chief').exec();
    } catch (err) {}
    this.body = team;
}

function *listCompanions() {
    let team;
    try {
        team = yield db.Team.findById(this.params.idTeam).populate('companions').exec();
    } catch (err) {}
    this.assert(team, 400, 'team does not exist');
    this.body = team.companions;
}

function *listByChief() {
    let companion;
    try {
        companion = yield db.Companion.findById(this.params.idChief).exec();
    } catch (err) {}
    this.assert(companion, 400, 'companion does not exist');
    this.assert(companion.chief, 400, 'companion is not chief');
    this.body = yield db.Team.find().populate('companions tasks chief').exec();
}

function *addCompanion() {
    const body = this.request.body;
    this.assert(body.companion, 400, 'missing params');
    let team, companion;
    try {
        team = yield db.Team.findById(this.params.idTeam).exec();
        companion = yield db.Companion.findById(body.companion).exec();
    } catch (err) {}
    this.assert(team, 400, 'team does not exist');
    this.assert(companion, 400, 'companion does not exist');
    const idx = team.companions.indexOf(body.companion);
    if (idx !== -1) this.throw(400, 'companion already in the team');
    team.companions.push(body.companion);
    this.body = yield team.save();
}

function *removeCompanion() {
    const body = this.request.body;
    this.assert(body.companion, 400, 'missing params');
    let team, companion;
    try {
        team = yield db.Team.findById(this.params.idTeam).exec();
        companion = yield db.Companion.findById(body.companion).exec();
    } catch (err) {}
    this.assert(team, 400, 'team does not exist');
    this.assert(companion, 400, 'companion does not exist');
    const idx = team.companions.indexOf(body.companion);
    if (idx === -1) this.throw(400, 'companion is not in the team');
    team.companions.splice(idx, 1);
    this.body = yield team.save();
}

function *addTask() {
    const body = this.request.body;
    this.assert(body.task, 400, 'missing params');
    let team, task;
    try {
        team = yield db.Team.findById(this.params.idTeam).populate('companions').exec();
        task = yield db.Task.findById(body.task).exec();
    } catch (err) {}
    this.assert(team, 400, 'team does not exist');
    this.assert(task, 400, 'task does not exist');
    const idx = team.tasks.indexOf(body.task);
    if (idx !== -1) this.throw(400, 'task already in the team');
    for (let i =0; i < team.companions.length; i++) {
        if (team.companions[i].tasksInProgress.indexOf(body.task) === -1) {
            team.companions[i].tasksInProgress.push(body.task);
            yield team.companions[i].save();
        }
    }
    team.tasks.push(body.task);
    this.body = yield team.save();
}

function *removeTask() {
    const body = this.request.body;
    this.assert(body.task, 400, 'missing params');
    let team, task;
    try {
        team = yield db.Team.findById(this.params.idTeam).populate('companions').exec();
        task = yield db.Task.findById(body.task).exec();
    } catch (err) {}
    this.assert(team, 400, 'team does not exist');
    this.assert(task, 400, 'task does not exist');
    const idx = team.tasks.indexOf(body.task);
    if (idx === -1) this.throw(400, 'task is not in the team');
    for (let i =0; i < team.companions.length; i++) {
        const idx = team.companions[i].tasksInProgress.indexOf(body.task);
        if (idx !== -1) {
            team.companions[i].tasksInProgress.splice(idx, 1);
            yield team.companions[i].save();
        }
    }
    team.tasks.splice(idx, 1);
    this.body = yield team.save();
}

function *update() {
    const body = this.request.body;
    let team;
    const labels = ['name', 'chief', 'companions', 'tasks'];
    try {
        team = yield db.Team.findById(this.params.idTeam).exec();
    } catch (err) {
    }
    this.assert(team, 400, 'team does not exist');
    labels.forEach(label => {
        if (body[label]) team[label] = body[label];
    });
    this.body = yield team.save();
}

function *del() {
    let team;
    try {
        team = yield db.Team.findById(this.params.idTeam).exec();
    } catch (err) {}
    this.assert(team, 400, 'team does not exist');
    /*const user = yield db.Companion.findOne({_id: this.state.user.sub});
    this.assert(user, 400, 'companion does not exist');
    if (JSON.stringify(team.chief) !== JSON.stringify(user._id) && user.username !== 'admin') this.throw(401, 'not authorized to delete');*/
    if (team.chief) {
        const chief = yield db.Companion.findById(team.chief).exec();
        chief.chief = false;
        yield chief.save();
    }
    this.body = yield db.Team.remove({_id: this.params.idTeam}).exec();
}

export default {create, list, listCompanions, listByChief, addCompanion, removeCompanion, addTask, removeTask, getById, update, del};