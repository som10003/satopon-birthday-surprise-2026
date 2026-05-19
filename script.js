// =====================
// INTERACTIVE BIRTHDAY CAKE WITH 6 CANDLES
// =====================

const canvas = document.getElementById('cakeCanvas');
const ctx = canvas.getContext('2d');
const resetButton = document.getElementById('resetButton');

// Canvas setup
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Color palette
const colors = {
    background: '#FDF8F2',
    creamFrosting: '#F6F1E7',
    softBlush: '#EBCFC4',
    dustyRose: '#D8A7A7',
    sageGreen: '#A8B59A',
    candleWax: '#FFF8DC',
    flameOuter: '#FFA500',
    candleFlame: '#FF6B35',
    cakeSponge: '#D9B99B',
    plate: '#E8DDD0',
    shadow: 'rgba(122, 92, 77, 0.15)',
};

// Cake dimensions (centered, thick and celebratory)
const cakeX = canvasWidth / 2;
const cakeY = canvasHeight * 0.55;
const cakeWidth = 280;
const cakeHeight = 180;

// Candle setup
const candleCount = 6;
let candles = [];
let allBlown = false;
let celebrationTriggered = false;

// Petal animation
let petals = [];

class Petal {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = Math.random() * -2 - 1;
        this.life = 1;
        this.size = Math.random() * 4 + 2;
        this.rotation = Math.random() * Math.PI * 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy -= 0.1; // gravity
        this.life -= 0.01;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life * 0.6;
        ctx.fillStyle = colors.dustyRose;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Candle {
    constructor(index) {
        // 6 candles evenly spaced across top of cake
        const spacing = cakeWidth * 0.65;
        const startX = cakeX - (spacing / 2);
        
        this.x = startX + (index * spacing / (candleCount - 1));
        this.y = cakeY - cakeHeight / 2 - 20;
        this.index = index;
        this.lit = true;
        this.blowProgress = 0;
        this.candleWidth = 6;
        this.candleHeight = 40;
        this.flameHeight = 20;
        this.flameWidth = 8;
    }

    isHit(mx, my) {
        // Generous hit area for candle and flame
        const flameTop = this.y - this.candleHeight - this.flameHeight;
        return (
            mx >= this.x - 20 &&
            mx <= this.x + 20 &&
            my >= flameTop - 15 &&
            my <= this.y - this.candleHeight + 15
        );
    }

    blow() {
        if (this.lit && this.blowProgress < 1) {
            this.blowProgress = Math.min(this.blowProgress + 0.15, 1);
            if (this.blowProgress >= 1) {
                this.lit = false;
                // Create petal burst
                for (let i = 0; i < 8; i++) {
                    petals.push(new Petal(this.x, this.y - this.candleHeight - 10));
                }
            }
        }
    }

    draw() {
        // Draw candle wax (cream colored)
        ctx.fillStyle = colors.candleWax;
        ctx.fillRect(this.x - this.candleWidth / 2, this.y - this.candleHeight, this.candleWidth, this.candleHeight);

        // Draw candle highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(this.x - this.candleWidth / 2 + 1, this.y - this.candleHeight, 2, this.candleHeight);

        // Draw flame only if lit
        if (this.lit) {
            this.drawFlame();
        }
    }

    drawFlame() {
        const wobble = Math.sin(Date.now() / 120 + this.index * 0.5) * 2;
        const flameX = this.x + wobble;
        const flameTop = this.y - this.candleHeight - this.flameHeight;
        const flicker = Math.sin(Date.now() / 80 + this.index) * 0.3 + 0.7;

        // Outer flame (orange)
        ctx.fillStyle = colors.flameOuter;
        ctx.globalAlpha = 0.6 * flicker * (1 - this.blowProgress * 0.3);
        ctx.beginPath();
        ctx.ellipse(flameX, flameTop + 8, this.flameWidth + 2, this.flameHeight * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner flame (bright red-orange)
        ctx.fillStyle = colors.candleFlame;
        ctx.globalAlpha = 0.9 * flicker * (1 - this.blowProgress * 0.3);
        ctx.beginPath();
        ctx.ellipse(flameX, flameTop + 5, this.flameWidth - 1, this.flameHeight * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Flame glow
        ctx.fillStyle = 'rgba(255, 107, 53, 0.25)';
        ctx.globalAlpha = 0.4 * (1 - this.blowProgress * 0.3);
        ctx.beginPath();
        ctx.ellipse(flameX, flameTop, this.flameWidth + 10, this.flameHeight + 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
    }
}

// Initialize candles
function initializeCandles() {
    candles = [];
    allBlown = false;
    celebrationTriggered = false;
    petals = [];

    for (let i = 0; i < candleCount; i++) {
        candles.push(new Candle(i));
    }
}

// Draw the thick layered cake
function drawCake() {
    // Plate/base
    ctx.fillStyle = colors.plate;
    ctx.beginPath();
    ctx.ellipse(cakeX, cakeY + cakeHeight / 2 + 15, cakeWidth / 2 + 50, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Soft shadow
    ctx.fillStyle = colors.shadow;
    ctx.beginPath();
    ctx.ellipse(cakeX, cakeY + cakeHeight / 2 + 18, cakeWidth / 2 + 40, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bottom sponge layer (darker, visible cake)
    ctx.fillStyle = colors.cakeSponge;
    ctx.beginPath();
    ctx.ellipse(cakeX, cakeY + cakeHeight * 0.25, cakeWidth / 2, cakeHeight * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Middle sponge layer
    ctx.fillStyle = colors.cakeSponge;
    ctx.beginPath();
    ctx.ellipse(cakeX, cakeY - cakeHeight * 0.1, cakeWidth / 2 - 20, cakeHeight * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Top frosting layer (main visible part)
    ctx.fillStyle = colors.creamFrosting;
    ctx.beginPath();
    ctx.ellipse(cakeX, cakeY - cakeHeight * 0.3, cakeWidth / 2 - 30, cakeHeight * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Frosting highlight (lighter cream)
    ctx.fillStyle = colors.softBlush;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(cakeX - 40, cakeY - cakeHeight * 0.35, cakeWidth / 2 - 60, cakeHeight * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Soft floral piping accents (very subtle)
    ctx.strokeStyle = colors.dustyRose;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.4;

    // Decorative gentle swirls
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(
            cakeX - 50 + i * 50,
            cakeY - cakeHeight * 0.2,
            12,
            0,
            Math.PI * 2
        );
        ctx.stroke();
    }

    ctx.globalAlpha = 1;

    // Optional delicate "60" text on cake front
    ctx.fillStyle = colors.dustyRose;
    ctx.globalAlpha = 0.4;
    ctx.font = 'italic 24px "EB Garamond", serif';
    ctx.textAlign = 'center';
    ctx.fillText('60', cakeX, cakeY + cakeHeight * 0.15);
    ctx.globalAlpha = 1;
}

// Draw all candles
function drawCandles() {
    candles.forEach((candle) => candle.draw());
}

// Draw petals
function drawPetals() {
    petals = petals.filter(p => p.life > 0);
    petals.forEach(p => {
        p.update();
        p.draw();
    });
}

// Show celebration message
function showCelebration() {
    if (celebrationTriggered) return;
    celebrationTriggered = true;

    const celebration = document.createElement('div');
    celebration.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #F6F1E7 0%, #FDF8F2 100%);
        border: 2px solid #7E8F74;
        border-radius: 20px;
        padding: 50px 70px;
        text-align: center;
        z-index: 1000;
        box-shadow: 0 20px 60px rgba(122, 92, 77, 0.25);
        animation: popIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;

    celebration.innerHTML = `
        <p style="
            font-family: 'Cormorant Garamond', serif;
            font-size: 2.2em;
            color: #7A5C4D;
            margin: 0 0 15px 0;
            letter-spacing: 0.5px;
        ">May all your wishes bloom beautifully.</p>
        <p style="
            font-family: 'Great Vibes', cursive;
            font-size: 1.6em;
            color: #D8A7A7;
            margin: 0;
        ">✨ Happy 60th Birthday, Satopon! ✨</p>
    `;

    document.body.appendChild(celebration);

    // Remove after 4 seconds
    setTimeout(() => {
        celebration.style.animation = 'fadeOut 0.8s ease-out forwards';
        setTimeout(() => celebration.remove(), 800);
    }, 4000);
}

// Main draw function
function draw() {
    // Clear canvas
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw cake
    drawCake();

    // Draw candles
    drawCandles();

    // Draw petals
    drawPetals();

    // Check if all candles are blown
    const allBlownNow = candles.every((c) => !c.lit);
    if (allBlownNow && !allBlown) {
        allBlown = true;
        // Create celebration petals
        for (let i = 0; i < 30; i++) {
            petals.push(new Petal(cakeX + (Math.random() - 0.5) * 100, cakeY - 100));
        }
        setTimeout(showCelebration, 500);
    }

    // Continue animation
    requestAnimationFrame(draw);
}

// Handle canvas click
function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    candles.forEach((candle) => {
        if (candle.isHit(x, y)) {
            candle.blow();
        }
    });
}

// Handle touch events for mobile
function handleCanvasTouch(event) {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    for (let touch of event.touches) {
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;

        candles.forEach((candle) => {
            if (candle.isHit(x, y)) {
                candle.blow();
            }
        });
    }
}

// Reset button functionality
resetButton.addEventListener('click', () => {
    initializeCandles();
});

// Canvas event listeners
canvas.addEventListener('click', handleCanvasClick);
canvas.addEventListener('touchstart', handleCanvasTouch, false);

// Add animations to document
const style = document.createElement('style');
style.textContent = `
    @keyframes popIn {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.3);
        }
        100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }

    @keyframes fadeOut {
        0% {
            opacity: 1;
        }
        100% {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize and start
initializeCandles();
draw();
