let products = {};
let questions = [];
let quizIndex = 0;
let score = 0;
let timerInterval;

// Load products and questions
fetch("products.json").then(res => res.json()).then(data => products = data);
fetch("questions.json").then(res => res.json()).then(data => questions = data.sort(() => Math.random() - 0.5));

// --------------------
// Camera QR Scanner
// --------------------
const scanMessage = document.getElementById('scanMessage');

function onScanSuccess(decodedText, decodedResult) {
    if (products[decodedText]) {
        html5QrcodeScanner.clear().then(_ => {
            showScreen2(products[decodedText]);
        }).catch(err => console.error(err));
    } else {
        scanMessage.textContent = "Unknown product!";
    }
}

const html5QrcodeScanner = new Html5Qrcode("qr-reader");
const config = { fps: 10, qrbox: 250 };

Html5Qrcode.getCameras().then(cameras => {
    if (cameras && cameras.length) {
        html5QrcodeScanner.start(cameras[0].id, config, onScanSuccess);
    }
}).catch(err => { scanMessage.textContent = "Camera not found: " + err; });

// --------------------
// Screen & Quiz Logic
// --------------------
function showScreen2(product) {
  document.getElementById('screen1').classList.remove('active');
  document.getElementById('screen2').classList.add('active');
  document.getElementById('productName').textContent = product.name;
  const recList = document.getElementById('recommendations');
  recList.innerHTML = "";
  product.recommendations.forEach(r => { const li = document.createElement('li'); li.textContent = r; recList.appendChild(li); });
  drawTree(product.ecoScore);
}

document.getElementById('nextToQuiz').addEventListener('click', () => {
  document.getElementById('screen2').classList.remove('active');
  document.getElementById('screen3').classList.add('active');
});

document.getElementById('startQuizBtn').addEventListener('click', () => {
  document.getElementById('screen3').classList.remove('active');
  document.getElementById('screen4').classList.add('active');
  quizIndex = 0;
  score = 0;
  showQuestion();
});

document.getElementById('skipQuizBtn').addEventListener('click', () => {
  document.getElementById('screen3').classList.remove('active');
  document.getElementById('screen5').classList.add('active');
  document.getElementById('finalScore').textContent = "You skipped the quiz!";
});

document.getElementById('restartBtn').addEventListener('click', () => {
  document.getElementById('screen5').classList.remove('active');
  document.getElementById('screen1').classList.add('active');
  scanMessage.textContent = "Waiting for QR code...";
  Html5Qrcode.getCameras().then(cameras => {
    if (cameras && cameras.length) html5QrcodeScanner.start(cameras[0].id, config, onScanSuccess);
  });
});

// --------------------
// Quiz Functions
// --------------------
function showQuestion() {
  if (quizIndex >= 5) { endQuiz(); return; }
  const q = questions[quizIndex];
  document.getElementById('quizQuestion').textContent = q.q;
  const optionsDiv = document.getElementById('quizOptions');
  optionsDiv.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.addEventListener('click', () => { checkAnswer(i); });
    optionsDiv.appendChild(btn);
  });
  startTimer();
}

function checkAnswer(selected) {
  if (selected === questions[quizIndex].answer) score++;
  quizIndex++;
  clearInterval(timerInterval);
  showQuestion();
}

function startTimer() {
  let timeLeft = 10;
  const timerP = document.getElementById('timer');
  timerP.textContent = "Time left: " + timeLeft;
  timerInterval = setInterval(() => {
    timeLeft--;
    timerP.textContent = "Time left: " + timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      quizIndex++;
      showQuestion();
    }
  }, 1000);
}

function endQuiz() {
  document.getElementById('screen4').classList.remove('active');
  document.getElementById('screen5').classList.add('active');
  document.getElementById('finalScore').textContent = `Your Score: ${score}/5`;
}

// --------------------
// Tree Animation
// --------------------
function drawTree(score) {
    const canvas = document.getElementById('ecoTree');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const trunkHeight = 50 + (score * 1.5);
    const trunkWidth = 10;
    const baseX = canvas.width / 2;
    const baseY = canvas.height;

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(baseX - trunkWidth/2, baseY - trunkHeight, trunkWidth, trunkHeight);

    const leafCount = Math.floor(score / 5);
    for(let i = 0; i < leafCount; i++){
        const angle = Math.random() * Math.PI - Math.PI/2;
        const radius = Math.random() * 20 + 10;
        const x = baseX + Math.cos(angle) * (trunkHeight / 2);
        const y = baseY - trunkHeight + Math.sin(angle) * (trunkHeight / 2);
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#228B22';
        ctx.fill();
    }
}
