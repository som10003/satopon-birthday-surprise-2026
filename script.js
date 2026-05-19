// =====================
// INTERACTIVE CAKE WITH CANDLES
// =====================

const canvas = document.getElementById('cakeCanvas');
const ctx = canvas.getContext('2d');
const resetButton = document.getElementById('resetButton');

// Canvas dimensions
const cakeWidth = 300;
const cakeHeight = 280;
const cakeX = (canvas.width - cakeWidth) / 2;
const cakeY = canvas.height - cakeHeight - 50;

// Color palette
const colors = {
    cakeBrown: '#8B6F47',
    frosting: '#F5E6D3',
    frostingLight: '#FEFAF3',
    frosting2: '#E8D4C0',
    candleWax: '#FFE5B4',
    candleFlame: '#FF6B35',
    flameOuter: '#FFA500',
    plate: '#D4C5B9',
    shadow: 'rgba(122, 92, 77, 0.2)',
};

// Candle properties
const candleCount = 6;
let candles = [];
let allBlown = false;

class Candle {
    constructor(x, y, index) {
        this.x = x;
        this.y = y;
        this.index = index;
        this.lit = true;
        this.blowProgress = 0; // 0 = not blown, 1 = fully blown
        this.width = 8;
        this.height = 45;
        this.flameHeight = 18;
        this.flameWidth = 6;
    }

    isHit(mx, my) {
        // Check if click is within candle and flame area
        const flameTop = this.y - this.height - this.flameHeight;
        return (
            mx >= this.x - 15 &&
            mx <= this.x + 15 &&
            my >= flameTop - 10 &&
            my <= this.y - this.height + 10
        );
    }

    blow() {
        if (this.lit && this.blowProgress < 1) {
            this.blowProgress = Math.min(this.blowProgress + 0.15, 1);
            if (this.blowProgress >= 1) {
                this.lit = false;
            }
        }
    }

    draw() {
        // Draw candle wax
        ctx.fillStyle = colors.candleWax;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y - this.height, this.width / 2 + 1, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = colors.candleWax;
        ctx.fillRect(this.x - this.width / 2, this.y - this.height, this.width, this.height);

        // Draw candle highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(this.x - this.width / 2 + 2, this.y - this.height, 2, this.height);

        // Draw flame only if lit
        if (this.lit) {
            this.drawFlame();
        }
    }

    drawFlame() {
        const wobble = Math.sin(Date.now() / 100 + this.index) * 2;
        const flameX = this.x + wobble;
        const flameTop = this.y - this.height - this.flameHeight;

        // Outer flame (orange)
        ctx.fillStyle = colors.flameOuter;
        ctx.globalAlpha = 0.7 * (1 - this.blowProgress * 0.5);
        ctx.beginPath();
        ctx.ellipse(
            flameX,
            flameTop + 8,
            this.flameWidth + 3,
            this.flameHeight * 0.8,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Inner flame (bright red-orange)
        ctx.fillStyle = colors.candleFlame;
        ctx.globalAlpha = 0.9 * (1 - this.blowProgress * 0.5);
        ctx.beginPath();
        ctx.ellipse(
            flameX,
            flameTop + 5,
            this.flameWidth,
            this.flameHeight * 0.6,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Flame glow
        ctx.fillStyle = 'rgba(255, 107, 53, 0.3)';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.ellipse(
            flameX,
            flameTop,
            this.flameWidth + 8,
            this.flameHeight + 5,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.globalAlpha = 1;
    }
}

// Initialize candles
function initializeCandles() {
    candles = [];
    allBlown = false;

    // Calculate positions in an arc across the top of the cake
    for (let i = 0; i < candleCount; i++) {
        const angle = (Math.PI / (candleCount - 1)) * i - Math.PI / 2;
        const radius = cakeWidth * 0.35;
        const x = cakeX + cakeWidth / 2 + Math.cos(angle) * radius;
        const y = cakeY + 30;

        candles.push(new Candle(x, y, i));
    }
}

// Draw cake
function drawCake() {
    // Plate
    ctx.fillStyle = colors.plate;
    ctx.fillRect(cakeX - 30, cakeY + cakeHeight - 10, cakeWidth + 60, 15);
    ctx.fillStyle = 'rgba(122, 92, 77, 0.1)';
    ctx.fillRect(cakeX - 30, cakeY + cakeHeight - 10, cakeWidth + 60, 3);

    // Main cake layers
    // Bottom layer (darker)
    ctx.fillStyle = colors.cakeBrown;
    ctx.fillRect(cakeX, cakeY + cakeHeight - 100, cakeWidth, 100);

    // Top layer (lighter)
    ctx.fillStyle = colors.frosting;
    ctx.beginPath();
    ctx.ellipse(cakeX + cakeWidth / 2, cakeY + 50, cakeWidth / 2, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    // Frosting detail
    ctx.fillStyle = colors.frostingLight;
    ctx.beginPath();
    ctx.ellipse(cakeX + cakeWidth / 2, cakeY + 40, cakeWidth / 2 - 10, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Frosting swirls/texture
    ctx.strokeStyle = colors.frosting2;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(
            cakeX + cakeWidth / 2 - 80 + i * 40,
            cakeY + 50 + Math.sin(i) * 10,
            15,
            0,
            Math.PI * 2
        );
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Cake shadow
    ctx.fillStyle = colors.shadow;
    ctx.fillRect(cakeX - 15, cakeY + cakeHeight - 5, cakeWidth + 30, 8);
}

// Draw all candles
function drawCandles() {
    candles.forEach((candle) => candle.draw());
}

// Main draw function
function draw() {
    // Clear canvas
    ctx.fillStyle = 'transparent';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw cake
    drawCake();

    // Draw candles
    drawCandles();

    // Check if all candles are blown
    const allBlownNow = candles.every((c) => !c.lit);
    if (allBlownNow && !allBlown) {
        allBlown = true;
        showCelebration();
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

    // Check which candle was clicked
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

// Show celebration message
function showCelebration() {
    const celebration = document.createElement('div');
    celebration.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #F6F1E7 0%, #FDF8F2 100%);
        border: 2px solid #7E8F74;
        border-radius: 20px;
        padding: 40px 60px;
        text-align: center;
        z-index: 1000;
        box-shadow: 0 20px 60px rgba(122, 92, 77, 0.25);
        animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;

    celebration.innerHTML = `
        <p style="
            font-family: 'Cormorant Garamond', serif;
            font-size: 2.2em;
            color: #7A5C4D;
            margin: 0;
            letter-spacing: 0.5px;
        ">✨ Make a wish! ✨</p>
        <p style="
            font-family: 'Great Vibes', cursive;
            font-size: 1.5em;
            color: #D8A7A7;
            margin: 15px 0 0 0;
        ">Happy Birthday! 🎂</p>
    `;

    document.body.appendChild(celebration);

    // Remove after 3 seconds
    setTimeout(() => {
        celebration.style.animation = 'fadeOut 0.6s ease-out forwards';
        setTimeout(() => celebration.remove(), 600);
    }, 3000);
}

// Reset button functionality
resetButton.addEventListener('click', () => {
    initializeCandles();
    allBlown = false;
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
