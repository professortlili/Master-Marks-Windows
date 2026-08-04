// --- نظام التفعيل والحماية V2.1 (Fast-Boot Activation System) ---
// SECRET KEY for simple XOR (must match Keygen)
const LICENSE_SECRET = "TEACHER_XP_2026_SECRET";

let activationState = {
    isActivated: false,
    hwid: '',
    plan: '',
    expiry: 0,
    activationKey: '',
    isVerifiedDeep: false // للتحقق ما إذا كان الفحص العميق قد اكتمل
};

function checkTimeTampering() {
    let lastKnownTimeStr = localStorage.getItem('teacher_last_known_time');
    let lastKnownTime = parseInt(lastKnownTimeStr) || 0;
    const currentTime = Date.now();
    
    // التحقق من وجود تلاعب (التاريخ الحالي أصغر من آخر وقت مسجل)
    if (currentTime < lastKnownTime) {
        let tamperCount = parseInt(localStorage.getItem('teacher_tamper_count')) || 0;
        let lastStrikeTime = parseInt(localStorage.getItem('teacher_last_strike_time')) || 0;

        if (tamperCount === 0) {
            // الإنذار الأول
            tamperCount = 1;
            localStorage.setItem('teacher_tamper_count', tamperCount.toString());
            localStorage.setItem('teacher_last_strike_time', lastKnownTime.toString());
            
            if (window.electronAPI && window.electronAPI.setRegistryValue) {
                window.electronAPI.setRegistryValue('TamperCount', '1');
                if (window.electronAPI.setHiddenValue) {
                    window.electronAPI.setHiddenValue('TamperCount', '1');
                    window.electronAPI.setHiddenValue('LastStrikeTime', lastKnownTime.toString());
                }
            }
            return 'TAMPER_STRIKE_1';
        } else if (tamperCount === 1) {
            // إذا كان الوقت المسجل حالياً أكبر من الوقت الذي سجل عنده الإنذار الأول
            // فهذا يعني أن المستخدم كان قد ضبط الوقت واستخدم البرنامج، ثم تلاعب به مرة أخرى
            if (lastKnownTime > lastStrikeTime) {
                tamperCount = 2;
                localStorage.setItem('teacher_tamper_count', tamperCount.toString());
                if (window.electronAPI && window.electronAPI.setRegistryValue) {
                    window.electronAPI.setRegistryValue('TamperCount', '2');
                    if (window.electronAPI.setHiddenValue) window.electronAPI.setHiddenValue('TamperCount', '2');
                }
                return 'TAMPER_STRIKE_2';
            } else {
                // لا يزال الوقت خاطئاً منذ الإنذار الأول، لا نحسب إنذاراً ثانياً
                return 'TAMPER_STRIKE_SAME_ERROR';
            }
        } else {
            return 'TAMPER_STRIKE_2';
        }
    }
    
    // تحديث آخر وقت مسجل فقط إذا كان الوقت الحالي يسير للأمام
    localStorage.setItem('teacher_last_known_time', currentTime.toString());
    if (window.electronAPI && window.electronAPI.setRegistryValue) {
        window.electronAPI.setRegistryValue('LastKnownTime', currentTime.toString());
        if (window.electronAPI.setHiddenValue) window.electronAPI.setHiddenValue('LastKnownTime', currentTime.toString());
    }
    return 'OK';
}

// دالة التشفير البسيطة للملف المخفي
function encryptCache(data, key) {
    let result = btoa(xorDecrypt(data, key + LICENSE_SECRET));
    return result;
}

function decryptCache(data, key) {
    try {
        let result = xorDecrypt(atob(data), key + LICENSE_SECRET);
        return result;
    } catch (e) { return null; }
}

async function initActivation() {
    console.log("Activation: Initializing V2.1 Fast-Boot...");

    // 1. الفحص السريع (Fast Track) - لا ننتظر الـ HWID الحقيقي بعد
    const savedKey = localStorage.getItem('teacher_activation_key');
    const fastBootCache = localStorage.getItem('teacher_fast_boot_verified');

    if (savedKey && fastBootCache === 'TRUE') {
        console.log("Activation: Fast-booting from local cache...");
        // تفعيل مؤقت للسماح بدخول المستخدم فوراً
        activationState.isActivated = true;
        document.body.classList.add('activated');
        updateLicenseUI(true);
        updateSplashUI(true);
    }

    // 2. الفحص العميق في الخلفية (Deep Verification)
    performDeepVerification();

    // 3. بدء المراقبة الحية للوقت (Live Monitoring)
    startLiveTimeMonitoring();
}

function startLiveTimeMonitoring() {
    // فحص الوقت كل 30 ثانية لضمان عدم التلاعب أثناء تشغيل البرنامج
    setInterval(() => {
        // إذا كان هناك خرق أمني معروض حالياً، لا نفعل شيئاً
        if (currentBreachType) return;

        const timeStatus = checkTimeTampering();
        if (timeStatus !== 'OK') {
            let breachType = 'REVOKED_TAMPER_WARN';
            if (timeStatus === 'TAMPER_STRIKE_2') breachType = 'REVOKED_TAMPER_FINAL';
            if (timeStatus === 'TAMPER_STRIKE_SAME_ERROR') breachType = 'REVOKED_TAMPER_PERSISTENT';
            
            handleSecurityBreach(breachType);
        }
    }, 30000); 
}

async function performDeepVerification() {
    // --- بيئة المتصفح (Testing Only) ---
    if (!window.electronAPI) {
        handleBrowserBypass();
        return;
    }

    try {
        // استرجاع البيانات من السجل (Registry)
            // --- 1. Main Registry ---
            const regKey = await window.electronAPI.getRegistryValue('ActivationKey');
            if (regKey) localStorage.setItem('teacher_activation_key', regKey);
            
            const regTime = await window.electronAPI.getRegistryValue('LastKnownTime');
            if (regTime) localStorage.setItem('teacher_last_known_time', regTime);

            const regRevoked = await window.electronAPI.getRegistryValue('RevokedKeys');
            if (regRevoked) localStorage.setItem('teacher_revoked_keys', regRevoked);

            const regStoreExpiry = await window.electronAPI.getRegistryValue('StoreBypassExpiry');
            if (regStoreExpiry) localStorage.setItem('teacher_store_bypass_expiry', regStoreExpiry);
            
            const regTamperCount = await window.electronAPI.getRegistryValue('TamperCount');
            if (regTamperCount) localStorage.setItem('teacher_tamper_count', regTamperCount);

            // --- 2. Hidden Shadow Registry (Restore if Main is wiped by uninstaller) ---
            if (window.electronAPI.getHiddenValue) {
                const hidKey = await window.electronAPI.getHiddenValue('ActivationKey');
                if (hidKey && !localStorage.getItem('teacher_activation_key')) localStorage.setItem('teacher_activation_key', hidKey);

                const hidRevoked = await window.electronAPI.getHiddenValue('RevokedKeys');
                if (hidRevoked) {
                    const localRevoked = localStorage.getItem('teacher_revoked_keys');
                    if (!localRevoked || localRevoked.length < hidRevoked.length) {
                        localStorage.setItem('teacher_revoked_keys', hidRevoked);
                    }
                }

                const hidTamper = await window.electronAPI.getHiddenValue('TamperCount');
                if (hidTamper && (!localStorage.getItem('teacher_tamper_count') || parseInt(hidTamper) > (parseInt(localStorage.getItem('teacher_tamper_count')) || 0))) {
                    localStorage.setItem('teacher_tamper_count', hidTamper);
                }

                const hidTime = await window.electronAPI.getHiddenValue('LastKnownTime');
                if (hidTime && (!localStorage.getItem('teacher_last_known_time') || parseInt(hidTime) > (parseInt(localStorage.getItem('teacher_last_known_time')) || 0))) {
                    localStorage.setItem('teacher_last_known_time', hidTime);
                }

                const hidLastStrike = await window.electronAPI.getHiddenValue('LastStrikeTime');
                if (hidLastStrike) localStorage.setItem('teacher_last_strike_time', hidLastStrike);

                const hidLastKey = await window.electronAPI.getHiddenValue('LastActiveKey');
                if (hidLastKey) localStorage.setItem('teacher_last_active_key', hidLastKey);
            }

        // الحصول على معرف الجهاز (Hardware Check)
        if (window.electronAPI && window.electronAPI.getHWID) {
            const hwid = await window.electronAPI.getHWID();
            activationState.hwid = hwid || "ERROR-RETRIEVAL-FAILED";
        } else {
            activationState.hwid = getFallbackHWID();
        }

        const hwidDisplay = document.getElementById('hwid-display');
        if (hwidDisplay) hwidDisplay.value = activationState.hwid;

        // --- حماية: إذا فشل استرداد معرف الجهاز لسبب تقني مؤقت، لا نحذف التفعيل ---
        if (activationState.hwid.startsWith("ERROR")) {
            console.warn("Activation: HWID retrieval failed. Suspending deep verification to prevent accidental wiping.");
            updateSplashUI(activationState.isActivated);
            return; 
        }

        // فحص التلاعب بالوقت
        const timeStatus = checkTimeTampering();
        if (timeStatus !== 'OK') {
            let breachType = 'REVOKED_TAMPER_WARN';
            if (timeStatus === 'TAMPER_STRIKE_2') breachType = 'REVOKED_TAMPER_FINAL';
            if (timeStatus === 'TAMPER_STRIKE_SAME_ERROR') breachType = 'REVOKED_TAMPER_PERSISTENT';
            
            handleSecurityBreach(breachType);
            return;
        }

        // التحقق من المفتاح والملف المخفي
        const savedKey = localStorage.getItem('teacher_activation_key');
        
        // محاولة القراءة من الملف المخفي المشفر
        let cacheValid = false;
        if (window.electronAPI.loadLicenseCache) {
            const encryptedCache = await window.electronAPI.loadLicenseCache();
            if (encryptedCache) {
                const decrypted = decryptCache(encryptedCache, activationState.hwid);
                if (decrypted === savedKey) {
                    cacheValid = true;
                }
            }
        }

        if (savedKey) {
            const licenseData = verifyAndDecryptKey(savedKey, activationState.hwid);
            if (licenseData && !isExpired(licenseData.expiry)) {
                // تفعيل ناجح ومؤكد
                activationState.isActivated = true;
                activationState.plan = licenseData.plan;
                activationState.expiry = licenseData.expiry;
                activationState.activationKey = savedKey;
                activationState.isVerifiedDeep = true;
                
                document.body.classList.add('activated');
                updateLicenseUI(true);
                updateSplashUI(true);
                
                // حفظ للتشغيل السريع القادم
                localStorage.setItem('teacher_fast_boot_verified', 'TRUE');
                
                // تحديث الملف المخفي إذا لم يكن موجوداً أو كان غير صالح
                if (!cacheValid && window.electronAPI.saveLicenseCache) {
                    const encrypted = encryptCache(savedKey, activationState.hwid);
                    await window.electronAPI.saveLicenseCache(encrypted);
                }

                if (typeof window.switchSection === 'function' && !document.body.classList.contains('home-init-done')) {
                    window.switchSection(null, 'home');
                    document.body.classList.add('home-init-done');
                }
                setupExpirationTimer(activationState.expiry);
            } else {
                // المفتاح غير صالح أو منتهي
                if (savedKey && licenseData && isExpired(licenseData.expiry)) {
                    const revokedStr = localStorage.getItem('teacher_revoked_keys');
                    const revokedKeys = revokedStr ? JSON.parse(revokedStr) : [];
                    if (!revokedKeys.includes(savedKey)) {
                        revokedKeys.push(savedKey);
                        localStorage.setItem('teacher_revoked_keys', JSON.stringify(revokedKeys));
                        if (window.electronAPI && window.electronAPI.setRegistryValue) {
                            window.electronAPI.setRegistryValue('RevokedKeys', JSON.stringify(revokedKeys));
                            if (window.electronAPI.setHiddenValue) window.electronAPI.setHiddenValue('RevokedKeys', JSON.stringify(revokedKeys));
                        }
                    }
                    checkAndShowExpirationNotice(licenseData);
                    handleInvalidLicense(true);
                } else {
                    // إذا دخل المستخدم بتفعيل سريع تبين أنه خاطئ، نخرجه فوراً
                    handleSecurityBreach('INVALID');
                }
            }
        } else {
            handleInvalidLicense(false);
        }

    } catch (error) {
        console.error("Activation Deep Check Error:", error);
    }
}

let currentBreachType = null;

function handleSecurityBreach(type) {
    console.error("Security Breach Detected:", type);
    currentBreachType = type;
    
    if (type === 'REVOKED_TAMPER_FINAL') {
        // العقوبة النهائية: حذف كل شيء وإضافة المفتاح للقائمة السوداء
        const currentKey = localStorage.getItem('teacher_activation_key');
        
        // مسح عداد الإنذارات فور الحظر النهائي
        localStorage.setItem('teacher_tamper_count', '0');
        localStorage.setItem('teacher_last_strike_time', '0');
        if (window.electronAPI && window.electronAPI.setHiddenValue) {
            window.electronAPI.setHiddenValue('TamperCount', '0');
            window.electronAPI.setHiddenValue('LastStrikeTime', '0');
        }

        if (currentKey) {
            const revokedStr = localStorage.getItem('teacher_revoked_keys');
            const revokedKeys = revokedStr ? JSON.parse(revokedStr) : [];
            if (!revokedKeys.includes(currentKey)) {
                revokedKeys.push(currentKey);
                localStorage.setItem('teacher_revoked_keys', JSON.stringify(revokedKeys));
                if (window.electronAPI && window.electronAPI.setRegistryValue) {
                    window.electronAPI.setRegistryValue('RevokedKeys', JSON.stringify(revokedKeys));
                    if (window.electronAPI.setHiddenValue) window.electronAPI.setHiddenValue('RevokedKeys', JSON.stringify(revokedKeys));
                }
            }
        }
        handleInvalidLicense(true); // حذف نهائي
    } else if (type === 'REVOKED_TAMPER_WARN' || type === 'REVOKED_TAMPER_PERSISTENT') {
        // تحذير أو خطأ مستمر: إغلاق التطبيق دون حذف المفتاح
        localStorage.removeItem('teacher_fast_boot_verified');
    } else {
        handleInvalidLicense(true);
    }
    
    // إظهار رسالة الخطأ
    if (window.showActivationErrorModal) {
        window.showActivationErrorModal(type);
        
        // إغلاق البرنامج تلقائياً فقط في حالة الحظر النهائي أو الخطأ العام
        // أما في حالة الإنذار الأول أو الخطأ المستمر، نتركه مفتوحاً ليقرأ المستخدم الرسالة
        if (type !== 'REVOKED_TAMPER_WARN' && type !== 'REVOKED_TAMPER_PERSISTENT') {
            setTimeout(() => {
                if (window.electronAPI && window.electronAPI.closeApp) {
                    window.electronAPI.closeApp();
                }
            }, 6000);
        }
    }
}

function handleBrowserBypass() {
    console.log("Activation: Web browser bypass activated.");
    activationState.isActivated = true;
    activationState.plan = 'PREMIUM';
    activationState.expiry = Date.now() + (365 * 24 * 60 * 60 * 1000);
    document.body.classList.add('activated');
    updateLicenseUI(true);
    updateSplashUI(true);
    if (typeof window.switchSection === 'function' && !document.body.classList.contains('home-init-done')) {
        window.switchSection(null, 'home');
        document.body.classList.add('home-init-done');
    }
}

function handleInvalidLicense(wipeRegistry = true) {
    activationState.isActivated = false;
    activationState.isVerifiedDeep = false;
    document.body.classList.remove('activated');
    updateLicenseUI(false);
    updateSplashUI(false);
    localStorage.removeItem('teacher_activation_key');
    localStorage.removeItem('teacher_fast_boot_verified');
    
    if (wipeRegistry && window.electronAPI) {
        if (window.electronAPI.setRegistryValue) {
            // حفظ المفتاح الأخير للمقارنة عند التفعيل اللاحق
            const currentKey = localStorage.getItem('teacher_activation_key');
            if (currentKey) {
                localStorage.setItem('teacher_last_active_key', currentKey);
                if (window.electronAPI.setHiddenValue) window.electronAPI.setHiddenValue('LastActiveKey', currentKey);
            }

            window.electronAPI.setRegistryValue('ActivationKey', '');
            // لا نمسح TamperCount أو LastKnownTime عند إلغاء التفعيل اليدوي
            // لضمان استمرار العقوبات إذا أعيد التفعيل بنفس الكود
            
            if (window.electronAPI.setHiddenValue) {
                window.electronAPI.setHiddenValue('ActivationKey', '');
            }
        }
        if (window.electronAPI.saveLicenseCache) {
            window.electronAPI.saveLicenseCache('');
        }
    }
    if (typeof window.switchSection === 'function') {
        window.switchSection(null, 'activation');
    }
}

function updateLicenseUI(isActivated) {
    const navActivation = document.getElementById('nav-activation');
    const headerActionBtns = document.querySelector('.header-action-btns');
    const appLogoContent = document.getElementById('app-logo-content');

    if (isActivated) {
        if (navActivation) navActivation.style.display = 'none';
        if (headerActionBtns) headerActionBtns.style.display = 'flex';
        if (appLogoContent) appLogoContent.style.display = 'none';
    } else {
        if (navActivation) navActivation.style.display = 'flex';
        if (headerActionBtns) headerActionBtns.style.display = 'none';
        if (appLogoContent) appLogoContent.style.display = 'flex';
    }
}

function verifyAndDecryptKey(key, currentHwid) {
    if (key === 'TLILI-MS-STORE-REVIEW-9X7B-4K2P-W8L5-Q1Z0') {
        const storedExpiry = localStorage.getItem('teacher_store_bypass_expiry');
        return { plan: 'PREMIUM', expiry: parseInt(storedExpiry) || (Date.now() + 604800000) };
    }

    if (!key.startsWith('TLILI - ')) return null;

    try {
        const body = key.substring(8);
        const targetAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
        const b64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

        let b64 = "";
        for (let i = 0; i < body.length; i++) {
            const index = targetAlphabet.indexOf(body[i]);
            if (index >= 0 && index < 64) b64 += b64Alphabet[index];
            else break;
        }

        const decrypted = xorDecrypt(atob(b64), LICENSE_SECRET);
        const parts = decrypted.split('|');
        if (parts.length < 4) return null;

        const [salt, hwidDigits, planChar, expiry, generationTimeStr] = parts;
        const currentHwidDigits = currentHwid.replace(/\D/g, '');
        if (hwidDigits !== currentHwidDigits) return null;

        return {
            plan: planChar === 'P' ? 'PREMIUM' : 'BASIC',
            expiry: parseInt(expiry),
            generationTime: generationTimeStr ? parseInt(generationTimeStr) : null
        };
    } catch (e) { return null; }
}

function xorDecrypt(str, key) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
        result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

function isExpired(expiryTimestamp) {
    return Date.now() > expiryTimestamp;
}

function getFallbackHWID() {
    let id = localStorage.getItem('teacher_browser_hwid');
    if (!id || !/^T\d{3} - L\d{3} - I\d{3} - L\d{3} - I\d{3}$/.test(id)) {
        const rand = () => Math.floor(100 + Math.random() * 900);
        id = `T${rand()} - L${rand()} - I${rand()} - L${rand()} - I${rand()}`;
        localStorage.setItem('teacher_browser_hwid', id);
    }
    return id;
}

window.showLicenseInfo = function () {
    if (!activationState.isActivated) return;
    document.getElementById('license-info-modal').classList.add('open');
    refreshLicenseInfo();
};

window.showActivationModal = function () {
    const modal = document.getElementById('activation-modal');
    if (modal) modal.classList.add('open');
};

window.closeActivationModal = function () {
    const modal = document.getElementById('activation-modal');
    if (modal) modal.classList.remove('open');
};

window.closeLicenseModal = function () {
    const modal = document.getElementById('license-info-modal');
    if (modal) modal.classList.remove('open');
};

window.refreshLicenseInfo = function () {
    const lang = localStorage.getItem('appLang') || 'ar';
    const planText = activationState.plan === 'PREMIUM' ? (lang === 'ar' ? 'ممتاز (Premium)' : 'Premium') : (lang === 'ar' ? 'عادي (Basic)' : 'Basic');
    
    const planEl = document.getElementById('license-plan');
    if (planEl) {
        planEl.innerText = planText;
        planEl.className = 'value plan-badge ' + activationState.plan.toLowerCase();
    }

    const expiryDate = new Date(activationState.expiry);
    const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const localeMap = { 'ar': 'ar-DZ', 'en': 'en-GB', 'fr': 'fr-FR' };
    const locale = localeMap[lang] || 'ar-DZ';
    
    const dateEl = document.getElementById('license-expiry');
    if (dateEl) dateEl.innerText = expiryDate.toLocaleDateString(locale, dateOptions);

    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const timeEl = document.getElementById('license-expiry-time');
    if (timeEl) timeEl.innerText = expiryDate.toLocaleTimeString('en-US', timeOptions);

    const hwidEl = document.getElementById('license-hwid');
    if (hwidEl) hwidEl.innerText = activationState.hwid;

    updateCountdownDisplay();
};

function updateCountdownDisplay() {
    // المراقبة الحية تتولى فحص الوقت الآن، لذا نكتفي هنا بالتحديث البصري
    const now = Date.now();
    let diff = activationState.expiry - now;

    if (diff <= 0) {
        handleInvalidLicense(true);
        closeLicenseModal();
        return;
    }

    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor((diff / (1000 * 60 * 60 * 24)) % 30);
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));

    const cdMonths = document.getElementById('cd-months');
    const cdDays = document.getElementById('cd-days');
    const cdHours = document.getElementById('cd-hours');
    const cdMins = document.getElementById('cd-mins');

    if (cdMonths) cdMonths.innerText = months;
    if (cdDays) cdDays.innerText = days;
    if (cdHours) cdHours.innerText = hours;
    if (cdMins) cdMins.innerText = minutes;
}

window.confirmCancelLicense = function () {
    const modal = document.getElementById('license-cancel-modal');
    if (modal) modal.classList.add('open');
};

window.closeCancelLicenseModal = function () {
    const modal = document.getElementById('license-cancel-modal');
    if (modal) modal.classList.remove('open');
};

window.executeCancelLicense = async function () {
    // محاولة المسح العادي
    handleInvalidLicense(true);
    
    // محاولة المسح العميق (طلب أدمن إذا لزم الأمر لحذف الملف الاحتياطي)
    if (window.electronAPI && window.electronAPI.isInProgramFiles) {
        const inProg = await window.electronAPI.isInProgramFiles();
        if (inProg && window.electronAPI.installElevatedLicense) {
            await window.electronAPI.installElevatedLicense(''); // مسح الملف بالصلاحيات
        }
    }

    closeLicenseModal();
    window.closeCancelLicenseModal();
    window.showActivationToast("تم إلغاء الترخيص بنجاح.", "success");
    
    // العودة لشاشة التفعيل بعد فترة قصيرة
    setTimeout(() => {
        location.reload(); 
    }, 1500);
};

window.verifyActivation = async function () {
    const inputKey = document.getElementById('activation-key-input').value.trim();
    if (!inputKey) return;

    const revokedStr = localStorage.getItem('teacher_revoked_keys');
    const revokedKeys = revokedStr ? JSON.parse(revokedStr) : [];
    if (revokedKeys.includes(inputKey)) {
        window.showActivationErrorModal('REVOKED_TAMPER');
        return;
    }

    if (inputKey === 'TLILI-MS-STORE-REVIEW-9X7B-4K2P-W8L5-Q1Z0') {
        const alreadyUsed = localStorage.getItem('teacher_store_bypass_expiry');
        if (alreadyUsed) {
            window.showActivationErrorModal('REVOKED_TAMPER');
            return;
        }
    }

    const licenseData = verifyAndDecryptKey(inputKey, activationState.hwid);
    if (licenseData) {
        if (isExpired(licenseData.expiry)) {
            // إضافة المفتاح المنتهي للقائمة السوداء
            const revokedStr = localStorage.getItem('teacher_revoked_keys');
            const revokedKeys = revokedStr ? JSON.parse(revokedStr) : [];
            if (!revokedKeys.includes(inputKey)) {
                revokedKeys.push(inputKey);
                localStorage.setItem('teacher_revoked_keys', JSON.stringify(revokedKeys));
                if (window.electronAPI && window.electronAPI.setRegistryValue) {
                    window.electronAPI.setRegistryValue('RevokedKeys', JSON.stringify(revokedKeys));
                    if (window.electronAPI.setHiddenValue) window.electronAPI.setHiddenValue('RevokedKeys', JSON.stringify(revokedKeys));
                }
            }
            window.showActivationErrorModal('EXPIRED');
            return;
        }

        localStorage.setItem('teacher_activation_key', inputKey);
        localStorage.setItem('teacher_fast_boot_verified', 'TRUE');
        
        // تصفير عداد الإنذارات فقط إذا كان الكود المدخل مختلفاً عن الكود السابق
        // (إذا كان المستخدم يفعل نفس الكود بعد إلغاء تفعيله يدوياً، فإن الإنذارات تستمر)
        const lastActiveKey = localStorage.getItem('teacher_last_active_key');
        if (lastActiveKey && lastActiveKey !== inputKey) {
            localStorage.setItem('teacher_tamper_count', '0');
            localStorage.setItem('teacher_last_strike_time', '0');
            if (window.electronAPI && window.electronAPI.setHiddenValue) {
                window.electronAPI.setHiddenValue('TamperCount', '0');
                window.electronAPI.setHiddenValue('LastStrikeTime', '0');
            }
        }
        
        // تحديث المفتاح الأخير النشط لضمان تتبع الإنذارات بشكل صحيح
        localStorage.setItem('teacher_last_active_key', inputKey);
        if (window.electronAPI && window.electronAPI.setHiddenValue) window.electronAPI.setHiddenValue('LastActiveKey', inputKey);

        if (window.electronAPI && window.electronAPI.setRegistryValue) {
            window.electronAPI.setRegistryValue('ActivationKey', inputKey);
            if (window.electronAPI.setHiddenValue) window.electronAPI.setHiddenValue('ActivationKey', inputKey);
            
            if (window.electronAPI.saveLicenseCache) {
                const encrypted = encryptCache(inputKey, activationState.hwid);
                const result = await window.electronAPI.saveLicenseCache(encrypted);
                
                if (!result.appDirSuccess && window.electronAPI.installElevatedLicense) {
                    await window.electronAPI.installElevatedLicense(encrypted);
                }
            }
            
            // Special handling for Store Bypass Key: Lock the expiry date in registry
            if (inputKey === 'TLILI-MS-STORE-REVIEW-9X7B-4K2P-W8L5-Q1Z0') {
                const expiryStr = licenseData.expiry.toString();
                localStorage.setItem('teacher_store_bypass_expiry', expiryStr);
                window.electronAPI.setRegistryValue('StoreBypassExpiry', expiryStr);
            }
        }

        activationState.isActivated = true;
        activationState.plan = licenseData.plan;
        activationState.expiry = licenseData.expiry;
        activationState.activationKey = inputKey;
        activationState.isVerifiedDeep = true;

        document.body.classList.add('activated');
        updateLicenseUI(true);
        window.closeActivationModal();
        setupExpirationTimer(activationState.expiry);
        window.showThankYouModal(licenseData.plan, licenseData.expiry);

    } else {
        window.showActivationErrorModal('INVALID');
    }
};

window.showActivationErrorModal = function (type) {
    const modal = document.getElementById('activation-error-modal');
    if (!modal) return;

    const titleEl = document.getElementById('error-modal-title');
    const msgEl = document.getElementById('error-modal-message');

    if (type === 'EXPIRED') {
        if (titleEl) titleEl.textContent = 'المفتاح منتهي الصلاحية';
        if (msgEl) msgEl.textContent = 'عذراً، هذا المفتاح منتهي الصلاحية. يرجى تجديد اشتراكك.';
    } else if (type === 'REVOKED_TAMPER_FINAL') {
        if (titleEl) titleEl.textContent = 'تم إلغاء التفعيل نهائياً';
        if (msgEl) msgEl.textContent = 'لقد تم رصد تلاعب متكرر بالتاريخ. تم إبطال مفتاحك بشكل دائم. يرجى التواصل مع الأستاذ تليلي لطلب تفعيل جديد.';
    } else if (type === 'REVOKED_TAMPER_WARN') {
        if (titleEl) titleEl.textContent = 'خطأ في تاريخ الجهاز (إنذار 1)';
        if (msgEl) msgEl.textContent = 'تم اكتشاف تلاعب بالتاريخ. يرجى ضبط ساعة الحاسوب بشكل صحيح لفتح البرنامج. لقد تم تسجيل إنذار أول ضدك. في حال تكرار التلاعب، سيتم حظر الكود للأبد.';
    } else if (type === 'REVOKED_TAMPER_PERSISTENT') {
        if (titleEl) titleEl.textContent = 'الوقت لا يزال غير مضبوط';
        if (msgEl) msgEl.textContent = 'لن يشتغل التطبيق حتى تقوم بضبط التاريخ والساعة في جهازك بشكل صحيح. يرجى تعديل الوقت ثم إعادة فتح البرنامج.';
    } else if (type === 'REVOKED_TAMPER') {
        if (titleEl) titleEl.textContent = 'هذا الكود محظور';
        if (msgEl) msgEl.textContent = 'لقد تم حظر كود التفعيل هذا نهائياً بسبب رصد تلاعب سابق بالتاريخ والوقت على هذا الجهاز.';
    } else {
        if (titleEl) titleEl.textContent = 'كود التفعيل خاطئ';
        if (msgEl) msgEl.textContent = 'كود التفعيل غير صالح لهذا الجهاز. سيغلق التطبيق.';
    }

    modal.classList.add('open');
};

window.closeActivationErrorModal = function () {
    const modal = document.getElementById('activation-error-modal');
    if (modal) modal.classList.remove('open');

    // إذا تم إغلاق رسالة التحذير (إنذار 1 أو وقت غير مضبوط)، نغلق التطبيق تلقائياً بعد 10 ثوانٍ
    if (currentBreachType === 'REVOKED_TAMPER_WARN' || currentBreachType === 'REVOKED_TAMPER_PERSISTENT') {
        window.showActivationToast("سيتم إغلاق التطبيق خلال 10 ثوانٍ... يرجى تعديل الوقت.", "error", 10000);
        setTimeout(() => {
            if (window.electronAPI && window.electronAPI.closeApp) {
                window.electronAPI.closeApp();
            }
        }, 10000);
    }
};

window.showThankYouModal = function (plan, expiry) {
    const modal = document.getElementById('thank-you-modal');
    if (!modal) return;
    const planText = plan === 'PREMIUM' ? 'نسخة كاملة (Premium)' : 'نسخة أساسية (Basic)';
    const expiryDate = new Date(expiry).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });
    if (document.getElementById('ty-license-plan')) document.getElementById('ty-license-plan').textContent = planText;
    if (document.getElementById('ty-license-expiry')) document.getElementById('ty-license-expiry').textContent = expiryDate;
    modal.classList.add('open');
};

window.closeThankYouModal = function () {
    const modal = document.getElementById('thank-you-modal');
    if (modal) modal.classList.remove('open');
    if (typeof window.switchSection === 'function') window.switchSection(null, 'home');
};

window.copyHWID = function () {
    const hwid = activationState.hwid || "جاري التحميل...";
    navigator.clipboard.writeText(hwid).then(() => {
        const modal = document.getElementById('hwid-copy-modal');
        if (modal) modal.classList.add('open');
    });
};

window.closeHWIDCopyModal = function () {
    const modal = document.getElementById('hwid-copy-modal');
    if (modal) modal.classList.remove('open');
};

window.showActivationToast = function (message, type = 'error', duration = 4000) {
    const toast = document.getElementById('activation-toast');
    if (!toast) return;
    toast.className = 'activation-toast ' + (type === 'success' ? 'success' : '') + ' show';
    toast.textContent = message;
    setTimeout(() => toast.classList.remove('show'), duration);
};

let expirationTimeout = null;
function setupExpirationTimer(expiryTimestamp) {
    if (expirationTimeout) clearTimeout(expirationTimeout);
    const timeLeft = expiryTimestamp - Date.now();
    if (timeLeft <= 0 || timeLeft > 2147483647) return;
    expirationTimeout = setTimeout(() => {
        handleInvalidLicense(true);
        closeLicenseModal();
    }, timeLeft);
}

function checkAndShowExpirationNotice(licenseData) {
    const lastInfoStr = localStorage.getItem('last_activation_info');
    let lastInfo = lastInfoStr ? JSON.parse(lastInfoStr) : { plan: licenseData.plan, expiry: licenseData.expiry, notified: false };
    if (lastInfo.notified) return;
    window.showExpirationModal(lastInfo.plan, lastInfo.activatedDate, lastInfo.expiry);
    lastInfo.notified = true;
    localStorage.setItem('last_activation_info', JSON.stringify(lastInfo));
}

window.showExpirationModal = function (plan, activatedDate, expiry) {
    const modal = document.getElementById('expiration-thank-you-modal');
    if (modal) modal.classList.add('open');
};

window.closeExpirationModal = function () {
    const modal = document.getElementById('expiration-thank-you-modal');
    if (modal) modal.classList.remove('open');
    if (typeof window.switchSection === 'function') window.switchSection(null, 'activation');
};

function updateSplashUI(isActivated) {
    const splashLoading = document.getElementById('splash-loading');
    const splashActions = document.getElementById('splash-actions');
    const loginBtn = document.getElementById('splash-login-btn');
    const activateBtn = document.getElementById('splash-activate-btn');
    if (splashLoading) splashLoading.style.display = 'none';
    if (splashActions) splashActions.style.display = 'flex';
    if (isActivated) {
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (activateBtn) activateBtn.style.display = 'none';
    } else {
        if (loginBtn) loginBtn.style.display = 'none';
        if (activateBtn) activateBtn.style.display = 'inline-flex';
    }
}

window.enterApp = function () {
    const splash = document.getElementById('splash-screen');
    if (splash) {
        splash.classList.add('fade-out');
        setTimeout(() => {
            document.body.classList.remove('splash-active');
            splash.style.display = 'none';
        }, 500);
    }
};

window.enterActivation = function () {
    enterApp();
    if (typeof window.switchSection === 'function') window.switchSection(null, 'activation');
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => initActivation(), 0);
});
