var _ = require('underscore'),
	Bookshelf = require('bookshelf'),
	Promise = require('bluebird'),
	config = require('../config'),
	dbConfig = config.db,
	syBookshelf = module.exports = Bookshelf.initialize(dbConfig),
	syModel = syBookshelf.Model,
	syCollection = syBookshelf.Collection;

syModel = syBookshelf.Model = syModel.extend({
	tableName: '',
	fields: [],
	omitInJSON: [],

	initialize: function () {
		syModel.__super__.initialize.apply(this, arguments);
		this._data = {};
		this.on('creating', this.creating, this);
		this.on('created', this.created, this);
		this.on('updating', this.updating, this);
		this.on('updated', this.updated, this);
		this.on('saving', this.saving, this);
		this.on('saved', this.saved, this);
		this.on('fetching', this.fetching, this);
		this.on('fetched', this.fetched, this);
		this.on('destroying', this.destroying, this);
		this.on('destroyed', this.destroyed, this);
	},

	creating: function () {
		return Promise.resolve(this);
	},
	created: function () {
		return Promise.resolve(this);
	},
	updating: function () {
		return Promise.resolve(this);
	},
	updated: function () {
		return Promise.resolve(this);
	},
	saving: function () {
		// pick attributes
		this.attributes = this.pick(this.fields);
		return Promise.resolve(this);
	},
	saved: function () {
		return Promise.resolve(this);
	},
	fetching: function () {
		return Promise.resolve(this);
	},
	fetched: function () {
		return Promise.resolve(this);
	},
	destroying: function () {
		return Promise.resolve(this);
	},
	destroyed: function () {
		return Promise.resolve(this);
	},

	toJSON: function () {
		var ret = syModel.__super__.toJSON.apply(this, arguments);
		// omit
		ret = _.omit(ret, this.omitInJSON);
		// for timestamp
		ret = this.forTimestamp(ret);
		return ret;
	},

	// like jQuery's .data API
	data: function(key, value) {
		if (arguments.length === 1) {
			return this._data[key];
		}
		this._data[key] = value;
		return this;
	},
	removeData: function(key) {
		delete this._data[key];
		return this;
	},

	// Jayin needs Timestamp as Datetime
	forTimestamp: function (attrs) {
		_.each(attrs, function (val, key, list) {
			if (_.isDate(val)) {
				list[key] = val.getTime();
			}
		});
		return attrs;
	},

	fixLowerCase: function (keys) {
		var attrs = this.attributes;
		_.each(keys, function (k) {
			if (_.isString(attrs[k])) {
				attrs[k] = attrs[k].toLowerCase();
			}
		});
	}
}, {

});

syCollection = syModel.Set = syCollection.extend({
	model: syModel
});
