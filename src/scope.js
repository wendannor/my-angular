'use strict';

function initWatchVal() {
}

function Scope() {

    this.$$watchers = [];

}

/**
 * Create a watcher on the scope
 * @param watchFn
 * @param listenerFn
 * @param valueEq if true then value based comparison is used
 */
Scope.prototype.$watch = function (watchFn, listenerFn, valueEq) {

    var watcher = {
        watchFn: watchFn,
        listenerFn: listenerFn || function () {
        },
        valueEq: !!valueEq,
        lastValue: initWatchVal
    };
    this.$$watchers.push(watcher);
    this.$$lastDirtyWatch = null;
};

Scope.prototype.$$digestOnce = function () {
    var _this = this;
    var oldValue;
    var newValue;
    var dirty = false;
    _.forEach(this.$$watchers, function (watcher) {
        newValue = watcher.watchFn(_this);
        oldValue = watcher.lastValue;
        if (!_this.$$areEqual(newValue, oldValue, watcher.valueEq)) {
            _this.$$lastDirtyWatch = watcher;
            watcher.lastValue = watcher.valueEq ? _.cloneDeep(newValue) : newValue;
            watcher.listenerFn(newValue, (oldValue === initWatchVal ? newValue : oldValue), _this);
            dirty = true;
        } else if (_this.$$lastDirtyWatch === watcher) {
            return false;
        }
    });
    return dirty;
};


/**
 * Run a digest cycle
 */
Scope.prototype.$digest = function () {
    var dirty;
    
    // time to live, number of cycles we allow the digest loop to make
    var ttl = 10;
    
    this.$$lastDirtyWatch = null;
    do {
        dirty = this.$$digestOnce();
        ttl--;
    } while (dirty && ttl !== 0);

    if (ttl === 0) {
        throw '10 digest iterations reached';
    }
};


Scope.prototype.$$areEqual = function (newValue, oldValue, valueEq) {
    if (valueEq) {
        return _.isEqual(newValue, oldValue);
    } else {
        return newValue === oldValue ||
            // handle the NaN case
            (typeof newValue === 'number' && typeof oldValue === 'number' && isNaN(newValue) && isNaN(oldValue));
    }
};