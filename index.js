'use strict';

var isObject        = require('es5-ext/object/is-object')
  , Database        = require('dbjs')
  , DbjsEvent       = require('dbjs/_setup/event')
  , isType          = require('dbjs/is-dbjs-type')
  , validDbjs       = require('dbjs/valid-dbjs')
  , isDbjsObject    = require('dbjs/is-dbjs-object')
  , validDbjsObject = require('dbjs/valid-dbjs-object')
  , serialize       = require('dbjs/_setup/serialize/value')
  , unserialize     = require('dbjs/_setup/unserialize/value')

  , create = Object.create, getPrototypeOf = Object.getPrototypeOf
  , copyObject, copyProperty, copyDescProperty, copyItem, copyValue
  , baseDb = new Database(), nativeObjects = baseDb.objects.__setData__
  , resolvePrototype;

resolvePrototype = function (obj, database) {
	var prototype = database.objects.getById(obj.__id__);
	if (prototype) return prototype;
	return database.objects.unserialize(obj.__id__, resolvePrototype(getPrototypeOf(obj), database));
};

copyObject = function (obj, database, options, done, force) {
	var target = database.objects.getById(obj.__id__), prototype, event, targetEvent;
	if (done[obj.__id__]) return target;
	done[obj.__id__] = true;
	if (!force && target && !options.complement) return target;
	if (options.recursive) copyObject(getPrototypeOf(obj), database, options, done);
	event = obj._lastOwnEvent_;
	if (event) {
		if (target) targetEvent = target._lastOwnEvent_;
		if (!targetEvent || (targetEvent.stamp < event.stamp)) {
			prototype = resolvePrototype(getPrototypeOf(obj), database);
			new DbjsEvent(database.objects.unserialize(obj.__id__, prototype),
				prototype, event.stamp); //jslint: ignore
		}
	}

	if (obj.hasOwnProperty('__descriptorPrototype__')) {
		copyProperty(obj.__descriptorPrototype__, database, options, done);
	}
	obj._forEachOwnDescriptor_(function (desc) { copyProperty(desc, database, options, done); });
	obj._forEachOwnItem_(function (item) { copyItem(item, database, options, done); });
	obj._forEachOwnNestedObject_(function (obj) { copyObject(obj, database, options, done); });
	if (isType(obj)) copyObject(obj.prototype, database, options, done, true);
};

copyValue = function (value, database, options, done) {
	if (!isObject(value)) return value;
	if (isDbjsObject(value) && options.recursive) return copyObject(value, database, options, done);
	return unserialize(serialize(value), database.objects);
};

copyProperty = function (obj, database, options, done) {
	var target = database.objects.getById(obj.__id__), event, targetEvent;
	if (done[obj.__id__]) return target;
	done[obj.__id__] = true;
	obj._forEachOwnDescriptor_(function (desc) { copyDescProperty(desc, database, options, done); });
	event = obj._lastOwnEvent_;
	if (event) {
		if (target) targetEvent = target._lastOwnEvent_;
		if (!targetEvent || (targetEvent.stamp < event.stamp)) {
			new DbjsEvent(database.objects.unserialize(obj.__valueId__),
				copyValue(event.value, database, options, done), event.stamp); //jslint: ignore
		}
	}
};

copyDescProperty = function (obj, database, options, done) {
	var target = database.objects.getById(obj.__id__), event, targetEvent;
	if (done[obj.__id__]) return target;
	done[obj.__id__] = true;
	event = obj._lastOwnEvent_;
	if (event) {
		if (target) targetEvent = target._lastOwnEvent_;
		if (!targetEvent || (targetEvent.stamp < event.stamp)) {
			new DbjsEvent(database.objects.unserialize(obj.__valueId__),
				copyValue(event.value, database, options, done), event.stamp); //jslint: ignore
		}
	}
};

copyItem = function (obj, database, options, done) {
	var target = database.objects.getById(obj.__id__), event, targetEvent;
	if (done[obj.__id__]) return target;
	done[obj.__id__] = true;
	event = obj._lastOwnEvent_;
	if (event) {
		if (target) targetEvent = target._lastOwnEvent_;
		if (!targetEvent || (targetEvent.stamp < event.stamp)) {
			new DbjsEvent(database.objects.unserialize(obj.__valueId__),
				event.value, event.stamp); //jslint: ignore
		}
	}
};

module.exports = function (object, targetDb/*, options*/) {
	var options = Object(arguments[2]);
	validDbjsObject(object);
	validDbjs(targetDb);
	if (object.database === targetDb) throw new TypeError("Object origins from target database");
	return copyObject(object, targetDb, options, create(nativeObjects));
};
