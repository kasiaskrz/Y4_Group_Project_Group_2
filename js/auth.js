// auth.js

document.addEventListener("DOMContentLoaded", () => {
  const supabase = window.supabaseClient;

  if (!supabase) {
    console.error("Supabase client missing. Make sure script.js loads BEFORE auth.js");
    return;
  }

  // --- REGISTER FORM ---
  const registerForm = document.getElementById("registerForm");

  // --- REGISTER ---
  async function registerUser(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });

    console.log("SIGNUP DEBUG:", { data, error });

    if (error) {
      if (
        (error.message && (error.message.includes("registered") || error.message.includes("exists"))) ||
        error.code === "user_already_exists"
      ) {
        return { success: false, message: "This email is already registered. Please log in instead." };
      }
      return { success: false, message: error.message || "Signup failed." };
    }

    return { success: true };
  }

  // --- LOGIN ---
  async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.log("LOGIN ERROR:", error);
      return error.message;
    }

    return "Logged in!";
  }

  // --- HANDLE REGISTER FORM ---
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("reg-username").value;
      const email = document.getElementById("reg-email").value.trim().toLowerCase();
      const password = document.getElementById("reg-password").value;

      const emailError = document.getElementById("email-error");
      const usernameError = document.getElementById("username-error");

      // Clear old errors
      emailError.textContent = "";
      emailError.style.display = "none";
      usernameError.textContent = "";
      usernameError.style.display = "none";

      // 1) Check username
      if (await isUsernameTaken(username)) {
        usernameError.textContent = "This username is already taken.";
        usernameError.style.display = "block";
        return;
      }

      // 2) Register user (Supabase handles duplicate emails)
      const result = await registerUser(email, password);

      if (!result.success) {
        emailError.textContent = result.message;
        emailError.style.display = "block";
        console.log("SIGNUP ERROR:", result.message);
        return;
      }

      localStorage.setItem("pending_username", username);
      alert("We sent you a confirmation email. Please verify to log in.");
      window.location.href = "login.html";
    });
  }

  // --- HANDLE LOGIN FORM ---
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("login-email").value.trim().toLowerCase();
      const password = document.getElementById("login-password").value;

      const message = await loginUser(email, password);
      console.log("LOGIN MESSAGE:", message);

      if (message === "Logged in!") {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.log("Error getting user after login:", userError);
          return;
        }

        // Check if profile already exists
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profileCheckError) console.log("PROFILE CHECK ERROR:", profileCheckError);

        // Insert only if no profile exists
        if (!existingProfile) {
          let username = localStorage.getItem("pending_username");
          if (!username) username = user.email.split("@")[0];

          const { error: insertError } = await supabase
            .from("profiles")
            .insert([{ id: user.id, username, email: user.email }]);

          if (insertError) {
            console.log("PROFILE INSERT ERROR:", insertError);
          } else {
            localStorage.removeItem("pending_username");
            console.log("PROFILE INSERTED ");
          }
        }

        window.location.href = "home.html";
      }
    });
  }

  // --- CHECK USERNAME ---
  async function isUsernameTaken(username) {
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      console.log("USERNAME CHECK ERROR:", error);
      return false;
    }

    return data !== null;
  }
});
