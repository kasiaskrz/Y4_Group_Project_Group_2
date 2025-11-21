const supabase = window.supabase.createClient(
    "https://ywuyfgvtazqysxnmvnkv.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3dXlmZ3Z0YXpxeXN4bm12bmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MzQyMzAsImV4cCI6MjA3ODExMDIzMH0.qOpekOPmKweh29QgtQUCGM-fAXPJZ58R0ccSjMET-rM"
);

// --- REGISTER FORM ---
const registerForm = document.getElementById("registerForm");

// --- REGISTER ---
async function registerUser(email, password) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) {
        console.log("SIGNUP ERROR:", error);
        return { success: false, message: error.message };
    }

    return { success: true };
}


// --- LOGIN ---
async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

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
        emailError.style.display = "none";
        emailError.textContent = "";
        usernameError.style.display = "none";
        usernameError.textContent = "";

        // Check if username exists
        if (await isUsernameTaken(username)) {
            usernameError.textContent = "This username is already taken.";
            usernameError.style.display = "block";
            return;
        }

        // Save username until login
        localStorage.setItem("pending_username", username);

        // Register the user
        const result = await registerUser(email, password);

        if (!result.success) {
            emailError.textContent = result.message;
            emailError.style.display = "block";
            return;
        }

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
        console.log("LOGIN MESSAGE:", message);

        if (message === "Logged in!") {

            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                console.log("Error getting user after login:", userError);
                return;
            }

            console.log("USER OBJECT:", user);

            // Check if profile already exists
            const { data: existingProfile, error: profileCheckError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();

            if (profileCheckError) console.log("PROFILE CHECK ERROR:", profileCheckError);
            console.log("EXISTING PROFILE:", existingProfile);

            // Insert only if no profile exists
            if (!existingProfile) {

                let username = localStorage.getItem("pending_username");

                // fallback username if missing
                if (!username) {
                    username = user.email.split("@")[0];
                }

                console.log("INSERTING PROFILE WITH USERNAME:", username);

                const { error: insertError } = await supabase
                    .from("profiles")
                    .insert([{
                        id: user.id,
                        username: username,
                        email: user.email
                    }]);

                if (insertError) {
                    console.log("PROFILE INSERT ERROR:", insertError);
                } else {
                    console.log("PROFILE INSERTED SUCCESSFULLY 🎉");
                    localStorage.removeItem("pending_username");
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
