const messages = [
            "Signal found...",
            "Connection initializing...",
            "Entering the station..."
        ];

        function typeLine(el, text, delay) {
            setTimeout(() => {
                let i = 0;
                const timer = setInterval(() => {
                    el.textContent += text[i];
                    i++;
                    if (i === text.length) clearInterval(timer);
                }, 35);
            }, delay);
        }

        window.onload = () => {

            typeLine(document.getElementById("line1"), messages[0], 400);
            typeLine(document.getElementById("line2"), messages[1], 1300);
            typeLine(document.getElementById("line3"), messages[2], 2200);

            // Start fade after text plays
            setTimeout(() => {
                document.getElementById("splash-screen").classList.add("fade-out");
            }, 3400);

            // Redirect after fade animation completes
            setTimeout(() => {
                window.location.href = "home.html";
            }, 4300);
        };