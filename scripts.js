/* vim:set foldmethod=marker: */

/**
 * @fileOverview 円を横に並べ、描画アニメーションと重なり部分を可視化するプログラム
 * @date 2025/12/26
 * javascript言語ベースのp5js言語で開発. <br/>
 * ～備忘録～<br/>
 * VBA経験者向けの補足
 *  -setup() : 初期化プログラムの一番最初に一度だけ実行される。(VBAのForm_Loadに近い)
 *  -draw()  : 一秒間に最高60回呼び出される[60fps](VBAの Timerに近い)
 *  -mouse～ : イベントハンドラ draw関数は1秒間に約60回呼び出されるが、マウスイベントは割り込むことができるように設計されている。(ボタンとかもイベントハンドラを定義しておくと、マウスと同じように割り込ますことができる。)
 *  このイベントドリブン形式の概念が理解できれば、他のWebアプリやWindowsアプリ、ゲーム等の開発の第一歩は卒業です。<br />
 *  ■専門用語
 *  【イベントハンドラ】：イベントをハンドル[操縦]するという意味。]トリガーを発火させるための概念
 *  【トリガー】　　　　：イベントハンドラの条件の事。マウスは予め定義されている。トリガーの具体例は、マウスが動いたら。マウスが左クリックされたら。マウスのドラッグがスタートされたら、マウスのドラッグが終了して押しているゆびが離れたら、実行ボタンが押下されたら。とか、いろいろ指定できる。VBAでは、⚡[稲妻]みたいなマークのやつ。
 *  【発火】　　　　　　：イベント実行のこと。例えば、[実行ボタンのmousePressedが発火したら]という文言があるとする。これを置き換えると、実行ボタンを定義されたmousePressed関数がコールされたらという意味。
 *  【イベントドリブン】：イベントハンドラによって、プログラムを制御する概念のこと。
 *  【UI 】		：ユーアイと読む。User Interfaceのこと。つまり、ボタンとかの配置とか、ユーザーとコンピュータとの設定[つまりボタンとかね。]が本来の意味だと思うが、一般的には、変な所にボタンが配置されていたりすると、「ユーアイ―わるいね」と言ったりするので、デザインも総じていわれがち。
 *  【 75行目：User Agent】:ユーザーエージェントと読み、アクセスしたユーザーの基本的な情報を読み込む.ここではパソコンからか、タブレットやスマホからかを取得している。ブラウザとかも読めるが今回はそれは無視している。
 *  【286行目:フラグ】　：最近は一般語になっている気もするが・・・。変化を自動的に検出してくれることは、イベントハンドラを使う以外には、自分で実装するしかない。で、何かが終わったことを別の関数内で知るためには、変数の変化を読むのが手っ取り早い。なので、何かの変化があったら、変数の0を、1にしたり、変数のfalseをtrueにしたりする。名前の通り旗を立てる感覚です。
 *  【332行目：厳密等価演算子】ifで比較するのに厳密に比較してくれよ。ということ。==[等価演算子]の場合、例えば a="1" b=1 とすると、a==bはtrue になる。 でも a===bは、falseを返す。
 * @author MURAYAMA, Yoshiyuki
 * @version 1.0.1
 */

/** 定数まとめクラス
 * VBAでいうところの(Public Const的なやつ)
 */
class gc { /** {{{*/
  static BTN_RUN_B_Y = 100;//今回は未使用

}
/**}}}*/

// ===== 図形描画用 =====
let circles = [];		  // 円情報の配列
const CIRCLE_RADIUS = 200;	  // 円の半径
const CIRCLE_GAP = CIRCLE_RADIUS;
const DRAW_DURATION = 1000;	  // 円を何ミリ秒で描画するか.

let btnDraw;			  // 実行ボタン
let btnReset;			  // リセットボタン

const BASE_WIDTH = 800;
const BASE_HEIGHT = 600;

let offsetX = 0;		  // パンX軸(平行移動)
let offsetY = 0;		  // パンY軸
let wholeScale = 1;		  // 全体のズーム倍率
let isDragging = false;		  // 今ドラッグされているか
let lastMouseX, lastMouseY;	  // 今回のプログラムでは使わない。一個前のマウスの位置座標  

// タッチ操作のぐりぐり用
let lastTouchX = null;		  // タッチ操作用X軸
let lastTouchY = null;		  // タッチ操作用Y軸
let lastTouchDist = null;	  // タッチ操作用ピンチズーム用

/** ブラウザの画面の横幅いっぱい.
 * @type {Number}
 */
var iWidth = window.innerWidth;

/** ブラウザの画面の縦幅いっぱい. 
 * @type {Number} 
 */
var iHeight = window.innerHeight;

/** setup()関数の先頭に記述してあるため、setup()よりも先に呼び出される.
 * スマホ・タブレット（iOS・Android）か、PCかをuserAgentを調べることで、判別する.
 * これにより、isPCにtrueかfalseが入るため、これ以降のプログラムでは、isPCを見れば、
 * PCかどうかがわかる.
 */
function preload() { /** {{{*/
  // setupより先に実行

  if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)){
    // スマホ・タブレット（iOS・Android）の場合の処理を記述
    isPC = false;
  }else{
    // PCの場合の処理を記述
    isPC = true;
  }
  //font = loadFont("Meiryo.ttf");
}
/**}}}*/

//---------------------------------------
// ★ iPad（ピンチでズーム）
//---------------------------------------
function touchMoved(event) { /**{{{*/
  // 2本指（ピンチズーム）
  if (touches.length == 2) {
    let t1 = touches[0];
    let t2 = touches[1];

    let dx = t1.x - t2.x;
    let dy = t1.y - t2.y;
    let dist = sqrt(dx*dx + dy*dy);

    if (lastTouchDist !== null) {
      let change = dist / lastTouchDist;

      // ピンチ中心
      let cx = (t1.x + t2.x) / 2;
      let cy = (t1.y + t2.y) / 2;

      // ズーム前のワールド座標
      const wx = (cx - offsetX) / wholeScale;
      const wy = (cy - offsetY) / wholeScale;

      // ズーム
      wholeScale *= change;

      // ズーム後のオフセット補正[中心がずれないように補正している]
      offsetX = cx - wx * wholeScale;
      offsetY = cy - wy * wholeScale;
    }
    lastTouchDist = dist;

    return false;
  }

  // 1本指（パン[平行移動]）
  if (touches.length == 1) {
    if (isDragging) {
      let x = touches[0].x;
      let y = touches[0].y;

      offsetX += x - lastTouchX;
      offsetY += y - lastTouchY;

      lastTouchX = x;
      lastTouchY = y;
    }

    // スクロール禁止
    return false;
  }

  return false;
}
/**}}}*/

/** タッチ操作が終了したら*/
function touchEnded() { /**{{{*/
  if (touches.length < 2) {
    lastTouchDist = null;
    isDragging = false;
  }
}

/**}}}*/

/** 最初に1回だけ実行. 初期値の図形情報を詰め込むのはここ.
 * 
 */
function setup(){ /** {{{*/
  preload();

  /** タッチ操作が開始されたときのイベントハンドラを定義*/
  window.addEventListener("touchstart", function(ev) {
    const t = ev.target;
    if ( t ) {
      const tag = t.tagName;
      if ( tag === 'BUTTON' || tag === 'INPUT' || t.closest && t.closest('button, input, textarea, .p5ui') ) {
	//UI要素なら何もしない
	return;
      }
    }
    //それ以外では、スクロールを無効化
    ev.preventDefault();
  } , { passive: false });

  /** タッチ操作が一本指でぐりぐりしたときのイベントハンドラを定義*/
  window.addEventListener("touchmove", function (ev) {
    const t = ev.target;
    if (t) {
      const tag = t.tagName;
      if (tag === 'BUTTON' || tag === 'INPUT' || t.closest && t.closest('button, input, textarea, .p5ui')) {
	return;
      }
    }
    ev.preventDefault();
  }, { passive: false });

  cursor('pointer');
  //キャンバスを作成
  textSize( 20 );     //文字の大きさ
  createCanvas(iWidth, iHeight);//キャンバスの横幅と縦幅の指定
  drawBackground();		//背景の描画 ここでは、薄黄色に、水色のドット

  lastMouseX = mouseX;
  lastMouseY = mouseY;
  btnDraw = createButton("作図");//作図ボタンを定義
  btnDraw.position(20, 20);	 //作図ボタンのX座標とY座標の定義
  btnDraw.mousePressed(addCircle);//作図ボタンが発火したらaddCircle関数をコールするように定義
  btnDraw.addClass("p5ui");	  //今はおまじないでいい。気になったらオブジェクト指向について学んでみましょう。２０年ほど前から世界標準に近い概念です。btnDrawオブジェクトにp5uiクラスを追加.

  btnReset = createButton("リセット");
  btnReset.position(80, 20);
  btnReset.mousePressed(resetCircles);
  btnReset.addClass("p5ui");
}
/**}}}*/


/** 円を追加する.circlesは配列なので、pushによって、円オブジェクトを追加していく。
 */
function addCircle() { /** {{{*/
  const idx = circles.length;//[配列の要素数を見ることで、X座標を定義できる。

  const cx = 200 + idx * CIRCLE_GAP;
  const cy = 300;

  circles.push({
    cx: cx,
    cy: cy,
    r: CIRCLE_RADIUS,
    startTime: millis(),
    finished: false
  });
}
/**}}}*/


/** 円のリセットは、円の配列情報をクリアすればオッケー*/
function resetCircles() { /** {{{*/
  circles = [];
}
/**}}}*/


/** 円描画*/
function drawCircles() { /**{{{*/

  // ① 非重なり
  for (let i = 0; i < circles.length; i++) {
    drawCircleFill(circles[i], i);
  }

  // ② 重なり（今まで通り）
  drawAllOverlaps();

  // ③ 線（最前面）
  for (let i = 0; i < circles.length; i++) {
    drawAnimatedCircleLine(circles[i], i);
  }
}
/**}}}*/

/** 円の輪郭をアニメーションによって描画する.
 * @param c	addCircleされた該当円のみのオブジェクト[配列の中身]
 * @param index	addCircleされた該当円が何番目の円なのか.
 */
function drawAnimatedCircleLine(c, index) { /** {{{*/
  //描き始めてからの経過時間÷全体時間＝進行率(0~1)
  const elapsed = millis() - c.startTime;
  const progress = constrain(elapsed / DRAW_DURATION, 0, 1);

  noFill();

  if ( progress < 1 ) {
    //★作図途中：赤・少し太目・半透明
    stroke( 255, 0, 0, 150 );	//作図する線の色 順番は stroke( 赤の強さ[0-255], 緑の強さ[0-255], 青の強さ[0-255], 透明度[0-255]); 
    strokeWeight( 3 );		//作図する線の太さ

    //作図途中に中心点を表示
    push();			//push() pop()間で線の色と太さを変えてもそれ以降のプログラムに影響しない
    noStroke();			//線の色は黒
    fill( 0, 0, 255 );		//塗りつぶし色は赤0緑0青255の強さの色。つまり青
    circle( c.cx, c.cy, 16 );	//作図する円の中心点
    pop();
  } else {
    //★作図完了：黒・通常
    stroke( 0 );
    strokeWeight( 2 );
  }

  // ===== 最初の円だけ =====
  if (index === 0) {
    const angleEnd = progress * PI;	//PI:πのこと。円のプログラムは基本的にはラジアン表記。360度で2π 180度はπ 90度は0.5π　珍しくp5.jsの場合は、度数表記ができるけど、ラジアン記法になれた方がいい。

    arc(				//円弧の記述
      c.cx, c.cy,
      c.r * 2, c.r * 2,
      -HALF_PI,				//HALF_PI=0.5πのこと。
      -HALF_PI + angleEnd
    );

    if (progress >= 1) c.finished = true;//progressが1を越えると、アニメーション完了のフラグを立てる。
    return;
  }

  // ===== 通常の円 =====
  const angleEnd = progress * TWO_PI;

  arc(
    c.cx, c.cy,
    c.r * 2, c.r * 2,
    HALF_PI,
    HALF_PI + angleEnd
  );

  if (progress >= 1) c.finished = true;
}
/**}}}*/

/** グリッド線を記述する*/
function drawGrid(spacing = 20) { /**{{{*/
  stroke(180, 220, 240); // 薄水色
  strokeWeight(1);

  // 縦線
  for (let x = 0; x <= width; x += spacing) {
    line(x, 0, x, height);
  }

  // 横線
  for (let y = 0; y <= height; y += spacing) {
    line(0, y, width, y);
  }
}
/**}}}*/

/** 円の塗り
 * @param c	addCircleされた該当円のみのオブジェクト[配列の中身]
 * @param index	addCircleされた該当円が何番目の円なのか.
 */
function drawCircleFill(c, index) { /** {{{*/
  if (!c.finished) return;

  noStroke();

  // ===== 最初の円だけ（右半分） =====
  if (index === 0) { // === 厳密等価演算子

    // 右上（オレンジ）
    fill(255, 180, 100);
    arc(
      c.cx, c.cy,
      c.r * 2, c.r * 2,
      -HALF_PI, 0
    );

    // 右下（ピンク）
    fill(255, 170, 190);
    arc(
      c.cx, c.cy,
      c.r * 2, c.r * 2,
      0, HALF_PI
    );

    return;
  }

  // ===== 通常の円 =====
  fill(255, 180, 100); // 上
  arc(c.cx, c.cy, c.r*2, c.r*2, PI, TWO_PI);

  fill(255, 170, 190); // 下
  arc(c.cx, c.cy, c.r*2, c.r*2, 0, PI);
}
/**}}}*/


/** 円の重なり部分の描画*/
function drawAllOverlaps() { /** {{{*/
  noStroke();
  fill(255, 245, 200); // 薄黄色

  const ctx = drawingContext;	      //なんとp5.js上でHTML5 Canvasが使える。

  for (let i = 0; i < circles.length; i++) {
    if (!circles[i].finished) continue;

    for (let j = i + 1; j < circles.length; j++) {
      if (!circles[j].finished) continue;

      ctx.save();

      // 円 i
      ctx.beginPath();
      ctx.arc(circles[i].cx, circles[i].cy, circles[i].r, 0, TWO_PI);
      ctx.clip();

      // 円 j
      ctx.beginPath();
      ctx.arc(circles[j].cx, circles[j].cy, circles[j].r, 0, TWO_PI);
      ctx.clip();

      // 共通部分だけ塗る
      rect(0, 0, width, height);

      ctx.restore();
    }
  }
}
/**}}}*/

/** マウスがドラッグされたら.
 */
function mouseDragged() { /** {{{*/
  if ( isDragging ) {
    offsetX += (mouseX - lastMouseX);
    offsetY += (mouseY - lastMouseY);
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}
/** }}}*/

/** マウスのドラッグが終わったら*/
function mouseReleased() { /** {{{*/
  isDragging = false;
}
/**}}}*/

//---------------------------------------
// ★ マウスホイールで、"マウス位置を中心に" ズーム
//---------------------------------------
function mouseWheel(event) { /** {{{*/
  let zoom = 1.0;

  if (event.delta > 0) zoom = 0.9;   // ズームアウト
  else zoom = 1.1;                   // ズームイン

  // マウス座標をキャンバスの座標系に変換
  const wx = (mouseX - offsetX) / wholeScale;
  const wy = (mouseY - offsetY) / wholeScale;

  // ズーム適用
  wholeScale *= zoom;

  // ズーム位置の中心がマウスになるようにオフセット調整
  offsetX = mouseX - wx * wholeScale;
  offsetY = mouseY - wy * wholeScale;

  return false; // ブラウザのスクロールを防ぐ
}
/**}}}*/


/** mousePressedイベント. もしかしたらtouchとかも考えないといけないかもしれないから、一応分割した.
 * @param pinputX pmouseXか、ptouchXのどっちか.		@type {Number}
 * @param pinputY pmouseYか、ptouchYのどっちか.		@type {Number}
 * @param inputX mouseXか、touches[0].xのどっちか.	@type {Number}
 * @param inputY mouseYか、touches[0].yのどっちか.	@type {Number}
 * このプログラムでは全く使わない.
 */
function pressProcess( pinputX, pinputY, inputX, inputY  ) { /** {{{*/
  isDragging = true;
  lastMouseX = mouseX;
  lastMouseY = mouseY;
}
/**}}}*/


/** マウスが押下されたイベント.touchStartedにも対応するために、そのまんまpressProcessに流す. */
function mousePressed() { /** {{{*/
  pressProcess( pmouseX, pmouseY, mouseX, mouseY );
}
/** }}}*/

/** タッチクリックされたイベント. 
 * mousePressedにも対応するために、そのまんまpressProcessに流しているが、
 * タッチモードでは、createButtonに対応していない.
 * そのため、タッチされた時の座標からボタンイベント判別している.*/
function touchStarted() { /** {{{*/
  isDragging = true;

  // finger 0 の位置を使う
  lastTouchX = touches[0].x;
  lastTouchY = touches[0].y;
}
/**}}}*/


/** ブラウザの大きさがリサイズされたら*/
function windowResized() { /** {{{*/
  resizeCanvas(BASE_WIDTH, BASE_HEIGHT);

  const scaleX = windowWidth / BASE_WIDTH;
  const scaleY = windowHeight / BASE_HEIGHT;
  const scaleFactor = min(scaleX, scaleY);

  draw();
}
/**}}}*/


/** draw()は、p5.jsによって1秒間に約60回、自動的に呼ばれる関数.[60fps]
 * VBAでいうところの「タイマーで繰り返し実行される処理」に近い。
*/
function draw(){ /** {{{*/
  //現在のパン・ズーム状態を適用
  translate( offsetX, offsetY);
  scale(wholeScale);


  /* マウスでもタッチでもどちらでも対応できるように、PCではマウス、タブレット、スマホではタッチ対応にさせる.*/
  let pinputX;	//前のX座標
  let pinputY;	//前のY座標
  let inputX;		//現在のX座標
  let inputY;		//現在のY座標

  //画面の実サイズを取得
  const scaleX = windowWidth / BASE_WIDTH;
  const scaleY = windowHeight / BASE_HEIGHT;
  const scaleFactor = min (scaleX, scaleY);   //縦横の縮尺のうち、小さい方を使う(縦横比を保つ)

  //キャンバス全体を拡大縮小
  push();
  scale(scaleFactor); 

  drawBackground();
  drawCircles();
  drawGrid(100);

  pop();

}
/** }}}*/


/**背景を描画する*/
function drawBackground() { /** {{{*/
  stroke(0);
  strokeWeight(1);
  background( 255, 255, 204 );
  for ( var iCounter = 0; iCounter < iHeight; iCounter+=20 ) {
    for ( var jCounter = 0; jCounter < iWidth; jCounter += 20 ) {
      point( jCounter, iCounter );
    }
  }
}
/**}}}*/

