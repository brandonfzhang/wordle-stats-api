module.exports = function (app, router) {
    app.use('/api', require('./result.js')(router));
};
