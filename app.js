let currentScreen = 1;
let ecoScore = 0;
let currentQuestion = 0;
let score = 0;
let quizQuestions = [];

const products = {
  "prod1": { name: "Plastic Bottle", ecoScore: 20, recommendations: ["Use Steel Bottle", "Refill Instead"] },
  "prod2": { name: "Organic Apple", ecoScore: 90, recommendations: ["Great Choice!"] }
};

const questionsPool = [
  { q: "Which is better for environment?", options: ["Plastic Bag","Cloth Bag"], answer: 1 },
  { q: "Best energy source?", options: ["Coal","Solar"], answer: 1 },
  { q: "Recycle symbol color?", options: ["Green","Blue"], answer: 0 },
  // add 50 questions here
];

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
}

// -------- QR Code Scanner --------
function startScanner() {
  const html5QrCode = new Html5Qrcode("reader");
  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    qrCodeMessage => {
      html5QrCode.stop();
      handleProductScan(qrCodeMessage);
    },
    errorMessage => { /* ignore errors */ }
  );
}

function handleProductScan(code) {
  if(products[code]){
    ecoScore = products[code].ecoScore;
    showScreen("screen-tree");
    drawTree(ecoScore);
    displayRecommendations(products[code].recommendations);
  } else {
    alert("Unknown product!");
  }
}

// -------- Tree Animation --------
function drawTree(score){
  const canvas = document.getElementById("treeCanvas");
  const ctx = canvas.getContext("2d");
  let height = 0;
  const targetHeight = score * 3; // scale for animation
  function animate() {
    if(height < targetHeight){
      height += 2;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = "#228B22";
      ctx.fillRect(canvas.width/2-5, canvas.height-height, 10, height);
      requestAnimationFrame(animate);
    }
  }
  animate();
}

function displayRecommendations(recs){
  const recDiv = document.getElementById("recommendations");
  recDiv.innerHTML = "<h3>Recommendations:</h3><ul>" + recs.map(r => `<li>${r}</li>`).join("") + "</ul>";
}

// -------- Quiz Logic --------
function startQuiz(){
  quizQuestions = questionsPool.sort(() => 0.5 - Math.random()).slice(0,5);
  currentQuestion = 0;
  score = 0;
  showScreen("screen-quiz");
  showQuizQuestion();
}

function showQuizQuestion(){
  const q = quizQuestions[currentQuestion];
  document.getElementById("quiz-question").innerText = q.q;
  const optionsDiv = document.getElementById("quiz-options");
  optionsDiv.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = () => { if(i===q.answer) score++; };
    optionsDiv.appendChild(btn);
  });
  startTimer(10);
}

function startTimer(sec){
  const timerDiv = document.getElementById("timer");
  timerDiv.innerText = `Time: ${sec}s`;
  const interval = setInterval(()=>{
    sec--;
    timerDiv.innerText = `Time: ${sec}s`;
    if(sec<=0){ clearInterval(interval); }
  },1000);
}

document.getElementById("nextToQuiz").onclick = () => showScreen("screen-quiz-invite");
document.getElementById("startQuizBtn").onclick = startQuiz;
document.getElementById("skipQuizBtn").onclick = () => alert("Thanks for visiting!");

startScanner();
