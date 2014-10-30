'use strict';

var aFrom    = require('es5-ext/array/from')
  , Database = require('dbjs')
  , source   = require('./__playground');

module.exports = function (t, a) {
	var target = new Database(), testType, testObj;

	testType = function (Type) {
		a.h2("Constructor");
		a(Type.regularType, 'bar', "Value");
		a(Type.getOwnDescriptor('regularType').type, target.String, "Type");

		a.h2("Prototype");
		testObj(Type.prototype);
		testObj(Type.prototype.nested);
	};
	testObj = function (obj) {
		a.h3("Regular");
		a(obj.regular, 'foo', "Value");
		a(obj.getOwnDescriptor('regular').type, target.String, "Type");
		a.h3("Computed");
		a(obj.regularComputed, 'foobar');
		a.h3("Multiple");
		a.deep(aFrom(obj.multiple), [2, 3]);
		a.h3("Multiple computed");
		a.deep(aFrom(obj.multipleComputed), ['foo', 'fooraz']);
	};

	a.h1("Flat");
	t(source.TypeB, target);
	testType(target.TypeB);
	a(target.TypeA.prototype.regularDeep, undefined, "Not recursive");

	a.h1("Recursive");
	t(source.TypeD, target, { recursive: true });
	testType(target.TypeD);
	a(target.TypeC.prototype.regularDeep, 1, "Recursive");

	a.h1("Complement");
	target.Object.extend('TypeE', {
		someOther: {
			type: target.String,
			value: 'marko'
		}
	}, {
		someOtherType: {
			type: target.Number,
			value: 3
		}
	});

	t(source.TypeE, target, { complement: true });
	testType(target.TypeE);
};
