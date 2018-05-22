
nebulas = require("nebulas");

/*封装合约参数*/
var Contract = function (dapp_address) {
    this.dapp_address = dapp_address;
    this.neb = new nebulas.Neb();
    this.neb.setRequest(new nebulas.HttpRequest("https://testnet.nebulas.io"));

    this.account = nebulas.Account;
    this.from = this.account.NewAccount().getAddressString();

    this.value = "0";
    this.nonce = "0";
    this.gas_price = "1000000";
    this.gas_limit = "2000000";
};

/*初始化合约*/
var contract_class = new Contract("n1yCJnQWq9YHSDszfhrfyG8zRxkJcCiZe67");


/*初始化，一些界面的设置*/
function init() {
    $("#SearchFirst").show();
    $("#SearchTwo").hide();
    $("#SearchTwo .search_result").hide();
    $("#SearchTwo .search_null").hide();

    /*设置创建成语链*/
    $("#SearchTwo .create_button").click(function () {
        var value = $(this).parent().find(".create_text").val();
        var address = $(this).parent().find(".create_address").val();
        /*需要检查一下*/
        alert("check value");
        create_get_data(value, address, contract_class, function () {
            alert("创建失败了哥！");
        }, function (search_value) {
            alert("创建成功了哥！");
            check_idiom(search_value);
        });
        /*成功后搜索成语，得到该成语所在的成语链*/
    });
}

/*搜索入口*/
function search_init() {
    $("#SearchFirst .search_button").click(function () {
        var search_value = $(this).prev().val();

        /*检查search_value,若成功，调用回调函数，否则给出提示错误*/
        check_idiom(search_value);
    });
    $("#SearchTwo .search_button").click(function () {
        var search_value = $(this).prev().val();
        /*检查search_value,若成功，调用回调函数，否则给出提示错误*/
        check_idiom(search_value);
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
    search_get_data(search_value, contract_class, function () {
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
    $("#SearchTwo .search .search_text").val(search_value);
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
            $result_html_item.find(".award").text("20000");
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
        var address = $(this).parent().find(".append_address").val();
        alert("调用api进行处理:" + id + value + address);

        /*成功后搜索成语，得到该成语所在的成语链*/
    });

}

/*搜索的结果为空*/
function search_null(search_value) {
    $("#SearchFirst").hide();
    $("#SearchTwo").show();
    $("#SearchTwo .search_result").hide();
    $("#SearchTwo .search_null").show();
    if(search_value.length >= 1){
        $("#SearchTwo .search_null .count .text").text(search_value);
        $("#SearchTwo .search_null .search_text").val(search_value);
    }
}


/*封装请求函数*/
function get_data(contract_class, contract, callback) {
    contract_class.neb.api.call(contract_class.from, contract_class.dapp_address, contract_class.value,
        contract_class.nonce, contract_class.gas_price, contract_class.gas_limit, contract).then(function (resp) {
        callback(resp);
    }).catch(function (err) {
        console.log("error:" + err.message);
        alert("error: " + err.message);
    });
}

/*查询*/
function search_get_data(search_value, contract_class, callback_null, callback_ok) {
    var now_contract = {
        "function": "checkIdiomInChains",
        "args": "[\"" + search_value + "\"]"
    };
    get_data(contract_class, now_contract, function (resp) {
        console.log("search ... :" + search_value + ", " + resp);
        if(resp.result !== "false" && resp.result !== "null"){
            callback_ok(JSON.parse(JSON.parse(resp.result)));
        }else{
            callback_null();
        }
    })
}

/*查询*/
function create_get_data(idiom_value, user_address, contract_class, callback_error, callback_ok) {
    var now_contract = {
        "function": "createIdiomChain",
        "args": "[\"" + idiom_value + "\", \"" + user_address + "\", \"" + get_time() + "\"]"
    };
    get_data(contract_class, now_contract, function (resp) {
        console.log("create ... :" + idiom_value + ", " + resp);
        if(resp.result !== "false"){
            callback_ok(idiom_value);
        }else{
            callback_error();
        }
    })
}

/*获取事件*/
function get_time() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >=1 && month <= 9) {
        month = "0" + month;
    }
    if(strDate >=0 && strDate <=9) {
        strDate = "0" + strDate;
    }
    var currentDate = date.getFullYear() + seperator1 + month
        + seperator1 + strDate + " " + date.getHours()
        + seperator2 + date.getMinutes() + seperator2
        + date.getSeconds();
    return currentDate;
}

$(function () {
    /*初始化*/
    init();

    function deal_get(resp) {
        var result = resp.result;
        console.log("return of rpn call: " + JSON.stringify(result));

        if(result === "null"){
            alert("error in deal_get: " + result);
        }else{
            try{
                result = JSON.parse(result);
            }catch (err) {
                alert("error in deal_get: " + err.message);
            }
            if (!!result.key){
                alert("ok: key=" + result.key + ", value=" +
                    result.value + ", author=" + result.author + ", time=" + result.time);
            }else{
                alert("result in deal_get: " + result);
            }
        }
    }

    /*启动搜索*/
    search_init();
});
