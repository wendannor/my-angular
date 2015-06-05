/* jshint globalstrict: true */
/* global Scope: false */
'use strict';

describe('Scope', function () {

    it('can be constructed and used as an object', function () {
        var scope = new Scope();
        scope.property = 1;
        expect(scope.property).toBe(1);
    });

});
