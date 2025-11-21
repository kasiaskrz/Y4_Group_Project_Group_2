const supabase = window.supabase.createClient(
    "https://ywuyfgvtazqysxnmvnkv.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3dXlmZ3Z0YXpxeXN4bm12bmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MzQyMzAsImV4cCI6MjA3ODExMDIzMH0.qOpekOPmKweh29QgtQUCGM-fAXPJZ58R0ccSjMET-rM"
);

const registerForm = document.getElementById("registerForm");
// --- REGISTER ---
async function registerUser(email, password) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) {
        return { success: false, message: error.message };
    }

    return { success: true };
}


// --- LOGIN ---
async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        console.log(error.message);
        return error.message;
    }

    return "Logged in!";
}

// --- HANDLE REGISTER FORM ---
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("reg-username").value;
        const email = document.getElementById("reg-email").value;
        const password = document.getElementById("reg-password").value;

        const emailError = document.getElementById("email-error");
        const usernameError = document.getElementById("username-error");

        // Clear old errors
        emailError.style.display = "none";
        emailError.textContent = "";
        usernameError.style.display = "none";
        usernameError.textContent = "";

        // 1️⃣ Check if username is taken
        if (await isUsernameTaken(username)) {
            usernameError.textContent = "This username is already taken.";
            usernameError.style.display = "block";
            return; // Stop here
        }

        // Save username temporarily until user logs in
        localStorage.setItem("pending_username", username);

        // Create user (email + password)
        const result = await registerUser(email, password);

        if (!result.success) {
            // email-related error from Supabase
            emailError.textContent = result.message;
            emailError.style.display = "block";
            return;
        }

        // 3️⃣ Success!
        alert("We sent you a confirmation email. Please verify to log in.");
        window.location.href = "login.html";
    });
}



// --- HANDLE LOGIN FORM ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        const message = await loginUser(email, password);
        console.log(message);

        if (message === "Logged in!") {

            const { data: { user } } = await supabase.auth.getUser();

            // Check if profile exists
            const { data: existingProfile, error: profileCheckError } = await supabase
                .from("profiles")
                .select("id")
                .eq("id", user.id)
                .maybeSingle();

            if (!existingProfile) {
                // Insert the profile now
                const username = localStorage.getItem("pending_username");

                if (username) {
                    await supabase
                        .from("profiles")
                        .insert([{ id: user.id, username: username }]);

                    // Clear the saved username so it's not reused
                    localStorage.removeItem("pending_username");
                }
            }

            window.location.href = "home.html";
        }
    });
}

async function isUsernameTaken(username) {
    const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .maybeSingle();

    if (error) {
        console.log(error.message);
        return false; // fail-safe: don't block registration
    }

    return data !== null; // if data exists → taken
}
