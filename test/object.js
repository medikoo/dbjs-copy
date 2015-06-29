'use strict';

var aFrom  = require('es5-ext/array/from')
  , source = require('./__playground');

module.exports = function (t, a) {
	var testType, testObj;

	testType = function (Type) {
		a.h2("Constructor");
		a(Type.regularType, 'bar', "Value");
		a(Type.getOwnDescriptor('regularType').type, source.String, "Type");

		a.h2("Prototype");
		testObj(Type.prototype);
		testObj(Type.prototype.nested);
	};
	testObj = function (obj) {
		a.h3("Regular");
		a(obj.regular, 'foo', "Value");
		a(obj.getOwnDescriptor('regular').type, source.String, "Type");
		a.h3("Computed");
		a(obj.regularComputed, 'foobar');
		a.h3("Multiple");
		a.deep(aFrom(obj.multiple), [2, 3]);
		a.h3("Multiple computed");
		a.deep(aFrom(obj.multipleComputed), ['foo', 'fooraz']);
	};

	t(source.TypeB, source.TypeA.extend('TypeBCopy'));
	testType(source.TypeBCopy);
};
