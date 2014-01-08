var _ = require('underscore'),
	Admin = require('../models/admin');

module.exports = function (app) {
	app.get('/api/admin/find', function (req, res) {
		var offset = req.api.offset,
			limit = req.api.limit,
			match = req.query;
		Admin.find(match, offset, limit)
			.then(function (admins) {
				admins.each(function (admin) {
					admin.attributes = admin.omit(['regtime']);
				});
				res.api.send({
					admins: admins
				});
			});
	});

	app.get('/api/admin/search', function (req, res) {
		var offset = req.api.offset,
			limit = req.api.limit,
			match = req.query;
		Admin.search(match, offset, limit)
			.then(function (admins) {
				admins.each(function (admin) {
					admin.attributes = admin.omit(['regtime']);
				});
				res.api.send({
					admins: admins
				});
			});
	});

	app.get('/api/admin/view', function (req, res, next) {
		var id = req.query['id'];
		Admin.view(id)
			.then(function (admin) {
				res.api.send({ admin: admin });
			}).catch(next);
	});

	app.post('/api/admin/register', function (req, res, next) {
		var adminData = req.body;
		Admin.forge(adminData).register()
			.then(function (admin) {
				res.api.send({
					msg: 'register success',
					id: admin.id
				});
			}).catch(next);
	});

	app.post('/api/admin/login', function (req, res, next) {
		var adminData = req.body;
		Admin.forge(adminData).login()
			.then(function (admin) {
				res.api.send({
					msg: 'login success',
					id: req.session.adminid = admin.id
				});
			}).catch(next);
	});

	app.post('/api/admin/logout', function (req, res, next) {
		Admin.forge({ id: req.session.adminid }).logout()
			.then(function () {
				res.api.send({ msg: 'logout success' });
			}).catch(next);
	});

	app.post('/api/admin/password/reset', function (req, res, next) {
		Admin.forge({id: req.session['adminid']})
			.resetPassword((req.body))
			.then(function () {
				res.api.send({ msg: 'password reset' });
			}).catch(next);
	});

}