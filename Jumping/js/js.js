// 初始化设置
window.onload = function(){

    document.body.addEventListener('touchmove', function (event) {
        event.preventDefault();
    }, false);
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    var canvas = document.getElementById('canvas');
    var oStart = document.getElementById('start');
    var oEnd = document.getElementById('end');
    var oTitle = document.getElementById('title');
    var oCover = document.getElementById('cover');
    // var oStartInner = document.getElementById('startInner');
    var ctx = canvas.getContext('2d');
    var wStd = window.innerWidth;
    var hStd = window.innerHeight;

    //font-size
    var baseSize = wStd * 0.017;
    oTitle.style.fontSize = baseSize * 6.7 + 'px';
    oEnd.style.fontSize = baseSize * 4.7 + 'px';
    oStart.style.fontSize = baseSize * 3.7 + 'px';
    // oStartInner.style.width = baseSize * 3.7 * 4 + 20 + 'px';

    
    // 人物体型
    var personW = wStd * 0.10;
    var personH = hStd * 0.10;

    // 人物偏移量
    var peosonOW = wStd * 0.65;
    var peosonOH = hStd * 0.21;

    // 起跳位置
    var jumpW = wStd * 0.7146; // 1247/1745
    var jumpH = hStd * 0.308; // 926/3006

    // 下落位置
    var dropW = wStd * 0.668; // 1166/1745
    var dropH = hStd * 0.308; // 926/3006

    var offArg = (jumpW - dropW)/2; //旋转过程的半径 

    // 游戏参数
    var clickFlag;  // 判断是否已进行点击
    var animeStep;  // 当前动画进行的步骤，0代表尚未开始，1代表旋转，2代表下落
    var score;      // 分数
    var endFlag;    // 判断是否失败，0代表没有，1代表失败，2是为了防止误点
    var arg;        // 当 animeStep === 1 时，小人旋转的角度
    var down;       // 当 animeStep === 2 时，小人下落的高度

    setCanvasSize();
    init();
    gameStart();

    window.onclick = function(){
        if(animeStep === 2 && clickFlag == 0 && endFlag == 0){
            clickFlag = 1;
        }
        else if(endFlag == 0){
            animeStep = 1;
            oStart.style.display = 'none';
            oCover.style.display = 'none';
            oTitle.style.display = 'none';

        }
        else if(endFlag == 1){
            endFlag = 0;
            // oStartInner.innerHTML = '开始游戏';
            oEnd.style.display = 'none';
            
            init();
            gameStart();
        }

    }

    function init(){
        clickFlag = 0;
        animeStep = 0;
        score = 0;
        endFlag = 0;
        arg = 0;    
        down = 0;   
    }

    // 游戏开始的主函数
    function gameStart(){
        Anime(function(){
            if(animeStep === 0){
                ctx.save();
                ctx.drawImage(bg,0,0,wStd,hStd);
                ctx.drawImage(person,jumpW - personW * 0.458,jumpH - personH ,personW,personH);
            }
            else if(animeStep === 1){
                arg += 3.1415/30;
                offArgX = offArg * Math.cos(arg);
                offArgY = offArg * Math.sin(arg);

                ctx.save();
                // 绘制背景
                ctx.drawImage(bg,0,0,wStd,hStd);

                // 绘制人物
                ctx.translate((dropW+jumpW)/2 + offArgX, (dropH+jumpH)/2 - offArgY);
                ctx.rotate(-arg);
                ctx.drawImage(person, - personW * 0.458, - personH ,personW,personH);

                // 绘制小人脚上连的那根线
                ctx.beginPath();
                ctx.lineWidth = 3;
                ctx.moveTo(0,0);
                ctx.lineTo(-offArg-offArgX,-offArgY);
                ctx.stroke();

                ctx.restore();
            }
            else if(animeStep === 2){
                down+=(5+Math.random()-0.5);
                ctx.save();

                // 绘制背景
                ctx.drawImage(bg,0,0,wStd,hStd);

                // 绘制旋转后的小人
                ctx.translate(dropW, dropH)
                ctx.rotate(Math.PI);
                ctx.drawImage(person,-personW * 0.458, - personH - down, personW,personH);

                // 绘制小人脚上连的那根线
                ctx.beginPath();
                ctx.lineWidth = 3;
                ctx.moveTo(0,0);//此时坐标原点为drop处
                ctx.lineTo(0,-down);
                ctx.stroke();

                ctx.restore();
            }
        },function(){
            if(animeStep === 1){
                if(Math.abs(arg - 3.1415) < 1e-5)animeStep = 2;
            }
            else if(animeStep === 2){
                // 0.879 = 2642 / 3006
                // 以下是对游戏结果的判断
                if(dropH + personH + down > hStd * 0.879 || clickFlag) {
                    score = dropH + personH + down > hStd * 0.879?10000:(200 - (dropH + personH + down) / (hStd * 0.879)*200);
                    // score += (Math.random()-0.5)/2;
                    // if(score < 0){score = 0.01;}
                    if(score > 100){
                        oEnd.innerHTML = '<p>游戏失败</p>';
                        // 防止误点
                        endFlag = 2;
                        setTimeout(function(){endFlag = 1},50);
                    }
                    else {
                        oEnd.innerHTML = '<p>你离地面还有 '+score.toFixed(2)+' 米！</p>';
                        endFlag = 1;
                    }
                    // oStartInner.innerHTML = '再试一次';
                    oEnd.style.display = 'block';
                    oStart.style.display = 'block';
                    oCover.style.display = 'block';
                    oTitle.style.display = 'block';
                    return false;
                }

            }
            return true;
        })
    }

    // 设置画布的宽度
    function setCanvasSize () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // 用于创造动画的函数
    // 参数1：动画内容
    // 参数2：判断条件
    function Anime(animation,checkPoint){ 
        function draw(timestamp){   

            animation();

            //计算两次重绘的时间间隔 
            var drawStart = (timestamp || Date.now()), 
                diff = drawStart - startTime; 
     
            //使用 diff 确定下一步的绘制时间 
     
            //把 startTime 重写为这一次的绘制时间 
            startTime = drawStart; 
     
            //重绘 UI 
            if(checkPoint())requestAnimationFrame(draw); 
        } 
     
            var startTime = window.mozAnimationStartTime || Date.now(); 
        requestAnimationFrame(draw); 
    }

}


