/**
 * Created by fritz on 1/17/14.
 * @class 相片
 */
var _ = require('underscore'),
	Photo = require('../models/photo'),
	Photos = Photo.Set,
	errors = require('../lib/errors'),
	config = require('../config');

module.exports = function (app) {
	/**
	 * GET /api/photos/list
	 * @method 相片列表
	 * @param {Number} [id] 相片ID
	 * @param {Number} [userid] 用户ID
	 * @param {String} [description] 相片描述(仅限搜索)
	 * @return {JSON}
	 */
	app.get('/api/photos/list', function (req, res, next) {
		Photos.forge().fetch({ req: req })
			.then(function (photos) {
				next({ photos: photos });
			}).catch(next);
	});

	/**
	 * GET /api/photos/my
	 * @method 自己的相片列表
	 * @param {String} [description] 相片描述(仅限搜索)
	 * @return {JSON}
	 */
	app.get('/api/photos/my', function (req, res, next) {
		if (!req.user) return next(errors(21301));
		req.query = _.omit(req.query, ['id']);
		req.query['userid'] = req.user.id;
		Photos.forge().fetch({ req: req })
			.then(function (photos) {
				next({ photos: photos });
			}).catch(next);
	});

	/**
	 * POST /api/photos/post
	 * @method 发布相片
	 * @param {String} description 描述
	 * @param {File} image 图片文件
	 * @return {JSON}
	 */
	app.post('/api/photos/post', function (req, res, next) {
		if (!req.user) return next(errors(21301));
		if (!req.files['image']) return next(errors(20007));
		var file = req.files['image'];
		if (file['type'] != 'image/jpeg') return next(errors(20005));
		if (file['size'] > config.imageLimit) return next(errors(20006));
		delete req.body['id'];
		req.body['userid'] = req.user.id;
		Photo.forge(req.body).data('image', file['path']).save()
			.then(function (photo) {
				next({
					msg: 'Photo posted',
					id: photo.id
				});
			}).catch(next);
	});

	/**
	 * POST /api/photos/update
	 * @method 更新相片
	 * @param {Number} id 相片ID
	 * @param {String} description 描述
	 * @return {JSON}
	 */
	app.post('/api/photos/update', function (req, res, next) {
		if (!req.user) return next(errors(21301));
		var id = req.body['id'];
		delete req.body['id'];
		Photo.forge({ id: id }).fetch()
			.then(function (photo) {
				if (!photo) throw errors(20603);
				if (photo.get('userid') != req.user.id) {
					throw errors(20102);
				}
				return photo.set(req.body).save();
			}).then(function () {
				next({ msg: 'Photo updated' });
			}).catch(next);
	});

	/**
	 * POST /api/photos/delete
	 * @method 删除相片
	 * @param {Number} id 相片ID
	 * @return {JSON}
	 */
	app.post('/api/photos/delete', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors(21301));
		Photo.forge({ id: req.body['id'] }).fetch()
			.then(function (photo) {
				if (!photo) throw errors(20603);
				if (photo.get('userid') != user.id) {
					throw errors(20102);
				}
				return photo.destroy();
			}).then(function () {
				next({ msg: 'Photo deleted' });
			}).catch(next);
	});
};
