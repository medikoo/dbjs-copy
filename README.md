# dbjs-copy
## Copy object definitions between [dbjs](https://github.com/medikoo/dbjs) database instances

### Usage

```javascript
var Database = require('dbjs');
var dbjsCopy = require('dbjs-copy');
var db1 = new Database();
var db2 = new Database();

db1.Object.extend('ObjectExtension', {
  foo: { type: db1.String, value: 'bar' },
})

dbjsCopy(db1.ObjectExtension, db2);

db2.ObjectExtension.__id__; // 'ObjectExtension'
db2.ObjectExtension.prototype.foo; // 'bar'
db2.ObjectExtension.prototype.getOwnDescriptor('foo').type; //db2.String

```

By default only given object (with its properties) is copied, but its prototype chain, types of properties, or values of properties, if they're missing they're not recreated with additional copying. To assure that pass additionally `recursive: true` option;

```javascript
dbjsCopy(db1.ObjectExtension, db2, { recursive: true });
```

If you want to complement already existing object with properties defined in other database, be sure to pass `{ complement: true }` option, otherwise object will remain untouched (as it was already found in given database).


```javascript
db1.ObjectExtension.define('lorem', { value: 'ipsum' });
dbjsCopy(db1.ObjectExtension, db2, { complement: true });

db2.ObjectExtension.lorem; // 'ipsum';
```

### Installation

	$ npm install dbjs-copy

## Tests [![Build Status](https://travis-ci.org/medikoo/dbjs-copy.svg)](https://travis-ci.org/medikoo/dbjs-copy)

	$ npm test
