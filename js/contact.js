// @ts-ignore
const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");
const button = document.getElementById("submit-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // UI feedback
  button.disabled = true;
  status.textContent = "Sending...";

  // Collect form data
  const data = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    subject: document.getElementById("subject").value.trim(),
    message: document.getElementById("message").value.trim(),
    honeypot: form.querySelector('[name="honeypot"]').value,
  };

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (res.ok) {
      status.textContent = "Message sent successfully ";
      form.reset();
    } else {
      status.textContent = result.error || "Something went wrong";
    }

  } catch (error) {
    console.error("Request failed:", error);
    status.textContent = "Network error. Try again.";
  }

  button.disabled = false;
});