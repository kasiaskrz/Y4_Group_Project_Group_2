window.supabaseClient = window.supabase.createClient(
  "https://ywuyfgvtazqysxnmvnkv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3dXlmZ3Z0YXpxeXN4bm12bmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MzQyMzAsImV4cCI6MjA3ODExMDIzMH0.qOpekOPmKweh29QgtQUCGM-fAXPJZ58R0ccSjMET-rM"
);


document.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabaseClient;

  const { data: { user } } = await supabase.auth.getUser();

  const loginBtn = document.getElementById("btn-login");
  const registerBtn = document.getElementById("btn-register");
  const logoutBtn = document.getElementById("btn-logout");
  const profileBtn = document.getElementById("btn-profile");

  if (user) {
    // Logged in
    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block";
    if (profileBtn) profileBtn.style.display = "block"; // SHOW PROFILE BUTTON

    logoutBtn?.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.reload();
    });

  } else {
    // Not logged in
    if (loginBtn) loginBtn.style.display = "block";
    if (registerBtn) registerBtn.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (profileBtn) profileBtn.style.display = "none"; // HIDE PROFILE BUTTON
  }
});

// HERO VIDEO MOTION TOGGLE (reset to start)
document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("heroVideo");
  const motionBtn = document.getElementById("toggleVideo");

  if (!video || !motionBtn) return;

  motionBtn.addEventListener("click", () => {
    if (video.paused) {
      video.currentTime = 0;
      video.play();
      motionBtn.textContent = "Motion: On";
      motionBtn.classList.remove("motion-off");
    } else {
      video.pause();
      video.currentTime = 0;
      motionBtn.textContent = "Motion: Off";
      motionBtn.classList.add("motion-off");
    }
  });
});



