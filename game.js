/**
 * SUPER ADVENTURE - Game Engine
 * Retro Side-Scrolling Platformer
 */

// ==========================================
// 1. SOUND SYNTHESIZER (Web Audio API)
// ==========================================
class SoundManager {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.tempo = 120;
        this.isPlayingBgm = false;
        this.bgmSequence = null;
        this.bgmTimeouts = [];
        this.masterVolume = null;
        this.melodyOsc = null;
        this.bassOsc = null;
    }

    init() {
        if (this.ctx) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        this.ctx = new AudioContextClass();
        this.masterVolume = this.ctx.createGain();
        this.masterVolume.gain.value = this.muted ? 0 : 0.3;
        this.masterVolume.connect(this.ctx.destination);
    }

    setMute(mute) {
        this.muted = mute;
        if (this.masterVolume) {
            this.masterVolume.gain.setValueAtTime(mute ? 0 : 0.3, this.ctx.currentTime);
        }
    }

    playTone(freq, type, duration, gainStart, gainEnd, delay = 0) {
        if (!this.ctx) this.init();
        if (this.muted || !this.ctx) return;

        // Resume context if suspended (browser security)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
        
        gainNode.gain.setValueAtTime(gainStart, this.ctx.currentTime + delay);
        gainNode.gain.exponentialRampToValueAtTime(gainEnd, this.ctx.currentTime + delay + duration);

        osc.connect(gainNode);
        gainNode.connect(this.masterVolume);

        osc.start(this.ctx.currentTime + delay);
        osc.stop(this.ctx.currentTime + delay + duration);
    }

    playJump() {
        if (!this.ctx) this.init();
        if (this.muted || !this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(650, now + 0.15);

        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gainNode);
        gainNode.connect(this.masterVolume);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    playCoin() {
        if (!this.ctx) this.init();
        if (this.muted || !this.ctx) return;

        const now = this.ctx.currentTime;
        // Double tone (B5 -> E6)
        this.playTone(987.77, 'square', 0.08, 0.25, 0.1, 0);
        this.playTone(1318.51, 'square', 0.25, 0.25, 0.01, 0.08);
    }

    playStomp() {
        if (!this.ctx) this.init();
        if (this.muted || !this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(30, now + 0.1);

        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gainNode);
        gainNode.connect(this.masterVolume);
        osc.start(now);
        osc.stop(now + 0.1);
    }

    playPowerUp() {
        if (!this.ctx) this.init();
        if (this.muted || !this.ctx) return;

        const notes = [330, 392, 659, 523, 587, 784];
        const step = 0.07;
        notes.forEach((freq, idx) => {
            this.playTone(freq, 'triangle', step * 1.5, 0.3, 0.05, idx * step);
        });
    }

    playHurt() {
        if (!this.ctx) this.init();
        if (this.muted || !this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.2);

        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gainNode);
        gainNode.connect(this.masterVolume);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    playFireball() {
        if (!this.ctx) this.init();
        if (this.muted || !this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);

        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gainNode);
        gainNode.connect(this.masterVolume);
        osc.start(now);
        osc.stop(now + 0.1);
    }

    playGameOver() {
        this.stopBgm();
        if (!this.ctx) this.init();
        if (this.muted || !this.ctx) return;

        const notes = [523, 494, 440, 392, 349, 330, 294, 261];
        const step = 0.15;
        notes.forEach((freq, idx) => {
            this.playTone(freq, 'sawtooth', step * 1.5, 0.3, 0.01, idx * step);
        });
    }

    playVictory() {
        this.stopBgm();
        if (!this.ctx) this.init();
        if (this.muted || !this.ctx) return;

        const notes = [261, 329, 392, 523, 659, 784, 1046, 784, 880, 987, 1046];
        const steps = [0.1, 0.1, 0.1, 0.15, 0.15, 0.15, 0.3, 0.15, 0.15, 0.15, 0.5];
        let accumDelay = 0;
        notes.forEach((freq, idx) => {
            const type = idx === notes.length - 1 ? 'square' : 'triangle';
            this.playTone(freq, type, steps[idx] * 1.5, 0.35, 0.02, accumDelay);
            accumDelay += steps[idx];
        });
    }

    startBgm() {
        if (this.isPlayingBgm) return;
        this.init();
        this.isPlayingBgm = true;
        this.playBgmLoop();
    }

    stopBgm() {
        this.isPlayingBgm = false;
        this.bgmTimeouts.forEach(clearTimeout);
        this.bgmTimeouts = [];
    }

    playBgmLoop() {
        if (!this.isPlayingBgm || this.muted || !this.ctx) return;

        // Simple looping tune scheduler
        // A simple happy pentatonic retro melody & bass
        const melody = [
            330, 330, 0, 330, 0, 261, 330, 0,
            392, 0, 0, 0, 196, 0, 0, 0,
            261, 0, 0, 196, 0, 0, 165, 0,
            220, 0, 247, 0, 220, 220, 220, 0,
            196, 261, 330, 392, 0, 261, 330, 0,
            392, 0, 0, 0, 196, 0, 0, 0
        ];
        
        const bass = [
            130, 130, 130, 130, 130, 130, 130, 130,
            98, 98, 98, 98, 98, 98, 98, 98,
            110, 110, 110, 110, 110, 110, 110, 110,
            87, 87, 87, 87, 130, 130, 130, 130,
            130, 130, 130, 130, 130, 130, 130, 130,
            98, 98, 98, 98, 98, 98, 98, 98
        ];

        const tempoStep = 0.15; // Time in seconds per 16th note

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const now = this.ctx.currentTime;
        let totalDuration = melody.length * tempoStep;

        melody.forEach((freq, idx) => {
            if (freq > 0) {
                this.playTone(freq, 'triangle', tempoStep * 0.8, 0.12, 0.01, idx * tempoStep);
            }
        });

        bass.forEach((freq, idx) => {
            if (freq > 0) {
                this.playTone(freq, 'sine', tempoStep * 0.9, 0.15, 0.01, idx * tempoStep);
            }
        });

        const timeoutId = setTimeout(() => {
            if (this.isPlayingBgm) {
                this.playBgmLoop();
            }
        }, totalDuration * 1000);

        this.bgmTimeouts.push(timeoutId);
    }
}

const sound = new SoundManager();

// ==========================================
// 2. LEVEL MAPS & LAYOUTS
// ==========================================
const LEVEL_HEIGHT = 15;
const TILE_SIZE = 32;

// Character codes in grid maps:
// . : Empty
// # : Solid Ground Block
// G : Grass Top Ground Block
// B : Breakable Brick Block
// ? : Question Block (Coin)
// M : Question Block (Super Mushroom)
// F : Question Block (Fire Flower)
// S : Solid Metal Block (indestructible)
// p, P: Pipe Top Left/Right
// u, U: Pipe Shaft Left/Right
// x : Spikes (Damage/Death)
// | : Flagpole shaft
// [ : Flagpole base block
// ] : Flagpole top/flag

const level1 = [
    "......................................................................................................................................................",
    "......................................................................................................................................................",
    "......................................................................................................................................................",
    "......................................................................................................................................................",
    "......................................................................................................................................................",
    "......................................................................................................................................................",
    "......................B?B.B?B............................................B?B.........................B?B..B?B........................................",
    ".....................................................................................................................................]................",
    ".....................................................................................................................................|................",
    "............?B?........................BBSSBB.......................................................BBSSBB..................................|................",
    ".........................p.P........................................p.P..............................................................|................",
    "...................p.P...u.U..........................p.P...........u.U.....................................p.P......................|................",
    "...................u.U...u.U.......x.......x..........u.U...........u.U.......x......x......................u.U......x...x...........[................",
    "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
    "############################################################   #######################################################################################"
];

const level2 = [
    "......................................................................................................................................................",
    "......................................................................................................................................................",
    "......................................................................................................................................................",
    "......................................................................................................................................................",
    "......................................................................................................................................................",
    "......................BBB..BBB..........................................BBB..........................BBB..BBB........................................",
    "......................................................................................................................................................",
    "................x...x.................x...x..........................................................................................]................",
    "............B?B...M...B?B.........BSSB.....BSSB......................................................................................|................",
    "...........................................................................................BSSB..BSSB................................|................",
    "....................................................................p.P..............................................................|................",
    "...................p.P................................p.P...........u.U.....................................p.P......................|................",
    "...................u.U................................u.U...........u.U.....................................u.U......................|................",
    "GGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
    "##########################   ####################################   ##################################################################################"
];

// List of levels
const LEVELS = [level1, level2];

// ==========================================
// 3. KEYBOARD & INPUT ENGINE
// ==========================================
const keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    dash: false
};

function setupInput() {
    window.addEventListener('keydown', (e) => {
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            e.preventDefault();
        }
        
        handleKey(e.code, true);
    });

    window.addEventListener('keyup', (e) => {
        handleKey(e.code, false);
    });

    // P or Escape for pause
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyP' || e.code === 'Escape') {
            game.togglePause();
        }
    });

    // Mobile / Touch controls
    const bindTouchBtn = (id, keyName) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        
        const setKey = (val) => {
            keys[keyName] = val;
            if (keyName === 'jump' && val) {
                keys.up = true;
            } else if (keyName === 'jump' && !val) {
                keys.up = false;
            }
        };

        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            setKey(true);
        }, { passive: false });

        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            setKey(false);
        }, { passive: false });

        btn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            setKey(false);
        }, { passive: false });
    };

    bindTouchBtn('touch-left', 'left');
    bindTouchBtn('touch-right', 'right');
    bindTouchBtn('touch-jump', 'jump');
    bindTouchBtn('touch-fire', 'dash');
}

function handleKey(code, isDown) {
    switch (code) {
        case 'ArrowLeft':
        case 'KeyA':
            keys.left = isDown;
            break;
        case 'ArrowRight':
        case 'KeyD':
            keys.right = isDown;
            break;
        case 'ArrowUp':
        case 'KeyW':
            keys.up = isDown;
            break;
        case 'ArrowDown':
        case 'KeyS':
            keys.down = isDown;
            break;
        case 'Space':
        case 'KeyZ':
            keys.jump = isDown;
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
        case 'KeyX':
            keys.dash = isDown;
            break;
    }
}

// ==========================================
// 4. ENTITY CLASSES (Player, Enemy, Item, etc.)
// ==========================================

class Player {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = 80;
        this.y = 300;
        this.vx = 0;
        this.vy = 0;
        
        this.state = 0; // 0: ちび (Small), 1: デカ (Super), 2: ファイア (Fire)
        this.width = 24;
        this.height = 32;

        this.onGround = false;
        this.facing = 'right';
        this.isInvincible = 0; // invincibility frame counter
        this.animFrame = 0;
        this.walkCycle = 0;
        this.isDead = false;
        this.deathTimer = 0;
        
        // Cooldown for firing fireballs
        this.fireCooldown = 0;
    }

    changeState(newState) {
        if (newState === this.state) return;
        
        // Adjust collision size and offset
        const oldHeight = this.height;
        if (newState === 0) {
            this.width = 24;
            this.height = 32;
        } else {
            this.width = 24;
            this.height = 54;
        }
        
        // Reposition Y to avoid sinking into ground
        this.y -= (this.height - oldHeight);
        this.state = newState;
        
        if (newState > 0) {
            sound.playPowerUp();
        }
    }

    damage() {
        if (this.isInvincible > 0 || this.isDead) return;

        if (this.state > 0) {
            // Shrink back to Small
            this.changeState(0);
            this.isInvincible = 120; // 2 seconds of invincibility at 60fps
            sound.playHurt();
            game.shakeScreen(15);
        } else {
            // Die
            this.die();
        }
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;
        this.deathTimer = 120;
        this.vy = -10; // pop upwards
        this.vx = 0;
        sound.playGameOver();
        game.shakeScreen(25);
    }

    update() {
        if (this.isDead) {
            this.y += this.vy;
            this.vy += 0.4; // gravity during death
            this.deathTimer--;
            if (this.deathTimer <= 0) {
                game.handlePlayerDeath();
            }
            return;
        }

        if (this.isInvincible > 0) {
            this.isInvincible--;
        }

        if (this.fireCooldown > 0) {
            this.fireCooldown--;
        }

        // Horizontal Movement
        const accel = this.onGround ? 0.35 : 0.2;
        const drag = this.onGround ? 0.85 : 0.98;
        const maxSpeed = (keys.dash || keys.dash) ? 5.5 : 3.5;

        if (keys.left) {
            this.vx -= accel;
            this.facing = 'left';
            this.walkCycle += 0.15;
        } else if (keys.right) {
            this.vx += accel;
            this.facing = 'right';
            this.walkCycle += 0.15;
        } else {
            // Idle friction
            this.vx *= drag;
            if (Math.abs(this.vx) < 0.1) this.vx = 0;
        }

        // Limit velocity
        if (this.vx > maxSpeed) this.vx = maxSpeed;
        if (this.vx < -maxSpeed) this.vx = -maxSpeed;

        // Jump physics
        // Mario physics: hold jump for higher jumps, can jump only if onGround
        if ((keys.jump || keys.up) && this.onGround) {
            this.vy = -10.2;
            this.onGround = false;
            sound.playJump();
        }

        // Variable jump height: if button released while ascending, cut upward velocity
        if (!(keys.jump || keys.up) && this.vy < -3) {
            this.vy = -3;
        }

        // Apply gravity
        this.vy += 0.42;
        if (this.vy > 12) this.vy = 12; // Terminal velocity

        // Update positions & run collisions
        this.x += this.vx;
        this.resolveCollisions('horizontal');

        this.y += this.vy;
        this.onGround = false;
        this.resolveCollisions('vertical');

        // Check if fallen out of map
        if (this.y > 480 + 100) {
            this.die();
        }

        // Shooting Fireballs
        if (this.state === 2 && keys.dash && this.fireCooldown === 0) {
            this.fireCooldown = 15; // 4 fireballs a second limit
            const fx = this.facing === 'right' ? this.x + this.width : this.x - 12;
            const fy = this.y + this.height / 2 - 6;
            const fvx = this.facing === 'right' ? 7 : -7;
            game.spawnFireball(fx, fy, fvx);
            sound.playFireball();
        }
    }

    resolveCollisions(dir) {
        const startX = Math.floor(this.x / TILE_SIZE);
        const endX = Math.floor((this.x + this.width) / TILE_SIZE);
        const startY = Math.floor(this.y / TILE_SIZE);
        const endY = Math.floor((this.y + this.height) / TILE_SIZE);

        for (let row = startY; row <= endY; row++) {
            for (let col = startX; col <= endX; col++) {
                if (game.isTileSolid(col, row)) {
                    // Check if block overlaps
                    const tileX = col * TILE_SIZE;
                    const tileY = row * TILE_SIZE;

                    if (this.x + this.width > tileX &&
                        this.x < tileX + TILE_SIZE &&
                        this.y + this.height > tileY &&
                        this.y < tileY + TILE_SIZE) {
                        
                        if (dir === 'horizontal') {
                            if (this.vx > 0) { // moving right
                                this.x = tileX - this.width;
                                this.vx = 0;
                            } else if (this.vx < 0) { // moving left
                                this.x = tileX + TILE_SIZE;
                                this.vx = 0;
                            }
                        } else { // vertical
                            if (this.vy > 0) { // moving down
                                this.y = tileY - this.height;
                                this.vy = 0;
                                this.onGround = true;
                            } else if (this.vy < 0) { // moving up
                                this.y = tileY + TILE_SIZE;
                                this.vy = 0.5; // bounce slightly
                                game.handleBlockHit(col, row);
                            }
                        }
                    }
                }
            }
        }
    }

    draw(ctx) {
        // Flashing animation during invincibility
        if (this.isInvincible > 0 && Math.floor(this.isInvincible / 4) % 2 === 0) {
            return;
        }

        ctx.save();
        
        // Base coordinate shifting for animations
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        if (this.facing === 'left') {
            ctx.scale(-1, 1);
        }

        // Draw Player Sprite Programmatically (Smooth Modern Vector Style)
        const sizeMultiplier = this.state > 0 ? 1.6 : 1.0;
        
        // Custom colors depending on Fire/Super/Small state
        let hatColor = '#e63946'; // Red
        let shirtColor = '#e63946'; // Red
        let overallsColor = '#1d3557'; // Blue

        if (this.state === 2) { // Fire state
            hatColor = '#ffffff'; // White hat
            shirtColor = '#e63946'; // Red shirt
            overallsColor = '#ffffff'; // White overalls
        } else if (this.state === 1) { // Super state
            hatColor = '#d90429';
            shirtColor = '#d90429';
            overallsColor = '#003049';
        }

        if (this.isDead) {
            // Rotated / Dead sprite
            ctx.rotate(Math.PI);
            shirtColor = '#888888';
            overallsColor = '#444444';
        }

        const headRadius = 8 * sizeMultiplier;
        const bodyWidth = 16 * sizeMultiplier;
        const bodyHeight = 16 * sizeMultiplier;

        // 1. Draw head (Skin)
        ctx.fillStyle = '#ffdbac'; // Skin tone
        ctx.beginPath();
        ctx.arc(0, -this.height/4, headRadius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Draw Eyes
        ctx.fillStyle = '#000';
        if (this.isDead) {
            // Draw dead eyes (X)
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            const ex = 3 * sizeMultiplier;
            const ey = -this.height/4;
            // Left eye X
            ctx.beginPath();
            ctx.moveTo(ex - 2, ey - 2); ctx.lineTo(ex + 2, ey + 2);
            ctx.moveTo(ex - 2, ey + 2); ctx.lineTo(ex + 2, ey - 2);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(3 * sizeMultiplier, -this.height/4 - 1, 1.5 * sizeMultiplier, 0, Math.PI * 2);
            ctx.fill();
        }

        // 3. Draw Cap
        ctx.fillStyle = hatColor;
        ctx.beginPath();
        // Cap dome
        ctx.arc(0, -this.height/4 - 5 * sizeMultiplier, headRadius * 0.9, Math.PI, 0);
        // Cap visor
        ctx.lineTo(headRadius + 2, -this.height/4 - 5 * sizeMultiplier);
        ctx.lineTo(headRadius + 2, -this.height/4 - 3 * sizeMultiplier);
        ctx.lineTo(-headRadius, -this.height/4 - 3 * sizeMultiplier);
        ctx.closePath();
        ctx.fill();

        // M emblem on cap (if super/fire, tiny pixel)
        if (this.state > 0) {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(0, -this.height/4 - 7, 2, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = hatColor;
            ctx.font = 'bold 3px sans-serif';
            ctx.fillText('M', -1.5, -6);
        }

        // 4. Body & Overalls
        // Walk animation: bob body up & down
        let walkOffset = 0;
        if (!this.onGround) {
            walkOffset = -2;
        } else if (Math.abs(this.vx) > 0.1) {
            walkOffset = Math.sin(this.walkCycle) * 1.5;
        }

        ctx.fillStyle = shirtColor;
        // Torso/Shirt
        ctx.fillRect(-bodyWidth/2, -this.height/12 + walkOffset, bodyWidth, bodyHeight * 0.7);

        // Overalls
        ctx.fillStyle = overallsColor;
        ctx.fillRect(-bodyWidth/2, 2 + walkOffset, bodyWidth, bodyHeight * 0.6);
        
        // Straps
        ctx.fillRect(-bodyWidth/2.5, -this.height/12 + walkOffset, 3 * sizeMultiplier, bodyHeight * 0.7);
        ctx.fillRect(bodyWidth/6, -this.height/12 + walkOffset, 3 * sizeMultiplier, bodyHeight * 0.7);

        // Yellow buttons
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(-bodyWidth/2.5 + 1.5, walkOffset + 1, 1, 0, Math.PI*2);
        ctx.arc(bodyWidth/6 + 1.5, walkOffset + 1, 1, 0, Math.PI*2);
        ctx.fill();

        // 5. Draw Legs/Shoes
        ctx.fillStyle = '#5c4033'; // Brown shoes
        let legL_Y = this.height/2 - 3;
        let legR_Y = this.height/2 - 3;
        
        if (Math.abs(this.vx) > 0.1 && this.onGround) {
            legL_Y += Math.sin(this.walkCycle) * 3;
            legR_Y += -Math.sin(this.walkCycle) * 3;
        }

        ctx.fillRect(-bodyWidth/2.5, legL_Y, 5 * sizeMultiplier, 4);
        ctx.fillRect(bodyWidth/8, legR_Y, 5 * sizeMultiplier, 4);

        // 6. Arms
        ctx.fillStyle = shirtColor;
        if (!this.onGround && !this.isDead) {
            // Arms up in air jump pose
            ctx.fillRect(bodyWidth/2, -this.height/6, 4 * sizeMultiplier, 8 * sizeMultiplier);
        } else {
            // Arms down/swinging
            let armOffset = Math.sin(this.walkCycle) * 2;
            ctx.fillRect(bodyWidth/2, -this.height/12 + armOffset, 3 * sizeMultiplier, 8 * sizeMultiplier);
        }

        ctx.restore();
    }
}

// ==========================================
// 5. ENEMY & HAZARD LOGIC
// ==========================================
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'kuribo' (Goomba), 'nokonoko' (Koopa)
        
        this.width = 28;
        this.height = type === 'nokonoko' ? 32 : 28;
        
        this.vx = -1.2;
        this.vy = 0;
        this.isDead = false;
        this.deadTimer = 0;
        
        // nokonoko shell states: 'walk', 'shell', 'shell_slide'
        this.nokonokoState = 'walk';
        
        this.facing = 'left';
        this.walkCycle = 0;
    }

    update() {
        if (this.isDead) {
            if (this.deadTimer > 0) {
                this.deadTimer--;
            }
            return;
        }

        // Apply gravity
        this.vy += 0.4;
        if (this.vy > 10) this.vy = 10;

        // Apply velocities
        this.x += this.vx;
        this.resolveCollisions('horizontal');

        this.y += this.vy;
        this.resolveCollisions('vertical');

        this.walkCycle += 0.1;

        // Simple Cliff Turnaround AI (avoid falling off cliffs for non-sliding shells)
        if (this.nokonokoState !== 'shell_slide') {
            const lookAheadX = this.vx > 0 ? this.x + this.width + 4 : this.x - 4;
            const lookAheadY = this.y + this.height + 4;
            
            const checkCol = Math.floor(lookAheadX / TILE_SIZE);
            const checkRow = Math.floor(lookAheadY / TILE_SIZE);
            
            if (!game.isTileSolid(checkCol, checkRow) && game.isTileSolid(Math.floor(this.x / TILE_SIZE), checkRow)) {
                this.vx = -this.vx; // turn around at edge!
            }
        }
    }

    resolveCollisions(dir) {
        const startX = Math.floor(this.x / TILE_SIZE);
        const endX = Math.floor((this.x + this.width) / TILE_SIZE);
        const startY = Math.floor(this.y / TILE_SIZE);
        const endY = Math.floor((this.y + this.height) / TILE_SIZE);

        for (let row = startY; row <= endY; row++) {
            for (let col = startX; col <= endX; col++) {
                if (game.isTileSolid(col, row)) {
                    const tileX = col * TILE_SIZE;
                    const tileY = row * TILE_SIZE;

                    if (this.x + this.width > tileX &&
                        this.x < tileX + TILE_SIZE &&
                        this.y + this.height > tileY &&
                        this.y < tileY + TILE_SIZE) {
                        
                        if (dir === 'horizontal') {
                            this.vx = -this.vx;
                            if (this.vx > 0) {
                                this.x = tileX + TILE_SIZE;
                            } else {
                                this.x = tileX - this.width;
                            }
                        } else {
                            if (this.vy > 0) {
                                this.y = tileY - this.height;
                                this.vy = 0;
                            }
                        }
                    }
                }
            }
        }
    }

    stomp() {
        if (this.type === 'kuribo') {
            this.isDead = true;
            this.deadTimer = 30; // squashed frame duration
            this.vx = 0;
            this.vy = 0;
            sound.playStomp();
        } else if (this.type === 'nokonoko') {
            if (this.nokonokoState === 'walk') {
                this.nokonokoState = 'shell';
                this.height = 24; // smaller shell height
                this.y += 8;
                this.vx = 0;
                sound.playStomp();
            } else if (this.nokonokoState === 'shell') {
                // Kick shell
                const dir = (game.player.x + game.player.width/2 < this.x + this.width/2) ? 1 : -1;
                this.nokonokoState = 'shell_slide';
                this.vx = dir * 8;
                sound.playStomp();
            } else if (this.nokonokoState === 'shell_slide') {
                // Stop shell sliding
                this.nokonokoState = 'shell';
                this.vx = 0;
                sound.playStomp();
            }
        }
    }

    kick(dir) {
        if (this.type === 'nokonoko' && this.nokonokoState === 'shell') {
            this.nokonokoState = 'shell_slide';
            this.vx = dir * 8;
            sound.playStomp();
        }
    }

    dieFly() {
        this.isDead = true;
        this.deadTimer = 100;
        this.vy = -7;
        this.vx = (Math.random() - 0.5) * 4;
        sound.playStomp();
    }

    draw(ctx) {
        if (this.isDead && this.type === 'kuribo' && this.deadTimer > 0) {
            // Squashed flat Kuribo
            ctx.fillStyle = '#a0522d';
            ctx.beginPath();
            ctx.ellipse(this.x + this.width/2, this.y + this.height - 4, this.width/2, 4, 0, 0, Math.PI*2);
            ctx.fill();
            // face
            ctx.fillStyle = '#ffdbac';
            ctx.fillRect(this.x + 4, this.y + this.height - 8, this.width - 8, 4);
            return;
        }

        if (this.isDead && this.deadTimer > 0) {
            // Flying upside down death
            ctx.save();
            ctx.translate(this.x + this.width/2, this.y + this.height/2);
            ctx.rotate(Math.PI);
            
            ctx.fillStyle = '#a0522d';
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
            ctx.restore();
            return;
        }

        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        
        if (this.vx < 0) {
            ctx.scale(-1, 1);
        }

        if (this.type === 'kuribo') {
            // Draw Kuribo (Goomba)
            // Head
            ctx.fillStyle = '#a0522d'; // Brown
            ctx.beginPath();
            ctx.arc(0, -2, 12, Math.PI, 0); // round top
            ctx.lineTo(12, 8);
            ctx.lineTo(-12, 8);
            ctx.closePath();
            ctx.fill();

            // Face details (Angry eyes & fangs)
            ctx.fillStyle = '#ffdbac'; // Tan face/stem
            ctx.fillRect(-8, 3, 16, 8);

            // Eyes
            ctx.fillStyle = '#fff';
            ctx.fillRect(-5, 0, 3, 4);
            ctx.fillRect(2, 0, 3, 4);
            ctx.fillStyle = '#000';
            ctx.fillRect(-4, 1, 2, 2);
            ctx.fillRect(2, 1, 2, 2);

            // Angry eyebrows
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-6, -2); ctx.lineTo(-2, 0);
            ctx.moveTo(6, -2); ctx.lineTo(2, 0);
            ctx.stroke();

            // Teeth
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(-4, 8); ctx.lineTo(-3, 6); ctx.lineTo(-2, 8);
            ctx.moveTo(2, 8); ctx.lineTo(3, 6); ctx.lineTo(4, 8);
            ctx.fill();

            // Feet
            ctx.fillStyle = '#000';
            let walkOffset = Math.sin(this.walkCycle) * 3;
            ctx.fillRect(-10, 8 + walkOffset, 6, 4);
            ctx.fillRect(4, 8 - walkOffset, 6, 4);

        } else if (this.type === 'nokonoko') {
            // Draw Nokonoko (Koopa)
            if (this.nokonokoState === 'walk') {
                // Turtle walk state
                // Shell
                ctx.fillStyle = '#2ec4b6'; // Green
                ctx.beginPath();
                ctx.arc(0, 2, 10, Math.PI, 0);
                ctx.lineTo(10, 8);
                ctx.lineTo(-10, 8);
                ctx.closePath();
                ctx.fill();

                // Shell lines
                ctx.strokeStyle = '#004b49';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Yellow Body/Head
                ctx.fillStyle = '#ffeb3b';
                ctx.beginPath();
                ctx.arc(8, -8, 6, 0, Math.PI*2); // Head
                ctx.fill();

                // Snout
                ctx.fillRect(8, -8, 4, 6);

                // Eye
                ctx.fillStyle = '#000';
                ctx.fillRect(9, -10, 2, 3);

                // Legs
                ctx.fillStyle = '#ffeb3b';
                let wOffset = Math.sin(this.walkCycle) * 3;
                ctx.fillRect(-7, 8 + wOffset, 4, 6);
                ctx.fillRect(3, 8 - wOffset, 4, 6);

            } else {
                // Shell / Slide state
                ctx.fillStyle = '#2ec4b6'; // Green shell
                ctx.beginPath();
                ctx.arc(0, 0, 11, 0, Math.PI*2);
                ctx.fill();

                // Shell pattern (subtle lines)
                ctx.strokeStyle = '#004b49';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Spin effect if sliding
                if (this.nokonokoState === 'shell_slide') {
                    ctx.rotate(this.walkCycle * 2);
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(0, 0, 8, 0, Math.PI);
                    ctx.stroke();
                }
            }
        }

        ctx.restore();
    }
}

// ==========================================
// 6. ITEMS & PARTICLES ENGINE
// ==========================================
class Item {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'mushroom' (デカキノコ), 'flower' (ファイアフラワー)
        
        this.width = 24;
        this.height = 24;
        this.vx = type === 'mushroom' ? 1.5 : 0;
        this.vy = 0;
        
        this.isSpawned = false; // block emergence phase
        this.spawnY = y - 24;
        this.spawnTimer = 24; // pop up frames
    }

    update() {
        if (!this.isSpawned) {
            this.y--;
            this.spawnTimer--;
            if (this.spawnTimer <= 0) {
                this.isSpawned = true;
            }
            return;
        }

        if (this.type === 'mushroom') {
            // Apply gravity
            this.vy += 0.35;
            if (this.vy > 8) this.vy = 8;

            this.x += this.vx;
            this.resolveCollisions('horizontal');

            this.y += this.vy;
            this.resolveCollisions('vertical');
        }
    }

    resolveCollisions(dir) {
        const startX = Math.floor(this.x / TILE_SIZE);
        const endX = Math.floor((this.x + this.width) / TILE_SIZE);
        const startY = Math.floor(this.y / TILE_SIZE);
        const endY = Math.floor((this.y + this.height) / TILE_SIZE);

        for (let row = startY; row <= endY; row++) {
            for (let col = startX; col <= endX; col++) {
                if (game.isTileSolid(col, row)) {
                    const tileX = col * TILE_SIZE;
                    const tileY = row * TILE_SIZE;

                    if (this.x + this.width > tileX &&
                        this.x < tileX + TILE_SIZE &&
                        this.y + this.height > tileY &&
                        this.y < tileY + TILE_SIZE) {
                        
                        if (dir === 'horizontal') {
                            this.vx = -this.vx;
                            if (this.vx > 0) {
                                this.x = tileX + TILE_SIZE;
                            } else {
                                this.x = tileX - this.width;
                            }
                        } else {
                            if (this.vy > 0) {
                                this.y = tileY - this.height;
                                this.vy = 0;
                            }
                        }
                    }
                }
            }
        }
    }

    draw(ctx) {
        ctx.save();
        if (this.type === 'mushroom') {
            // Red-white spotted mushroom
            // Cap
            ctx.fillStyle = '#ff3333';
            ctx.beginPath();
            ctx.arc(this.x + 12, this.y + 10, 11, Math.PI, 0);
            ctx.closePath();
            ctx.fill();

            // Spots
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x + 12, this.y + 4, 3, 0, Math.PI*2);
            ctx.arc(this.x + 5, this.y + 8, 2.5, 0, Math.PI*2);
            ctx.arc(this.x + 19, this.y + 8, 2.5, 0, Math.PI*2);
            ctx.fill();

            // Stem
            ctx.fillStyle = '#fceade';
            ctx.fillRect(this.x + 7, this.y + 10, 10, 10);
            ctx.fillStyle = '#000';
            ctx.fillRect(this.x + 9, this.y + 12, 1.5, 3);
            ctx.fillRect(this.x + 13, this.y + 12, 1.5, 3);
        } else if (this.type === 'flower') {
            // Fire Flower
            // Stem & Green leaves
            ctx.strokeStyle = '#2dca73';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x + 12, this.y + 12);
            ctx.lineTo(this.x + 12, this.y + 24);
            ctx.stroke();

            // Leaf details
            ctx.fillStyle = '#2dca73';
            ctx.beginPath();
            ctx.arc(this.x + 7, this.y + 18, 3, 0, Math.PI*2);
            ctx.arc(this.x + 17, this.y + 18, 3, 0, Math.PI*2);
            ctx.fill();

            // Flower Head (layered circles: Red, White, Yellow)
            ctx.fillStyle = '#ff3333';
            ctx.beginPath();
            ctx.ellipse(this.x + 12, this.y + 8, 11, 7, 0, 0, Math.PI*2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(this.x + 12, this.y + 8, 8, 5, 0, 0, Math.PI*2);
            ctx.fill();

            ctx.fillStyle = '#ffcc00';
            ctx.beginPath();
            ctx.ellipse(this.x + 12, this.y + 8, 5, 3, 0, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.restore();
    }
}

class Fireball {
    constructor(x, y, vx) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = 2;
        this.width = 12;
        this.height = 12;
        this.life = 120; // disappears after 2 seconds
    }

    update() {
        this.life--;
        this.vy += 0.4; // gravity

        this.x += this.vx;
        this.resolveCollisions('horizontal');

        this.y += this.vy;
        this.resolveCollisions('vertical');

        if (this.y > 480) this.life = 0;
    }

    resolveCollisions(dir) {
        const startX = Math.floor(this.x / TILE_SIZE);
        const endX = Math.floor((this.x + this.width) / TILE_SIZE);
        const startY = Math.floor(this.y / TILE_SIZE);
        const endY = Math.floor((this.y + this.height) / TILE_SIZE);

        for (let row = startY; row <= endY; row++) {
            for (let col = startX; col <= endX; col++) {
                if (game.isTileSolid(col, row)) {
                    const tileX = col * TILE_SIZE;
                    const tileY = row * TILE_SIZE;

                    if (this.x + this.width > tileX &&
                        this.x < tileX + TILE_SIZE &&
                        this.y + this.height > tileY &&
                        this.y < tileY + TILE_SIZE) {
                        
                        if (dir === 'horizontal') {
                            this.life = 0; // explode on wall
                            game.spawnExplosion(this.x, this.y);
                        } else {
                            if (this.vy > 0) {
                                // bounce up!
                                this.y = tileY - this.height;
                                this.vy = -4.5;
                            } else {
                                this.life = 0; // explode on ceiling
                                game.spawnExplosion(this.x, this.y);
                            }
                        }
                    }
                }
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#ff5722'; // Fire red-orange
        ctx.beginPath();
        ctx.arc(this.x + 6, this.y + 6, 6, 0, Math.PI*2);
        ctx.fill();

        // Inner glowing yellow
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(this.x + 6, this.y + 6, 3, 0, Math.PI*2);
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, vx, vy, color, life, size) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.maxLife = life;
        this.life = life;
        this.size = size;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.25; // mild gravity
        this.life--;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1.0;
    }
}

// Bouncing Coin animation when hitting block
class BouncingCoin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vy = -7.5;
        this.life = 30; // 30 frames animation
    }

    update() {
        this.y += this.vy;
        this.vy += 0.5; // gravity pulling coin down
        this.life--;
    }

    draw(ctx) {
        ctx.fillStyle = '#ffd700'; // Gold coin
        ctx.beginPath();
        ctx.ellipse(this.x + 16, this.y + 16, 6, 12, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = '#daa520';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

// ==========================================
// 7. CORE GAME SYSTEM / CONTROLLER
// ==========================================
class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.player = new Player();
        this.levelIndex = 0;
        this.grid = []; // level grid array of strings
        
        this.enemies = [];
        this.items = [];
        this.fireballs = [];
        this.particles = [];
        this.bouncingCoins = [];
        
        this.score = 0;
        this.coins = 0;
        this.lives = 3;
        this.time = 400;
        this.timeTimer = 0;

        this.cameraX = 0;
        this.levelWidth = 0;

        this.isPaused = false;
        this.gameState = 'start'; // 'start', 'play', 'gameover', 'victory'
        
        this.screenShake = 0;

        // Block bounces storage {col, row, yOffset, timer}
        this.bouncingBlocks = [];

        // Dynamic cloud/bush parallax backgrounds
        this.clouds = [];
        this.initParallaxAssets();
    }

    initParallaxAssets() {
        for (let i = 0; i < 15; i++) {
            this.clouds.push({
                x: Math.random() * 2000,
                y: Math.random() * 150 + 20,
                speed: Math.random() * 0.2 + 0.1,
                size: Math.random() * 40 + 30
            });
        }
    }

    loadLevel(index) {
        this.levelIndex = index;
        const rawMap = LEVELS[this.levelIndex];
        this.grid = rawMap.map(row => row.split(''));
        this.levelWidth = this.grid[0].length * TILE_SIZE;
        
        // Reset lists
        this.enemies = [];
        this.items = [];
        this.fireballs = [];
        this.particles = [];
        this.bouncingCoins = [];
        this.bouncingBlocks = [];
        
        this.player.reset();
        this.cameraX = 0;
        this.time = 400;
        this.timeTimer = 0;

        // Scan map layout to spawn enemies at preset points
        // Enemies are spawned at appropriate ground coordinates to avoid manual mapping
        for (let col = 0; col < this.grid[0].length; col++) {
            // Spawn some enemies dynamically based on distance intervals to fill the stage
            if (col > 15 && col % 18 === 0 && col < this.grid[0].length - 15) {
                // Ensure there is solid floor below
                let groundY = -1;
                for (let r = 0; r < LEVEL_HEIGHT; r++) {
                    if (this.isTileSolid(col, r)) {
                        groundY = r;
                        break;
                    }
                }
                if (groundY > 2 && !this.isTileSolid(col, groundY - 1)) {
                    // Spawn kuribo or nokonoko alternately
                    const type = (col % 36 === 0) ? 'nokonoko' : 'kuribo';
                    this.enemies.push(new Enemy(col * TILE_SIZE, (groundY - 1) * TILE_SIZE + 4, type));
                }
            }
        }

        this.updateHUD();
    }

    isTileSolid(col, row) {
        if (col < 0 || col >= this.grid[0].length || row < 0 || row >= LEVEL_HEIGHT) {
            return false;
        }
        const char = this.grid[row][col];
        return ['#', 'G', 'B', 'S', '?', 'M', 'F', 'p', 'P', 'u', 'U', '[', 'x'].includes(char);
    }

    start() {
        setupInput();
        this.loadLevel(0);
        this.gameState = 'start';
        this.setupMenuHandlers();
        
        // Game Loop parameters
        let lastTime = 0;
        const tickRate = 1000 / 60; // Fixed 60fps update
        let accumulator = 0;

        const loop = (timestamp) => {
            if (!lastTime) lastTime = timestamp;
            let dt = timestamp - lastTime;
            lastTime = timestamp;

            // Cap dt to prevent massive jumps during tab freezes
            if (dt > 250) dt = 250;

            accumulator += dt;

            while (accumulator >= tickRate) {
                this.update();
                accumulator -= tickRate;
            }

            this.render();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    update() {
        if (this.isPaused || this.gameState !== 'play') return;

        // Screen shake dampening
        if (this.screenShake > 0) {
            this.screenShake *= 0.9;
            if (this.screenShake < 0.5) this.screenShake = 0;
        }

        // Timer ticking
        this.timeTimer++;
        if (this.timeTimer >= 60) {
            this.timeTimer = 0;
            this.time--;
            this.updateHUD();
            
            if (this.time <= 0) {
                this.player.die();
            }
        }

        this.player.update();

        // Update camera position to follow player smoothly
        const targetCamX = this.player.x - 300;
        this.cameraX += (targetCamX - this.cameraX) * 0.1;
        // Keep camera bounds
        if (this.cameraX < 0) this.cameraX = 0;
        if (this.cameraX > this.levelWidth - 800) this.cameraX = this.levelWidth - 800;

        // Update block bounces
        this.bouncingBlocks.forEach((block, idx) => {
            block.timer--;
            // Sinusoidal bounce offset
            block.yOffset = Math.sin((block.timer / 15) * Math.PI) * -8;
            if (block.timer <= 0) {
                this.bouncingBlocks.splice(idx, 1);
            }
        });

        // Update Enemies
        this.enemies.forEach((enemy, idx) => {
            enemy.update();

            // Collision with player
            if (!enemy.isDead && !this.player.isDead) {
                if (this.player.x + this.player.width > enemy.x &&
                    this.player.x < enemy.x + enemy.width &&
                    this.player.y + this.player.height > enemy.y &&
                    this.player.y < enemy.y + enemy.height) {
                    
                    // Stomp check: player is falling and is above enemy's head
                    if (this.player.vy > 0.5 && this.player.y + this.player.height - this.player.vy <= enemy.y + 12) {
                        enemy.stomp();
                        this.player.vy = -6.5; // bounce player
                        this.player.y = enemy.y - this.player.height;
                        this.score += 200;
                        this.updateHUD();
                        this.spawnTextParticle(enemy.x + 8, enemy.y - 10, "200");
                    } else {
                        // Kick / Slide check for shells
                        if (enemy.type === 'nokonoko' && enemy.nokonokoState === 'shell') {
                            const dir = this.player.x < enemy.x ? 1 : -1;
                            enemy.kick(dir);
                            // offset player slightly
                            this.player.x += dir * 4;
                        } else if (enemy.nokonokoState === 'shell_slide') {
                            // Sliding shell hurts player
                            this.player.damage();
                        } else {
                            // Standard damage
                            this.player.damage();
                        }
                    }
                }
            }

            // Shell slides hitting other enemies
            if (enemy.type === 'nokonoko' && enemy.nokonokoState === 'shell_slide') {
                this.enemies.forEach((other) => {
                    if (other !== enemy && !other.isDead) {
                        if (enemy.x + enemy.width > other.x &&
                            enemy.x < other.x + other.width &&
                            enemy.y + enemy.height > other.y &&
                            enemy.y < other.y + other.height) {
                            
                            other.dieFly();
                            this.score += 500;
                            this.updateHUD();
                            this.spawnTextParticle(other.x + 8, other.y - 10, "500");
                        }
                    }
                });
            }

            // Remove dead enemies offscreen
            if (enemy.isDead && enemy.deadTimer <= 0) {
                this.enemies.splice(idx, 1);
            }
        });

        // Update items
        this.items.forEach((item, idx) => {
            item.update();
            
            // Collect item check
            if (this.player.x + this.player.width > item.x &&
                this.player.x < item.x + item.width &&
                this.player.y + this.player.height > item.y &&
                this.player.y < item.y + item.height) {
                
                if (item.type === 'mushroom') {
                    this.player.changeState(Math.max(1, this.player.state));
                    this.score += 1000;
                    this.spawnTextParticle(item.x + 4, item.y - 10, "1000");
                } else if (item.type === 'flower') {
                    this.player.changeState(2);
                    this.score += 1000;
                    this.spawnTextParticle(item.x + 4, item.y - 10, "1000");
                }
                
                this.items.splice(idx, 1);
                this.updateHUD();
            }
        });

        // Update fireballs
        this.fireballs.forEach((fb, idx) => {
            fb.update();

            // Check hit enemies
            this.enemies.forEach((enemy) => {
                if (!enemy.isDead && fb.x + fb.width > enemy.x &&
                    fb.x < enemy.x + enemy.width &&
                    fb.y + fb.height > enemy.y &&
                    fb.y < enemy.y + enemy.height) {
                    
                    enemy.dieFly();
                    fb.life = 0; // destroy fireball
                    this.score += 200;
                    this.updateHUD();
                    this.spawnTextParticle(enemy.x + 8, enemy.y - 10, "200");
                }
            });

            if (fb.life <= 0) {
                this.fireballs.splice(idx, 1);
            }
        });

        // Update particles
        this.particles.forEach((p, idx) => {
            p.update();
            if (p.life <= 0) {
                this.particles.splice(idx, 1);
            }
        });

        // Update bouncing coins
        this.bouncingCoins.forEach((bc, idx) => {
            bc.update();
            if (bc.life <= 0) {
                this.bouncingCoins.splice(idx, 1);
            }
        });

        // Flagpole Check (Goal)
        const checkFlagCol = Math.floor((this.player.x + this.player.width/2) / TILE_SIZE);
        const checkFlagRow = Math.floor((this.player.y + this.player.height/2) / TILE_SIZE);
        if (checkFlagCol >= 0 && checkFlagCol < this.grid[0].length && checkFlagRow >= 0 && checkFlagRow < LEVEL_HEIGHT) {
            const char = this.grid[checkFlagRow][checkFlagCol];
            if (char === '|' || char === ']' || char === '[') {
                this.handleLevelComplete();
            }
        }
    }

    handleBlockHit(col, row) {
        const char = this.grid[row][col];
        
        if (char === '?') {
            // Hit question block -> give coin
            this.grid[row][col] = 'S'; // Turn to solid metal
            this.bouncingCoins.push(new BouncingCoin(col * TILE_SIZE, row * TILE_SIZE));
            this.bouncingBlocks.push({ col, row, yOffset: 0, timer: 15 });
            
            this.coins++;
            this.score += 200;
            sound.playCoin();
            this.updateHUD();
            this.spawnExplosion(col * TILE_SIZE + 16, row * TILE_SIZE + 16, '#ffd700');
        } else if (char === 'M') {
            // Hit question block -> give Mushroom or Fire Flower depending on player size
            this.grid[row][col] = 'S';
            this.bouncingBlocks.push({ col, row, yOffset: 0, timer: 15 });
            sound.playCoin();

            const itemType = this.player.state > 0 ? 'flower' : 'mushroom';
            this.items.push(new Item(col * TILE_SIZE, row * TILE_SIZE, itemType));
            this.spawnExplosion(col * TILE_SIZE + 16, row * TILE_SIZE + 16, '#ff4757');
        } else if (char === 'B') {
            // Brick Block
            if (this.player.state > 0) {
                // Break block
                this.grid[row][col] = '.'; // Empty
                sound.playStomp();
                this.shakeScreen(6);
                
                // Spawn brick chunks
                const bx = col * TILE_SIZE;
                const by = row * TILE_SIZE;
                this.particles.push(new Particle(bx, by, -2, -6, '#8b4513', 40, 8));
                this.particles.push(new Particle(bx + 16, by, 2, -6, '#8b4513', 40, 8));
                this.particles.push(new Particle(bx, by + 16, -1.5, -4, '#8b4513', 40, 8));
                this.particles.push(new Particle(bx + 16, by + 16, 1.5, -4, '#8b4513', 40, 8));
            } else {
                // Bounces up but doesn't break
                this.bouncingBlocks.push({ col, row, yOffset: 0, timer: 15 });
                sound.playTone(150, 'sawtooth', 0.1, 0.2, 0.01); // dull thud
            }
        } else if (char === 'x') {
            // Instantly hurts player if hitting spike block from underneath or side
            this.player.damage();
        }
    }

    spawnFireball(x, y, vx) {
        this.fireballs.push(new Fireball(x, y, vx));
    }

    spawnExplosion(x, y, color = '#ffeb3b') {
        for (let i = 0; i < 8; i++) {
            const vx = (Math.random() - 0.5) * 5;
            const vy = (Math.random() - 0.5) * 5;
            this.particles.push(new Particle(x, y, vx, vy, color, 25, 4));
        }
    }

    spawnTextParticle(x, y, text) {
        // We will draw simple flying text points
        const textObj = {
            x: x,
            y: y,
            vx: 0,
            vy: -1.5,
            life: 45,
            draw(ctx, camX) {
                ctx.save();
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 10px "Press Start 2P"';
                ctx.shadowColor = '#000';
                ctx.shadowBlur = 4;
                ctx.fillText(text, this.x - camX, this.y);
                ctx.restore();
            },
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.life--;
            }
        };
        this.particles.push(textObj);
    }

    shakeScreen(intensity) {
        this.screenShake = intensity;
    }

    handlePlayerDeath() {
        this.lives--;
        this.updateHUD();
        if (this.lives > 0) {
            // Show Miss Overlay for 2 seconds and pause the game, then reload
            const missLives = document.getElementById('miss-lives');
            if (missLives) {
                missLives.innerText = `のこり数: ❤️ x${this.lives}`;
            }
            this.showOverlay('miss-screen');
            this.gameState = 'miss';
            sound.stopBgm();
            
            setTimeout(() => {
                this.loadLevel(this.levelIndex);
                this.hideOverlays();
                this.gameState = 'play';
                sound.startBgm();
            }, 2000);
        } else {
            // Fill gameover results safely (preventing TypeErrors if cached html is used)
            const levelEl = document.getElementById('gameover-level');
            const scoreEl = document.getElementById('gameover-score');
            const coinsEl = document.getElementById('gameover-coins');
            
            if (levelEl) levelEl.innerText = this.levelIndex + 1;
            if (scoreEl) scoreEl.innerText = this.score;
            if (coinsEl) coinsEl.innerText = this.coins;

            this.showOverlay('gameover-screen');
            this.gameState = 'gameover';
            sound.stopBgm();
        }
    }

    handleLevelComplete() {
        this.gameState = 'victory';
        sound.playVictory();
        this.shakeScreen(15);
        
        const timeBonus = this.time * 10;
        this.score += timeBonus;
        
        document.getElementById('time-bonus').innerText = timeBonus;
        document.getElementById('final-score').innerText = this.score;
        this.showOverlay('victory-screen');
    }

    updateHUD() {
        document.getElementById('hud-score').innerText = String(this.score).padStart(6, '0');
        document.getElementById('hud-coins').innerText = `🪙 x${String(this.coins).padStart(2, '0')}`;
        document.getElementById('hud-time').innerText = String(Math.max(0, this.time)).padStart(3, '0');
        document.getElementById('hud-lives').innerText = `❤️ x${this.lives}`;
    }

    showOverlay(id) {
        document.querySelectorAll('.overlay').forEach(el => el.classList.remove('active'));
        const overlay = document.getElementById(id);
        if (overlay) overlay.classList.add('active');
    }

    hideOverlays() {
        document.querySelectorAll('.overlay').forEach(el => el.classList.remove('active'));
    }

    togglePause() {
        if (this.gameState !== 'play') return;
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.showOverlay('pause-screen');
            sound.stopBgm();
        } else {
            this.hideOverlays();
            sound.startBgm();
        }
    }

    setupMenuHandlers() {
        // Start Button
        document.getElementById('start-btn').addEventListener('click', () => {
            this.lives = 3;
            this.score = 0;
            this.coins = 0;
            this.loadLevel(0);
            this.hideOverlays();
            this.gameState = 'play';
            sound.startBgm();
        });

        // Restart button (on Game Over)
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.lives = 3;
            this.score = 0;
            this.coins = 0;
            this.loadLevel(0);
            this.hideOverlays();
            this.gameState = 'play';
            sound.startBgm();
        });

        // Quit Button (on Game Over)
        document.getElementById('quit-btn').addEventListener('click', () => {
            this.hideOverlays();
            this.showOverlay('start-screen');
            this.gameState = 'start';
            sound.stopBgm();
        });

        // Next Level / Play Again button (on Victory)
        document.getElementById('next-level-btn').addEventListener('click', () => {
            const nextLevel = (this.levelIndex + 1) % LEVELS.length;
            this.loadLevel(nextLevel);
            this.hideOverlays();
            this.gameState = 'play';
            sound.startBgm();
        });

        // Resume Button
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.togglePause();
        });

        // Mute Toggle Button
        const muteBtn = document.getElementById('mute-btn');
        muteBtn.addEventListener('click', () => {
            sound.muted = !sound.muted;
            sound.setMute(sound.muted);
            if (sound.muted) {
                muteBtn.innerText = '🔇 音楽: オフ';
                sound.stopBgm();
            } else {
                muteBtn.innerText = '🔊 音楽: オン';
                if (this.gameState === 'play' && !this.isPaused) {
                    sound.startBgm();
                }
            }
        });

        // Extra UI Pause Button
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });

        // Fullscreen Toggle Button
        const fsBtn = document.getElementById('fullscreen-btn');
        if (fsBtn) {
            fsBtn.addEventListener('click', () => {
                const wrapper = document.getElementById('game-wrapper');
                if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                    if (wrapper.requestFullscreen) {
                        wrapper.requestFullscreen();
                    } else if (wrapper.webkitRequestFullscreen) {
                        wrapper.webkitRequestFullscreen();
                    }
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                }
            });
        }
    }

    // ==========================================
    // 8. GRAPHICS RENDERING (CANVAS ART)
    // ==========================================
    render() {
        this.ctx.save();
        
        // Apply camera shake if active
        if (this.screenShake > 0) {
            const dx = (Math.random() - 0.5) * this.screenShake;
            const dy = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(dx, dy);
        }

        // Draw sky background
        this.drawBackground();

        // Draw Game Objects (Shifted by camera offset)
        this.ctx.save();
        this.ctx.translate(-Math.floor(this.cameraX), 0);
        
        this.drawLevelGrid();
        this.items.forEach(item => item.draw(this.ctx));
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.fireballs.forEach(fb => fb.draw(this.ctx));
        this.particles.forEach(p => p.draw(this.ctx));
        this.bouncingCoins.forEach(bc => bc.draw(this.ctx));
        
        this.ctx.restore();

        // Draw player (rendered in its own coordinate space offset by cameraX)
        this.ctx.save();
        this.ctx.translate(-Math.floor(this.cameraX), 0);
        this.player.draw(this.ctx);
        this.ctx.restore();

        this.ctx.restore();
    }

    drawBackground() {
        // Sky Gradient
        const skyGrad = this.ctx.createLinearGradient(0, 0, 0, 480);
        skyGrad.addColorStop(0, '#5c94fc'); // bright blue
        skyGrad.addColorStop(0.7, '#b8fcff'); // light turquoise
        skyGrad.addColorStop(1, '#ffc6ff'); // soft peach sunrise look
        this.ctx.fillStyle = skyGrad;
        this.ctx.fillRect(0, 0, 800, 480);

        // Draw Parallax clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        this.clouds.forEach(cloud => {
            // Draw a puffy cloud shape
            const cx = (cloud.x - this.cameraX * cloud.speed) % 1200;
            const cy = cloud.y;
            const cs = cloud.size;

            this.ctx.beginPath();
            this.ctx.arc(cx, cy, cs * 0.4, 0, Math.PI * 2);
            this.ctx.arc(cx + cs * 0.3, cy - cs * 0.1, cs * 0.4, 0, Math.PI * 2);
            this.ctx.arc(cx + cs * 0.6, cy, cs * 0.3, 0, Math.PI * 2);
            this.ctx.arc(cx + cs * 0.3, cy + cs * 0.1, cs * 0.35, 0, Math.PI * 2);
            this.ctx.closePath();
            this.ctx.fill();
        });

        // Parallax far mountains
        this.ctx.fillStyle = '#94bdfa'; // faint mountains
        this.ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const mx = (i * 400 - this.cameraX * 0.25) % 1600;
            this.ctx.moveTo(mx, 480);
            this.ctx.lineTo(mx + 200, 300);
            this.ctx.lineTo(mx + 400, 480);
        }
        this.ctx.fill();
    }

    drawLevelGrid() {
        const startX = Math.floor(this.cameraX / TILE_SIZE);
        const endX = startX + Math.ceil(800 / TILE_SIZE) + 1;

        for (let row = 0; row < LEVEL_HEIGHT; row++) {
            for (let col = startX; col <= endX; col++) {
                if (col >= 0 && col < this.grid[0].length) {
                    const char = this.grid[row][col];
                    if (char !== '.' && char !== ' ') {
                        // Apply block bounce offset if matching coordinate
                        const bouncingBlock = this.bouncingBlocks.find(b => b.col === col && b.row === row);
                        const blockYOffset = bouncingBlock ? bouncingBlock.yOffset : 0;
                        
                        this.drawTile(char, col * TILE_SIZE, row * TILE_SIZE + blockYOffset);
                    }
                }
            }
        }
    }

    drawTile(char, x, y) {
        this.ctx.save();

        switch (char) {
            case '#': // Ground fill
                this.ctx.fillStyle = '#8b5a2b'; // Darker dirt brown
                this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                // Soil patterns
                this.ctx.fillStyle = '#73411a';
                this.ctx.fillRect(x + 2, y + 2, 6, 6);
                this.ctx.fillRect(x + 18, y + 10, 8, 4);
                this.ctx.fillRect(x + 8, y + 22, 10, 5);
                break;
                
            case 'G': // Grass top block
                // Soil base
                this.ctx.fillStyle = '#8b5a2b';
                this.ctx.fillRect(x, y + 6, TILE_SIZE, TILE_SIZE - 6);
                this.ctx.fillStyle = '#73411a';
                this.ctx.fillRect(x + 6, y + 12, 6, 6);
                this.ctx.fillRect(x + 18, y + 20, 8, 4);
                
                // Grass top caps
                this.ctx.fillStyle = '#2eb82e'; // Vibrant green
                this.ctx.fillRect(x, y, TILE_SIZE, 8);
                // Dangling grass spikes
                this.ctx.beginPath();
                this.ctx.moveTo(x, y + 8);
                this.ctx.lineTo(x + 8, y + 14);
                this.ctx.lineTo(x + 16, y + 8);
                this.ctx.lineTo(x + 24, y + 14);
                this.ctx.lineTo(x + 32, y + 8);
                this.ctx.fill();
                break;

            case 'B': // Breakable Brick
                this.ctx.fillStyle = '#b85c38'; // red brick
                this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                // Brick mortar lines
                this.ctx.strokeStyle = '#632b15';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
                
                // Horizontal divider
                this.ctx.beginPath();
                this.ctx.moveTo(x, y + 16);
                this.ctx.lineTo(x + TILE_SIZE, y + 16);
                // Vertical dividers
                this.ctx.moveTo(x + 16, y);
                this.ctx.lineTo(x + 16, y + 16);
                this.ctx.moveTo(x + 8, y + 16);
                this.ctx.lineTo(x + 8, y + TILE_SIZE);
                this.ctx.moveTo(x + 24, y + 16);
                this.ctx.lineTo(x + 24, y + TILE_SIZE);
                this.ctx.stroke();
                break;

            case '?': // Question Block (Active)
            case 'M':
            case 'F':
                // Pulsing yellow
                const pulse = Math.floor(Date.now() / 250) % 2 === 0;
                this.ctx.fillStyle = pulse ? '#ffcc00' : '#ffa500';
                this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                this.ctx.strokeStyle = '#cc6600';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
                
                // Question mark text
                this.ctx.fillStyle = '#cc6600';
                this.ctx.font = 'bold 20px "Press Start 2P", Courier, sans-serif';
                this.ctx.fillText('?', x + 8, y + 25);
                break;

            case 'S': // Empty hit block / Solid block
                this.ctx.fillStyle = '#7a7a7a'; // Grey metallic
                this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                this.ctx.strokeStyle = '#4a4a4a';
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
                // Rivet corner dots
                this.ctx.fillStyle = '#4a4a4a';
                this.ctx.fillRect(x + 3, y + 3, 3, 3);
                this.ctx.fillRect(x + TILE_SIZE - 6, y + 3, 3, 3);
                this.ctx.fillRect(x + 3, y + TILE_SIZE - 6, 3, 3);
                this.ctx.fillRect(x + TILE_SIZE - 6, y + TILE_SIZE - 6, 3, 3);
                break;

            case 'p': // Pipe top left
                this.ctx.fillStyle = '#00cc44';
                this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                this.ctx.strokeStyle = '#006622';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(x + TILE_SIZE, y);
                this.ctx.lineTo(x, y);
                this.ctx.lineTo(x, y + TILE_SIZE);
                this.ctx.stroke();
                break;

            case 'P': // Pipe top right
                this.ctx.fillStyle = '#00cc44';
                this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                this.ctx.strokeStyle = '#006622';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x + TILE_SIZE, y);
                this.ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE);
                this.ctx.stroke();
                break;

            case 'u': // Pipe shaft left
                this.ctx.fillStyle = '#00b33c';
                this.ctx.fillRect(x + 4, y, TILE_SIZE - 4, TILE_SIZE);
                this.ctx.strokeStyle = '#006622';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(x + 4, y);
                this.ctx.lineTo(x + 4, y + TILE_SIZE);
                this.ctx.stroke();
                break;

            case 'U': // Pipe shaft right
                this.ctx.fillStyle = '#00b33c';
                this.ctx.fillRect(x, y, TILE_SIZE - 4, TILE_SIZE);
                this.ctx.strokeStyle = '#006622';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(x + TILE_SIZE - 4, y);
                this.ctx.lineTo(x + TILE_SIZE - 4, y + TILE_SIZE);
                this.ctx.stroke();
                break;

            case 'x': // Spikes (hazard)
                // Draw multiple red/grey sharp triangles
                this.ctx.fillStyle = '#7a7a7a';
                this.ctx.strokeStyle = '#ff3333';
                this.ctx.lineWidth = 1.5;
                for (let i = 0; i < 4; i++) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + i * 8, y + TILE_SIZE);
                    this.ctx.lineTo(x + i * 8 + 4, y + 8);
                    this.ctx.lineTo(x + i * 8 + 8, y + TILE_SIZE);
                    this.ctx.fill();
                    this.ctx.stroke();
                }
                break;

            case '|': // Flagpole shaft
                this.ctx.fillStyle = '#c0c0c0'; // Silver
                this.ctx.fillRect(x + 13, y, 6, TILE_SIZE);
                this.ctx.strokeStyle = '#606060';
                this.ctx.strokeRect(x + 13, y, 6, TILE_SIZE);
                break;

            case '[': // Flagpole base
                this.ctx.fillStyle = '#34495e'; // Heavy block
                this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                this.ctx.strokeStyle = '#2c3e50';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
                break;

            case ']': // Flagpole top and flag
                // Draw shaft top green ball
                this.ctx.fillStyle = '#ffd700'; // Gold ball
                this.ctx.beginPath();
                this.ctx.arc(x + 16, y + 6, 6, 0, Math.PI*2);
                this.ctx.fill();

                // Draw flagpole shaft line
                this.ctx.fillStyle = '#c0c0c0';
                this.ctx.fillRect(x + 13, y + 12, 6, TILE_SIZE - 12);

                // Draw waving flag (white/neon-pink retro grid flag!)
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.moveTo(x + 13, y + 15);
                this.ctx.lineTo(x - 18, y + 25);
                this.ctx.lineTo(x + 13, y + 35);
                this.ctx.closePath();
                this.ctx.fill();
                
                // Red skull logo or crest on flag
                this.ctx.fillStyle = '#ff007f';
                this.ctx.font = 'bold 8px Courier';
                this.ctx.fillText('★', x - 7, y + 28);
                break;
        }

        this.ctx.restore();
    }
}

// Global engine init
const game = new GameEngine();

window.addEventListener('DOMContentLoaded', () => {
    game.start();
});
