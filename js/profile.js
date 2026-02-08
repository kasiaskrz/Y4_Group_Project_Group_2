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

    // 4. Example static values (you’ll replace these with real game stats later)
    document.getElementById("best-score").textContent = "04:22";
    document.getElementById("global-rank").textContent = "#20";
    document.getElementById("playtime").textContent = "2h 22m";

    // 5. Example levels (replace with Supabase later)
    const dummyLevels = [
        { level: "Level 1", date: "21/2/2021", time: "04:22" },
        { level: "Level 2", date: "15/5/2022", time: "04:22" },
        { level: "Level 3", date: "15/5/2022", time: "04:22" },
        { level: "Level 4", date: "15/5/2022", time: "04:22" },
        { level: "Level 5", date: "15/5/2022", time: "04:22" },
        { level: "Level 6", date: "15/5/2022", time: "04:22" }
    ];

    const tableBody = document.getElementById("levels-table-body");
    dummyLevels.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${row.level}</td>
      <td>${row.date}</td>
      <td>${row.time}</td>
    `;
        tableBody.appendChild(tr);
    });
});
