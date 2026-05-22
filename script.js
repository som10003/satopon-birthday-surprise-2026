// ==========================================
// 1. 3D BOOK & SWIPE PAGE NAVIGATION ENGINE
// ==========================================
const pages = document.querySelectorAll('.page');
let currentPageIndex = 0;

function updatePageDepthSorting() {
    pages.forEach((page, index) => {
        if (index < currentPageIndex) {
            // Page is flipped behind to the left
            page.classList.add('flipped');
            page.classList.remove('active');
        } else if (index === currentPageIndex) {
            // Active view state
            page.classList.remove('flipped');
            page.classList.add('active');
        } else {
            // Unopened hidden layers
            page.classList.remove('flipped');
            page.classList.remove('active');
        }
    });
}

// Connect layout execution actions onto navigation triggers
document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (currentPageIndex < pages.length - 1) {
            currentPageIndex++;
            updatePageDepthSorting();
        }
    });
});

document.querySelectorAll('.prev-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (currentPageIndex > 0) {
            currentPageIndex--;
            updatePageDepthSorting();
        }
    });
});

// Mobile Native Swipe Interaction Layer
let touchStartX = 0;
let touchEndX = 0;

const bookContainer = document.getElementById('birthdayBook');
bookContainer.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

bookContainer.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
}, { passive: true });

function handleSwipeGesture() {
    const swipeThreshold = 50; 
    // Do not turn pages while interacting with the active cake canvas area
    if (document.activeElement && document.activeElement.id === 'cakeCanvas') return;
    
    if (touchStartX - touchEndX > swipeThreshold) {
        // Swiped Left -> Turn forward
        if (currentPageIndex < pages.length - 1) {
            currentPageIndex++;
            updatePageDepthSorting();
        }
    } else if (touchEndX - touchStartX > swipeThreshold) {
        // Swiped Right -> Turn backward
        if (currentPageIndex > 0) {
            currentPageIndex--;
            updatePageDepthSorting();
        }
    }
}


// ==========================================
// 2. CANVAS INTERACTIVE BIRTHDAY CAKE LAYER
// ==========================================
const canvas = document.getElementById('cakeCanvas');
const ctx = canvas.getContext('2d');
const resetButton = document.getElementById('resetButton');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const colors = {
    background: '#FDF8F2',
    creamFrosting: '#F6F1E7',
    topFrosting: '#FFFFFF',
    sageGreen: '#A8B59A',
    mossGreen: '#7E8F74',
    dustyRose: '#D8A7A7',
    softBlush: '#EBCFC4',
    antiqueBrown: '#7A5C4D',
    candleWax: '#FDF8F2',
    flameOuter: '#C8B68A',
    candleFlame: '#D8A7A7',
    plate: '#B8B0C9',
    shadow: 'rgba(122, 92, 77, 0.08)'
};

// Cake dimensions (Optimized tightly for portrait mobile layout frames)
const cakeX = canvasWidth / 2;
const cakeY = canvasHeight * 0.82; 
const bottomTierWidth = 240;
const bottomTierHeight = 70;
const topTierWidth = 160;
const topTierHeight = 65;

const candleCount = 6;
let candles = [];
let allBlown = false;
let celebrationTriggered = false;
let petals = [];

class Petal {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = Math.random() * -2 - 1;
        this.life = 1;
        this.size = Math.random() * 4 + 3;
        this.rotation = Math.random() * Math.PI * 2;
        this.color = Math.random() > 0.5 ? colors.dustyRose : colors.softBlush;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05;
        this.vx += (Math.random() - 0.5) * 0.3;
        this.life -= 0.008;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.life * 0.8;
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Candle {
    constructor(index) {
        const curveOffset = Math.sin((index / (candleCount - 1)) * Math.PI);
        const spacing = topTierWidth * 0.75;
        const startX = cakeX - (spacing / 2);
        
        this.x = startX + (index * spacing / (candleCount - 1));
        const baseTopY = cakeY - bottomTierHeight - topTierHeight;
        this.y = baseTopY + (curveOffset * 8) + 5; 
        
        this.index = index;
        this.lit = true;
        this.blowProgress = 0;
        this.candleWidth = 6;
        this.candleHeight = 40;
        this.flameHeight = 20;
        this.flameWidth = 7;
    }

    isHit(mx, my) {
        const hitPadding = 35; 
        return (mx >= this.x - hitPadding && mx <= this.x + hitPadding && 
                my >= this.y - this.candleHeight - this.flameHeight - hitPadding && my <= this.y + hitPadding);
    }

    blow() {
        if (this.lit && this.blowProgress < 1) {
            this.blowProgress = Math.min(this.blowProgress + 0.2, 1);
            if (this.blowProgress >= 1) {
                this.lit = false;
                for (let i = 0; i < 6; i++) {
                    petals.push(new Petal(this.x, this.y - this.candleHeight));
                }
            }
        }
    }

    draw() {
        ctx.fillStyle = colors.candleWax;
        ctx.strokeStyle = 'rgba(122, 92, 77, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(this.x - this.candleWidth / 2, this.y - this.candleHeight, this.candleWidth, this.candleHeight, [2, 2, 0, 0]);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = colors.antiqueBrown;
        ctx.fillRect(this.x - 0.5, this.y - this.candleHeight - 4, 1, 4);

        if (this.lit) {
            this.drawFlame();
        } else {
            ctx.fillStyle = 'rgba(122, 92, 77, 0.15)';
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.candleHeight - 8, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawFlame() {
        const wobble = Math.sin(Date.now() / 150 + this.index * 0.8) * 1.2;
        const flameX = this.x + wobble;
        const flameTop = this.y - this.candleHeight - this.flameHeight;
        const flicker = Math.sin(Date.now() / 100 + this.index) * 0.15 + 0.85;

        ctx.fillStyle = colors.flameOuter;
        ctx.globalAlpha = 0.4 * flicker * (1 - this.blowProgress);
        ctx.beginPath();
        ctx.ellipse(flameX, flameTop + 10, this.flameWidth + 3, this.flameHeight * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = colors.candleFlame;
        ctx.globalAlpha = 0.8 * flicker * (1 - this.blowProgress);
        ctx.beginPath();
        ctx.ellipse(flameX, flameTop + 8, this.flameWidth - 1, this.flameHeight * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function initializeCandles() {
    candles = [];
    allBlown = false;
    celebrationTriggered = false;
    petals = [];
    for (let i = 0; i < candleCount; i++) {
        candles.push(new Candle(i));
    }
}

function drawTier(x, y, width, height, bodyColor, topColor) {
    const curve = 22;
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(x - width / 2, y);
    ctx.lineTo(x - width / 2, y - height);
    ctx.bezierCurveTo(x - width / 2, y - height + curve, x + width / 2, y - height + curve, x + width / 2, y - height);
    ctx.lineTo(x + width / 2, y);
    ctx.bezierCurveTo(x + width / 2, y + curve, x - width / 2, y + curve, x - width / 2, y);
    ctx.fill();

    const gradient = ctx.createLinearGradient(x - width/2, 0, x + width/2, 0);
    gradient.addColorStop(0, 'rgba(122, 92, 77, 0.04)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
    gradient.addColorStop(1, 'rgba(122, 92, 77, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.ellipse(x, y - height, width / 2, curve - 4, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawVinePiping(x, y, width, height) {
    ctx.strokeStyle = colors.sageGreen;
    ctx.lineWidth = 1.5;
    const curve = 22;
    
    for(let i = -width/2; i <= width/2; i+=15) {
        const progress = (i + width/2) / width;
        const archY = y + (Math.sin(progress * Math.PI) * curve * 0.8);
        
        ctx.fillStyle = colors.mossGreen;
        ctx.beginPath();
        ctx.ellipse(x + i, archY - 4, 3, 6, Math.PI/4, 0, Math.PI*2);
        ctx.fill();
        
        if (i % 30 === 0) {
            ctx.fillStyle = colors.dustyRose;
            ctx.beginPath();
            ctx.arc(x + i, archY - 2, 3, 0, Math.PI*2);
            ctx.fill();
        }
    }
}

function drawCake() {
    ctx.fillStyle = colors.shadow;
    ctx.beginPath();
    ctx.ellipse(cakeX, cakeY + 12, bottomTierWidth / 2 + 20, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colors.plate;
    ctx.beginPath();
    ctx.ellipse(cakeX, cakeY, bottomTierWidth / 2 + 30, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.creamFrosting;
    ctx.beginPath();
    ctx.ellipse(cakeX, cakeY - 2, bottomTierWidth / 2 + 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    drawTier(cakeX, cakeY - 4, bottomTierWidth, bottomTierHeight, colors.creamFrosting, colors.topFrosting);
    drawVinePiping(cakeX, cakeY - 4, bottomTierWidth, bottomTierHeight);

    const topTierY = cakeY - bottomTierHeight - 4;
    drawTier(cakeX, topTierY, topTierWidth, topTierHeight, colors.creamFrosting, colors.topFrosting);
    drawVinePiping(cakeX, topTierY, topTierWidth, topTierHeight);

    ctx.fillStyle = colors.antiqueBrown;
    ctx.globalAlpha = 0.5;
    ctx.font = 'italic 22px "Cormorant Garamond", serif';
    ctx.textAlign = 'center';
    ctx.fillText('Happy 60th', cakeX, topTierY - topTierHeight/2 + 8);
    ctx.globalAlpha = 1;
}

function showCelebration() {
    if (celebrationTriggered) return;
    celebrationTriggered = true;

    const celebration = document.createElement('div');
    celebration.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #FDF8F2;
        border: 1px solid #A8B59A;
        border-radius: 8px;
        padding: 30px;
        text-align: center;
        z-index: 2000;
        width: 85%;
        max-width: 340px;
        box-shadow: 0 20px 40px rgba(122, 92, 77, 0.2);
        animation: popIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;

    celebration.innerHTML = `
        <div style="border: 1px dashed #D8A7A7; padding: 20px; border-radius: 4px;">
            <p style="font-family: 'Cormorant Garamond', serif; font-size: 1.6em; color: #7A5C4D; margin: 0 0 10px 0;">May all your wishes bloom beautifully.</p>
            <p style="font-family: 'Great Vibes', cursive; font-size: 1.5em; color: #7E8F74; margin: 0;">Happy 60th Birthday, Satopon!</p>
        </div>
    `;

    document.body.appendChild(celebration);
    setTimeout(() => {
        celebration.style.animation = 'fadeOut 1s ease-out forwards';
        setTimeout(() => celebration.remove(), 1000);
    }, 4500);
}

function renderLoop() {
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    drawCake();
    candles.forEach(c => c.draw());
    
    petals = petals.filter(p => p.life > 0);
    petals.forEach(p => { p.update(); p.draw(); });

    const allBlownNow = candles.every(c => !c.lit);
    if (allBlownNow && !allBlown) {
        allBlown = true;
        for (let i = 0; i < 35; i++) {
            petals.push(new Petal(cakeX + (Math.random() - 0.5) * 160, cakeY - 120));
        }
        setTimeout(showCelebration, 600);
    }
    requestAnimationFrame(renderLoop);
}

function handleInteraction(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    candles.forEach(c => { if (c.isHit(x, y)) c.blow(); });
}

canvas.addEventListener('click', handleInteraction);
canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    handleInteraction(e);
}, { passive: false });

resetButton.addEventListener('click', () => initializeCandles());


// ==========================================
// 3. VOICE-ACTIVATED BLOW DETECTION ENGINE
// ==========================================
let audioContext;
let analyser;
let microphone;

async function setupMicrophone() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        
        const instructionText = document.querySelector('.cake-instruction');
        if (instructionText) {
            instructionText.style.opacity = 0;
            setTimeout(() => {
                instructionText.innerText = "✨ Blow into your microphone to make a wish... ✨";
                instructionText.style.color = colors.dustyRose;
                instructionText.style.fontWeight = "600";
                instructionText.style.opacity = 1;
            }, 300);
        }
        checkAudioLevel();
    } catch (err) {
        console.log("Mic access denied or unsupported. Falling back to tap control mechanics.", err);
    }
}

function checkAudioLevel() {
    if (allBlown) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) { sum += dataArray[i]; }
    let average = sum / bufferLength;

    // Threshold 42 is highly optimized to filter speech but detect close proximity air blows
    if (average > 42) { 
        let litCandles = candles.filter(c => c.lit);
        if (litCandles.length > 0) {
            const randomCandle = litCandles[Math.floor(Math.random() * litCandles.length)];
            randomCandle.blow();
        }
    }
    requestAnimationFrame(checkAudioLevel);
}

// Microphone permission requested on initial canvas engagement
canvas.addEventListener('click', () => { if (!audioContext) setupMicrophone(); }, { once: true });
canvas.addEventListener('touchstart', () => { if (!audioContext) setupMicrophone(); }, { once: true });

// Dynamic Keyframe style generation
const style = document.createElement('style');
style.textContent = `
    @keyframes popIn {
        0% { opacity: 0; transform: translate(-50%, -40%) scale(0.9); }
        100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    @keyframes fadeOut { 0% { opacity: 1; } 100% { opacity: 0; } }
`;
document.head.appendChild(style);

// Run initialization engines
initializeCandles();
renderLoop();
