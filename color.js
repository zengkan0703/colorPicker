//初始化画布
var panal=$("#panal").get(0);
var panalCtx=panal.getContext("2d");
//rgb转换为hsl的函数，来自张鑫旭(http://www.zhangxinxu.com/wordpress/2010/03/javascript-hex-rgb-hsl-color-convert/)
//最终得出的hsl的值都是0-1的小数
function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, l];
}
//hsl转换成rgb的函数，来自张鑫旭
function hslToRgb(h, s, l){
	h=Number(h);
	s=Number(s);
	l=Number(l);
    var r, g, b;
    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
//十六进制颜色值的正则表达式
var reg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
/*RGB颜色转换为16进制 来自张鑫旭*/
String.prototype.colorHex = function(){
	var that = this;
	if(/^(rgb|RGB)/.test(that)){
		var aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g,"").split(",");
		var strHex = "#";
		for(var i=0; i<aColor.length; i++){
			var hex = Number(aColor[i]).toString(16);
			if(hex === "0"){
				hex += hex;	
			}
			strHex += hex;
		}
		if(strHex.length !== 7){
			strHex = that;	
		}
		return strHex;
	}else if(reg.test(that)){
		var aNum = that.replace(/#/,"").split("");
		if(aNum.length === 6){
			return that;	
		}else if(aNum.length === 3){
			var numHex = "#";
			for(var i=0; i<aNum.length; i+=1){
				numHex += (aNum[i]+aNum[i]);
			}
			return numHex;
		}
	}else{
		return that;	
	}
};
/*16进制颜色转为RGB格式 来自张鑫旭*/
String.prototype.colorRgb = function(){
	var sColor = this.toLowerCase();
	if(sColor && reg.test(sColor)){
		if(sColor.length === 4){
			var sColorNew = "#";
			for(var i=1; i<4; i+=1){
				sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));	
			}
			sColor = sColorNew;
		}
		//处理六位的颜色值
		var sColorChange = [];
		for(var i=1; i<7; i+=2){
			sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));	
		}
		return "RGB(" + sColorChange.join(",") + ")";
	}else{
		return sColor;	
	}
};
//把rgb转换成hsl并更新hsl的输入框
function rgbToHsl_fill(r,g,b){
	var hsl =rgbToHsl(r,g,b);
	//把hsl转换为标准格式
	var h=Math.round(Number(hsl[0])*360);
	var s=Math.round(Number(hsl[1])*100);
	var l=Math.round(Number(hsl[2])*100);
	var hsl=[h,s,l];
	$(".color-picker .hsl input").val(function(index){
		return hsl[index];
	})
}
//把hsl转换成rgb并更新rgb的输入框
function hslToRgb_fill(h,s,l){
	h=(h/360).toFixed(2);
	s=parseInt(s)/100;
	l=parseInt(l)/100;
	var rgb=hslToRgb(h,s,l);
	$(".color-picker .rgb input").val(function(index){
		return rgb[index];
	})
	//转换成十六进制；
	var stringRgb="RGB("+rgb+")";
	$("#css-color").text(stringRgb.colorHex())
}
// 左边颜色面板填充渐变颜色
function panalColor(h,s,l){
	//每次都需要重新创建渐变颜色，否则画布的渐变会失败，很尖锐
	s=s+"%";l=l+"%";
	var panalGrd=panalCtx.createLinearGradient(0,0,300,300);
	var hsl=h+","+s+","+l;
	var hslMinus=h+","+s+","+"0%";//右下角的颜色 l值为0
	var hslAddition=h+","+s+","+"100%"; //左上角的颜色 l值为100%
	//颜色面板显示一个渐变色，颜色是在画布上填充的，便于之后拾取颜色
	panalGrd.addColorStop(0,"hsl("+hslAddition+")");
	panalGrd.addColorStop(0.5,"hsl("+hsl+")");
	panalGrd.addColorStop(1,"hsl("+hslMinus+")");
	panalCtx.fillStyle=panalGrd;
	panalCtx.fillRect(0,0,300,300)
	//确定第二个取色器的位置
	$(".color-picker .range .target").show().css("top",(h/360)*100+"%");
}
//当通过其他改变颜色时需要把左边圆圈放回中心位置，来表示准确的颜色
function leftCircleBack(){
	$(".color-picker .panal .target").css({
		"top":"50%",
		"left":"50%"
	})
}
//每次随机生成默认颜色
;(function(){
	//随机获取0-255之间的整数作为r g b
	var r=Math.floor(Math.random()*256);
	var g=Math.floor(Math.random()*256);
	var b=Math.floor(Math.random()*256);
	$(".color-picker .rgb input").eq(0).val(r)
	$(".color-picker .rgb input").eq(1).val(g)
	$(".color-picker .rgb input").eq(2).val(b)
	var rgb=r+","+g+","+b;
	//转换成十六进制；
	var stringRgb="RGB("+rgb+")";
	$("#css-color").text(stringRgb.colorHex())
	//把rgb转换成hsl并更新hsl的输入框
	rgbToHsl_fill(r,g,b)
	var hsl=rgbToHsl(r,g,b);
	var h=Math.round(Number(hsl[0])*360);
	var s=Math.round(Number(hsl[1])*100);
	var l=Math.round(Number(hsl[2])*100);
	//填充颜色面板的颜色
	panalColor(h,s,l);
})()
//改动输入框时改变相应其他的输入框和背景颜色
function inputChange(){
	var r=$("#color-r").val();
	var g=$("#color-g").val();
	var b=$("#color-b").val();
	var h=$("#color-h").val();
	var s=$("#color-s").val();
	var l=$("#color-l").val();
	var value=$(this).val();
	//如果输入框不是数字，返回
	if(isNaN(Number(value))){
		$(this).siblings(".warning").show();
		return;
	//改动后的输入框是数字，继续
	}else{
		//如果改动的是rgb中的一个值，随之改变hsl输入框
		if($(this).parent().is(".rgb")){
			//判断输入框的值是不是数字，是否是在0-255之间的整数
			if(value<0||value>256||value.indexOf(".")!==-1){
				$(this).siblings(".warning").show();
				return ;
			}else{
				rgbToHsl_fill(r,g,b);
				$(this).siblings(".warning").hide();
			}
			//相反同理
		}else{
			var show;
			if($(this).is("#color-h")){
				value<0||value>360?show=true:show=false;
			}else{
				value<0||value>100?show=true:show=false;
			}
			if(show){
				$(this).siblings(".warning").show();
				return ;
			}else{
				hslToRgb_fill(h,s,l);
				$(this).siblings(".warning").hide();
			}
				
		}
	}
	//改变左边面板的颜色
	panalColor(h,s,l);
	//通过输入框改变颜色之后把左边的圆圈复位到中心位置
	leftCircleBack()
	var rgb=r+","+g+","+b;
	//转换成十六进制；
	var stringRgb="RGB("+rgb+")";
	$("#css-color").text(stringRgb.colorHex())
}
$(".color-picker input").on("input",inputChange);
//输入框数字减小的函数
function minus(ele,number){
	number>1?number--:number=0;
	return number;
}
//输入框数字增加的函数
function addition(ele,number){
	if(ele.parents(".rgb").get(0)){
		//如果改变的是rgb输入框
		number<255?number++:number=255;
	}else{
		if(ele.is("#color-h")){
			number<359?number++ :number=360;
		}else{
			number<99?number++:number=100;
		}
		
	}
	return number;
}
//点击箭头时触发输入框数字改变
$(".color-picker .arrow-group i").on("click",function(){
	//手动触发输入框的input事件，来验证修改后数字的对错
	$(this).parent().siblings("input").trigger("input")
	var number=Number($(this).parent().siblings("input").val());
	//如果点击的是下箭头
	if($(this).is(".minus")){
		number=minus($(this),number);
	//如果点击的是上箭头
	}else if($(this).is(".addition")){
		number=addition($(this),number);
	}
	$(this).parent().siblings("input").val(number)
})
//按键盘上下键触发输入框数字改变
$("input").on("keydown",function(e){
	$(this).trigger("input");
	var number=parseInt($(this).val());
	if(e.keyCode==40){
		number=minus($(this),number);	
	}else if(e.keyCode==38){
		number=addition($(this),number);
	}else{
		//如果没有这个return 会导致输入框输入异常
		return;
	}
	$(this).val(number)
})
//移动左边圆圈
$(".color-picker .panal").on("mousedown",function(event){
	var left,top;
	//圆圈跟随鼠标移动的函数
	function circleMove(ele,e){
		if(e.pageX-ele.offset().left>300){
			left=300;
		}else if(e.pageX-ele.offset().left<0){
			left=0;
		}else{
			left=e.pageX-ele.offset().left
		}
		if(e.pageY-ele.offset().top>300){
			top=300;
		}else if(e.pageY-ele.offset().top<0){
			top=0;
		}else{
			top=e.pageY-ele.offset().top
		}
		ele.find(".target").css({
			"left":left,
			"top":top,
		})
	}
	circleMove($(this),event);
	$(this).on("mousemove",function(e){
		circleMove($(this),e);
		left=Math.round(left);
		top=Math.round(top);
		//获取这个位置像素点画布的像素信息
		var data=panalCtx.getImageData(left,top,1,1).data;
		var r=data[0];
		var g=data[1];
		var b=data[2];
		//改变右边rgb数值
		$(".color-picker .rgb input").val(function(index){
			return data[index];
		})
		var rgb=r+","+g+","+b;
		//转换成十六进制；
		var stringRgb="RGB("+rgb+")";
		$("#css-color").text(stringRgb.colorHex())
		//把rgb转换成hsl并更新hsl的输入框
		rgbToHsl_fill(r,g,b)

	})
})
//移动中间圆圈
$(".color-picker .range").on("mousedown",function(event){
	//通过输入框改变颜色之后把左边的圆圈复位到中心位置
	leftCircleBack();
	var s=$("#color-s").val();
	var l=$("#color-l").val();
	var top;
	//圆圈跟随鼠标移动的函数
	function circleMove2(ele,e){
		if(e.pageY-ele.offset().top>300){
			top=300;
		}else if(e.pageY-ele.offset().top<0){
			top=0;
		}else{
			top=e.pageY-ele.offset().top
		};
		ele.find(".target").css({
			"top":top,
		})
	}
	circleMove2($(this),event);
	$(this).on("mousemove",function(e){
		circleMove2($(this),e);
		//根据top值的比值能得到h的值，因为从上到下h也是按比例来的
		var h=Math.round((top/300).toFixed(2)*360);
		$("#color-h").val(h);
		//改变rgb输入框的值
		hslToRgb_fill(h,s,l);
		//改变左边颜色面板填充颜色
		panalColor(h,s,l);

	});
})
//鼠标松开之后，解绑两个块的move事件
$(document).on("mouseup",function(){
	$(".color-picker .panal").off("mousemove")
	$(".color-picker .range").off("mousemove")
})
$("button").on("click",function(){
	//提交改变颜色时把左边圆圈复位
	leftCircleBack();
	if(reg.test($("#set-color").val())){
		var rgb=$("#set-color").val().colorRgb().split("(")[1].split(")")[0].split(",");
		var r=rgb[0];
		var g=rgb[1];
		var b=rgb[2];
		var hsl=rgbToHsl(r,g,b);
		var h=Math.round(Number(hsl[0])*360);
		var s=Math.round(Number(hsl[1])*100);
		var l=Math.round(Number(hsl[2])*100);
		//左边面板颜色
		panalColor(h,s,l);
		//确认第二个取色器的位置
		$(".color-picker .range .target").show().css("top",(h/360)*100+"%");
		rgbToHsl_fill(r,g,b)
		//rgb颜色填写
		$(".color-picker .rgb input").eq(0).val(r)
		$(".color-picker .rgb input").eq(1).val(g)
		$(".color-picker .rgb input").eq(2).val(b)
		$(".set .warning").hide();
		//下面css-color填写
		$("#css-color").text($("#set-color").val())
	}else{
		$(".set .warning").show();
	}
})