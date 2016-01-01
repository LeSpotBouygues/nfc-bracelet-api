/**
 * Created by nana on 01/01/2016.
 */

import * as db from '../models/data_models';

function *create() {
    const body = this.request.body;
    this.assert(body.chief, 400, 'missing params');
    this.body = yield db.Team.create(body);
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

export default {create, update};