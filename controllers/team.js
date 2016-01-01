/**
 * Created by nana on 01/01/2016.
 */

import * as db from '../models/data_models';

function *create() {
    const body = this.request.body;
    this.assert(body.chief, 400, 'missing params');
    this.body = yield db.Team.create(body);
}

export default {create};