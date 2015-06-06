'use strict';

function initWatchVal() {
}

function Scope() {

    this.$$watchers = [];

}

Scope.prototype.$watch = function (watchFn, listenerFn) {

    var watcher = {
        watchFn: watchFn,
        listenerFn: listenerFn || function () {},
        lastValue: initWatchVal
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
            watcher.listenerFn(newValue, (oldValue === initWatchVal ? newValue : oldValue), _this);
        }
    });
};