
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
        alert("调用api进行处理:" + value + address);
        /*成功后搜索成语，得到该成语所在的成语链*/
    });
}

/*搜索入口*/
function search(callback) {
    $("#SearchFirst .search_button").click(function () {
        var search_value = $(this).prev().val();

        /*检查search_value,若成功，调用回调函数，否则给出提示错误*/
        check_idiom(search_value, callback);
    });
    $("#SearchTwo .search_button").click(function () {
        var search_value = $(this).prev().val();
        /*检查search_value,若成功，调用回调函数，否则给出提示错误*/
        check_idiom(search_value, callback);
    });
}

/*检查成语，成功后执行回调*/
function check_idiom(search_value, callback) {
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
        callback(search_value);
    }else {
        alert("请输入一个成语");
    }
}

/*检查成语成功后的回调：根据search_value，搜索信息*/
function search_idiom(search_value) {
    /*联网去搜索信息*/

    var result = [
        {
            id:1,
            content:[
                {value: "我是成语", author: "sdfghjklzxcvbnmwertyu", award: "1000000w", time: "2018-05-16 09:46:33"},
                {value: "我是成语", author: "sdfghjklzxcvbnmwertyu", award: "1000000w", time: "2018-05-16 09:46:33"},
                {value: "我是成语", author: "sdfghjklzxcvbnmwertyu", award: "1000000w", time: "2018-05-16 09:46:33"},
                {value: "我是成语", author: "sdfghjklzxcvbnmwertyu", award: "1000000w", time: "2018-05-16 09:46:33"},
                {value: "我是成语", author: "sdfghjklzxcvbnmwertyu", award: "1000000w", time: "2018-05-16 09:46:33"}
            ]
        },
        {
            id:2,
            content:[
                {value: "我是成语", author: "sdfghjklzxcvbnmwertyu", award: "1000000w", time: "2018-05-16 09:46:33"},
                {value: "我是成语", author: "sdfghjklzxcvbnmwertyu", award: "1000000w", time: "2018-05-16 09:46:33"},
                {value: "我是成语", author: "sdfghjklzxcvbnmwertyu", award: "1000000w", time: "2018-05-16 09:46:33"},
                {value: "我是成语", author: "sdfghjklzxcvbnmwertyu", award: "1000000w", time: "2018-05-16 09:46:33"},
                {value: "我是成语", author: "sdfghjklzxcvbnmwertyu", award: "1000000w", time: "2018-05-16 09:46:33"}
            ]
        },
        {
            id:3,
            content:[
                {value: "我是成语", author: "sdfghjklzxcvbnmwertyu", award: "1000000w", time: "2018-05-16 09:46:33"},
                {value: "我是成语", author: "sdfghjklzxcvbnmwertyu", award: "1000000w", time: "2018-05-16 09:46:33"},
                {value: "我是成语", author: "sdfghjklzxcvbnmwertyu", award: "1000000w", time: "2018-05-16 09:46:33"},
                {value: "我是成语", author: "sdfghjklzxcvbnmwertyu", award: "1000000w", time: "2018-05-16 09:46:33"},
                {value: "我是成语", author: "sdfghjklzxcvbnmwertyu", award: "1000000w", time: "2018-05-16 09:46:33"}
            ]
        }
    ];

    /*得到了信息*/
    var has_result = false;
    if(has_result){
        search_ok(search_value, result);
    }else{
        search_null(search_value);
    }
}

/*搜索成功，根据数据进行展示，处理接续操作*/
function search_ok(search_value, result) {
    $("#SearchFirst").hide();
    $("#SearchTwo").show();
    $("#SearchTwo .search_result").show();
    $("#SearchTwo .search_null").hide();
    if(search_value.length > 0){
        /*显示结果*/
        show_search_result(search_value, result)
    }else{
        alert("出现错误。。。。");
    }
}

/*展示搜索成功后的结果*/
function show_search_result(search_value, result) {

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
            if (now_item.value === search_value){
                $result_html_item.find(".item").addClass("current");
            }
            $result_html_item.find(".value").text(now_item.value);
            $result_html_item.find(".author").text(now_item.author);
            $result_html_item.find(".award").text(now_item.award);
            $result_html_item.find(".time").text(now_item.time);
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

$(function () {
    /*初始化*/
    init();
    
    /*启动搜索*/
    search(search_idiom);
});
