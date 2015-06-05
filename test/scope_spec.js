/* jshint globalstrict: true */
/* global Scope: false */
'use strict';

describe('Scope', function () {

    it('can be constructed and used as an object', function () {
        var scope = new Scope();
        scope.property = 1;
        expect(scope.property).toBe(1);
    });

    describe('digest', function () {

        var scope;
        
        beforeEach(function () {
           
            scope = new Scope();
            
        });


        it('calls the listener function of a watch on a first $digest', function () {
            var watchFn = function() {return 'watchExp';};
            var listenerFn = jasmine.createSpy();
            scope.$watch(watchFn, listenerFn);
            
            scope.$digest();
            
            expect(listenerFn).toHaveBeenCalled();
        });

    });
    
    
});
