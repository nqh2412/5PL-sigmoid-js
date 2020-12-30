fminsearch = function (fun, Parm0, x, y, Opt) {// fun = function(x,Parm)
	if (!Opt) { Opt = {} };
	if (!Opt.maxIter) { Opt.maxIter = 1000 };
	if (!Opt.step) {// initial step is 1/100 of initial value (remember not to use zero in Parm0)
		Opt.step = Parm0.map(function (p) { return p / 100 });
		Opt.step = Opt.step.map(function (si) { if (si == 0) { return 1 } else { return si } }); // convert null steps into 1's
	};
	if (typeof (Opt.display) == 'undefined') { Opt.display = true };
	if (!Opt.objFun) {
		Opt.objFun = function (y, yp) {
			return y.map(function (yi, i) { return Math.pow((yi - yp[i]), 2) }).reduce(function (a, b) { return a + b })
		}
	} //SSD

	var cloneVector = function (V) { return V.map(function (v) { return v }) };
	var ya, y0, yb, fP0, fP1;
	var P0 = cloneVector(Parm0), P1 = cloneVector(Parm0);
	var n = P0.length;
	var step = Opt.step;
	var funParm = function (P) { return Opt.objFun(y, fun(x, P)) }
	//function (of Parameters) to minimize
	// silly multi-univariate screening
	for (var i = 0; i < Opt.maxIter; i++) {
		for (var j = 0; j < n; j++) { // take a step for each parameter
			P1 = cloneVector(P0);
			P1[j] += step[j];
			if (funParm(P1) < funParm(P0)) { // if parm value going in the righ direction
				step[j] = 1.2 * step[j]; // then go a little faster
				P0 = cloneVector(P1);
			}
			else {
				step[j] = -(0.5 * step[j]); // otherwiese reverse and go slower
			}
		}
		if (Opt.display) { if (i > (Opt.maxIter - 10)) { console.log(i + 1, funParm(P0), P0) } }
	}
	if (!!document.getElementById('plot')) { // if there is then use it
		fminsearch.plot(x, y, fun(x, P0), P0);
	}
	return P0
};

fminsearch.load = function (src) { // script loading
	// example: fminsearch.load('http://localhost:8888/jmat/jmat.js')
	var s = document.createElement('script');
	s.src = src;
	document.head.appendChild(s);
	s.parentElement.removeChild(s);
};

fminsearch.plot = function (x, y, yp, Parms) { // ploting results using <script type="text/javascript" src="https://www.google.com/jsapi"></script>
	// create Array in Google's format
	var data = new google.visualization.DataTable();
	data.addColumn('number', 'X');
	data.addColumn('number', 'Observed');
	data.addColumn('number', 'Model fit');
	var n = x.length;
	for (var i = 0; i < n; i++) {
		data.addRow([x[i], y[i], yp[i]]);
	};
	//var chart = new google.visualization.ScatterChart(
	var titulo = 'Model fitting';
	if (!!Parms) { titulo = 'Model parameters: ' + Parms };
	var chart = new google.visualization.ComboChart(
		document.getElementById('plot'));
	chart.draw(data, {
		title: titulo,
		width: 600, height: 400,
		vAxis: { title: "Y", titleTextStyle: { color: "green" } },
		hAxis: { title: "X", titleTextStyle: { color: "green" } },
		seriesType: "scatter",
		series: { 1: { type: "line" } }
	}
	);
}

const x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
const y = [100, 73.39, 73.39, 91.79, 122.11, 96.24, 100.62, 82.71, 202.3,
	221.76, 225.49, 198.01, 221.76, 221.76, 229.17, 232.8, 205.64,
	209.38, 209.38, 213.07]

const xMin = Math.min.apply(Math, x);
const xMax = Math.max.apply(Math, x);
const yMin = Math.min.apply(Math, y);
const yMax = Math.max.apply(Math, y);
const xMid = xMax / 2;
const slope = (yMax - yMin) / (xMax - xMin)

fun = function (x, P) {
	return x.map(function (xi) {
		return P[1] + (P[2] - P[1]) /
			((1 + Math.exp(P[0] * (Math.log10(xi) - Math.log10(P[3])))) ** P[4])
	})
};
const ssd = function (y, yp) {
	return y.map(function (yi, i) { return Math.pow((yi - yp[i]), 2) }).reduce(function (a, b) { return a + b })
}
const rmse = function (y, yp) {
	const sqrError = y.map(function (yi, i) { return Math.pow((yi - yp[i]), 2) });
	const meanSqrError = sqrError.reduce(function (a, b) { return a + b }) / sqrError.length;
	const rmse = Math.sqrt(meanSqrError);
	return rmse;
}

Parms = fminsearch(fun, [slope, yMax, yMin, xMid, 1], x, y, {
	maxIter: 1000,
	//display: false,
	objFun: rmse
});

console.log(Parms[0] / 3);