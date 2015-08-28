/*can-connect@0.2.7#constructor/constructor*/
var connect = require('../can-connect.js');
var WeakReferenceMap = require('../helpers/weak-reference-map.js');
var overwrite = require('../helpers/overwrite.js');
var idMerge = require('../helpers/id-merge.js');
var helpers = require('../helpers/helpers.js');
module.exports = connect.behavior('constructor', function (baseConnect) {
    var behavior = {
            cidStore: new WeakReferenceMap(),
            _cid: 0,
            get: function (params) {
                var self = this;
                return this.getData(params).then(function (data) {
                    return self.hydrateInstance(data);
                });
            },
            getList: function (set) {
                var self = this;
                return this.getListData(set).then(function (data) {
                    return self.hydrateList(data, set);
                });
            },
            hydrateList: function (listData, set) {
                if (Array.isArray(listData)) {
                    listData = { data: listData };
                }
                var arr = [];
                for (var i = 0; i < listData.data.length; i++) {
                    arr.push(this.hydrateInstance(listData.data[i]));
                }
                listData.data = arr;
                if (this.list) {
                    return this.list(listData, set);
                } else {
                    var list = listData.data.slice(0);
                    list[this.listSetProp || '__listSet'] = set;
                    return list;
                }
            },
            hydrateInstance: function (props) {
                if (this.instance) {
                    return this.instance(props);
                } else {
                    return helpers.extend({}, props);
                }
            },
            save: function (instance) {
                var serialized = this.serializeInstance(instance);
                var id = this.id(instance);
                var self = this;
                if (id === undefined) {
                    var cid = this._cid++;
                    this.cidStore.addReference(cid, instance);
                    return this.createData(serialized, cid).then(function (data) {
                        if (data !== undefined) {
                            self.createdInstance(instance, data);
                        }
                        self.cidStore.deleteReference(cid, instance);
                        return instance;
                    });
                } else {
                    return this.updateData(serialized).then(function (data) {
                        if (data !== undefined) {
                            self.updatedInstance(instance, data);
                        }
                        return instance;
                    });
                }
            },
            destroy: function (instance) {
                var serialized = this.serializeInstance(instance), self = this;
                return this.destroyData(serialized).then(function (data) {
                    if (data !== undefined) {
                        self.destroyedInstance(instance, data);
                    }
                    return instance;
                });
            },
            createdInstance: function (instance, props) {
                helpers.extend(instance, props);
            },
            updatedInstance: function (instance, data) {
                overwrite(instance, data, this.idProp);
            },
            updatedList: function (list, listData, set) {
                var instanceList = [];
                for (var i = 0; i < listData.data.length; i++) {
                    instanceList.push(this.hydrateInstance(listData.data[i]));
                }
                idMerge(list, instanceList, this.id.bind(this), this.hydrateInstance.bind(this));
            },
            destroyedInstance: function (instance, data) {
                overwrite(instance, data, this.idProp);
            },
            serializeInstance: function (instance) {
                return helpers.extend({}, instance);
            },
            serializeList: function (list) {
                var self = this;
                return list.map(function (instance) {
                    return self.serializeInstance(instance);
                });
            },
            isNew: function (instance) {
                var id = this.id(instance);
                return !(id || id === 0);
            }
        };
    return behavior;
});
//# sourceMappingURL=constructor.js.map