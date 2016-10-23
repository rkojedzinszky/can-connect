/*can-connect@1.0.2#data/callbacks-cache/callbacks-cache*/
define(function (require, exports, module) {
    var connect = require('../../can-connect');
    var assign = require('can-util/js/assign');
    var each = require('can-util/js/each');
    var pairs = {
        createdData: 'createData',
        updatedData: 'updateData',
        destroyedData: 'destroyData'
    };
    module.exports = connect.behavior('data/callbacks-cache', function (baseConnect) {
        var behavior = {};
        each(pairs, function (cacheCallback, dataCallbackName) {
            behavior[dataCallbackName] = function (data, set, cid) {
                this.cacheConnection[cacheCallback](assign(assign({}, set), data));
                return baseConnect[dataCallbackName].call(this, data, set, cid);
            };
        });
        return behavior;
    });
});
//# sourceMappingURL=callbacks-cache.js.map