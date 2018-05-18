"use strict";

//定义成语接龙参与方 数据结构
var WordPerson = function(jsonStr) {
    if(jsonStr) {
        var obj = JSON.parse(jsonStr);
        this.address = obj.address;//填成语的地址
        this.word = obj.word;//成语名字
        this.first = obj.first;//成语第一个字
        this.last = obj.last;//成语最后一个字
    } else {
        this.address = "";
        this.word = "";
        this.first = "";
        this.last = "";
    }
};

WordPerson.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

//定义一条成语链，每个用户都可以创建一条成语链
var WordLine = function(jsonStr) {
    //只能绑定合约属性，不知道这个合不合适
    LocalContractStorage.defineMapProperty(this, "wordMap", {//存放成语{编号，成语名}
        parse: function(jsonText) {
            return new WordPerson(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });

    if(jsonStr) {
        var obj = JSON.parse(jsonStr);
        this.adminAddress = obj.adminAddress;//定义成语链的管理员地址
        this.currentNumber = obj.currentNumber;//该成语链上现有成语个数
        this.initWord = obj.initWord;//该链初始成语
        //this.note = obj.note;//该成语链备注
        this.wordMap = obj.wordMap;//该成语链包含的成语参与人个数
    } else {
        this.adminAddress = "";
        this.currentNumber = "";
        this.initWord = "";
        //this.note = "";
        this.wordMap = "";
    }
}

WordLine.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
}

var WordMapLineContract = function() {
    LocalContractStorage.defineProperty(this, "wordLineNumber");//绑定合约属性，成语链个数
    LocalContractStorage.defineProperty(this, "award");//奖励NAS钱数,添加链
    LocalContractStorage.defineProperty(this, "putAward")//添加成语的奖励
    LocalContractStorage.defineProperty(this, "administrator");//定义合约部署者账户，也就是管理员
    LocalContractStorage.defineMapProperty(this, "lineAdminAddresses", {//绑定合约属性，各成语链创建者
        parse: function(jsonText) {
            return new WordPerson(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "lineMap", {//绑定合约属性，成语链集合
        parse: function(jsonText) {
            return new WordLine(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
};

WordMapLineContract.prototype = {
    init: function() {
        this.wordLineNumber = 0;//初始部署合约时，0条成语链
        this.award = 0.01;//单位NAS
        this.putAward = 0.001;//单位NAS
        this.administrator = Blockchain.transaction.from;
    },

    //添加一条成语链
    addWordLine: function(address, word, first, last, award) {
        var fromAddress = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;//交易的数值

        //检查是否该用户已经创建成语链
        if(wordLineNumber > 0){
            for(var i = 0; i < this.wordLineNumber; i++) {
                if(this.lineAdminAddresses.get(i).address == address){
                    throw new Error("Sorry, you can't build a word line because it was already exits.");
                }
            }
        }

        //判断成语是否是真的成语

        //添加成语链到合约
        var wordPerson = new WordPerson();
        wordPerson.address = address;
        wordPerson.word = word;
        wordPerson.first = first;
        wordPerson.last = last;

        var wordLine = new WordLine();
        wordLine.adminAddress = address;
        wordLine.currentNumber = 0;
        wordLine.initWord = word;
        wordLine.wordMap.put(wordLine.currentNumber, wordPerson);
        wordLine.currentNumber++;

        this.award = award;
        //this.putAward = putAward;
        this.wordLineNumber = 0;
        this.lineAdminAddresses.put(this.wordLineNumber, wordPerson);
        this.lineMap.put(this.wordLineNumber, wordLine);
        this.wordLineNumber++;

        //发送奖励，
        if(this.administrator != fromAddress) {//自己的话(合约部署者)就不给奖励了
            var result = Blockchain.transfer(fromAddress, award * 1000000000000000000
            );//这个单位还不是很清楚
            if(!result) {
                Event.Trigger("TransferAwardFailed", {
                    Transfer: {
                        from: Blockchain.transaction.to,
                        to: fromAddress,
                        value: award
                    }
                });
                throw new Error("Award transfer failed. Receiver Address:" + fromAddress + ", NAS:" + award);
            }

            Event.Trigger("TransferAwardSuccessful", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: fromAddress,
                    value: award
                }
            });
            throw new Error("Award transfer successed. Receiver Address:" + fromAddress + ", NAS:" + award);
        }

    },

    //查询返回所有成语链的创建者
    findAllLineAddress: function() {
        var result = "";
        for(var i  = 0; i < this.wordLineNumber; i++) {
            var address = this.lineAdminAddresses.get(i).address;
            result += address +"\r\n";
        }

        return result;
    },

    //查询返回所有成语链的所有成语
    findAllWordLine: function() {
        
        var result = "";
        for (var i = 0; i < this.wordLineNumber; i++) {
            var line = i + ",";
            for(var j = 0; j < this.lineMap.get(i).currentNumber; j++) {
                line += this.lineMap.get(i).wordMap.get(j).word + ",";
            }
            result += line + "\r\n";
        }
    },

    //添加成语到指定成语链
    putWordOnLine: function(address, word, first, last, lineNum) {
        
        //验证word是成语

        if (lineNum > this.wordLineNumber) {
            throw new Error("Put word failed, because not have" + lineNum + "wordLine.");
        }
        var lastWord = this.findWordOnLine(lineNum);

        if(lastWord.last != first) {
            throw new Error("New word's first not equals to last of lastword on line.");
        } else {
            var exitsWord = this.isWordExistsInLine(lineNum, word);
            if (!exitsWord) {
                throw new Error("The word already exits in" + lineNum + "wordLine.");
            } else {
                var wordPerson = new WordPerson();
                wordPerson.address = address;
                wordPerson.word = word;
                wordPerson.first = first;
                wordPerson.last = last;

                var lineWordNum = this.lineMap.get(lineNum).currentNumber;
                this.lineMap.get(lineNum).wordMap.put(lineWordNum, wordPerson);
                this.lineMap.get(lineNum).currentNumber++;

                //添加成功后，奖励
                var result = Blockchain.transfer(fromAddress, putAward * 1000000000000000000
                );//这个单位还不是很清楚
                if(!result) {
                    Event.Trigger("TransferPutWord Award Failed", {
                        Transfer: {
                            from: Blockchain.transaction.to,
                            to: fromAddress,
                            value: putAward
                        }
                    });
                    throw new Error("PutWord Award transfer failed. Receiver Address:" + fromAddress + ", NAS:" + putAward);
                }
    
                Event.Trigger("TransferPutWord Award Successful", {
                    Transfer: {
                        from: Blockchain.transaction.to,
                        to: fromAddress,
                        value: putAward
                    }
                });
                throw new Error("PutWord Award transfer successed. Receiver Address:" + fromAddress + ", NAS:" + putAward);
            }
        }
    },

    //查询某条成语链上最后一个成语对象
    findWordOnLine: function(lineNum) {
        if(lineNum > this.wordLineNumber) {
            throw new Error("LineNum IndexOutOfBoundsException");
        }
        var lastWord = this.lineMap.get(lineNum).currentNumber;
        return this.lineMap.get(lineNum).wordMap.get(lastWord);
    },

    //验证该成语的正确性
    isWordValidate: function() {

        //未实现的逻辑代码
        return true;
    },

    //验证该成语在该链上没有
    isWordExistsInLine: function(lineNum, word) {
        var result = true;
        for (var i = 0; i < this.lineMap.get(lineNum).currentNumber; i++) {
            if (word == this.lineMap.get(lineNum).wordMap.get(i).word) {
                result = false;
                break;
            }
        }
        return result;
    }
};

module.exports = WordMapLineContract;
