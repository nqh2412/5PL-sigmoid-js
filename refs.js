
let y_vals = [];
let x_vals = [];
let a, b, c, d, e, f;
let dragging = false;
const learningRate = 0.5;
const optimizer = tf.train.sgd(learningRate);

function setup() {
  createCanvas(600, 600);
  b = tf.variable(tf.scalar(random(2,5)));
  c = tf.variable(tf.scalar(random(0,1)));
  d = tf.variable(tf.scalar(random(0,1)));
  e = tf.variable(tf.scalar(random(0,1)));
  a = tf.variable(tf.scalar(random(1,5)));
}

function loss(pred, labels) {
  return pred
    .sub(labels)
    .square()
    .mean();
}

function predict(x) {
    const xs = tf.tensor1d(x);

//log logistic curve - 5-parameter sigmoidal curve
// y = c + (d - c)/(1 + e^(b*(log(x) - log(e)))^a

const ys = c.add(
      d.sub(c).div(
         tf.scalar(1).add(e.pow(b.mul(xs.log().sub(e.log())))).pow(a)));


  return ys;
}

function mousePressed() {
  dragging = true;
}

function mouseReleased() {
  dragging = false;
}

function draw() {

    if (dragging) {
        let x = map(mouseX, 0, width, 0, 1);
        let y = map(mouseY, 0, height, 1, 0);
        x_vals.push(x);
        y_vals.push(y);
    } else {

        tf.tidy(() => {
            if (x_vals.length > 0) {
                const ys = tf.tensor1d(y_vals);
                optimizer.minimize(() => loss(predict(x_vals), ys));
            }
        });

        
    }

    background(0);

    stroke(255);
    strokeWeight(8);
    for (let i = 0; i < x_vals.length; i++) {
        let px = map(x_vals[i], 0, 1, 0, width);
        let py = map(y_vals[i], 0, 1, height, 0);
        point(px, py);
    }

    const curveX = [];
    for (let x = -1; x <= 1; x += 0.05) {
        curveX.push(x);
    }

    const ys = tf.tidy(() => predict(curveX));
    let curveY = ys.dataSync();
    ys.dispose();

    beginShape();
    noFill();
    stroke(255);
    strokeWeight(2);
    for (let i = 0; i < curveX.length; i++) {
        let x = map(curveX[i], 0, 1, 0, width);
        let y = map(curveY[i], 0, 1, height, 0);
        vertex(x, y);
    }
    endShape();

   let param_a = a.dataSync();
   let param_b = b.dataSync();
   let param_c = c.dataSync();
   let param_d = d.dataSync();
   let param_e = e.dataSync();
//    document.write(param_a, param_b, param_c, param_d, param_e )
    console.log(
        `a: ${a.dataSync()}, 
        b: ${b.dataSync()}, 
        c: ${c.dataSync()},
        d: ${d.dataSync()}, 
        e: ${e.dataSync()}
        loss: `);
    //console.log(tf.memory().numTensors);

}