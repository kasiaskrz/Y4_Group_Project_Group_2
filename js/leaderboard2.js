import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabaseConfig.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const tbody = document.getElementById("leaderboard-body");
const searchInput = document.getElementById("leaderboard-search");

function formatMs(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

async function loadLeaderboardFull(searchTerm = "") {

    const { data, error } = await supabase
        .from("level_leaderboard")
        .select("username, level_number, best_time_ms")
        .order("best_time_ms", { ascending: true });

    if (error) {
        console.error("Leaderboard error:", error);
        tbody.innerHTML = `<tr><td colspan="4">Failed to load leaderboard.</td></tr>`;
        return;
    }

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">No runs found.</td></tr>`;
        return;
    }

    // Add global rank
    const rankedData = data.map((row, index) => ({
        ...row,
        rank: index + 1
    }));

    // If searching, filter AFTER ranking
    const filtered = searchTerm.trim() !== ""
        ? rankedData.filter(player =>
            player.username.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : rankedData.slice(10); // skip top 10 normally

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">No matching players.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(player => `
        <tr>
            <td>#${player.rank}</td>
            <td>${player.username ?? "Unknown"}</td>
            <td>Level ${player.level_number}</td>
            <td>${formatMs(player.best_time_ms)}</td>
        </tr>
    `).join("");
}

searchInput.addEventListener("input", (e) => {
    loadLeaderboardFull(e.target.value);
});

loadLeaderboardFull();