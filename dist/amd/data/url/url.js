/*can-connect@1.5.0-pre.1#data/url/url*/
define(function (require, exports, module) {
    var isArray = require('can-util/js/is-array');
    var assign = require('can-util/js/assign');
    var each = require('can-util/js/each');
    var ajax = require('can-util/dom/ajax');
    var string = require('can-util/js/string');
    var getIdProps = require('../../helpers/get-id-props');
    var dev = require('can-util/js/dev');
    var connect = require('../../can-connect');
    var makeRest = require('can-make-rest');
    var defaultRest = makeRest('/resource/{id}');
    var makePromise = require('can-util/js/make-promise');
    var urlBehavior = connect.behavior('data/url', function (baseConnection) {
        var behavior = {};
        each(defaultRest, function (defaultData, dataInterfaceName) {
            behavior[dataInterfaceName] = function (params) {
                var meta = methodMetaData[dataInterfaceName];
                if (typeof this.url === 'object') {
                    if (typeof this.url[dataInterfaceName] === 'function') {
                        return makePromise(this.url[dataInterfaceName](params));
                    } else if (this.url[dataInterfaceName]) {
                        var promise = makeAjax(this.url[dataInterfaceName], params, defaultData.method, this.ajax || ajax, findContentType(this.url), meta);
                        return makePromise(promise);
                    }
                }
                var resource = typeof this.url === 'string' ? this.url : this.url.resource;
                if (resource) {
                    var idProps = getIdProps(this);
                    var resourceWithoutTrailingSlashes = resource.replace(/\/+$/, '');
                    var result = makeRest(resourceWithoutTrailingSlashes, idProps[0])[dataInterfaceName];
                    return makePromise(makeAjax(result.url, params, result.method, this.ajax || ajax, findContentType(this.url), meta));
                }
                return baseConnection[name].call(this, params);
            };
        });
        return behavior;
    });
    var methodMetaData = {
        getListData: {},
        getData: {},
        createData: {},
        updateData: {},
        destroyData: { includeData: false }
    };
    var findContentType = function (url) {
        if (typeof url === 'object' && url.contentType) {
            var acceptableType = url.contentType === 'application/x-www-form-urlencoded' || url.contentType === 'application/json';
            if (acceptableType) {
                return url.contentType;
            } else {
            }
        }
        return 'application/json';
    };
    var makeAjax = function (ajaxOb, data, type, ajax, contentType, reqOptions) {
        var params = {};
        if (typeof ajaxOb === 'string') {
            var parts = ajaxOb.split(/\s+/);
            params.url = parts.pop();
            if (parts.length) {
                params.type = parts.pop();
            }
        } else {
            assign(params, ajaxOb);
        }
        params.data = typeof data === 'object' && !isArray(data) ? assign(params.data || {}, data) : data;
        params.url = string.sub(params.url, params.data, true);
        var encodeJSON = contentType !== 'application/x-www-form-urlencoded' && (type && (type === 'POST' || type === 'PUT'));
        if (encodeJSON) {
            params.data = JSON.stringify(params.data);
            params.contentType = contentType;
        }
        if (reqOptions.includeData === false) {
            delete params.data;
        }
        return ajax(assign({
            type: type || 'post',
            dataType: 'json'
        }, params));
    };
    module.exports = urlBehavior;
});
//# sourceMappingURL=url.js.map