// 跳转到用户押金列表页
function toBalancePage() {
	var url="r?wf_num=V_ADBM_G006";
	location.href=url;
}

// 跳转到用户押金列表页
function toChargeReCordPage() {
	var url="r?wf_num=V_ADBM_G010";
	location.href=url;
}

$(function(){
	
	//1、按回车触发事件
	$('#book_code').bind('keypress',function(event){
		var book_code = $("#book_code").val();
		if(event.keyCode == "13"){
			if(book_code != ""){
				var obj = find(book_code);
			}else{
				alert("请输入用户信息！");
			}
		}
	});
	
	//点击搜索图标触发事件
	$("#btn0").click(function(){
		$('#win').window({width:700,height:460,modal:true,resizable:true,title:'用户',center:true});
		$('#win').html("<iframe height='100%' width='100%' overflow='hidden' frameborder='0' src='view?wf_num=V_ADBM_G004'></iframe>");
	});
});


function doCharge() {
	// $("#WF_ParentDocUnid").val(parent.$("#WF_DocUnid").val());
	if(!$("#user_id").val() || $("#user_id").val().indexOf(',') != -1) {
		alert("请选择一个用户");
		return;
	}
	
	var inputNumber = $("#recharge_amount").val();
	// 判断是否是负数
	var isMinus = false;
	if (inputNumber[0]  == "-") {
		isMinus = true;
		inputNumber = inputNumber.substr(1,inputNumber.length);
	}
	var patt = /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/;
	var isFigure = patt.test(inputNumber);
	if(isFigure) {
		var queryObj = {user_id:$("#user_id").val(),user_id_show:$("#user_id_show").text(),recharge_amount:$("#recharge_amount").val()};
		console.log(queryObj);
		$.ajax({
			url:'r?wf_num=R_ADBM_D003',  //根据图书编码获取相关信息
			type: "post",
			async : true,
			dataType:'json',
			data: queryObj,
			success:function(data){
				console.log(data);
				// 充值成功后刷新本页面 rule?wf_num=R_ADBM_D003
				if(data && data.isSuccess) {
					alert("充值成功！");
					window.location.reload();
				} else {
					alert("充值失败");
				}
			}
		});
		
	} else {
		alert("金额填写不正确");
	}
	
	
	
	
}


function formonload(){
	
	//控制输入的字符最多为**
	$('#book_code').unbind().bind('keyup',function(){
		controleInputLength(this, 20);
	});
	$('#add_number').unbind().bind('keyup',function(){
		controleInputLength(this, 20);
	});
	$('#inventory_remark').unbind().bind('keyup',function(){
		controleInputLength(this, 200);
	});
}

function formonsubmit(){
	var addnumber = $("#add_number").val();
	//校验图书的追加数量是否为除0外的整数
	if(!addnumber.match("^(-)?[1-9][0-9]*$")){
		alert("您的输入有误，请重新输入除0外的整数！");
		return false;
	}
}

function SaveDocument(btnAction){
	if($("#book_number").val()!==""){
		var cborrownumber = $("#cborrow_number").val();
		var addnumber = $("#add_number").val();
		var total = accAdd(cborrownumber,addnumber);     //求可借数量+追加数量的和
		var bookname = $("#book_name").val();
		
		if(total>=0){
			//保存时将name转为id
			$("#place_id").val($("#place").val());
			$("#category_id").val($("#category").val());
			SaveAppDocument(btnAction);
		}else{
			alert("'"+bookname+"'图书的可借数量为："+cborrownumber+", 请重新输入追加数量！");
			return false;
		}
	}else{
		alert("请输入正确的图书编码");
		return false;
	}
}

function SaveDocumentCallBack(btnAction,rs){
	//保存成功后的回调函数
	alert(rs.msg);
	//图书入库后图书总量和可借数量的变化
	$.ajax({
		url:'r?wf_num=R_ADBM_B013',
		type: "post",
		async : false,
		dataType:'json',
		data:{add_number:$("#add_number").val(),WF_OrUnid:$("#WF_OrUnid").val()},
		success:function(data){}
	});
	var url="r?wf_num=V_ADBM_E005";
	location.href=url;
}


/**
 * 定义record函数跳转到入库记录视图
 */
function record(){
	var url="r?wf_num=V_ADBM_E005";
	location.href=url;
}



/**
 * 定义find函数根据图书编号获取相关信息
 */
function find(book_code){
	$.ajax({
		url:'r?wf_num=R_ADBM_B006',  //根据图书编码获取相关信息
		type: "post",
		async : false,
		dataType:'json',
		data:{book_code:$("#book_code").val()},
		success:function(data){
			if(data.message != "-1"){
				$("#book_name").val(data.book_name);
				$("#category_name").val(data.category_name);
				$("#place_name").val(data.place_name);
				$("#book_number").val(data.book_number);
				$("#place_id").val(data.place_id);
				$("#category_id").val(data.category_id);
				$("#cborrow_number").val(data.cborrow_number);
				$("#WF_OrUnid").val(data.WF_OrUnid);
				$("#place").val(data.place);
				$("#category").val(data.category);
				
			}else{
				alert("未查询到该书籍，请重新输入！");
			}
		}
	});
}

/**
 * 控制输入框的输入长度
 *
 */
function controleInputLength(obj, len){
	if($(obj).val().length > len){
		$(obj).val( $(obj).val().substring(0,len));
	}
}
