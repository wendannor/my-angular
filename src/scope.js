'use strict';

function Scope() {

    this.$$watchers = [];
    
}

Scope.prototype.$watch = function (watchFn, listenerFn) {

    var watcher = {
        watchFn: watchFn,
        listenerFn: listenerFn
    };
    this.$$watchers.push(watcher);
};

Scope.prototype.$digest = function () {
    var _this = this;
    var oldValue;
    var newValue;
    _.forEach(this.$$watchers, function (watcher) {
        newValue = watcher.watchFn(_this);
        oldValue = watcher.lastValue;
        if (newValue !== oldValue) {
            watcher.lastValue = newValue;
            watcher.listenerFn(oldValue, newValue, _this);
        }
    });
};