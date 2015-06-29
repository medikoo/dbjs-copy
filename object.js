'use strict';

var Database        = require('dbjs')
  , DbjsEvent       = require('dbjs/_setup/event')
  , isType          = require('dbjs/is-dbjs-type')
  , validDbjsObject = require('dbjs/valid-dbjs-object')

  , create = Object.create, getPrototypeOf = Object.getPrototypeOf
  , copyObject, copyProperty, copyDescProperty, copyItem
  , baseDb = new Database(), nativeObjects = baseDb.objects.__setData__
  , resolvePrototype;

resolvePrototype = function (obj, database) {
	var prototype = database.objects.getById(obj.__id__);
	if (prototype) return prototype;
	return database.objects.unserialize(obj.__id__, resolvePrototype(getPrototypeOf(obj), database));
};

copyObject = function (obj, target, options, done, force) {
	var event, targetEvent;
	if (done[obj.__id__]) return target;
	event = obj._lastOwnEvent_;
	if (event) {
		targetEvent = target._lastOwnEvent_;
		if (!targetEvent || (targetEvent.stamp < event.stamp)) {
			new DbjsEvent(target, event.value, event.stamp); //jslint: ignore
		}
	}

	if (obj.hasOwnProperty('__descriptorPrototype__')) {
		copyProperty(obj.__descriptorPrototype__, target._descriptorPrototype_, options, done);
	}
	obj._forEachOwnDescriptor_(function (desc) { copyProperty(desc, target, options, done); });
	obj._forEachOwnItem_(function (item) { copyItem(item, target, options, done); });
	obj._forEachOwnNestedObject_(function (obj) { copyObject(obj, target._getObject_(obj.__sKey__),
		options, done); });
	if (isType(obj)) copyObject(obj.prototype, target.prototype, options, done, true);
};

copyProperty = function (obj, target) {
	var event, targetEvent;
	target = target._getOwnDescriptor_(obj._sKey_);
	obj._forEachOwnDescriptor_(function (desc) { copyDescProperty(desc, target); });
	event = obj._lastOwnEvent_;
	if (event) {
		if (target) targetEvent = target._lastOwnEvent_;
		if (!targetEvent || (targetEvent.stamp < event.stamp)) {
			new DbjsEvent(target, event.value, event.stamp); //jslint: ignore
		}
	}
};

copyDescProperty = function (obj, target) {
	var event, targetEvent;
	target = target._getOwnDescriptor_(obj.key);
	event = obj._lastOwnEvent_;
	if (event) {
		if (target) targetEvent = target._lastOwnEvent_;
		if (!targetEvent || (targetEvent.stamp < event.stamp)) {
			new DbjsEvent(target, event.value, event.stamp); //jslint: ignore
		}
	}
};

copyItem = function (obj, target) {
	var event, targetEvent;
	target = target._getOwnMultipleItem_(obj._pSKey_, obj.key, obj._sKey_);
	event = obj._lastOwnEvent_;
	if (event) {
		targetEvent = target._lastOwnEvent_;
		if (!targetEvent || (targetEvent.stamp < event.stamp)) {
			new DbjsEvent(target, event.value, event.stamp); //jslint: ignore
		}
	}
};

module.exports = function (object, targetObject/*, options*/) {
	var options = Object(arguments[2]);
	validDbjsObject(object);
	validDbjsObject(targetObject);
	return copyObject(object, targetObject, options, create(nativeObjects));
};
