var _ = require('underscore'),
	chance = new (require('chance'))(),
	Promise = require('bluebird'),
	syBookshelf = require('./base'),
	User = require('./user'),
	Users = User.Set,
	ActivityStatus = require('./activity-status'),
	ActivityStatuses = ActivityStatus.Set,
	UserActivity = require('./user-activity'),
	UserActivitys = UserActivity.Set,
	GroupMembers = require('./group_members'),
	GroupMembersSet = GroupMembers.Set,
	fkActivity = 'activityid',
	fkUser = 'userid',
	fkStatus = 'statusid',
	Activity, Activities;

Activity = module.exports = syBookshelf.Model.extend({
	tableName: 'activities',
	fields: [
		'id', 'ownerid', 'groupid', 'content', 'maxnum', 'createtime',
		'starttime', 'duration', 'statusid', 'avatar'
	],
	//omitInJSON: ['ownerid', 'groupid'],
	saving: function () {
		return Activity.__super__
			.saving.apply(this, arguments);

	},
	usership: function () {
		return this.hasMany(UserActivitys, fkActivity);
	},

	status: function () {
		return this.belongsTo(ActivityStatus, fkStatus);
	}

}, {
	randomForge: function () {
		var status = _.random(1, 4),
			maxnum = _.random(20, 40);
		duration = _.random(3, 10);
		return Activity.forge({
			'content': chance.paragraph(),
			'maxnum': maxnum,
			'createtime': new Date(),
			'starttime': chance.date({string: true}),
			'duration': duration,
			'statusid': status,
			'avatar': chance.word()
		});
	},

	find: function (match, offset, limit) {
		var forActivity = ['id', 'ownerid', 'groupid', 'content', 'statusid'],
			activities = Activities.forge();
		return activities
			.query(function (qb) {
				_.each(forActivity, function (k) {
					if (k in match) {
						qb.where(k, '=', match[k]);
					}
				})
			})
			.query('offset', offset)
			.query('limit', limit)
			.fetch();
	}
});

Activities = Activity.Set = syBookshelf.Collection.extend({
	model: Activity
});
