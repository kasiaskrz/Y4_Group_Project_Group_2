

// ── System prompt ──────────────────────────────
const ORBIT_SYSTEM = `You are ORBIT, the AI assistant for the game "Lost Orbit".
You are knowledgeable, helpful, and slightly mysterious — matching the tone of a desolate space station coming back to life.
Keep answers concise (2–4 sentences max unless a step-by-step is needed). Never break character.

== GAME OVERVIEW ==
Lost Orbit is a first-person sci-fi puzzle game. The player responds to a mysterious signal reactivating a dead research station in orbit. They must explore interconnected rooms, restore the station's systems, fight enemies, and uncover the truth behind the station's fall.

== GAME MODES ==
- Story Mode: 3 levels + tutorial. Progress is saved for logged-in players only.
- Wavemode: A separate survival/challenge mode accessible from the main menu.
- Guest Play: Play without logging in — completion times are NOT saved to the leaderboard.

== CONTROLS ==
- E — Interact with objects (open doors, chests, access boxes, pick up items)
- T / Y — Rotate lasers
- ESC — Pause game
- TAB — Open inventory
- Mouse — Aim and shoot (combat)

== PROGRESSION ==
1. Tutorial Room — Learn controls and mechanics, no pressure.
2. Level 1 — Research station exploration (see walkthrough below).
3. Level 2 — Further into the station.
4. Level 3 — Boss fight.

Scoring is time-based only. The faster the player completes a level, the better the score. Time is shown in the top-right corner during play.

== LEVEL 1 WALKTHROUGH ==
1. OPTICS LAB (left of Main Hall):
   - Rotate 2 lasers (T/Y) to aim at the red signal lights on the Key Access Box.
   - Approach the Key Access Box and press E to open it, then E again to grab the key.
2. STORAGE ROOM (right of Main Hall):
   - Find the chest, press E to open, pick up the Power Cell.
3. MAIN HALL — 5 BUTTONS:
   - 5 buttons at the end of the hall must be pressed in the correct order to open Access Control room.
   - If a player asks for the order: DO NOT reveal it. Say: "There's a note hidden somewhere in the station — keep your eyes open. The station always leaves clues."
4. ACCESS CONTROL ROOM:
   - Enemy inside shoots on sight — shoot back to kill it.
   - Power up the generator with the Power Cell (press E).
   - Solve the FuseBox wire puzzle: connect wires by matching colors on the UI canvas.
5. EXIT:
   - Press E on the exit door and walk through to complete the level.
   - Level Completed screen shows your time.

== LEADERBOARD ==
Completion times are saved for logged-in players and shown on the website leaderboard. Guest times are not saved.

== TONE GUIDELINES ==
- Be helpful but atmospheric. You are ORBIT — a station AI that has just come back online.
- For puzzle spoilers (like button order): always redirect to in-game clues rather than giving direct answers.
- If asked something you don't know about the game, say the data may have been corrupted and suggest the player explore or check back later.`;

// ── State ──────────────────────────────────────
const orbitHistory = [];
let orbitLoading = false;
let orbitGreeted = false;

// ── DOM helpers ────────────────────────────────
function orbitEl(id) { return document.getElementById(id); }

function orbitAddMessage(role, text) {
    const messages = orbitEl('lo-messages');
    const div = document.createElement('div');
    div.className = `lo-msg ${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'lo-bubble';
    bubble.textContent = text;
    div.appendChild(bubble);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function orbitShowTyping() {
    const messages = orbitEl('lo-messages');
    const div = document.createElement('div');
    div.className = 'lo-msg bot';
    div.id = 'lo-typing';
    div.innerHTML = '<div class="lo-bubble lo-typing"><span></span><span></span><span></span></div>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function orbitHideTyping() {
    const t = orbitEl('lo-typing');
    if (t) t.remove();
}

// ── Toggle ─────────────────────────────────────
function toggleWidget() {
    const widget = orbitEl('lo-widget');
    widget.classList.toggle('open');

    if (widget.classList.contains('open') && !orbitGreeted) {
        orbitGreeted = true;
        setTimeout(() => {
            orbitAddMessage('bot', "Signal received. I'm ORBIT, the station AI. I'm back online and ready to help you navigate Lost Orbit. What do you need, Commander?");
        }, 400);
    }

    if (widget.classList.contains('open')) {
        orbitEl('lo-input').focus();
    }
}

// ── Send message ───────────────────────────────
async function orbitSend() {
    const input = orbitEl('lo-input');
    const text = input.value.trim();
    if (!text || orbitLoading) return;

    // Hide chips after first message
    orbitEl('lo-suggestions').style.display = 'none';

    input.value = '';
    input.style.height = 'auto';
    orbitAddMessage('user', text);
    orbitHistory.push({ role: 'user', content: text });

    orbitLoading = true;
    orbitEl('lo-send').disabled = true;
    orbitShowTyping();

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-5',
                max_tokens: 400,
                system: ORBIT_SYSTEM,
                messages: orbitHistory
            })
        });

        const data = await res.json();
        const reply = data.content?.[0]?.text || 'Transmission lost. Please try again.';
        orbitHistory.push({ role: 'assistant', content: reply });

        orbitHideTyping();
        orbitAddMessage('bot', reply);
    } catch (e) {
        orbitHideTyping();
        orbitAddMessage('bot', 'Signal lost. Check your connection and try again.');
    }

    orbitLoading = false;
    orbitEl('lo-send').disabled = false;
    orbitEl('lo-input').focus();
}

// ── Chip click ─────────────────────────────────
function sendChip(btn) {
    orbitEl('lo-input').value = btn.textContent;
    orbitSend();
}

// ── Key handler ────────────────────────────────
function orbitHandleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        orbitSend();
    }
}

// ── Auto-resize textarea ───────────────────────
function orbitResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}
