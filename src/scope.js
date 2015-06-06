'use strict';

function initWatchVal() {
}

function Scope() {

    this.$$watchers = [];

}

Scope.prototype.$watch = function (watchFn, listenerFn) {

    var watcher = {
        watchFn: watchFn,
        listenerFn: listenerFn || function () {
        },
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
        if (newValue !== oldValue) {
            _this.$$lastDirtyWatch = watcher;
            watcher.lastValue = newValue;
            watcher.listenerFn(newValue, (oldValue === initWatchVal ? newValue : oldValue), _this);
            dirty = true;
        } else if (_this.$$lastDirtyWatch === watcher) {
            return false;
        }
    });
    return dirty;
};

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