'use strict';

var Database = require('dbjs')
  , db       = new Database()
  , UsDollar = require('dbjs-ext/number/currency/us-dollar')(db)

  , defineProtoProperties
  , defineConstructorProperties;

db.Object.extend('TypeA');
db.TypeA.extend('TypeB');
db.Object.extend('TypeC');
db.TypeC.extend('TypeD');
db.Object.extend('TypeE');

defineProtoProperties = function (obj) {
	obj.defineProperties({
		regular: {
			type: db.String,
			value: 'foo'
		},
		regularComputed: {
			type: db.String,
			value: function () { return this.regular + 'bar'; }
		},
		multiple: {
			type: UsDollar,
			multiple: true,
			value: [2, 3]
		},
		multipleComputed: {
			type: db.String,
			multiple: true,
			value: function () { return [this.regular, this.regular + 'raz']; }
		},
		multipleObj: {
			type: db.Object,
			multiple: true
		},
		nested: {
			type: db.TypeA,
			nested: true
		}
	});
	if (obj.owner) return;
	Object.getPrototypeOf(obj).defineProperties({
		regularDeep: {
			type: db.Number,
			value: 1
		}
	});
};

defineConstructorProperties = function (Type) {
	Type.defineProperties({
		regularType: {
			type: db.String,
			value: 'bar'
		}
	});
	defineProtoProperties(Type.prototype);
	defineProtoProperties(Type.prototype.nested);
};

defineConstructorProperties(db.TypeB);
defineConstructorProperties(db.TypeD);
defineConstructorProperties(db.TypeE);

module.exports = db;
