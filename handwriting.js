// 创建构造函数Writing
function Writing(json) {
    // 设置画布的宽高  分别在PC端和移动端的画布大小
    this.canvasWidth = Math.min(json.canvasWidth, $(window).width() - 20);
    this.canvasHeight = this.canvasWidth;
    //
    this.strokeColor = json.strokeColor;
    this.isMouseDown = json.isMouseDown;
    this.lastLoc = json.lastLoc;
    this.lastTimestamp = json.lastTimestamp;
    this.lastLineWidth = json.lastLineWidth;

    this.canvas = document.getElementById("canvas")
    this.context = this.canvas.getContext("2d")

    this.canvas.width = this.canvasWidth
    this.canvas.height = this.canvasHeight

    this.maxLineWidth = json.maxLineWidth;
    this.minLineWidth = json.minLineWidth;
    this.maxStrokeV = json.maxStrokeV;
    this.minStrokeV = json.minStrokeV;


    this.curLoc;
    this.curTimestamp;
    this.lineWidth;
    this.s;
    this.t;
    this.v;
    this.resultLineWidth;
    this.bbox;
    this.touch;
}
Writing.prototype.init = function () {
    $("#controller").css("width",this.canvasWidth+"px")
    this.drawGrid();
    _this = this;
    $("#clear_btn").click(
        function(e){
            _this.context.clearRect( 0 , 0 , _this.canvasWidth, _this.canvasHeight);
            _this.drawGrid();
        }
    )
    // 设置画笔的颜色
    $(".color_btn").click(
        function(e){
            $(".color_btn").removeClass("color_btn_selected");
            $(this).addClass("color_btn_selected");
            _this.strokeColor = $(this).css("background-color");
        }
    )
    // 鼠标在画布的落脚点位置 获取开始坐标
    canvas.onmousedown = function(e){
        e.preventDefault();
        _this.beginStroke( {x: e.clientX , y: e.clientY});
    };
    // 鼠标抬起停止绘画
    canvas.onmouseup = function(e){
        e.preventDefault();
        _this.endStroke();
    };
    // 鼠标离开画布停止绘画
    canvas.onmouseout = function(e){
        e.preventDefault();
        _this.endStroke();
    };
    // 鼠标移动绘画
    canvas.onmousemove = function(e){
        e.preventDefault();
        if( _this.isMouseDown ){
            _this.moveStroke({x: e.clientX , y: e.clientY});
        }
    };
// 移动端的事件处理
    canvas.addEventListener('touchstart',function(e){
        e.preventDefault();
        // 多个手指,只获取第一个手指的坐标
        console.log(11);
        _this.touch = e.touches[0];
        _this.beginStroke( {x: _this.touch.pageX , y: _this.touch.pageY});
    });
    canvas.addEventListener('touchmove',function(e){
        e.preventDefault();
        if( this.isMouseDown ){
            _this.touch = e.touches[0];
            _this.moveStroke({x: _this.touch.pageX , y: _this.touch.pageY});
        }

    });
    canvas.addEventListener('touchend',function(e){
        e.preventDefault();
        _this.endStroke();
    });
}

// 开始绘路径的初始化
Writing.prototype.beginStroke = function(point){
    // 画布获取到了鼠标
    this.isMouseDown = true;
    // 最后鼠标位置
    this.lastLoc = this.windowToCanvas(point.x, point.y);
    console.log(point.x +" "+point.y)
    // 获取结束事件
    this.lastTimestamp = new Date().getTime();
}
// 绘画结束
Writing.prototype.endStroke = function(){
    this.isMouseDown = false;
}
// 绘画
Writing.prototype.moveStroke = function(point){

    this.curLoc = this.windowToCanvas( point.x , point.y );
    this.curTimestamp = new Date().getTime();
    this.s = this.calcDistance( this.curLoc , this.lastLoc );
    this.t = this.curTimestamp - this.lastTimestamp;

    this.lineWidth = this.calcLineWidth( this.t , this.s );

    //绘制路径
    this.context.beginPath();
    this.context.moveTo( this.lastLoc.x , this.lastLoc.y );
    this.context.lineTo( this.curLoc.x , this.curLoc.y );
    this.context.strokeStyle = this.strokeColor;
    this.context.lineWidth = this.lineWidth;
    // 段与段之间用round衔接
    this.context.lineCap = "round";
    this.context.lineJoin = "round";
    this.context.stroke();
    this.lastLoc = this.curLoc;
    this.lastTimestamp = this.curTimestamp;
    this.lastLineWidth = this.lineWidth;
}
// 计算画笔的的宽度
Writing.prototype.calcLineWidth = function( t , s ){
    // 获取画笔的速度
    this.v = s / t;

    if( this.v <= this.minStrokeV )
    // 画笔的速度小于this.minStrokeV速度,就让画笔的宽度为最大的宽度
        this.resultLineWidth = this.maxLineWidth;
    else if ( this.v >= this.maxStrokeV )
    // 画笔的速度大于this.minStrokeV速度,就让画笔的宽度为最大的宽度
        this.resultLineWidth = this.minLineWidth;
    else{
        // 画笔的速度在之间,就让画笔的宽度为a-(v-minv)/(maxv-minv)*(maxl - minl)
        // 速度之比等于画笔宽度之比
        this.resultLineWidth = this.maxLineWidth -
            (this.v-this.minStrokeV)/(this.maxStrokeV-this.minStrokeV)*
            (this.maxLineWidth-this.minLineWidth);
    }

    if( this.lastLineWidth == -1 )
        return this.resultLineWidth;
    return this.resultLineWidth*1/3 + this.lastLineWidth*2/3;
}
// 计算速度
Writing.prototype.calcDistance = function( loc1 , loc2 ){
    // x平方+y平方开跟
    return Math.sqrt( (loc1.x - loc2.x)*(loc1.x - loc2.x) + (loc1.y - loc2.y)*(loc1.y - loc2.y) )
}
// 吧坐标(0,0)移动到画布左上角上
Writing.prototype.windowToCanvas = function( x , y ){
    this.bbox = this.canvas.getBoundingClientRect()
    return {x:Math.round(x-this.bbox.left) , y:Math.round(y-this.bbox.top)}
}
// 绘制田字格
Writing.prototype.drawGrid = function(){
    this.context.save()
    this.context.strokeStyle = "rgb(230,11,9)";
    this.context.beginPath()
    this.context.moveTo( 3 , 3 )
    this.context.lineTo( this.canvasWidth - 3 , 3 )
    this.context.lineTo( this.canvasWidth - 3 , this.canvasHeight - 3 )
    this.context.lineTo( 3 , this.canvasHeight - 3 )
    this.context.closePath()
    this.context.lineWidth = 6
    this.context.stroke()
    this.context.beginPath()
    this.context.moveTo(0,0)
    this.context.lineTo(this.canvasWidth,this.canvasHeight)
    this.context.moveTo(this.canvasWidth,0)
    this.context.lineTo(0,this.canvasHeight)
    this.context.moveTo(this.canvasWidth/2,0)
    this.context.lineTo(this.canvasWidth/2,this.canvasHeight)
    this.context.moveTo(0,this.canvasHeight/2)
    this.context.lineTo(this.canvasWidth,this.canvasHeight/2)
    this.context.lineWidth = 1
    this.context.setLineDash([5,2]);
    this.context.stroke()
    this.context.restore()
}
// 实例化writing对象
var writing = new Writing({
    canvasWidth: 500, // 画布宽
    strokeColor: 'black', // 画笔颜色
    isMouseDown: false, // 监听画笔是否获取鼠标
    lastLo:{x:0,y:0},  // 画笔的坐标
    lastTimestamp: 0,  // 画笔的结束时间
    lastLineWidth: -1, //画笔的结束宽度
    maxLineWidth: 10,  //画笔的最大宽度
    minLineWidth: 1, //画笔的最小宽度
    maxStrokeV: 5, //画笔的最大速度
    minStrokeV: 0.1 //画笔的最小速度
});
writing.init();

