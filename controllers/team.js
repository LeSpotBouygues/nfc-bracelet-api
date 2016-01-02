/**
 * Created by nana on 01/01/2016.
 */

import * as db from '../models/data_models';

function *create() {
    const body = this.request.body;
    this.assert(body.chief, 400, 'missing params');
    const team = yield db.Team.findOne({chief: body.chief});
    this.assert(!team, 400, 'chief already have a team');
    this.body = yield db.Team.create(body);
}

function *list() {
    this.body = yield db.Team.find().exec();
}

function *getById() {
    let team;
    try {
        team = yield db.Team.findById(this.params.idTeam).exec();
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

function *update() {
    const body = this.request.body;
    let team;
    const labels = ['name', 'chief', 'companions', 'tasks'];
    try {
        team = yield db.Team.findById(this.params.idTeam).exec();
    } catch (err) {
    }
    this.assert(team, 204);
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
    const user = yield db.Companion.findOne({_id: this.state.user.sub});
    this.assert(user, 400, 'companion does not exist');
    if (JSON.stringify(team.chief) !== JSON.stringify(user._id) && user.username !== 'admin') this.throw(401, 'not authorized to delete');
    this.body = yield db.Team.remove({_id: this.params.idTeam}).exec();
}

export default {create, list, listCompanions, getById, update, del};