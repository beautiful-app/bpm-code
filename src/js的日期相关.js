
function judgeTime(data){
    var date = data.toString();
    var year = date.substring(0, 4);
    var month = date.substring(4, 6);
    var day = date.substring(6, 8);
    var d1 = new Date(year + '/' + month + '/' + day);
    var dd = new Date();
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;
    var d = dd.getDate();
    var d2 = new Date(y + '/' + m + '/' + d);
    var iday = parseInt(d2 - d1) / 1000 / 60 / 60 / 24;
    return iday;
  }


function save(){
    stopEditRow();
    var flag = 1;                                       //保持后是否可跳转V_ADBM_G003我的借阅列表的标识
    var selectrows = $("#dg").datagrid("getSelections");      //获取选择的数据行
    var allrows = $("#dg").datagrid("getRows");     //获取当前的数据行
    var unselectrows = allrows.length-selectrows.length;  //获取未选中的行数
    
    var myDate = new Date();    
    var year = myDate.getFullYear()+"-";                                  //获取完整的年份(4位,如：2017)
    var month =  myDate.getMonth()+1+"-";                                 //获取当前月份(0-11,0代表1月)
    month = PrefixInteger(month,3);                                       //自动填充3位。如：03-
    var date =  myDate.getDate();                                         //获取当前日(1-31) 
    date = PrefixInteger(date,2);
    var newdate = year+month+date;
    var beginDate = new Date(newdate.replace(/-/g, "/"));                 //开始日期
    if(allrows.length>0){
        
        //若存在未选中的数据行，提示“保存前删除图书”
        /*if(unselectrows > 0){                       
            alert("请删除不需要的图书！");
            return false;
        }*/
        if(selectrows.length>0){
            for(var i=0;i<selectrows.length;i++){

                //结束日期
                var endDate = new Date(selectrows[i].borrow_date.replace(/-/g, "/"));
                //日期差值,即包含周六日、以天为单位的工时，86400000=1000*60*60*24.
                var workDayVal = (endDate - beginDate) / 86400000 + 1;
                //工时的余数
                var remainder = workDayVal % 7;
                //工时向下取整的除数
                var divisor = Math.floor(workDayVal / 7);
                var weekendDay = 2 * divisor;
                
                //起始日期的星期，星期取值有（1,2,3,4,5,6,0）
                var nextDay = beginDate.getDay();
                //从起始日期的星期开始 遍历remainder天
                for (var tempDay = remainder; tempDay >= 1; tempDay--) {
                    //第一天不用加1
                    if (tempDay == remainder) {
                        nextDay = nextDay + 0;
                    } else if (tempDay != remainder) {
                        nextDay = nextDay + 1;
                    }
                    //周日，变更为0
                    if (nextDay == 7) {
                        nextDay = 0;
                    }
            
                    //周六日
                    if (nextDay == 0 || nextDay == 6) {
                        weekendDay = weekendDay + 1;
                    }
                }
                //实际工时（天） = 起止日期差 - 周六日数目。
                workDayVal = workDayVal - weekendDay;
                
                if(selectrows[i].borrow_number ===""){
                    alert("请填写借阅数量!");
                    return false;
                }else if(selectrows[i].borrow_number<=0 ||selectrows[i].borrow_number.substring(0,1)=='0'){
                    alert("请输入正整数");
                    return false;
                }else{
                    var reg = new RegExp("^[0-9]*$");       //判断是否为整数
                    if(!reg.test(selectrows[i].borrow_number)){
                        alert("请输入正整数");
                        return false;
                    }
                }
                if(selectrows[i].borrow_date ===""){
                    alert("请填写借阅日期!");
                    return false;
                }else if(!selectrows[i].borrow_date.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/)){
                    
                    //判断日期格式是否为正确
                    alert("请输入格式如'YYYY-MM-DD'");
                    return false;
                }else if(workDayVal > 2){       //判断借阅日期离当前日期是否大于2天
                    alert("最多只能预借两个工作日内，请重新选择！");
                    return false;
                }
                if(selectrows[i].expect_return_date ===""){
                    alert("请填写预计归还日期!");
                    return false;
                }else if(!selectrows[i].expect_return_date.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/)){  //判断日期格式是否是'YYYY-MM-DD'
                    alert("请输入格式如'YYYY-MM-DD'");
                    return false;
                }
                if(selectrows[i].borrow_date > selectrows[i].expect_return_date){
                    alert("请填写正确的日期!");
                    return false;
                }
                /*if(unselectrows > 0){
                    alert("请删除不需要借阅的图书！");
                    flag = 0;
                    return false;
                }else{
                    if(flag !== 0){
                        $.ajax({
                            url:'r?wf_num=R_ADBM_B010',  //保存借阅单后可申请数量的变化
                            type: "post",  
                            async : false,  
                            dataType:'json',  
                            data:{borrow_number:selectrows[i].borrow_number,book_code:selectrows[i].book_code,borrow_date:selectrows[i].borrow_date,
                                  expect_return_date:selectrows[i].expect_return_date,WF_OrUnid:selectrows[i].WF_OrUnid,place_id:selectrows[i].place_id},  
                            success:function(data){ 
                                if(data[0].canapplys !== ''){
                                    alert(data[0].name+"图书的可借数量为："+data[0].canapplys+"，请重新输入数量!");
                                    
                                    flag = 0;
                                }
                            }
                        }); 
                    }
                    
                }*/
            }
            for(var i=0;i<selectrows.length;i++){
                $.ajax({
                    url:'r?wf_num=R_ADBM_B010',  //保存借阅单后可申请数量的变化
                    type: "post",  
                    async : false,  
                    dataType:'json',  
                    data:{borrow_number:selectrows[i].borrow_number,book_code:selectrows[i].book_code,borrow_date:selectrows[i].borrow_date,
                          expect_return_date:selectrows[i].expect_return_date,WF_OrUnid:selectrows[i].WF_OrUnid,place_id:selectrows[i].place_id},  
                    success:function(data){ 
                        if(data[0].canapplys !== ''){
                            alert(data[0].name+"图书的可借数量为："+data[0].canapplys+"，请重新输入数量!");
                            
                            flag = 0;
                        }
                    }
                });
            }
            //$("#dg").datagrid("reload"); // 重载视图
            
            
        }
        
        if(flag !== 0){
            //EditorGridSave($('#dg'));
            var url="r?wf_num=V_ADBM_G003";
            location.href=url;
        }
    }
    window.parent.$(".tabs-title").text("我的借阅");
}



function removeSelectedRow(){
   
	var selectrows = $("#dg").datagrid("getChecked");      //获取选择的数据行
    var k = 0;     //是否满足删除条件的标识
    var OrUnid = ""; //拼接主文档id，用，连接
    if (!selectrows || selectrows.length === 0) {
        $.messager.alert('提示', '请选择要删除的数据!', 'info');
        return false;
    }
	$.messager.confirm('Confirm','您确定要删除选中记录吗?',function(r){
        if (r){
            mask();
		
            for(var i=0;i<selectrows.length;i++){
                if(OrUnid ==""){
                    OrUnid=selectrows[i].WF_OrUnid;
                }else{
                    OrUnid+=","+selectrows[i].WF_OrUnid;
                }
                
            }
            if(OrUnid != ""){
                $.ajax({
                    url:'r?wf_num=R_ADBM_B003',
                    type: "post",  
                    async : false,  
                    dataType:'json',  
                    data:{WF_OrUnid:OrUnid},  
                    success: function(data){ 
                        if(data.nResult =="1"){
                            unmask();
                            alert("成功删除("+selectrows.length+")条数据记录！");
                        }
                    }
                });
            }
            stopEditRow();
            var selections  =$('#dg').datagrid('getSelections');
            var selectRows = [];
            for ( var h= 0; h< selections.length; h++) {
                selectRows.push(selections[h]);
            }
            for(var j =0;j<selectRows.length;j++){
                var index = $('#dg').datagrid('getRowIndex',selectRows[j]);
                $('#dg').datagrid('deleteRow',index);
            }
            //$("#dg").datagrid("reload"); // 重载视图
        }
	});
}

var lastIndex;
function RowClick(rowIndex){
    //单击进行修改
	$("#dg").datagrid('unselectAll');
	$("#dg").datagrid('selectRow',rowIndex);
	if (lastIndex != rowIndex){
		$('#dg').datagrid('endEdit', lastIndex);
		$('#dg').datagrid('beginEdit', rowIndex);
	}
	lastIndex = rowIndex;
}

function stopEditRow(){
	$('#dg').datagrid('endEdit', lastIndex);
	lastIndex=undefined;
}

function back(){
    history.back(); 
    window.parent.$(".tabs-title").text("图书列表");   //将标题改为“图书列表”
}

//自动填充两位数
function PrefixInteger(num, n) {
    return (Array(n).join(0) + num).slice(-n);

}
