
var canvas = document.getElementById("canvas1"); 
var ctx = canvas.getContext("2d");

var client_width = document.body.clientWidth;
var canvas_size;

if(client_width > 800){
  canvas_size  = client_width * 0.8;
}else{
  canvas_size  = client_width * 1;
}

canvas.width  = canvas_size;
canvas.height = canvas_size;

var vsize = 400;

var timer = null;

// セルオートマトンのパラメータ
var fields_history_size = 5;
var fields_size = 20;
var x_shift    = 40;
var y_span     = 70;
var y_margine  = 80;
var y_margine_start  = 5;


// セルオートマトンのグローバル変数
var fields = [];


// ニューラルネットのパラメータ
var neural_param_w = []; // ウェイト
var neural_param_t1;      // 閾値
var neural_param_t2;      // 閾値


// 描画座標の調整
function pos(in_n){
	return in_n * canvas_size / vsize;
}

// 線を描画
function line(in_x1, in_y1, in_x2, in_y2){
	var x1 = pos( in_x1 );
	var y1 = pos( in_y1 );
	var x2 = pos( in_x2 );
	var y2 = pos( in_y2 );
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.closePath();
	ctx.stroke();
}

// 塗りつぶし
function fill(in_x1, in_y1, in_x2, in_y2, in_x3, in_y3, in_x4, in_y4){
	var x1 = pos( in_x1 );
	var y1 = pos( in_y1 );
	var x2 = pos( in_x2 );
	var y2 = pos( in_y2 );
	var x3 = pos( in_x3 );
	var y3 = pos( in_y3 );
	var x4 = pos( in_x4 );
	var y4 = pos( in_y4 );
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.lineTo(x3, y3);
	ctx.lineTo(x4, y4);
	ctx.closePath();
	ctx.fill();
}



// フィールドを描画
function draw_field(n){
	var f = fields[n];
	
	var start_y = n * y_margine + y_margine_start;
	
	for(let x = 0; x <= fields_size; x++) {
		line(x * (vsize-x_shift)/fields_size + x_shift, start_y, x * (vsize-x_shift)/fields_size, start_y+y_span);
	}
	
	for(let y = 0; y <= fields_size; y++) {
		let x_shift_temp = x_shift * (fields_size-y) / fields_size;
		line(x_shift_temp , start_y + y * (y_span / fields_size), vsize-x_shift+x_shift_temp, start_y + y * (y_span / fields_size));
	}
	
	for(let x = 0; x < fields_size; x++) {
		for(let y = 0; y < fields_size; y++) {
			if(f[x][y] == 1){
				let x_shift_temp1 = x_shift * (fields_size-y) / fields_size;
				let x_shift_temp2 = x_shift * (fields_size-(y+1)) / fields_size;
				let x1 = x * (vsize-x_shift)/fields_size + x_shift_temp1;
				let x2 = (x+1) * (vsize-x_shift)/fields_size + x_shift_temp1;
				let x3 = (x+1) * (vsize-x_shift)/fields_size + x_shift_temp2;
				let x4 = x * (vsize-x_shift)/fields_size + x_shift_temp2;
				let y1 = start_y + y * (y_span / fields_size);
				let y2 = start_y + (y+1) * (y_span / fields_size);
				
				fill(x1, y1, x2, y1, x3, y2, x4, y2);
			}
		}
	}
	
}

// フィールドを描画
function draw_fields(){
	ctx.clearRect(0, 0, canvas_size, canvas_size);
	for(let n = 0; n < fields_history_size; n++) {
		draw_field(n);
	}
}


// 新しいフィールドを生成
function create_new_field(){
	let f = new Array(fields_size);
	for(let x = 0; x < fields_size; x++) {
	  f[x] = new Array(fields_size);
	  for(let y = 0; y < fields_size; y++) {
	    f[x][y] = 0;
	  }
	}
	return f;
}



// フィールドをランダムに初期化
function randomaize(f){
	for(let x = 0; x < fields_size; x++) {
		for(let y = 0; y < fields_size; y++) {
			var r = Math.floor( Math.random() * 10);
			if( r  == 0){
				f[x][y] = 1;
			}else{
				f[x][y] = 0;
			}
		}
	}
}


// 新しいneural_param_wを生成
function create_new_param_w(){
	let w = new Array(fields_size);
	for(let x = 0; x < fields_size; x++) {
	  w[x] = new Array(fields_size);
	  for(let y = 0; y < fields_size; y++) {
		var r = Math.random();
	    w[x][y] = r;
	  }
	}
	return w;
}

// 新しいneural_param_tを生成
function create_new_param_t(){
	let t = new Array(fields_size);
	for(let x = 0; x < fields_size; x++) {
	  t[x] = new Array(fields_size);
	  for(let y = 0; y < fields_size; y++) {
		var r = Math.random() * fields_size * fields_size /4;
	    t[x][y] = r;
	  }
	}
	return t;
}



// リセット
function reset(){
	ctx.clearRect(0, 0, canvas_size, canvas_size);
	
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(0, canvas_size);
	ctx.lineTo(canvas_size, canvas_size);
	ctx.lineTo(canvas_size, 0);
	ctx.lineTo(0, 0);
	ctx.closePath();
	ctx.stroke();
	
	
	clearInterval(timer);
	timer = null;
		
	// セルオートマトンのグローバル変数を初期化
	fields = [];
	fields_backdata = [];
	for(let n = 0; n < fields_history_size; n++) {
		fields.push(create_new_field());
		fields_backdata.push(create_new_field());
	}
	
	// neural_param_wを決める。	
	for(let x = 0; x < fields_size; x++) {
		for(let y = 0; y < fields_size; y++) {
			neural_param_w.push(create_new_param_w());
		}
	}
	// neural_param_t1を決める。	
	neural_param_t1 = create_new_param_t();
	neural_param_t2 = create_new_param_t();
	
	// ランダムに初期化(ニューラルネット用)
	randomaize(fields[fields_history_size - 1]);
	
	// フィールドを描画
	draw_fields();
}

// スタートボタン押下
function start(){
	if( timer == null){
		timer = setInterval(loop, 500);
	}
}

// ストップボタン押下
function stop(){
	clearInterval(timer);
	timer = null;
}


// ループ処理
function loop(){
	// フィールド入れ替え
	step_fields();
	
	// ニューラルネット計算
	neural_network_step( fields[fields_history_size - 2], fields[fields_history_size - 1] );
	
	// フィールドを描画
	draw_fields();
}

// フィールド入れ替え
function step_fields(){
	fields.shift();
	fields.push(create_new_field());
}

// ニューラルネット計算
function neural_network_step(f1, f2){
	for(let x = 0; x < fields_size; x++) {
		for(let y = 0; y < fields_size; y++) {
			f2[x][y] = calc_next_neuron(f1, x, y);
		}
	}
}


// 次のニューロンの計算
function calc_next_neuron(f, in_x, in_y){
	var ret = 0;
	var sum = 0;
	
	var w = neural_param_w[in_x*fields_size + in_y];
	var t1 = neural_param_t1[in_x][in_y];
	var t2 = neural_param_t2[in_x][in_y];
	
	if(t1 > t2){
		var temp = t1;
		t1 = t2;
		t2 = temp;
	}
	
	
	for(let x = 0; x < fields_size; x++) {
		for(let y = 0; y < fields_size; y++) {
			sum += f[x][y] * w[x][y];
		}
	}
	
	if( t1 < sum && sum < t2){
		ret = 1;
	}else{
		ret = 0;
	}
	
	return ret;
}






// Load時処理
reset()


