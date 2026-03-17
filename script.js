/* --- YOUR EXISTING STATE & ROOM DATA (UNCHANGED) --- */
const state = { 
    room: "landing", 
    inventory: [], 
    hasRemote: false, 
    finalPhase: false 
};

const roomData = {
    temple: {
        title: "The Temple",
        img: "assets/background/temple.jpeg",
        hotspots: [
            { x: 18, y: 35, w: 10, h: 25, action: () => changeRoom("telescope") },
            { x: 30, y: 35, w: 10, h: 20, action: () => changeRoom("hacker") },
            { x: 55, y: 35, w: 10, h: 20, action: () => changeRoom("doom") },
            { x: 44, y: 25, w: 12, h: 35, action: () => handleMainDoll() },
            { x: 40, y: 72, w: 20, h: 12, action: () => handleWaterKey() } 
        ]
    },
    telescope: {
        title: "The Sanctum",
        img: "assets/background/sanctum.jpeg",
        hotspots: [
            { x: 22, y: 15, w: 22, h: 30, action: () => handleTelescopeHint() },
            { x: 52, y: 55, w: 30, h: 20, action: () => handleBook() },
            { x: 74, y: 25, w: 10, h: 15, action: () => handleSphere() }
        ]
    },
    doom: {
        title: "The Laboratory",
        img: "assets/background/Doom background.png",
        hotspots: [
            { x: 45, y: 30, w: 30, h: 25, action: () => handleTV() },
            { x: 15, y: 65, w: 40, h: 20, action: () => handleMixing() }
        ]
    },
    hacker: {
        title: "The Vault",
        img: "assets/background/vault.jpeg",
        hotspots: [
            { x: 45, y: 70, w: 15, h: 10, action: () => pickUpRemote() },
            { x: 38, y: 20, w: 25, h: 35, action: () => handleSafe() }
        ]
    }
};

/* --- CORE ENGINE FUNCTIONS (UNCHANGED) --- */
function startGame() {
    document.getElementById("landing-page").style.display = "none";
    document.getElementById("game-container").style.display = "block";
    changeRoom("temple");
}

function changeRoom(roomKey) {
    state.room = roomKey;
    const room = roomData[roomKey];
    document.getElementById("room-title").innerText = room.title;
    document.getElementById("visual-area").style.backgroundImage = `url('${room.img}')`;
    document.getElementById("return-btn").style.display = roomKey === "temple" ? "none" : "block";
    
    const container = document.getElementById("hotspot-container");
    container.innerHTML = "";
    room.hotspots.forEach(hs => {
        const div = document.createElement("div");
        div.className = "hotspot";
        div.style.left = hs.x + "%"; div.style.top = hs.y + "%";
        div.style.width = hs.w + "%"; div.style.height = hs.h + "%";
        div.onclick = hs.action;
        container.appendChild(div);
    });
}

function showZoom(title, img, text, showMix = false) {
    document.getElementById("popup-title").innerText = title;
    const imgElement = document.getElementById("popup-image");
    const frame = document.querySelector(".square-frame");
    const pText = document.getElementById("popup-text");

    if(img){
        imgElement.src = img;
        frame.style.display = "block";
    } else {
        frame.style.display = "none";
    }

    pText.innerText = text; 
    pText.className = text.includes("OBTAINED") ? "big-success-text" : "";
    document.getElementById("mix-btn").style.display = showMix ? "inline-block" : "none";
    document.getElementById("popup-overlay").style.display = "flex";
    setTimeout(() => document.querySelector(".popup-content").classList.add("active"), 10);
    if (showMix) document.getElementById("mix-btn").onclick = startSuccessSequence;
}

function closePopup() {
    document.querySelector(".popup-content").classList.remove("active");
    setTimeout(() => document.getElementById("popup-overlay").style.display = "none", 400);
}

/* --- GAMEPLAY LOGIC (UNCHANGED) --- */
function startSuccessSequence() {
    closePopup();
    setTimeout(() => {
        if (!state.inventory.includes("Crystal 1")) { 
            animateCrystal();
            state.inventory.push("Crystal 1"); updateUI(); 
            showZoom("SUCCESS", null, "CRYSTAL ONE OBTAINED");
        }
    }, 400);
}

function handleSphere() {
    if (!state.inventory.includes("Crystal 2")) {
        animateCrystal();
        state.inventory.push("Crystal 2"); updateUI();
        showZoom("SPHERE", null, "CRYSTAL TWO OBTAINED");
    } else { showZoom("Sphere", "assets/zooms/sphere.jpeg", "It's empty."); }
}

function handleSafe() {
    const code = prompt("Enter 3-digit Code:");
    if (code === "321") {
        if (!state.inventory.includes("Crystal 3")) { 
            animateCrystal(); 
            state.inventory.push("Crystal 3"); updateUI(); 
            showZoom("VAULT", null, "CRYSTAL THREE OBTAINED");
        }
    }
}

function handleMainDoll() {
    const count = state.inventory.filter(i => i.includes("Crystal")).length;
    if (count >= 3) {
        showZoom("The Guardian", "assets/zooms/doll zoomed.png", "The three are home... now speak the name of the life-giver.");
        setTimeout(() => {
            let ans = prompt("What is the life-giver?");
            if (ans && ans.toLowerCase().trim() === "water") {
                showZoom("Guardian Awakened", "assets/zooms/doll_glow.png", "CORRECT. The way is revealed in the ripples.");
                state.finalPhase = true; 
                log("The Guardian has accepted the word.");
            }
        }, 1000);
    } else {
        showZoom("Guardian", "assets/zooms/doll zoomed.png", "Find all 3 crystals first.");
    }
}

function handleWaterKey() {
    if (state.finalPhase) {
        document.getElementById("game-container").style.display = "none";
        const codeSpace = document.getElementById("code-space");
        codeSpace.style.display="flex";
        document.body.style.background = "#0d1117";
        log("Terminal Decryption Initialized. O(log n) Required.");
    } else {
        log("The water ripples peacefully, but nothing happens.");
    }
}

/* --- UPDATED: CODE JUDGING & TERMINAL LOGIC --- */

function validateCode() {
    const editor = document.getElementById('editor');
    const terminal = document.getElementById('terminal');
    const code = editor.value; // Keep original for regex
    
    // 1. Terminal Reset
    terminal.innerHTML = "<div style='color: #fff;'>$ system: detecting language and complexity...</div>";

    setTimeout(() => {
        // 2. THE MULTI-LANGUAGE CHECK
        // This regex looks for halving the exponent (n/2, n>>1) 
        // and squaring the base (x*x), which is the core of O(log n)
        const hasHalving = /n\s*\/\s*2|n\s*\/=\s*2|n\s*>>\s*1|n\s*>>=\s*1|n\s*>>>\s*1/.test(code);
        const hasSquaring = /x\s*\*\s*x|x\s*\*=\s*x|Math\.pow\(x,\s*2\)/.test(code);
        
        // Check for basic structure
        const hasLogic = code.includes("return") || code.includes("System.out.print") || code.includes("cout");

        terminal.innerHTML = ""; // Clear for final result

        if (!hasLogic) {
            terminal.innerHTML += "<div style='color: #ff5060;'>[ERROR] Compilation failed: Entry point or return not found.</div>";
            showModal('m-wrong');
        } 
        else if (hasHalving || (hasHalving && hasSquaring)) {
            // SUCCESS: 15 POINTS
            terminal.innerHTML += "<div style='color: #36d479;'>[SUCCESS] Complexity verified: O(log n).</div>";
            terminal.innerHTML += "<div style='color: #36d479;'>[RESULT] All language test cases passed. Marks: 15/15</div>";
            
            // Update score badge
            const badge = document.getElementById('score-badge');
            if(badge) badge.innerText = "15 / 15 pts";
            
            showModal('m-ok');
        } 
        else {
            // PARTIAL: 3 POINTS (Simple Loop detected)
            terminal.innerHTML += "<div style='color: #f0a030;'>[WARNING] Correct logic, but efficiency is O(n).</div>";
            terminal.innerHTML += "<div style='color: #f0a030;'>[RESULT] Marks awarded: 3/15</div>";
            
            const partialBody = document.querySelector('#m-partial .mb');
            if(partialBody) {
                partialBody.innerText = "If you want to continue it's ok, you will get three points because you didn't meet the conditions... or else keep trying.";
            }

            const badge = document.getElementById('score-badge');
            if(badge) badge.innerText = "3 / 15 pts";
            
            showModal('m-partial');
        }
    }, 1000);
}

/* --- HELPERS (UNCHANGED) --- */
function updateUI() {
    const list = document.getElementById("inventory-list");
    list.innerHTML = state.inventory.map(item => `<div class="inventory-item">${item}</div>`).join("");
}

function animateCrystal() {
    const img = document.createElement("img");
    img.src = "assets/zooms/crystal.png";
    img.className = "crystal-morph-element";
    document.body.appendChild(img);
    setTimeout(() => img.remove(), 1600);
}

function log(msg) {
    const lb = document.getElementById("game-log");
    lb.innerHTML += `<br>> ${msg}`;
    lb.scrollTop = lb.scrollHeight;
}

function handleTelescopeHint() { showZoom("Telescope", "assets/zooms/telescope.jpeg", "I hold the galaxy but lack the stars...\nLook where the paper meets the wood."); }
function handleBook() { showZoom("Ancient Book", "assets/zooms/book.jpeg", "Mix 3 drops of green sun into the purple sea."); }
function handleTV() { showZoom("Monitor", state.hasRemote ? "assets/zooms/tv channel changed.jpeg" : "assets/zooms/tv.jpeg", state.hasRemote ? "Code: 3-2-1" : "Static screen."); }
function pickUpRemote() { if (!state.hasRemote) { state.hasRemote = true; state.inventory.push("Remote"); updateUI(); log("Found Remote."); } }
function handleMixing() { showZoom("Table", "assets/zooms/solutions.jpeg", "Mix fluids?", true); }
function returnToTemple() { changeRoom("temple"); }

// Modal Helper (In case it was missing)
function showModal(id) {
    const modal = document.getElementById(id);
    if(modal) modal.style.display = 'flex';
}