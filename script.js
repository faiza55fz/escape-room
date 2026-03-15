const state = { 
    room: "landing", 
    inventory: [], 
    hasRemote: false, 
    finalPhase: false 
};

const roomData = {
    temple: {
        title: "The Temple Hub",
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

// --- CORE ENGINE ---

function startGame() {
    document.getElementById("landing-page").style.display = "none";
    document.getElementById("game-container").style.display = "flex";
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
        div.style.left = hs.x + "%"; 
        div.style.top = hs.y + "%";
        div.style.width = hs.w + "%"; 
        div.style.height = hs.h + "%";
        div.onclick = hs.action;
        container.appendChild(div);
    });
}

function showZoom(title, img, text, showMix = false) {
    document.getElementById("popup-title").innerText = title;
    const imgElement = document.getElementById("popup-image");
const frame= document.querySelector(".square-frame");    
    const pText = document.getElementById("popup-text");
if(img){
    imgElement.src=img;
    frame.style.display="block";
}else{
    frame.style.display="none";
}
    pText.innerText = text; 
    pText.className = text.includes("OBTAINED") ? "big-success-text" : "";

    document.getElementById("mix-btn").style.display = showMix ? "inline-block" : "none";
    document.getElementById("popup-overlay").style.display = "flex";
    
    setTimeout(() => document.querySelector(".popup-content").classList.add("active"), 10);
    
    if (showMix) {
        document.getElementById("mix-btn").onclick = startSuccessSequence;
    }
}

function closePopup() {
    document.querySelector(".popup-content").classList.remove("active");
    setTimeout(() => {
        document.getElementById("popup-overlay").style.display = "none";
    }, 400);
}

// --- GAME ACTIONS (RESTORED) ---

function handleTelescopeHint() {
    const riddle = "I hold the galaxy but lack the stars,\nI turn in place but travel far.\nLook where the paper meets the wood,\nopposite where the window stands.";
    showZoom("Telescope", "assets/zooms/telescope.jpeg", riddle);
}

function handleBook() {
    showZoom("Ancient Book", "assets/zooms/book.jpeg", "Mix 3 drops of green sun into the purple sea to reveal the gem.");
}

function handleSphere() {
    if (!state.inventory.includes("Crystal 2")) {
        animateCrystal();
        state.inventory.push("Crystal 2"); 
        updateUI();
        showZoom("Sphere", "assets/zooms/sphere.jpeg", "CRYSTAL TWO OBTAINED");
    } else { 
        showZoom("Sphere", "assets/zooms/sphere.jpeg", "It's empty."); 
    }
}

function handleTV() {
    const img = state.hasRemote ? "assets/zooms/tv channel changed.jpeg" : "assets/zooms/tv.jpeg";
    const txt = state.hasRemote ? "Code" : "Static screen. Needs a remote.";
    showZoom("Monitor", img, txt);
}

function pickUpRemote() {
    if (!state.hasRemote) { 
        state.hasRemote = true; 
        state.inventory.push("Remote Control"); 
        updateUI(); 
        log("Found Remote."); 
    }
}

function handleMixing() { 
    showZoom("Table", "assets/zooms/solutions.jpeg", "Mix fluids?", true); 
}

function startSuccessSequence() {
    closePopup();
    setTimeout(() => {
        if (!state.inventory.includes("Crystal 1")) { 
            animateCrystal();
            state.inventory.push("Crystal 1"); 
            updateUI(); 
            showZoom("SUCCESS", null, "CRYSTAL ONE OBTAINED");
        }
    }, 400);
}

function handleSafe() {
    const code = prompt("Enter 3-digit Code:");
    if (code === "321") {
        if (!state.inventory.includes("Crystal 3")) { 
            animateCrystal(); 
            state.inventory.push("Crystal 3"); 
            updateUI(); 
            showZoom("Vault", null, "CRYSTAL THREE OBTAINED");
        }
    } else if (code !== null) {
        log("Wrong code.");
    }
}

// --- FINALE ---

function handleMainDoll() {
    const count = state.inventory.filter(i => i.includes("Crystal")).length;
    if (count >= 3) {
        showZoom("The Guardian", "assets/zooms/doll zoomed.png", "The three are home... now speak the name of the life-giver.");
        setTimeout(() => {
            let ans = prompt("What is the life-giver?");
            if (ans && ans.toLowerCase().trim() === "water") {
                showZoom("Guardian Awakened", "assets/zooms/doll_glow.png", "CORRECT. The  Key is revealed in the ripples.");
                state.finalPhase = true; 
                log("The Guardian has accepted the word.");
            }
        }, 800);
    } else {
        showZoom("Guardian", "assets/zooms/doll zoomed.png", "You must find all 3 crystals first.");
    }
}

function handleWaterKey() {
    if (state.finalPhase) {
        document.getElementById("win-screen").style.display = "flex";
    } else {
        log("The water ripples peacefully, but nothing happens.");
    }
}

// --- HELPERS ---

function updateUI() {
    const list = document.getElementById("inventory-list");
    // Creates small vertical blocks for each item in the sidebar
    list.innerHTML = state.inventory.map(item => `
        <div style="border: 1px solid #0f0; padding: 5px; font-size: 9px; background: rgba(0,255,0,0.1);">
            ${item}
        </div>
    `).join("");
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

function returnToTemple() { changeRoom("temple"); }