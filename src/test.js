var lastIndex;

window.onload=function(){
	var myDate = new Date();
	var year = myDate.getFullYear()+"-";                                  //获取完整的年份(4位,如：2017)
	var month =  myDate.getMonth()+1+"-";                                 //获取当前月份(0-11,0代表1月)
	month = PrefixInteger(month,3);                                       //自动填充3位。如：03-
	var date =  myDate.getDate();                                         //获取当前日(1-31)
	date = PrefixInteger(date,2);
	var newdate = year+month+date;
	$('#dg').datagrid({
		onSelect: function(index){                                        //当勾选图书信息的情况
			stopEditRow();
			if(index >= 0){
				var row = $('#dg').datagrid('getData').rows[index];       //获取当前勾选的数据行
				var number = row.borrow_number;
				var returntime = row.actual_return_date;
				
				if(returntime !== ""){
					$('#dg').datagrid('updateRow',{                       //更新勾选的row中的数据
						index:index,
						row: {
							return_number:number,
							other_remark:'无',
						}
					});
				}else{
					$('#dg').datagrid('updateRow',{                       //更新勾选的row中的数据
						index:index,
						row: {
							actual_return_date:newdate,
							return_number:number,
							other_remark:'无',
						}
					});
				}
			}
			
		},
		onUnselect:function(index){                                       //当取消勾选图书信息的情况
			if(index >= 0){
				var row = $('#dg').datagrid('getData').rows[index];       //获取当前勾选的数据行
				var returntime = row.actual_return_date;
				if(returntime !== newdate){
					$('#dg').datagrid('updateRow',{                       //更新勾选的row中的数据
						index:index,
						row: {
							return_number:'',
							other_remark:'',
						}
					});
				}else{
					$('#dg').datagrid('updateRow',{                       //更新勾选的row中的数据
						index:index,
						row: {
							actual_return_date:'',
							return_number:'',
							other_remark:'',
						}
					});
				}
			}
		}
	});
};
function RowClick(rowIndex){
	//单击进行修改
	//$("#dg").datagrid('unselectAll');
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



/**
 * 确认保存
 */
function shortcutSave(){
	stopEditRow();
	var flag = 1;
	var rows = $("#dg").datagrid("getSelections");//获取当前的数据行
	if(rows.length>0){
		var isSuccess = false;
		for(var i=0;i<rows.length;i++){
			var isSuccess = false;
			var returnnumber = parseInt(rows[i].return_number,10);
			var borrownumber = parseInt(rows[i].borrow_number,10);
			var deduct_money = parseInt(rows[i].deduct_money);
			if(returnnumber > borrownumber){
				alert("归还数量不能大于借阅数量!");
				$("#dg").datagrid("reload"); // 重载视图
				return false;
			}else{
				$.ajax({
					url:'r?wf_num=R_ADBM_B012',  //图书归还时借出数量和可借数量的变化
					type: "post",
					async : false,
					dataType:'json',
					data:{WF_OrUnid:rows[i].WF_OrUnid,WF_AddName:rows[i].WF_AddName,borrow_state:rows[i].borrow_state,other_remark:rows[i].other_remark,deduct_money:rows[i].deduct_money,
						actual_return_date:rows[i].actual_return_date,return_number:rows[i].return_number,borrower:rows[i].borrower},
					success:function(r){
						if (r.code < 0) {
							if(r.code == "-2") alert("请填写归还信息！");
							else if (r.code == "-1") alert(r.msg);
							$("#dg").datagrid("reload"); // 重载视图 return false;
						} else  isSuccess = true;
					}
				});
			}
		}
		if (isSuccess) $("#dg").datagrid("reload"); // 重载视图
	}
}


/**
 * 超期图书
 */
/*function overtime(){
    $.ajax({
        url:'r?wf_num=R_ADBM_D002',  //对超期的图书进行查询
        type: "post",
        async : false,
        dataType:'json',
        data:{conditions:"overtime"},
        success:function(data){
            $("#dg").datagrid("loadData",data);
        }
    });
}*/


//自动填充两位数
function PrefixInteger(num, n) {
	return (Array(n).join(0) + num).slice(-n);
	
}

function ocerduce($e) {
	console.log("jjjj");
}


/**
 * 搜索功能
 */
/*function GridDoSearch(v){
    $.ajax({
        url:'r?wf_num=R_ADBM_B008',  //对借阅中的图书进行模糊查询
        type: "post",
        async : false,
        dataType:'json',
        data:{search:v,conditions:"borrowing"},
        success:function(data){
            $("#dg").datagrid("loadData",data);
        }
    });
}*/
