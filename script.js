const argFuncTable = [
  {x: 0, y: 2},
  {x: 5, y: 8},
  {x: 7, y: 5},
]

let fileArgs = []
let gridSize = 50

const modePicker = document.getElementsByName("mode")
const argumentInput = document.getElementById("argument")
const runBtn = document.getElementById("run")
const resultsArea = document.getElementById("resultsArea")
const fileInput = document.getElementById("fileInput")
const funcPicker = document.getElementsByName("funcPicker")
const maxArg = document.getElementById("maxArg")

const inputs1 = document.getElementById("row1")
const inputs2 = document.getElementById("row2")
inputs2.style.display = "none"

function expm(x) {
  return Math.exp(-x)
}

function giper(x) {
  if (+x.toFixed(1) === 0) return undefined
  return 1 / x;
}

runBtn.addEventListener("click", (event) => {
  let mode = 1;

  modePicker.forEach(btn => {
    if (btn.checked) mode = +btn.value;
  })

  if(mode === 1) {
    const arg = parseFloat(argumentInput.value.replace(",", "."))
    resultsArea.value = polynomialNewtonValue(argFuncTable, arg).toString()
  }
  if(mode === 2) {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let funcName = 'sin'
    funcPicker.forEach(btn => {
      if (btn.checked) funcName = btn.value
    })

    let func
    switch (funcName) {
      case "sin":
        func = Math.sin
        break
      case "abs":
        func = Math.abs
        break
      case "e":
        func = expm
        break
      case "1x":
        func = giper
        break
      default:
        func = Math.sin
        break
    }

    gridSize = Math.ceil(canvas.width / (+maxArg.value * 2 + 1))

    drawNet()
    drawFunc(func)
    const filePoints = getFilePoints(func)

    filePoints.forEach(point => drawPoint(point))
    const differences = drawPolynomial(filePoints, func)

    drawMaxDifference(differences)
  }
})

modePicker.forEach(btn => {
  btn.addEventListener("click", (event) => {
    const pickedMode = +btn.value

    if (pickedMode === 1) {
      inputs1.style.display = "flex"
      inputs2.style.display = "none"
    }
    if (pickedMode === 2) {
      inputs1.style.display = "none"
      inputs2.style.display = "flex"
    }
  })
})

fileInput.onchange = (event) => {
  const file = fileInput.files[0]
  const reader = new FileReader();
  reader.readAsText(file)
  reader.onload = () => {
    fileArgs = reader.result.split(" ").map(elem => +elem)
  }
}

function dividedDifference(funcTable, ...args) {
  let sum = 0;
  for (let i = 0; i < args.length; i++) {
    let mul = 1;
    for (let j = 0; j < args.length; j++) {
      if (j === i) continue;
      mul *= (args[i] - args[j]);
    }

    sum += funcTable.find(node => node.x === args[i]).y / mul
  }

  return sum;
}

function polynomialNewtonValue(funcTable, arg) {
  let sum = funcTable[0].y
  const argsForDifference = [funcTable[0].x]

  for (let i = 1; i < funcTable.length; i++) {
    let mul = 1
    for (let j = 0; j < i; j++) {
      mul *= arg - funcTable[j].x
    }

    argsForDifference.push(funcTable[i].x)

    sum += dividedDifference(funcTable, ...argsForDifference) * mul
  }

  return sum
}

function drawPolynomial(filePoints, func) {

  let points = []
  let diffs = []

  const minArg = filePoints.reduce((acc, point) => {
    return point.x < acc ? point.x : acc
  }, filePoints[0].x)
  const maxArg = filePoints.reduce((acc, point) => {
    return point.x > acc ? point.x : acc
  }, filePoints[0].x)

  for (let i = minArg; i <= maxArg; i += 0.1) {
    const value = polynomialNewtonValue(filePoints, i)
    points.push({x: i, y: value});

    diffs.push({x: i, yf: func(i), yp: value});
  }

  drawMultiLine(points, "blue")
  return diffs
}

function getFilePoints(func) {
  return fileArgs.map(arg => ({x: arg, y: func(arg)}))
}

function drawPoint(point, color = "blue") {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(point.x * gridSize + canvas.width / 2, -point.y * gridSize + canvas.width / 2, 5, 0, 2 * Math.PI); // Start point
  ctx.fill();
}

function drawMultiLine(points, color = "black") {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const formattedPoints = points.map(point => {
    return {
      x: point.x * gridSize + canvas.width / 2,
      y: point.y !== undefined ? -point.y * gridSize + canvas.width / 2 : undefined
    }
  })

  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(formattedPoints[0].x, formattedPoints[0].y)

  formattedPoints.forEach((point, index) => {
    if (point.y === undefined) {
      if (index + 1 < formattedPoints.length) ctx.moveTo(formattedPoints[index + 1].x, formattedPoints[index + 1].y)
    } else {
      ctx.lineTo(point.x, point.y)
    }
  })

  ctx.stroke();
}

function drawFunc(func) {
  const canvas = document.getElementById("canvas");

  let points = []

  for (let i = +(-canvas.width / 2 / gridSize).toFixed(1); i <= canvas.width / 2 / gridSize; i += 0.1) {
    points.push({x: +i.toFixed(1), y: func(i)})
  }

  drawMultiLine(points)
}

function drawMaxDifference(diffs) {
  const maxDiff = diffs.reduce((acc, diff) => {
    return Math.abs(diff.yf - diff.yp) > Math.abs(acc.yf - acc.yp) ? diff : acc
  }, diffs[0])

  const points = [
    {x: maxDiff.x, y: maxDiff.yf},
    {x: maxDiff.x, y: maxDiff.yp}
  ]

  resultsArea.value = `Max difference: ${Math.abs(maxDiff.yf - maxDiff.yp).toString()}`
  drawPoint(points[0], 'red')
  drawPoint(points[1], 'red')
  drawMultiLine(points, 'red')
}

function drawNet() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  ctx.beginPath();
  ctx.strokeStyle = "#efefef";
  ctx.moveTo(canvas.width / 2, 0)
  ctx.lineTo(canvas.width / 2, canvas.height)
  ctx.stroke();
  ctx.moveTo(0, canvas.height / 2)
  ctx.lineTo(canvas.width, canvas.height / 2)
  ctx.stroke();

  let n = canvas.width / 2
  while (n < canvas.width) {
    n += gridSize
    ctx.moveTo(n, 0)
    ctx.lineTo(n, canvas.height)
    ctx.stroke();
  }
  n = canvas.width / 2
  while (n > 0) {
    n -= gridSize
    ctx.moveTo(n, 0)
    ctx.lineTo(n, canvas.height)
    ctx.stroke();
  }
  n = canvas.height / 2
  while (n < canvas.height) {
    n += gridSize
    ctx.moveTo(0, n)
    ctx.lineTo(canvas.width, n)
    ctx.stroke();
  }
  n = canvas.height / 2
  while (n > 0) {
    n -= gridSize
    ctx.moveTo(0, n)
    ctx.lineTo(canvas.width, n)
    ctx.stroke();
  }
}