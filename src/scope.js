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
    this.$$asyncQueue = [];
    this.$$phase = null;
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
    this.$beginPhase('$digest');
    do {

        while (this.$$asyncQueue.length > 0) {
            var asyncTask = this.$$asyncQueue.shift();
            asyncTask.scope.$eval(asyncTask.expression);
        }

        dirty = this.$$digestOnce();

        ttl--;
        if ((dirty || this.$$asyncQueue.length) && ttl === 0) {
            this.$clearPhase();
            throw '10 digest iterations reached';
        }

    } while (dirty || this.$$asyncQueue.length);
    this.$clearPhase();
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

Scope.prototype.$eval = function (expr, arg) {
    return expr(this, arg);
};

Scope.prototype.$apply = function (fn) {
    try {
        this.$beginPhase('$apply');
        return this.$eval(fn);
    } finally {
        this.$clearPhase();
        this.$digest();
    }
};

Scope.prototype.$evalAsync = function (expr) {
    this.$$asyncQueue.push({scope: this, expression: expr});
};

Scope.prototype.$beginPhase = function (phase) {
    if (this.$$phase) {
        throw this.$$phase + ' already in progress';
    }
    this.$$phase = phase;
};

Scope.prototype.$clearPhase = function () {
    this.$$phase = null;
};