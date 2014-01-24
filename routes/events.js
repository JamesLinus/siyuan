/**
 * Created by fritz on 1/21/14.
 * @class 动态
 */
var Event = require('../models/event');

module.exports = function (app) {
	/**
	 * GET /api/event/find
	 * @method 动态列表
	 * @param {Number} [id] 动态ID
	 * @param {Number} [userid] 用户ID
	 * @param {Number} [groupid] 圈子ID
	 * @param {Number} [itemtype] 类别ID - `1`用户, `2`话题, `3`活动, `4`商务合作
	 * @param {Number} [itemid] 资源ID
	 * @return {JSON}
	 */
	app.get('/api/events/find', function (req, res, next) {
		Event.find(req.query)
			.then(function (events) {
				next({ events: events });
			}).catch(next);
	});
};