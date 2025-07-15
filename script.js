let btn = document.querySelector("#btn");

let content = document.querySelector("#content");

let voice = document.querySelector("#voice");

let camera = document.querySelector("#camera");

let snapshot = document.querySelector("#snapshot");

let downloadBtn = document.querySelector("#downloadBtn");

let cameraStream = null;

// Speech Synthesis
function speak(text) {
    let text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1;
    text_speak.pitch = 1;
    text_speak.volume = 1;
    text_speak.lang = "en-US";

    text_speak.onend = () => {
        recognition.start();
    };

    window.speechSynthesis.speak(text_speak);
}

function wishMe() {
    let hours = new Date().getHours();
    if (hours >= 0 && hours < 12) {
        speak("Good Morning.");
    } else if (hours >= 12 && hours < 16) {
        speak("Good Afternoon.");
    } else {
        speak("Good Evening.");
    }
}

// Speech Recognition
let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;

recognition.onresult = (event) => {
    let transcript = event.results[0][0].transcript.trim().toLowerCase();
    content.innerText = transcript;
    takeCommand(transcript);
};

recognition.onend = () => {
    // Do not restart; we restart after speak
};

btn.addEventListener("click", () => {
    recognition.start();
    voice.style.display = "block";
    btn.style.display = "none";
    wishMe();
});

// Camera Functions
function openCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            camera.srcObject = stream;
            cameraStream = stream;
            camera.style.display = "block";

            speak("Camera opened.");
        })
        .catch(err => {
            speak("Sorry, I couldn't access the camera.");
            console.error("Camera error.", err);
        });
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop()); // Stop all streams
        camera.srcObject = null;
        cameraStream = null;
        camera.style.display = "none";

        speak("Camera closed.");
    } else {
        speak("Camera is not running.");
    }
}

function capturePhoto() {
    if (!cameraStream) {
        speak("Camera is not open.");
        return;
    }
    let ctx = snapshot.getContext("2d");

    snapshot.width = camera.videoWidth;
    snapshot.height = camera.videoHeight;

    ctx.drawImage(camera, 0, 0);
    snapshot.style.display = "block";

    // Generate data URL and show download button
    let imageDataURL = snapshot.toDataURL("image/png");

    downloadBtn.href = imageDataURL;
    downloadBtn.style.display = "inline-block";

    speak("Photo captured.");
}

function takeCommand(message) {
    voice.style.display = "none";
    btn.style.display = "flex";

    if (message.includes("hello") ||
        message.includes("hey")) {
        speak("Hello! How can I help you?");
    } else if (message.includes("who are you")) {
        speak("I am your virtual assistant.");
    } else if (message.startsWith("calculate ") ||
        message.startsWith("solve ") ||
        message.startsWith("what is ")) {

        let expression = message
            .replace("calculate ", "")
            .replace("solve ", "")
            .replace("what is ", "")
            .trim();

        try {
            if (message.startsWith("solve ")) {
                let [left, right] = expression.split('=');
                if (right === undefined) {
                    speak("Please provide an equation with an equals sign.");
                    return;
                }

                let equation = `${left}-(${right})`; // move everything to left side
                let solution = nerdamer.solve(equation, "x");

                if (solution.length == 0) {
                    speak("No solution found.");
                } else {
                    speak(`The solution for ${expression} is ${solution.toString()}.`);
                }
            } else {
                let result = eval(expression);
                speak(`The answer is ${result}.`);
            }
        } catch (error) {
            console.error(error);
            speak("Sorry, I could not compute.");
        }

    } else if (message.startsWith("call ")) {
        let phone = message.replace("call ", "").trim();

        if (phone) {
            speak(`Calling ${phone}. Please check your phone.`);
            window.open(`tel:${phone}`);
        } else {
            speak("Please say a phone number.");
        }
    } else if (message.startsWith("call on whatsapp ")) {
        let phone = message.replace("call on whatsapp ", "").trim();

        if (phone) {
            speak(`Calling ${phone} on WhatsApp.`);
            window.open(`https://wa.me/${phone}`);
        } else {
            speak("Please say a phone number.");
        }
    } else if (message.includes("open youtube")) {
        let query = message.replace(/.*youtube\s*/, "").trim();

        if (query) {
            speak(`Searching for ${query} on YouTube.`);
            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, "_blank");

        } else {
            speak("Opening YouTube.");
            window.open("https://youtube.com/", "_blank");

        }
    } else if (message.includes("open google")) {
        speak("Opening Google.");
        window.open("https://google.com/", "_blank");

    } else if (message.includes("open facebook")) {
        speak("Opening Facebook.");
        window.open("https://facebook.com/", "_blank");

    } else if (message.includes("open instagram")) {
        speak("Opening Instagram.");
        window.open("https://instagram.com/", "_blank");

    } else if (message.includes("open calculator")) {
        speak("Opening calculator.");
        window.open("calculator://");

    } else if (message.includes("open whatsapp")) {
        speak("Opening WhatsApp.");
        window.open("https://web.whatsapp.com");

    } else if (message.includes("open camera") ||
        message.includes("start camera")) {
        speak("Opening camera.");
        openCamera();

    } else if (message.includes("close camera") ||
        message.includes("stop camera")) {
        speak("Closing camera.");
        stopCamera();

    } else if (message.includes("take photo") ||
        message.includes("capture image")) {
        speak("Capturing photo.");
        capturePhoto();

    } else if (message.includes("time") ||
        message.includes("what time") ||
        message.includes("tell me the time")) {
        let now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let ampm = hours >= 12 ? "PM" : "AM";

        let timeString = `${(hours % 12) || 12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
        speak("The time is " + timeString);
    } else if (message.includes("date") ||
        message.includes("tell me the date") ||
        message.includes("what's the date") ||
        message.includes("what is the date")) {
        let date = new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
        speak("Today's date is " + date);
    } else {
        let query = message.trim().replace(/genos|shifra|shipra/gi, "");
        let response = "Here’s what I found on the internet about " + query;
        speak(response);
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");

    }
}

