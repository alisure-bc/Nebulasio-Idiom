
var Nebulas = require("nebulas");
var NebPay = require("nebpay");

/*创建交易*/
var neb = new Nebulas.Neb();
neb.setRequest(new Nebulas.HttpRequest("https://testnet.nebulas.io"));
var nebPay = new NebPay();

var dapp_address = "n1gbvnmGDvfQ2Tpb8sKYdrKTcniTgfTEjH5";

/*封装合约参数*/
var ContractValue = function () {
    this.value = "0";
    this.nonce = "0";
    this.gas_price = "1000000";
    this.gas_limit = "2000000";
};


/*初始化，一些界面的设置*/
function init() {
    $("#SearchFirst").show();
    $("#SearchTwo").hide();
    $("#SearchTwo .search_result").hide();
    $("#SearchTwo .search_null").hide();

    /*设置创建成语链*/
    $("#SearchTwo .create_button").click(function () {
        var value = $(this).parent().find(".create_text").val();
        /*需要检查一下*/
        alert("check value");
        create_data(value, function (search_value) {
            alert("创建失败了哥！");
        }, function (search_value) {
            check_idiom(search_value);
        });
    });
    $("#SearchTwo .create_text").on("keypress", function (event) {
        if(event.keyCode == 13){
            var value = $(this).val();
            /*需要检查一下*/
            alert("check value");
            create_data(value, function (search_value) {
                alert("创建失败了哥！");
            }, function (search_value) {
                check_idiom(search_value);
            });
        }
    });
}

/*搜索入口*/
function search_init() {
    $("#SearchFirst .search_button").click(function () {
        var search_value = $(this).prev().val();
        /*检查search_value,若成功，调用回调函数，否则给出提示错误*/
        check_idiom(search_value);
    });
    $("#SearchFirst .search_text").on("keypress", function (event) {
        if(event.keyCode == 13){
            var search_value = $(this).val();
            /*检查search_value,若成功，调用回调函数，否则给出提示错误*/
            check_idiom(search_value);
        }
    });
    $("#SearchTwo .search_button").click(function () {
        var search_value = $(this).prev().val();
        /*检查search_value,若成功，调用回调函数，否则给出提示错误*/
        check_idiom(search_value);
    });
    $("#SearchTwo .search_text").on("keypress", function (event) {
        if(event.keyCode == 13) {
            var search_value = $(this).val();
            /*检查search_value,若成功，调用回调函数，否则给出提示错误*/
            check_idiom(search_value);
        }
    });
}

/*检查成语，成功后执行回调*/
function check_idiom(search_value) {
    if(search_value.length > 0){
        /*需要单独写服务器处理*/
        /*$.get("https://www.pwxcoo.com/dictionary?type=idiom&word=" + search_value, function(data) {
            if (data.length < 5) {
                /!*不存在该成语，显示错误*!/
                alert("没有该成语");
            } else{
                /!*检查成功，开始执行回调*!/
                callback(search_value);
            }
        });*/

        /*检查成功，开始执行回调*/
        search_idiom_fn(search_value);
    }else {
        alert("请输入一个成语");
    }
}

/*检查成语成功后的回调：根据search_value，搜索信息*/
function search_idiom_fn(search_value) {
    /*联网去搜索信息*/
    search_data(search_value, function () {
        search_null(search_value);
    }, function (data) {
        search_ok(search_value, data);
    });
}

/*搜索成功，根据数据进行展示，处理接续操作*/
function search_ok(search_value, result) {
    $("#SearchFirst").hide();
    $("#SearchTwo").show();
    $("#SearchTwo .search_result").show();
    $("#SearchTwo .search_null").hide();
    $("#SearchTwo .search .search_text").val("");
    if(search_value.length > 0){
        /*显示结果*/
        _show_search_result(search_value, result)
    }else{
        alert("出现错误。。。。");
    }
}

/*展示搜索成功后的结果*/
function _show_search_result(search_value, result) {

    /*设置文字*/
    $("#SearchTwo .search_result .count .text").text(search_value);
    $("#SearchTwo .search_result .count .number").text(result.length);

    /*设置内容*/
    var $html = $("#SearchTwo .search_result .result");
    $html.empty();
    for(var i=0; i < result.length; i++){
        var now_id = result[i].id;
        var now_data = result[i].content;
        var $result_html_one = $("#temp .result_html_one").clone();
        $result_html_one.find(".index").text(i + 1);
        $result_html_one.find(".append").attr("data_id", now_id);
        for(var j=0; j < now_data.length; j++){
            var now_item = now_data[j];
            var $result_html_item = $("#temp .result_html_item").clone();
            if (now_item.idiom === search_value){
                $result_html_item.find(".item").addClass("current");
            }
            $result_html_item.find(".value").text(now_item.idiom);
            $result_html_item.find(".author").text(now_item.address);
            $result_html_item.find(".time").text(now_item.storageTime);
            $result_html_one.find(".append").before($result_html_item.html());  /*必须是html()*/
        }
        $html.append($result_html_one.html());  /*必须是html()*/
    }

    /*设置点击事件*/
    $("#SearchTwo .open").off("click").on("click", function () {
        if($(this).next().is(":visible")){
            $(this).next().slideUp(function () {
                $(this).prev().addClass("radius")
            });
        }else{
            $(this).removeClass("radius").next().slideDown();
        }
    });

    /*设置接续事件*/
    $("#SearchTwo .append_button").off("click").on("click", function () {
        var id = $(this).parent().attr("data_id");
        var value = $(this).parent().find(".append_text").val();
        append_data(value, parseInt(id), function () {
            alert("接续失败了哥！");
        }, function (value) {
            check_idiom(value);
        });
    });
    $("#SearchTwo .append_text").off("keypress").on("keypress", function (event) {
        if(event.keyCode == 13){
            var id = $(this).parent().attr("data_id");
            var value = $(this).val();
            append_data(value, parseInt(id), function () {
                alert("接续失败了哥！");
            }, function (value) {
                check_idiom(value);
            });
        }
    });

}

/*搜索的结果为空*/
function search_null(search_value) {
    $("#SearchFirst").hide();
    $("#SearchTwo").show();
    $("#SearchTwo .search_result").hide();
    $("#SearchTwo .search_null").show();
    $("#SearchTwo .search .search_text").val("");
    if(search_value.length >= 1){
        $("#SearchTwo .search_null .count .text").text(search_value);
        $("#SearchTwo .search_null .search_text").val(search_value);
        $("#SearchTwo .create_text").val(search_value);
    }
}


/*查询*/
function search_data(search_value, callback_null, callback_ok) {
    /*初始化合约*/
    var contract_value = new ContractValue();
    var from = Nebulas.Account.NewAccount().getAddressString();
    var contract_fn = {
        "function": "checkIdiomInChains",
        "args": "[\"" + search_value + "\"]"
    };

    neb.api.call(from, dapp_address, contract_value.value, contract_value.nonce,
        contract_value.gas_price, contract_value.gas_limit, contract_fn)
        .then(function (resp) {
            if(resp.result !== "false" && resp.result !== "null"){
                callback_ok(JSON.parse(JSON.parse(resp.result)));
            }else{
                callback_null();
            }
            console.log("search ... :" + search_value + ", " + resp);
        }).catch(function (err) {
            console.log("error:" + err.message);
            alert("error: " + err.message);
        });

}

/*创建*/
function create_data(idiom_value, callback_error, callback_ok) {
    /*初始化合约*/
    var contract_value = new ContractValue();
    var now_contract = {
        "function": "createIdiomChain",
        "args": "[\"" + idiom_value + "\"]"
    };

    /*发生交易，返回交易序号*/
    var serialNumber = nebPay.call(dapp_address, contract_value.value, now_contract.function, now_contract.args, {listener: print_result});

    /*定时查询交易是否成功，成功后执行回调：查询该条成语*/
    var intervalQuery = setInterval(function () {
        funcIntervalQuery();
    }, 10000);

    function funcIntervalQuery() {
        nebPay.queryPayInfo(serialNumber)
            .then(function (resp) {
                print_result(resp);
                var respObject = JSON.parse(resp);
                if(respObject.code === 0 && respObject.data.status === 1){
                    clearInterval(intervalQuery);
                    callback_ok(idiom_value)
                }
            }).catch(function (err) {
                callback_error(idiom_value)
            });
    }
}

/*追加*/
function append_data(idiom_value, chain_id, callback_error, callback_ok) {
    /*初始化合约*/
    var contract_value = new ContractValue();
    var now_contract = {
        "function": "addIdiomToChain",
        "args": "[\"" + idiom_value + "\", \"" + chain_id + "\"]"
    };

    /*发生交易，返回交易序号*/
    var serialNumber = nebPay.call(dapp_address, contract_value.value, now_contract.function, now_contract.args, {listener: print_result});

    /*定时查询交易是否成功，成功后执行回调：查询该条成语*/
    var intervalQuery = setInterval(function () {
        funcIntervalQuery();
    }, 10000);

    function funcIntervalQuery() {
        nebPay.queryPayInfo(serialNumber)
            .then(function (resp) {
                print_result(resp);
                var respObject = JSON.parse(resp);
                if(respObject.code === 0 && respObject.data.status === 1){
                    clearInterval(intervalQuery);
                    callback_ok(idiom_value)
                }
            }).catch(function (err) {
            callback_error(idiom_value)
        });
    }
}

/*打印网络返回的结果*/
function print_result(resp) {
    console.log("response of push: " + JSON.stringify(resp))
}

$(function () {
    /*初始化*/
    init();

    /*启动搜索*/
    search_init();
});
