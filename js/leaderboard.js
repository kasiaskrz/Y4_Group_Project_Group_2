import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabaseConfig.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const tbody = document.getElementById("leaderboard-body");

function formatMs(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function nameCell(username, rank) {
    if (rank === 1) {
        return `<span class="player-name first-place">${username}</span>`;
    }
    if (rank === 2) {
        return `<span class="player-name second-place">${username}</span>`;
    }
    if (rank === 3) {
        return `<span class="player-name third-place">${username}</span>`;
    }
    return `<span class="player-name">${username}</span>`;
}

async function loadLeaderboard() {
    const { data, error } = await supabase
        .from("level_leaderboard")
        .select("username, level_number, best_time_ms")
        .order("best_time_ms", { ascending: true })
        .limit(10);

    if (error) {
        console.error("Leaderboard error:", error);
        tbody.innerHTML = `<tr><td colspan="4">Failed to load leaderboard.</td></tr>`;
        return;
    }

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">No runs yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map((row, i) => {
        const rank = i + 1;

        return `
        <tr class="${rank === 1 ? 'row-first' : rank === 2 ? 'row-second' : rank === 3 ? 'row-third' : ''}">
          <td>#${rank}</td>
          <td>${nameCell(row.username ?? "Unknown", rank)}</td>
          <td>Level ${row.level_number}</td>
          <td>${formatMs(row.best_time_ms)}</td>
        </tr>
      `;
    }).join("");
}

loadLeaderboard();