/**
 * @class 用户
 */
var _ = require('underscore'),
	User = require('../models/user'),
	errors = require('../lib/errors'),
	config = require('../config'),
	imageLimit = config.imageLimit;

module.exports = function (app) {
	/**
	 * GET /api/users/find
	 * @method 会员列表
	 * @param {Number} [id] 用户ID
	 * @param {String} [username] 用户名
	 * @param {Number} [isonline] 是否在线 - `1`在线, `0`不在线
	 * @param {String} [profile.email] 邮箱
	 * @param {String} [profile.name] 姓名
	 * @param {String} [profile.gender] 性别 - `m`男, `f`女
	 * @return {JSON}
	 * <pre>
	 {
		users: [
			{
				"id": 1,
				"username": "ko_334",
				"regtime": 1373071542000,
				"isonline": 0,
				"avatar": "/avatars/1.jpg",
				"cover": null,
				"profile": {
					"email": "he@gec.net",
	 "name": "Nicolas Bailey",
	 "gender": "f",
	 "age": 45,
	 "grade": 1988,
	 "university": "Rizuuh University",
	 "major": "Asecoeb",
	 "summary": "Lubudzot ujumipji bu elahumi ze puezawuh acu bi ajbez pirwivu movatra ulazujtob bapbape."
	 },
	 "numFollowing": 0,
	 "numFollowers": 5,
	 "numIssues": 0,
	 "numPhotos": 5,
	 "numStarring": 0,
	 "numEvents": 0
	 },
	 ...
	 ]
	 }
	 * </pre>
	 */
	app.get('/api/users/find', function (req, res, next) {
		User.find(req.query)
			.then(function (users) {
				next({ users: users });
			}).catch(next);
	});

	/**
	 * GET /api/users/search
	 * @method 模糊搜索用户
	 * @param {String} [username] 用户名
	 * @param {Number} [isonline] 是否在线
	 * @param {String} [name] 姓名
	 * @param {String} [gender] 性别
	 * @param {String} [university] 学校
	 * @param {String} [major] 专业
	 * @param {String} [summary] 个性签名
	 * @return {JSON}
	 */
	app.get('/api/users/search', function (req, res, next) {
		User.search(req.query)
			.then(function (users) {
				next({ users: users });
			}).catch(next);
	});

	/**
	 * Get /api/users/view
	 * @method 会员详细资料
	 * @param {Number} id 用户ID
	 * @return {JSON}
	 */
	app.get('/api/users/view', function (req, res, next) {
		User.view(req.query)
			.then(function (user) {
				next({ user: user });
			}).catch(next);
	});

	/**
	 * POST /api/users/register
	 * @method 注册
	 * @param {String} username 用户名
	 * @param {String} password 密码
	 * @param {String} [email] 邮箱
	 * @param {String} [name] 姓名
	 * @param {String} [gender] 性别
	 * @param {Number} [age] 年龄
	 * @param {Number} [grade] 入学级数
	 * @param {String} [university] 学校
	 * @param {String} [major] 专业
	 * @param {String} [summary] 个性签名
	 * @return {JSON}
	 * <pre>
	 //   username, password, email, name
	 {
		"msg": "User registered",
		"id": 36
	}
	 * </pre>
	 */
	app.post('/api/users/register', function (req, res, next) {
		User.forge(req.body).register(req.body)
			.then(function (user) {
				next({
					msg: 'User registered',
					id: user.id
				});
			}).catch(next);
	});

	/**
	 * POST /api/users/login
	 * @method 登录
	 * @param {String} username
	 * @param {String} password
	 * @return {JSON}
	 */
	app.post('/api/users/login', function (req, res, next) {
		User.forge(req.body).login()
			.then(function (user) {
				next({
					msg: 'User logged in',
					id: req.session['userid'] = user.id
				});
			}).catch(next);
	});

	/**
	 * POST /api/users/logout
	 * @method 退出
	 * @return {JSON}
	 */
	app.post('/api/users/logout', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		user.logout()
			.then(function () {
				next({ msg: 'User logged out' });
			}).catch(next);
	});

	/**
	 * POST /api/users/password/reset
	 * @method 重置密码
	 * @param {String} password 原密码
	 * @param {String} new-password 新密码
	 * @return {JSON}
	 */
	app.post('/api/users/password/reset', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		user.resetPassword(req.body)
			.then(function () {
				next({ msg: 'Password reset' });
			}).catch(next);
	});

	/**
	 * POST /api/users/profile/update
	 * @method 更新个人档案
	 * @param {String} [email] 邮箱
	 * @param {String} [name] 姓名
	 * @param {String} [gender] 性别
	 * @param {Number} [age] 年龄
	 * @param {Number} [grade] 入学级数
	 * @param {String} [university] 学校
	 * @param {String} [major] 专业
	 * @param {String} [summary] 个性签名
	 * @return {JSON}
	 */
	app.post('/api/users/profile/update', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		user.updateProfile(req.body)
			.then(function () {
				next({ msg: 'Profile updated' });
			}).catch(next);
	});

	/**
	 * POST /api/users/avatar/update
	 * @method 更新头像
	 * @param {File} avatar
	 * @return {JSON}
	 */
	app.post('/api/users/avatar/update', function (req, res, next) {
		var user = req.user,
			file = req.files['avatar'];
		if (!user) return next(errors[21301]);
		if (!file) return next(errors[20007]);
		if (file['type'] != 'image/jpeg') return next(errors[20005]);
		if (file['size'] > imageLimit) return next(errors[20006]);
		user.updatePic('avatar', file['path'])
			.then(function () {
				next({ msg: 'Avatar updated' });
			}).catch(next);
	});

	/**
	 * POST /api/users/cover/update
	 * @method 更新封面
	 * @param {File} cover
	 * @return {JSON}
	 */
	app.post('/api/users/cover/update', function (req, res, next) {
		var user = req.user,
			file = req.files['cover'];
		if (!user) return next(errors[21301]);
		if (!file) return next(errors[20007]);
		if (file['type'] != 'image/jpeg') return next(errors[20005]);
		if (file['size'] > imageLimit) return next(errors[20006]);
		user.updatePic('cover', file['path'])
			.then(function () {
				next({ msg: 'Cover updated' });
			}).catch(next);
	});
};
