// =====================
// INTERACTIVE BIRTHDAY CAKE WITH 6 CANDLES
// Theme: Vintage English Garden / Anne of Green Gables
// =====================

const canvas = document.getElementById('cakeCanvas');
const ctx = canvas.getContext('2d');
const resetButton = document.getElementById('resetButton');

// Canvas setup
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Updated Color Palette based on design specs
const colors = {
    background: '#FDF8F2',      // Warm ivory
    creamFrosting: '#F6F1E7',   // Cream
    topFrosting: '#FFFFFF',     // Bright cream for top faces
    sageGreen: '#A8B59A',       // Sage green for vines
    mossGreen: '#7E8F74',       // Moss green for depth
    dustyRose: '#D8A7A7',       // Dusty rose for flowers
    softBlush: '#EBCFC4',       // Soft blush pink
    antiqueBrown: '#7A5C4D',    // Antique brown
    candleWax: '#FDF8F2',       // Ivory candles
    flameOuter: '#C8B68A',      // Faded gold
    candleFlame: '#D8A7A7',     // Rose-tinted inner flame
    plate: '#B8B0C9',           // Lavender grey plate
    shadow: 'rgba(122, 92, 77, 0.08)' // Soft antique brown shadow
};

// Cake dimensions (Elegant 2-tier design)
const cakeX = canvasWidth / 2;
const cakeY = canvasHeight * 0.70; // Lowered slightly to fit 2 tiers
const bottomTierWidth = 260;
const bottomTierHeight = 80;
const topTierWidth = 180;
const topTierHeight = 75;

// Candle setup
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
        this.vy += 0.05; // Gentle floating gravity
        this.vx += (Math.random() - 0.5) * 0.5; // Drifting effect
        this.life -= 0.008;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life * 0.8;
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw a soft oval petal shape
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Candle {
    constructor(index) {
        // Space gracefully around the top tier's curve
        const curveOffset = Math.sin((index / (candleCount - 1)) * Math.PI);
        const spacing = topTierWidth * 0.7;
        const startX = cakeX - (spacing / 2);
        
        this.x = startX + (index * spacing / (candleCount - 1));
        // Y position follows the slight elliptical curve of the top tier
        const baseTopY = cakeY - bottomTierHeight - topTierHeight;
        this.y = baseTopY + (curveOffset * 8) + 5; 
        
        this.index = index;
        this.lit = true;
        this.blowProgress = 0;
        this.candleWidth = 7;
        this.candleHeight = 45;
        this.flameHeight = 22;
        this.flameWidth = 8;
    }

    isHit(mx, my) {
        // MASSIVE hit area expansion for mobile touch ease
        const hitPadding = 40; 
        const hitLeft = this.x - hitPadding;
        const hitRight = this.x + hitPadding;
        const hitTop = this.y - this.candleHeight - this.flameHeight - hitPadding;
        const hitBottom = this.y + hitPadding;
        
        return (mx >= hitLeft && mx <= hitRight && my >= hitTop && my <= hitBottom);
    }

    blow() {
        if (this.lit && this.blowProgress < 1) {
            this.blowProgress = Math.min(this.blowProgress + 0.15, 1);
            if (this.blowProgress >= 1) {
                this.lit = false;
                // Soft elegant petal release
                for (let i = 0; i < 6; i++) {
                    petals.push(new Petal(this.x, this.y - this.candleHeight));
                }
            }
        }
    }

    draw() {
        // Candle body (Vintage ivory with slight brown border for definition)
        ctx.fillStyle = colors.candleWax;
        ctx.strokeStyle = 'rgba(122, 92, 77, 0.1)';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.roundRect(this.x - this.candleWidth / 2, this.y - this.candleHeight, this.candleWidth, this.candleHeight, [3, 3, 0, 0]);
        ctx.fill();
        ctx.stroke();

        // Wick
        ctx.fillStyle = colors.antiqueBrown;
        ctx.fillRect(this.x - 1, this.y - this.candleHeight - 4, 2, 4);

        if (this.lit) {
            this.drawFlame();
        } else {
            // Little smoke wisp when blown
            ctx.fillStyle = 'rgba(122, 92, 77, 0.2)';
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.candleHeight - 10 - Math.random() * 5, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawFlame() {
        const wobble = Math.sin(Date.now() / 150 + this.index * 0.8) * 1.5;
        const flameX = this.x + wobble;
        const flameTop = this.y - this.candleHeight - this.flameHeight;
        const flicker = Math.sin(Date.now() / 100 + this.index) * 0.15 + 0.85;

        // Outer glow
        ctx.fillStyle = colors.flameOuter;
        ctx.globalAlpha = 0.5 * flicker * (1 - this.blowProgress);
        ctx.beginPath();
        ctx.ellipse(flameX, flameTop + 10, this.flameWidth + 4, this.flameHeight * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner flame
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

// Helper function to draw a 3D cylindrical tier
function drawTier(x, y, width, height, bodyColor, topColor) {
    const curve = 25; // Controls the 3D perspective curve

    // Cake body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(x - width / 2, y);
    ctx.lineTo(x - width / 2, y - height);
    // Top curve of the body
    ctx.bezierCurveTo(x - width / 2, y - height + curve, x + width / 2, y - height + curve, x + width / 2, y - height);
    ctx.lineTo(x + width / 2, y);
    // Bottom curve of the body
    ctx.bezierCurveTo(x + width / 2, y + curve, x - width / 2, y + curve, x - width / 2, y);
    ctx.fill();

    // Side shading for soft natural lighting
    const gradient = ctx.createLinearGradient(x - width/2, 0, x + width/2, 0);
    gradient.addColorStop(0, 'rgba(122, 92, 77, 0.05)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(122, 92, 77, 0.12)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Cake top face
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.ellipse(x, y - height, width / 2, curve - 5, 0, 0, Math.PI * 2);
    ctx.fill();
}

// Helper to draw delicate vintage vines
function drawVinePiping(x, y, width, height) {
    ctx.strokeStyle = colors.sageGreen;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    const curve = 25;
    ctx.beginPath();
    // Trace the bottom curve of the tier
    for(let i = -width/2; i <= width/2; i+=15) {
        const progress = (i + width/2) / width;
        const archY = y + (Math.sin(progress * Math.PI) * curve * 0.8);
        
        // Draw little leaves
        ctx.fillStyle = colors.mossGreen;
        ctx.beginPath();
        ctx.ellipse(x + i, archY - 5, 4, 8, Math.PI/4, 0, Math.PI*2);
        ctx.fill();
        
        // Draw little wild roses
        if (i % 30 === 0) {
            ctx.fillStyle = colors.dustyRose;
            ctx.beginPath();
            ctx.arc(x + i, archY - 2, 4, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = colors.softBlush;
            ctx.beginPath();
            ctx.arc(x + i - 2, archY - 4, 3, 0, Math.PI*2);
            ctx.fill();
        }
    }
}

function drawCake() {
    // 1. Plate shadow
    ctx.fillStyle = colors.shadow;
    ctx.beginPath();
    ctx.ellipse(cakeX, cakeY + 15, bottomTierWidth / 2 + 30, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Vintage Plate
    ctx.fillStyle = colors.plate;
    ctx.beginPath();
    ctx.ellipse(cakeX, cakeY, bottomTierWidth / 2 + 40, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.creamFrosting;
    ctx.beginPath();
    ctx.ellipse(cakeX, cakeY - 2, bottomTierWidth / 2 + 25, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Bottom Tier
    drawTier(cakeX, cakeY - 5, bottomTierWidth, bottomTierHeight, colors.creamFrosting, colors.topFrosting);
    drawVinePiping(cakeX, cakeY - 5, bottomTierWidth, bottomTierHeight);

    // 4. Top Tier
    const topTierY = cakeY - bottomTierHeight - 5;
    drawTier(cakeX, topTierY, topTierWidth, topTierHeight, colors.creamFrosting, colors.topFrosting);
    drawVinePiping(cakeX, topTierY, topTierWidth, topTierHeight);

    // 5. Delicate Script on Cake
    ctx.fillStyle = colors.antiqueBrown;
    ctx.globalAlpha = 0.6;
    ctx.font = 'italic 26px "Cormorant Garamond", serif';
    ctx.textAlign = 'center';
    ctx.fillText('Happy 60th', cakeX, topTierY - topTierHeight/2 + 10);
    ctx.globalAlpha = 1;
}

function drawCandles() {
    candles.forEach((candle) => candle.draw());
}

function drawPetals() {
    petals = petals.filter(p => p.life > 0);
    petals.forEach(p => {
        p.update();
        p.draw();
    });
}

function showCelebration() {
    if (celebrationTriggered) return;
    celebrationTriggered = true;

    const celebration = document.createElement('div');
    // Styled to look like a vintage card
    celebration.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #FDF8F2;
        border: 1px solid #A8B59A;
        border-radius: 8px;
        padding: 50px 70px;
        text-align: center;
        z-index: 1000;
        box-shadow: 0 20px 40px rgba(122, 92, 77, 0.15);
        animation: popIn 1s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;

    // Added delicate borders inside to mimic a scrapbook frame
    celebration.innerHTML = `
        <div style="border: 1px dashed #D8A7A7; padding: 30px; border-radius: 4px;">
            <p style="
                font-family: 'Cormorant Garamond', serif;
                font-size: 2.2em;
                color: #7A5C4D;
                margin: 0 0 15px 0;
                letter-spacing: 0.5px;
            ">May all your wishes bloom beautifully.</p>
            <p style="
                font-family: 'Great Vibes', 'Allura', cursive;
                font-size: 1.8em;
                color: #7E8F74;
                margin: 0;
            ">Happy 60th Birthday, Satopon!</p>
        </div>
    `;

    document.body.appendChild(celebration);

    setTimeout(() => {
        celebration.style.animation = 'fadeOut 1.2s ease-out forwards';
        setTimeout(() => celebration.remove(), 1200);
    }, 5000);
}

function draw() {
    // Clear canvas with soft watercolor wash effect
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    drawCake();
    drawCandles();
    drawPetals();

    const allBlownNow = candles.every((c) => !c.lit);
    if (allBlownNow && !allBlown) {
        allBlown = true;
        for (let i = 0; i < 40; i++) {
            petals.push(new Petal(cakeX + (Math.random() - 0.5) * 200, cakeY - 150));
        }
        setTimeout(showCelebration, 800);
    }

    requestAnimationFrame(draw);
}

function handleInteraction(x, y) {
    candles.forEach((candle) => {
        if (candle.isHit(x, y)) {
            candle.blow();
        }
    });
}

function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    handleInteraction(x, y);
}

function handleCanvasTouch(event) {
    event.preventDefault(); // Prevents double-firing click events on mobile
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Check every finger touching the screen
    for (let touch of event.changedTouches) {
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;
        handleInteraction(x, y);
    }
}

resetButton.addEventListener('click', () => {
    initializeCandles();
});

// Canvas event listeners
canvas.addEventListener('click', handleCanvasClick);
canvas.addEventListener('touchstart', handleCanvasTouch, { passive: false });

// Injecting the animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes popIn {
        0% { opacity: 0; transform: translate(-50%, -45%) scale(0.95); }
        100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    @keyframes fadeOut {
        0% { opacity: 1; }
        100% { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize and start
initializeCandles();
draw();
