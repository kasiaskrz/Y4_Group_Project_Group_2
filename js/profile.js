// --- PROFILE PAGE LOGIC ---
document.addEventListener("DOMContentLoaded", async () => {
    // Use the client you already create in script.js
    const supabase = window.supabaseClient;

    // If script.js didn't run / loaded too late / not included
    if (!supabase) {
        console.error("Supabase client not found. Make sure js/script.js loads before js/profile.js.");
        return;
    }

    // 1. Check if user is logged in
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
        console.error("Error getting user:", userError);
        return;
    }

    if (!user) {
        window.location.href = "home.html";
        return;
    }

    // 2. Fetch username from "profiles" table using user.id
    const { data: profileData, error } = await supabase
        .from("profiles")
        .select("username, email, created_at")
        .eq("id", user.id)
        .single();

    if (error) {
        console.error("Error loading profile:", error);
        return;
    }

    // 3. Insert username into page
    document.getElementById("profile-username").textContent =
        profileData?.username ?? "(no username)";

    const formatMs = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    const formatDate = (iso) => {
        const d = new Date(iso);
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    const formatPlaytime = (msTotal) => {
        const totalSeconds = Math.floor(msTotal / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        if (hours <= 0) return `${minutes}m`;
        return `${hours}h ${minutes}m`;
    };

    // ======= BEST SCORE (FASTEST RUN FOR THIS USER) =======
    const bestScoreEl = document.getElementById("best-score");
    let bestRun = null;

    if (bestScoreEl) {
        const { data, error: bestError } = await supabase
            .from("level_runs")
            .select("time_ms")
            .eq("user_id", user.id)
            .order("time_ms", { ascending: true })
            .limit(1)
            .maybeSingle();

        bestRun = data;

        if (bestError || !bestRun) {
            bestScoreEl.textContent = "--:--";
        } else {
            bestScoreEl.textContent = formatMs(bestRun.time_ms);
        }
    }

    // ======= GLOBAL RANK (based on each user's BEST ever run) =======
    const globalRankEl = document.getElementById("global-rank");
    if (globalRankEl) {
        if (!bestRun) {
            globalRankEl.textContent = "--";
        } else {
            // Requires the SQL view: public.global_leaderboard (user_id, username, best_time_ms)
            const { data: board, error: boardError } = await supabase
                .from("global_leaderboard")
                .select("user_id, best_time_ms")
                .order("best_time_ms", { ascending: true });

            if (boardError || !board) {
                console.error("Error loading global leaderboard:", boardError);
                globalRankEl.textContent = "--";
            } else {
                const idx = board.findIndex(r => r.user_id === user.id);
                globalRankEl.textContent = idx === -1 ? "--" : `#${idx + 1}`;
            }
        }
    }

    // ======= LEVELS COMPLETED (ALL RUNS) + TOTAL PLAYTIME =======
    const tableBody = document.getElementById("levels-table-body");
    tableBody.innerHTML = ""; // clear old rows

    const { data: runs, error: runsError } = await supabase
        .from("level_runs")
        .select("level_number, time_ms, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (runsError) {
        console.error("Error loading level runs:", runsError);
        tableBody.innerHTML = `<tr><td colspan="3">Failed to load runs.</td></tr>`;
        return;
    }

    if (!runs || runs.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="3">No levels completed yet.</td></tr>`;
        const playtimeEl = document.getElementById("playtime");
        if (playtimeEl) playtimeEl.textContent = "0m";
        return;
    }

    // Total playtime = sum of all run times for this user
    const totalMs = runs.reduce((sum, r) => sum + (r.time_ms || 0), 0);
    const playtimeEl = document.getElementById("playtime");
    if (playtimeEl) playtimeEl.textContent = formatPlaytime(totalMs);

    runs.forEach(r => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>Level ${r.level_number}</td>
          <td>${formatDate(r.created_at)}</td>
          <td>${formatMs(r.time_ms)}</td>
        `;
        tableBody.appendChild(tr);
    });
});
