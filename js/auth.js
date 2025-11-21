const supabase = window.supabase.createClient(
    "https://ywuyfgvtazqysxnmvnkv.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3dXlmZ3Z0YXpxeXN4bm12bmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MzQyMzAsImV4cCI6MjA3ODExMDIzMH0.qOpekOPmKweh29QgtQUCGM-fAXPJZ58R0ccSjMET-rM"
);

// --- REGISTER ---
async function registerUser(email, password) {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
    });

    if (error) {
        console.log(error.message);
        return error.message;
    }

    return "Check your email to confirm your account!";
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
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("reg-email").value;
        const password = document.getElementById("reg-password").value;

        const message = await registerUser(email, password);
        console.log(message);

        if (message === "Logged in!") {
            window.location.href = "home.html";
        }

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
            window.location.href = "home.html";
        }

    });
}