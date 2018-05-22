"use strict";

//成语接龙参与者 数据结构
var Player = function(jsonStr) {
    if (jsonStr) {
        var obj = JSON.parse(jsonStr);
        this.address = obj.address;
        this.idiom = obj.idiom;
        this.storageTime = obj.storageTime;
    } else {
        this.address = "";
        this.idiom = "";
        this.storageTime = "";
    }
};

Player.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var IdiomChainContract = function() {
    LocalContractStorage.defineProperty(this, "chainNumber");
    LocalContractStorage.defineProperty(this, "idiomNumber");
    LocalContractStorage.defineProperty(this, "createAward");
    LocalContractStorage.defineProperty(this, "addAward");
    LocalContractStorage.defineMapProperty(this, "idiomPool", {
        parse: function(jsonText) {
            return new Player(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "idiomChains");
};

IdiomChainContract.prototype = {
    init: function() {
        this.chainNumber = 0;
        this.idiomNumber = 0;
        this.createAward = 10000000;
        this.addAward = 1000000;
    },

    //创建一条成语链，判断成语是否存在，存在则不能创建，不存在则创建成语链，并显示该链
    createIdiomChain: function(_idiom) {

        //检查地址是否符合规范

        var idiomExist = this.isIdiomExists(_idiom);
        //成语不存在，可以创建
        
        if (!idiomExist) {
            var player = new Player();
            player.address = Blockchain.transaction.from;
            player.idiom = _idiom;
            player.storageTime = this.getCurrentTime();
            //添加成语到成语池里
            this.idiomPool.put(this.idiomNumber, player);
            //创建一条成语链，把成语id加进去
            this.idiomChains.put(this.chainNumber, "," + this.idiomNumber);
            //成语链总数加1
            this.chainNumber++;
            //成语池总数量加1
            this.idiomNumber++;

            // //发布奖励
            // var result = Blockchain.transfer(_address, addAward);//这个单位还不是很清楚
            // if(!result) {
            //     Event.Trigger("TransferAwardFailed", {
            //         Transfer: {
            //             from: Blockchain.transaction.to,
            //             to: _address,
            //             value: addAward
            //         }
            //     });
            //     throw new Error("Award transfer failed. Receiver Address:" + _address + ", NAS(Wei):" + addAward);
            // }

            // Event.Trigger("TransferAwardSuccessful", {
            //     Transfer: {
            //         from: Blockchain.transaction.to,
            //         to: _address,
            //         value: addAward
            //     }
            // });

            return true;
        } else {
            return false;
        }
    },
    //查询成语是否存在，存在显示它在的所有链，不存在显示不存在
    checkIdiomInChains: function(_idiom) {
        var idiomExist = this.isIdiomExists(_idiom);
        if (!idiomExist) {
            return null;
        }
        var id;
        for (var i = 0; i < this.idiomNumber; i++) {
            if(_idiom == this.idiomPool.get(i).idiom) {
                id = i;
                break;
            }
        }
        var array = [];//拥有成语的链编号

        var idStr = "" + id;
        var chainStr;
        for (var i = 0; i < this.chainNumber; i++) {
            chainStr = this.idiomChains.get(i);
            if(this.isIdiomInChain(idStr, chainStr)){
                array.push(i);
            }
        }
        var result = "[";
        //存储每一条存在搜索成语的链
        for (var i = 0; i < array.length; i++) {
            result = result + "{\"id\":" + array[i] + ",\"content\":";
            result += this.getInfoByChain(array[i]);
            result += "},";
        }
        result = result.substring(0, result.length-1);
        result += "]";
        return result;
    },
    //添加成语到某条链，判断成语和该链上的最后一个成语是否符合规则，符合就添加，不符合就返回信息提示
    addIdiomToChain: function(_idiom, _chainId) {

        //检查地址是否符合规范

        //判断成语是否符合成语接龙规则,成语不能与成语池里的成语重复
        var str = this.idiomChains.get(_chainId);
        var index = str.lastIndexOf(",");
        var id = str.substring(index + 1);
        var now_idiom =  this.idiomPool.get(parseInt(id)).idiom;
        if (_idiom.substring(0,1) != now_idiom.substring(now_idiom.length - 1)) {
            /*..........................*/
            throw new Error("key or value exceed limit length");
        } else {
            //成语不能与成语池里的成语重复,若存在，直接添加该成语在成语池中的编号到成语链中
            if (this.isIdiomExists(_idiom)) {//池中存在
                var result = this.idiomChains.get(_chainId);
                result += "," + this.getIdiomIdFromPool(_idiom);

                this.idiomChains.put(_chainId, result);
                return true;
            }
            //成语池中不存在该成语，并且符合该成语链 接龙规则
            var player = new Player();
            player.idiom = _idiom;
            player.address = Blockchain.transaction.from;
            player.storageTime = this.getCurrentTime();

            this.idiomPool.put(this.idiomNumber, player);
            
            var result = this.idiomChains.get(_chainId);
            result += "," + this.idiomNumber;
            
            this.idiomNumber++;
            this.idiomChains.put(_chainId, result);
            return true;
        }
        //符合添加成语到链，添加成语到成语池，返回true
        //不符合，返回false
    },


    //查询成语在成语字典池中是否存在
    isIdiomExists: function(_idiom) {
        var result = false;
        if (this.idiomNumber == 0) {
            result = false;
        } else {
            for (var i = 0; i < this.idiomNumber; i++) {
                if (_idiom == this.idiomPool.get(i).idiom) {
                    result = true;
                    break;
                }
            }
        }
        return result;
    },
    //查询成语是否在某条成语链上，用编号(辅助函数，查询一个id，是否在字符串中)
    isIdiomInChain: function(_id, _idiomChain) {
        var strs = _idiomChain.split(",");
        for (var i = 0; i < strs.length; i++) {
            if (_id == strs[i]) {
                return true;
            }
        }
        return false;
    },

    //返回一条成语链上的所有成语信息
    getInfoByChain: function(_chainId) {

        var result = "[";
        var chainStr = this.idiomChains.get(_chainId);
        var strs = chainStr.split(",");

        var player;
        for (var i = 1; i < strs.length; i++) {
            player = this.idiomPool.get(parseInt(strs[i]));
            result += JSON.stringify(player) + ",";
        }
        result = result.substring(0, result.length-1);
        result += "]";
        return result;
    },

    //返回成语池中所有成语集合
    getAllIdiomFromPool: function() {
        if (this.idiomNumber == 0) {
            return null;
        } else {
            var result = "";
            for (var i = 0; i < this.idiomNumber; i++) {
                result += this.idiomPool.get(i).idiom + ",";
            }
            result = result.substring(0, result.length-1);
            return result;
        }
    },
    //返回成语在成语池里的id
    getIdiomIdFromPool: function(_idiom) {
        var result = null;
        for (var i = 0; i < this.idiomNumber; i++) {
            if(_idiom == this.idiomPool.get(i).idiom) {
                result = "" + i;
                break;
            }
        }
        return result;
    },
    //获取当前系统的日期时间，格式为"yyyy-MM-dd HH:MM:SS"
    getCurrentTime: function() {
        var now = new Date();
        now.setHours(now.getHours()+8);

        var year = now.getFullYear();       //年
        var month = now.getMonth() + 1;     //月
        var day = now.getDate();            //日

        var hh = now.getHours();            //时
        var mm = now.getMinutes();          //分
        var ss = now.getSeconds();           //秒

        var clock = year + "-";

        if(month < 10)
            clock += "0";

        clock += month + "-";

        if(day < 10)
            clock += "0";

        clock += day + " ";

        if(hh < 10)
            clock += "0";

        clock += hh + ":";
        if (mm < 10) clock += '0';
        clock += mm + ":";

        if (ss < 10) clock += '0';
        clock += ss;
        return(clock);
   }
};

module.exports = IdiomChainContract;

//n1gbvnmGDvfQ2Tpb8sKYdrKTcniTgfTEjH5
//前台应该不能输入地址，直接根据他调用的地址填上去
//添加数据之后要对该交易进行交易查询，知道success才可以停止周期查询
