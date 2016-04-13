'use strict';

const eventhandler  = require('./eventhandler.js');
const request       = require('./request.js');

var runNextTask = function() {

    return request.createRequest('/api/v1/tasks/run', {
        method: 'GET',
        dataType: 'json'
    }).success(function (response) {
        if ('OK' === response.status) {
            eventhandler.emit('displayTaskPopup', {
                taskId: response.task
            });
        }
    }).fail(function (err) {
        // @todo
    });
};

module.exports = {
    runNextTask: runNextTask
};
