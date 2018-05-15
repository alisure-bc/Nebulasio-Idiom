"use strict";


var DictItem = function(text) {
	// "{\"key\":\"key value\",\"author\":\"address\",\"value\":\"some value\",\"time\":\"now time\"}"
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.value = obj.value;
        this.author = obj.author;
        this.time = obj.time;
	} else {
	    this.key = "";
	    this.author = "";
        this.value = "";
        this.time = "";
	}
};

DictItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};


var SuperDictionary = function () {

    LocalContractStorage.defineMapProperty(this, "repo_map", {
        parse: function (text) {
            return new DictItem(text);
        },
        stringify: function (o) {
            return o.toString()
        }
    });

};


SuperDictionary.prototype = {

    init: function () {
        // todo
    },

    // save
    save: function (key, value, time) {

        key = key.trim();
        value = value.trim();
        if (key === "" || value === "" || time === ""){
            throw new Error("empty key or value or time");
        }

        if (value.length > 64 || key.length > 64 || time.length > 32){
            throw new Error("key or value exceed limit length")
        }

        // 自动获取当前钱包检测到的登录钱包地址
        var from = Blockchain.transaction.from;

        // jud
        var dictItem = this.repo_map.get(key);
        if (dictItem){
            throw new Error("value has been occupied");
        }

        dictItem = new DictItem();
        dictItem.author = from;
        dictItem.key = key;
        dictItem.value = value;
        dictItem.time = time;

        this.repo_map.put(key, dictItem);
    },

    // 查询
    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo_map.get(key);
    }
};
module.exports = SuperDictionary;
