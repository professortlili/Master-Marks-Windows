// --- الحالة العامة للتطبيق (State) ---
const APP_VERSION = "1.3";
const GITHUB_REPO = "professortlili/Master-Marks";
let latestReleaseData = null;

/**
 * توحيد تنسيق التاريخ الحالي بناءً على اللغة
 * العربية: YYYY-MM-DD
 * غيرها: DD-MM-YYYY
 */
function getFormattedDate() {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

let allYearsData = {
    currentYear: '2025 / 2026',
    years: {
        '2025 / 2026': {
            teacherInfo: {
                name: '',
                school: '',
                subject: '',
                year: '',
                classesCount: 0,
                logo: null
            },
            classes: []
        }
    }
};

/**
 * توحيد تنسيق السنة الدراسية لتكون دائمًا (السنة الصغرى / السنة الكبرى)
 * مثال: "2026 / 2025" تصبح "2025 / 2026"
 */
function normalizeYear(yearStr) {
    if (!yearStr || typeof yearStr !== 'string') return yearStr;
    const parts = yearStr.split('/').map(p => p.trim());
    if (parts.length === 2) {
        const y1 = parseInt(parts[0]);
        const y2 = parseInt(parts[1]);
        if (!isNaN(y1) && !isNaN(y2)) {
            const min = Math.min(y1, y2);
            const max = Math.max(y1, y2);
            return `${min} / ${max}`;
        }
    }
    return yearStr;
}

/**
 * ترجمة اسم المادة بناءً على اللغة الحالية
 * @param {string} subjectName - اسم المادة بالعربية
 * @returns {string} - المادة المترجمة
 */
function getSubjectTranslation(subjectName) {
    if (!subjectName) return '---';
    const s = subjectName.trim();
    if (s === 'الرياضيات') return t('subject_math');
    if (s === 'اللغة العربية / التربية الاسلامية') return t('subject_arabic');
    if (s === 'اللغة الفرنسية') return t('subject_french');
    if (s === 'اللغة الانجليزية') return t('subject_english');
    if (s === 'علوم الطبيعة و الحياة') return t('subject_science');
    if (s === 'العلوم الفيزيائية') return t('subject_physics');
    if (s === 'التاريخ و الجغرافيا / التربية المدنية') return t('subject_history');
    if (s === 'المعلوماتية') return t('subject_it');
    if (s === 'التربية البدنية') return t('subject_pe');
    return subjectName; // Return original if not matched
}

const defaultAppreciations = [
    { min: 0, max: 7.99, text: 'عمل ناقص جدا' },
    { min: 8, max: 9.99, text: 'عمل ناقص' },
    { min: 10, max: 11.99, text: 'نتائج متوسطة' },
    { min: 12, max: 13.99, text: 'نتائج حسنة' },
    { min: 14, max: 15.99, text: 'نتائج جيدة' },
    { min: 16, max: 17.99, text: 'نتائج جيدة جدا' },
    { min: 18, max: 20, text: 'نتائج ممتازة' }
];

const defaultContinuousConfig = {
    discipline: [
        { label: 'السلوك', max: 2 },
        { label: 'الغياب و التأخر', max: 2 },
        { label: 'إحضار الأدوات', max: 2 },
        { label: 'تنظيم الكراس', max: 1 }
    ],
    inClass: [
        { label: 'المشاركة', max: 2 },
        { label: 'الاستجوابات', max: 3 },
        { label: 'الكتابة على السبورة', max: 2 }
    ],
    outClass: [
        { label: 'الواجبات المنزلية', max: 3 },
        { label: 'الواجبات الشهرية', max: 2 },
        { label: 'المبادرة', max: 1 }
    ]
};

let appState = JSON.parse(JSON.stringify(allYearsData.years[allYearsData.currentYear]));

// (حالة التفعيل تدار الآن عبر activation-system.js)

let isEditMode = false;
let currentTrimester = 1;
let currentActiveClassIndex = 0;
let studentSortConfig = { column: null, direction: 'asc' };
let gradingSortConfig = { column: null, direction: 'asc' };

// --- حالة الرقمنة (Digitization State) ---
let digitizationState = {
    workbook: null,
    sheets: {}, // { sheetName: { data: [[]], mapping: { appId: rowIndex } } }
    availableSheets: [],
    sheetMappings: {}, // { sheetName: classIdx } لحفظ الربط الذكي لكل صفحة
    originalFileName: ''
};

// --- Word Export Control ---
let currentWordExportData = { html: '', filename: '' };

let currentSectionToClear = null;

// --- عناصر واجهة المستخدم (DOM) ---
const views = {
    home: document.getElementById('home-section'),
    lists: document.getElementById('student-lists-section'),
    grading: document.getElementById('grading-section'),
    continuous: document.getElementById('continuous-section'),
    monitoring: document.getElementById('monitoring-section'),
    digitization: document.getElementById('digitization-section'),
    backup: document.getElementById('backup-section'),
    activation: document.getElementById('activation-section'),
    absences: document.getElementById('absences-section')
};

// --- حالة الغيابات (Absences State) ---
let currentAbsenceDate = new Date().toISOString().split('T')[0];
let calendarViewDate = new Date(); // التاريخ المعروض في التقويم (الشهر/السنة)

// ضبط التقويم على شهر جوان إذا كان الشهر الحالي جويلية أو أوت
if (calendarViewDate.getMonth() === 6 || calendarViewDate.getMonth() === 7) {
    calendarViewDate.setMonth(5); // 5 تعني جوان (0-indexed)
}

// --- الإعداد الأولي (Initialization) ---
window.addEventListener('languageChanged', () => {
    if (typeof renderCurrentView === 'function') {
        renderCurrentView();
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    // تحديث سنة حقوق النشر تلقائيا
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0 is Jan, 7 is Aug
    const academicYear = currentMonth >= 7 ? `${currentYear} - ${currentYear + 1}` : `${currentYear - 1} - ${currentYear}`;
    const copyrightEl = document.getElementById('splash-copyright-year');
    if (copyrightEl) copyrightEl.innerText = academicYear;

    const versionDisplay = document.getElementById('app-version-display');
    if (versionDisplay) versionDisplay.innerText = APP_VERSION;

    await loadAppState();
    // await initActivation(); // يتم تنفيذه الآن عبر activation-system.js
    initGlobalEvents();
    initClickSounds();
    initFullscreenLongPress();
    initDarkMode();
    initAppTheme(); // Initialize custom theme

    document.body.classList.add('on-home-page'); // Default to home page

    // Auto-collapse sidebar on mobile devices
    if (window.innerWidth <= 768) {
        document.body.classList.add('sidebar-collapsed');
    }

    renderAcademicYearDropdown();
    renderHomeInputs();
    applySubjectTheme(); // Apply theme on load
    if (appState.classes.length > 0) {
        initClassTabs();
    }

    if (typeof renderCurrentView === 'function') renderCurrentView();
});

function createEmptyGradingData() {
    return {
        t1: { monitoring: '', assignment: '', exam: '', continuousEval: 0, average: 0, score: 0, appreciation: '' },
        t2: { monitoring: '', assignment: '', exam: '', continuousEval: 0, average: 0, score: 0, appreciation: '' },
        t3: { monitoring: '', assignment: '', exam: '', continuousEval: 0, average: 0, score: 0, appreciation: '' }
    };
}

async function loadAppState() {
    let saved = null;

    // Try to load from file database first
    if (window.electronAPI && window.electronAPI.loadAppState) {
        saved = await window.electronAPI.loadAppState();
    }

    // Migration logic: if file is empty/missing but localStorage has data
    const localData = localStorage.getItem('teacherScorebookV2');
    if ((!saved || (saved.years === undefined && (!saved.classes || saved.classes.length === 0))) && localData) {
        console.log("Migrating data from localStorage or legacy format...");
        saved = JSON.parse(localData);
    }

    if (saved) {
        // Migration: Ensure all years are normalized to "Lower / Higher" format
        if (saved.years) {
            const normalizedYears = {};
            Object.keys(saved.years).forEach(y => {
                const normalizedKey = normalizeYear(y);
                // Deep copy each year as it's added to the normalized structure
                normalizedYears[normalizedKey] = JSON.parse(JSON.stringify(saved.years[y]));

                // Update internal year info to match its normalized key
                if (normalizedYears[normalizedKey].teacherInfo) {
                    normalizedYears[normalizedKey].teacherInfo.year = normalizedKey;
                }
            });
            saved.years = normalizedYears;
            saved.currentYear = normalizeYear(saved.currentYear);
            allYearsData = JSON.parse(JSON.stringify(saved)); // Deep copy the entire structure
        } else {
            // Migration from single year structure
            console.log("Migrating legacy single-year data to multi-year structure...");
            let yearName = normalizeYear(saved.teacherInfo?.year || '2025 / 2026');
            allYearsData.years = {};
            // Deep copy when migrating
            allYearsData.years[yearName] = JSON.parse(JSON.stringify(saved));
            allYearsData.currentYear = yearName;
            if (allYearsData.years[yearName].teacherInfo) {
                allYearsData.years[yearName].teacherInfo.year = yearName;
            }
        }

        // Ensure current year is valid
        if (!allYearsData.years[allYearsData.currentYear]) {
            const yearKeys = Object.keys(allYearsData.years);
            if (yearKeys.length > 0) {
                // Pick the latest year by sorting
                allYearsData.currentYear = yearKeys.sort().reverse()[0];
            } else {
                allYearsData.currentYear = '2025 / 2026';
                allYearsData.years[allYearsData.currentYear] = initNewYearState(allYearsData.currentYear);
            }
        }

        appState = JSON.parse(JSON.stringify(allYearsData.years[allYearsData.currentYear]));

        // Migration for the new combined subject name
        if (appState.teacherInfo.subject === 'اللغة العربية' || appState.teacherInfo.subject === 'التربية الاسلامية') {
            appState.classes.forEach(c => { if (!c.subject) c.subject = appState.teacherInfo.subject; });
            appState.teacherInfo.subject = 'اللغة العربية / التربية الاسلامية';
        }
        if (appState.teacherInfo.subject === 'التاريخ و الجغرافيا' || appState.teacherInfo.subject === 'التربية المدنية') {
            appState.classes.forEach(c => { if (!c.subject) c.subject = appState.teacherInfo.subject; });
            appState.teacherInfo.subject = 'التاريخ و الجغرافيا / التربية المدنية';
        }

        // --- Data Sanitization Pass ---
        let dataChanged = false;
        const allIds = new Set();

        appState.classes.forEach(cls => {
            if (!cls.students) cls.students = [];
            cls.students.forEach((s, idx) => {
                // 1. Ensure ID is a unique string
                const originalId = s.id ? s.id.toString() : null;
                if (!originalId || allIds.has(originalId)) {
                    s.id = "std_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                    dataChanged = true;
                    console.log(`Sanitization: Regenerated ID for student at index ${idx} in class ${cls.name} (Original: ${originalId})`);
                } else {
                    s.id = originalId;
                }
                allIds.add(s.id);

                // 2. Ensure data structures exist
                if (!s.monitoringData) { s.monitoringData = createEmptyMonitoringData(); dataChanged = true; }
                if (!s.continuousData) { s.continuousData = createEmptyContinuousData(); dataChanged = true; }
                if (!s.gradingData) { s.gradingData = createEmptyGradingData(); dataChanged = true; }
                if (!s.activeTrimesters) { s.activeTrimesters = [1, 2, 3]; dataChanged = true; }

                // 3. Ensure all trimester keys exist
                for (let t = 1; t <= 3; t++) {
                    const tk = 't' + t;
                    if (!s.monitoringData[tk]) {
                        s.monitoringData[tk] = { discipline: '', homework: ['', '', '', ''], monthly: ['', '', ''] };
                        dataChanged = true;
                    }
                    if (!s.continuousData[tk]) {
                        s.continuousData[tk] = { discipline: ['', '', '', ''], inClass: ['', '', ''], outClass: ['', '', ''] };
                        dataChanged = true;
                    }
                    if (!s.gradingData[tk]) {
                        s.gradingData[tk] = { monitoring: '', assignment: '', exam: '', continuousEval: 0, average: 0, score: 0, appreciation: '' };
                        dataChanged = true;
                    }
                    if (!s.absenceData) {
                        s.absenceData = createEmptyAbsenceData();
                        dataChanged = true;
                    }
                    if (!s.absenceData[tk]) {
                        s.absenceData[tk] = {};
                        dataChanged = true;
                    }
                }
            });
        });

        if (dataChanged) {
            console.log("Sanitization: Data structure was repaired. Saving state...");
            saveAppState(true);
        }

        // Initialize appreciations if missing
        if (!appState.appreciations) {
            appState.appreciations = JSON.parse(JSON.stringify(defaultAppreciations));
        }

        // Initialize continuousConfig if missing
        if (!appState.continuousConfig) {
            appState.continuousConfig = JSON.parse(JSON.stringify(defaultContinuousConfig));
        }

        if (document.getElementById('teacherName')) {
            document.getElementById('teacherName').value = appState.teacherInfo.name || '';
            document.getElementById('schoolName').value = appState.teacherInfo.school || '';
            document.getElementById('subjectName').value = appState.teacherInfo.subject || '';
            document.getElementById('classesCount').value = appState.teacherInfo.classesCount || 0;

            if (appState.teacherInfo.logo && typeof updateLogoPreview === 'function') {
                updateLogoPreview(appState.teacherInfo.logo);
            }

            updateDynamicCredit();
        }

        // Catch-up synchronization for existing data
        syncAllMonitoringToContinuous();
        syncAllContinuousToGrading();
    }
}

async function saveAppState(silent = false) {
    // Sync current appState back to allYearsData (using deep copy for independence)
    allYearsData.years[allYearsData.currentYear] = JSON.parse(JSON.stringify(appState));

    // 1. Save to Electron file-based DB
    if (window.electronAPI && window.electronAPI.saveAppState) {
        try {
            const result = await window.electronAPI.saveAppState(allYearsData);
            if (!result.success && !silent) {
                console.error("Save failed:", result.error);
                if (window.showActivationToast) {
                    window.showActivationToast('فشل في حفظ البيانات', 'error');
                }
            }
        } catch (err) {
            console.error("Electron save error:", err);
        }
    }

    // 2. Save to localStorage as backup
    localStorage.setItem('teacherScorebookV2', JSON.stringify(allYearsData));

    // 3. Apply theme if subject changed
    applySubjectTheme();

    // 4. Show success feedback if not silent
    if (!silent && window.showActivationToast) {
        window.showActivationToast('تم حفظ التغييرات بنجاح', 'success');
    }
}

window.applySubjectTheme = function () {
    const subject = appState.teacherInfo.subject;
    const body = document.body;

    // Remove existing themes
    const themeClasses = ['theme-math', 'theme-arabic', 'theme-science', 'theme-physics', 'theme-history', 'theme-french', 'theme-english', 'theme-tech', 'theme-sports'];
    body.classList.remove(...themeClasses);

    let icons = ['fa-graduation-cap', 'fa-book-open', 'fa-pen', 'fa-bell', 'fa-clock'];

    if (!subject) {
        // Keep default icons
    } else if (subject === 'الرياضيات') {
        body.classList.add('theme-math');
        icons = ['fa-calculator', 'fa-square-root-variable', 'fa-superscript', 'fa-divide', 'fa-percent', 'fa-ruler-combined'];
    } else if (subject === 'اللغة العربية / التربية الاسلامية') {
        body.classList.add('theme-arabic');
        icons = ['fa-book-quran', 'fa-mosque', 'fa-kaaba', 'fa-star-and-crescent', 'fa-pen-nib', 'fa-scroll'];
    } else if (subject === 'العلوم الفيزيائية') {
        body.classList.add('theme-physics');
        icons = ['fa-atom', 'fa-magnet', 'fa-bolt', 'fa-lightbulb', 'fa-temperature-half', 'fa-plug'];
    } else if (subject === 'علوم الطبيعة و الحياة') {
        body.classList.add('theme-science');
        icons = ['fa-flask', 'fa-microscope', 'fa-dna', 'fa-leaf', 'fa-bug', 'fa-seedling'];
    } else if (subject === 'التاريخ و الجغرافيا / التربية المدنية') {
        body.classList.add('theme-history');
        icons = ['fa-earth-africa', 'fa-map', 'fa-monument', 'fa-landmark', 'fa-compass', 'fa-building-columns'];
    } else if (subject === 'اللغة الفرنسية') {
        body.classList.add('theme-french');
        icons = ['fa-language', 'fa-comments', 'fa-book', 'fa-font', 'fa-spell-check', 'fa-quote-right'];
    } else if (subject === 'اللغة الانجليزية') {
        body.classList.add('theme-english');
        icons = ['fa-a', 'fa-language', 'fa-book-open', 'fa-pen-nib', 'fa-spell-check', 'fa-comment-dots'];
    } else if (subject === 'المعلوماتية') {
        body.classList.add('theme-tech');
        icons = ['fa-laptop-code', 'fa-server', 'fa-network-wired', 'fa-microchip', 'fa-desktop', 'fa-keyboard'];
    } else if (subject === 'التربية البدنية') {
        body.classList.add('theme-sports');
        icons = ['fa-futbol', 'fa-basketball', 'fa-person-running', 'fa-volleyball', 'fa-table-tennis-paddle-ball', 'fa-stopwatch'];
    }

    renderSubjectDecorations(icons);
};

function renderSubjectDecorations(icons) {
    const sidebarDecorations = document.getElementById('sidebar-decorations');

    if (!sidebarDecorations) return;

    let sidebarHtml = '';

    // Shuffle icons to ensure variety
    const shuffledIcons = [...icons].sort(() => Math.random() - 0.5);

    // Zigzag layout: Use each icon once (up to available icons)
    const sidebarPositions = [];
    const sbRows = Math.min(shuffledIcons.length, 8); // Limit to unique icons available

    for (let r = 0; r < sbRows; r++) {
        const rowBase = (r * (100 / sbRows));

        const topOffset = rowBase + (Math.random() * 5) + 2;
        const isLeft = r % 2 === 0;
        const leftOffset = isLeft ? (2 + Math.random() * 10) : (50 + Math.random() * 10);

        const size = 4.0 + Math.random() * 3.0; // Larger icons
        const rot = Math.random() * 360;

        sidebarPositions.push({
            top: topOffset,
            left: leftOffset,
            size: size,
            rot: rot,
            icon: shuffledIcons[r] // Assign unique icon here
        });
    }

    sidebarPositions.forEach((pos) => {
        sidebarHtml += `<i class="fas ${pos.icon} decoration-icon" style="top: ${pos.top}%; left: ${pos.left}%; font-size: ${pos.size}rem; transform: rotate(${pos.rot}deg);"></i>`;
    });

    sidebarDecorations.innerHTML = sidebarHtml;

    // Create a horizontal ZigZag grid for header cards
    const headerDecorations = document.querySelectorAll('.header-decorations');
    if (headerDecorations.length > 0) {
        let headerHtml = '';
        const hdrCols = 6;
        for (let c = 0; c < hdrCols; c++) {
            const colBase = c * (100 / hdrCols);

            // Zigzag logic: alternate top and bottom vertical offsets
            const isTop = c % 2 === 0;
            const topOffset = isTop ? (8 + Math.random() * 12) : (55 + Math.random() * 12);
            const leftOffset = colBase + (Math.random() * 8) + 2;

            const size = 3.5 + Math.random() * 1.5; // Slightly varied size
            const rot = Math.random() * 360;

            const iconIdx = c % icons.length;
            const icon = icons[iconIdx];
            headerHtml += `<i class="fas ${icon} decoration-icon" style="top: ${topOffset}%; left: ${leftOffset}%; font-size: ${size}rem; transform: rotate(${rot}deg);"></i>`;
        }

        headerDecorations.forEach(container => {
            container.innerHTML = headerHtml;
        });
    }
}

function initNewYearState(yearName) {
    // Create a completely INDEPENDENT new year state - only carry over non-class-specific info
    // This ensures that groups (classes) are NEVER shared between academic years
    const info = {
        name: appState.teacherInfo.name || '',
        school: appState.teacherInfo.school || '',
        subject: appState.teacherInfo.subject || '',
        year: yearName,
        classesCount: 0, // Always start new year with 0 classes - no inheritance
        logo: appState.teacherInfo.logo || null
    };

    return {
        teacherInfo: info,
        classes: [],  // Always empty - each year manages its own groups independently
        appreciations: JSON.parse(JSON.stringify(defaultAppreciations)),
        continuousConfig: JSON.parse(JSON.stringify(defaultContinuousConfig))
    };
}

function renderAcademicYearDropdown() {
    const select = document.getElementById('academicYear');
    if (!select) return;

    select.innerHTML = '';
    Object.keys(allYearsData.years).sort().reverse().forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === allYearsData.currentYear) option.selected = true;
        select.appendChild(option);
    });
}

window.switchAcademicYear = function (yearName) {
    if (!allYearsData.years[yearName]) return;
    if (yearName === allYearsData.currentYear) return; // Already on this year

    // Sync DOM state into appState BEFORE saving to prevent stale data
    // This ensures classesCount in DOM matches what gets saved for the current year
    const domClassesCount = parseInt(document.getElementById('classesCount')?.value) || 0;
    if (domClassesCount !== appState.teacherInfo.classesCount) {
        // DOM has unsaved classesCount changes - sync to appState before saving
        appState.teacherInfo.classesCount = domClassesCount;
        // Trim or extend classes array to match DOM count
        if (domClassesCount < appState.classes.length) {
            appState.classes = appState.classes.slice(0, domClassesCount);
        }
    }

    // Save current year with a complete deep copy to ensure full independence
    allYearsData.years[allYearsData.currentYear] = JSON.parse(JSON.stringify(appState));

    // Switch to target year
    allYearsData.currentYear = yearName;

    // Load target year state with a complete deep copy to ensure full independence
    appState = JSON.parse(JSON.stringify(allYearsData.years[yearName]));

    // Verify appState is truly independent (sanity check)
    console.log(`[YearSwitch] Switched to ${yearName}: ${appState.classes.length} groups, classesCount=${appState.teacherInfo.classesCount}`);

    // Refresh UI - set flag to prevent subjectName handler from creating unwanted groups
    _isLoadingYear = true;
    renderHomeInputs();
    renderAcademicYearDropdown();
    _isLoadingYear = false;

    currentActiveClassIndex = 0;

    // Reset specific submenus if open
    initSidebarSubmenu('lists');
    initClassTabs();
    applySubjectTheme(); // Re-apply theme for new year

    saveAppState(true); // Silent save
};

window.addNewYear = function () {
    const modal = document.getElementById('add-year-modal');
    if (modal) {
        document.getElementById('new-year-input').value = '';
        modal.classList.add('open');
    }
};

window.closeAddYearModal = function () {
    const modal = document.getElementById('add-year-modal');
    if (modal) modal.classList.remove('open');
};

window.confirmAddYear = function () {
    let yearName = document.getElementById('new-year-input').value;
    if (!yearName || yearName.trim() === '') return;

    yearName = normalizeYear(yearName.trim());

    if (allYearsData.years[yearName]) {
        if (window.showActivationToast) {
            window.showActivationToast('هذه السنة الدراسية موجودة بالفعل!', 'error');
        } else {
            alert('هذه السنة الدراسية موجودة بالفعل!');
        }
        return;
    }

    allYearsData.years[yearName] = initNewYearState(yearName);
    switchAcademicYear(yearName);
    closeAddYearModal();

    // Show green toast notification in bottom-left for success
    if (window.showActivationToast) {
        const successMsg = window.t ? window.t('msg_year_added') : "تم إضافة السنة الدراسية بنجاح";
        window.showActivationToast(successMsg, 'success'); // 'success' type is green
    }
};

window.deleteCurrentYear = function () {
    const yearsCount = Object.keys(allYearsData.years).length;
    if (yearsCount <= 1) {
        if (window.showActivationToast) {
            window.showActivationToast('لا يمكن حذف السنة الدراسية الوحيدة!', 'error');
        } else {
            alert('لا يمكن حذف السنة الدراسية الوحيدة!');
        }
        return;
    }

    const modal = document.getElementById('delete-year-modal');
    if (modal) {
        const messageEl = document.getElementById('delete-year-message');
        if (messageEl) {
            messageEl.innerHTML = `هل أنت متأكد من حذف السنة الدراسية "${allYearsData.currentYear}"؟<br>سيتم حذف جميع البيانات المتعلقة بها نهائياً.`;
        }
        modal.classList.add('open');
    }
};

window.closeDeleteYearModal = function () {
    const modal = document.getElementById('delete-year-modal');
    if (modal) modal.classList.remove('open');
};

window.confirmDeleteYear = function () {
    try {
        const yearToDelete = allYearsData.currentYear;
        const yearsKeys = Object.keys(allYearsData.years);

        if (yearsKeys.length <= 1) {
            // Cannot delete last year
            const msg = (window.t ? window.t('error_last_year') : "لا يمكن حذف السنة الدراسية الوحيدة المتبقية");
            if (window.showActivationToast) window.showActivationToast(msg, 'error');
            closeDeleteYearModal();
            return;
        }

        // --- Step 1: Clear appState completely to prevent any memory leaks ---
        // This ensures no reference to the deleted year's data remains active
        appState = {
            teacherInfo: { name: '', school: '', subject: '', year: '', classesCount: 0, logo: null },
            classes: [],
            appreciations: JSON.parse(JSON.stringify(defaultAppreciations)),
            continuousConfig: JSON.parse(JSON.stringify(defaultContinuousConfig))
        };

        // --- Step 2: Remove the year from allYearsData completely ---
        delete allYearsData.years[yearToDelete];

        // Verify deletion was successful
        if (allYearsData.years[yearToDelete] !== undefined) {
            console.error('[DeleteYear] Failed to delete year from allYearsData!');
        }

        // --- Step 3: Pick the best remaining year (prefer the most recent one) ---
        const remainingYears = Object.keys(allYearsData.years).sort().reverse();
        allYearsData.currentYear = remainingYears[0];

        // --- Step 4: Load the replacement year with a deep copy (guaranteed independence) ---
        appState = JSON.parse(JSON.stringify(allYearsData.years[allYearsData.currentYear]));

        console.log(`[DeleteYear] Deleted "${yearToDelete}". Now on "${allYearsData.currentYear}" with ${appState.classes.length} groups.`);

        // --- Step 5: Refresh UI safely (prevent subject handler from touching classes) ---
        _isLoadingYear = true;
        if (typeof renderHomeInputs === 'function') renderHomeInputs();
        if (typeof renderAcademicYearDropdown === 'function') renderAcademicYearDropdown();
        _isLoadingYear = false;

        currentActiveClassIndex = 0;
        currentTrimester = 1; // Reset trimester to first on year deletion

        // Reset specific submenus if open
        if (typeof initSidebarSubmenu === 'function') initSidebarSubmenu('lists');
        if (typeof initClassTabs === 'function') initClassTabs();
        if (typeof applySubjectTheme === 'function') applySubjectTheme();
        if (typeof renderCurrentView === 'function') renderCurrentView();

        // --- Step 6: Save the updated state (without the deleted year) ---
        saveAppState();
        closeDeleteYearModal();

        // Show notification with the deleted year name (5s for readability)
        if (window.showActivationToast) {
            const deletedMsg = `🗑️ تم حذف السنة الدراسية "${yearToDelete}" نهائياً`;
            window.showActivationToast(deletedMsg, 'error', 5000);
        }
    } catch (err) {
        console.error("Error during year deletion:", err);
        closeDeleteYearModal();
    }
};


function syncAllContinuousToGrading() {
    appState.classes.forEach((cls) => {
        cls.students.forEach((student) => {
            if (!student.gradingData) student.gradingData = createEmptyGradingData();
        });
    });
}

function syncAllMonitoringToContinuous() {
    if (!appState || !appState.classes) return;
    appState.classes.forEach(cls => {
        cls.students.forEach(student => {
            if (!student.monitoringData) student.monitoringData = createEmptyMonitoringData();
            for (let trim = 1; trim <= 3; trim++) {
                const trimKey = `t${trim}`;
                const data = student.monitoringData[trimKey];
                if (data) {
                    // Sync Homework
                    if (data.homework) {
                        const total = parseFloat(data.homework[0]) || 0;
                        const done = parseFloat(data.homework[1]) || 0;
                        if (data.homework[0] !== '') {
                            data.homework[2] = Math.max(0, total - done);
                            let mark = 0;
                            const config = appState.continuousConfig || defaultContinuousConfig;
                            const hwMax = config.outClass[0].max;
                            if (total > 0) mark = (done / total) * hwMax;
                            data.homework[3] = parseFloat(mark.toFixed(2));
                            syncMonitoringToContinuous(student, trimKey, 'homework', data.homework[3]);
                        }
                    }
                    // Sync Monthly
                    if (data.monthly) {
                        const ass1 = parseFloat(data.monthly[0]) || 0;
                        const ass2 = parseFloat(data.monthly[1]) || 0;
                        data.monthly[2] = ass1 + ass2;
                        syncMonitoringToContinuous(student, trimKey, 'monthly', data.monthly[2]);
                    }
                }
            }
        });
    });
}

function getContinuousTotal(student, trimKey) {
    if (!student.continuousData || !student.continuousData[trimKey]) return 0;
    const data = student.continuousData[trimKey];
    const disciplineSum = (data.discipline || []).reduce((a, b) => a + (parseFloat(b) || 0), 0);
    const inClassSum = (data.inClass || []).reduce((a, b) => a + (parseFloat(b) || 0), 0);
    const outClassSum = (data.outClass || []).reduce((a, b) => a + (parseFloat(b) || 0), 0);
    return parseFloat((disciplineSum + inClassSum + outClassSum).toFixed(2));
}

/**
 * يحسب علامة "الغياب و التأخر" تلقائياً بناءً على عدد الغيابات في الفصل.
 * - أقل من 3 غيابات  → العلامة الكاملة (max)
 * - من 3 إلى 6 غيابات → نصف العلامة (max / 2)
 * - أكثر من 6 غيابات  → صفر (0)
 */
function getAutoAbsenceScore(student, trimKey) {
    const config = appState.continuousConfig || defaultContinuousConfig;
    const maxScore = config.discipline[1].max; // الحد الأقصى لعلامة "الغياب و التأخر"

    const absenceData = student.absenceData && student.absenceData[trimKey];
    const absenceCount = absenceData ? Object.keys(absenceData).length : 0;

    if (absenceCount < 3) return maxScore;
    if (absenceCount <= 6) return parseFloat((maxScore / 2).toFixed(2));
    return 0;
}

// --- نظام التنقل (Navigation) ---
window.switchSection = function (e, sectionId) {
    // التحقق من التفعيل قبل التبديل
    if (!activationState.isActivated && sectionId !== 'activation') {
        showActivationToast();
        return;
    }

    if (e) {
        // e.preventDefault(); // الأزرار القياسية لا تحتاج لهذا، ولكنها ممارسة جيدة
    }

    // تحديث واجهة أزرار التنقل
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    // Track active page for decorations
    document.body.classList.toggle('on-home-page', sectionId === 'home');

    // إذا تم توفير حدث الضغط، نستخدم currentTarget، وإلا نعتمد على sectionId
    if (e && e.currentTarget) {
        e.currentTarget.classList.add('active');
    }

    Object.values(views).forEach(el => {
        if (el) el.classList.remove('active-section');
    });

    const targetSection = document.getElementById(sectionId + '-section');
    if (targetSection) targetSection.classList.add('active-section');

    // تحديد الفصل التلقائي بناءً على تاريخ الجهاز عند اختيار هذه الأقسام
    if (['student-lists', 'absences', 'monitoring', 'continuous', 'grading'].includes(sectionId)) {
        const currentMonth = new Date().getMonth() + 1;
        if ([9, 10, 11, 12].includes(currentMonth)) {
            currentTrimester = 1;
        } else if ([1, 2, 3].includes(currentMonth)) {
            currentTrimester = 2;
        } else if ([4, 5, 6, 7, 8].includes(currentMonth)) {
            currentTrimester = 3;
        }
        
        // تحديث جميع أزرار اختيار الفصل
        const containers = document.querySelectorAll('.trimester-tabs-container, .trimester-select-grid');
        containers.forEach(container => {
            Array.from(container.children).forEach((btn, idx) => {
                if (idx + 1 === currentTrimester) btn.classList.add('active-trim');
                else btn.classList.remove('active-trim');
            });
        });
    }

    // التحكم في القوائم الفرعية (Submenus)
    const submenuIds = ['continuous-submenu', 'monitoring-submenu', 'grading-submenu', 'lists-submenu', 'absences-submenu'];
    const targetSubmenuId = (sectionId === 'student-lists' ? 'lists' : sectionId) + '-submenu';

    submenuIds.forEach(id => {
        const submenu = document.getElementById(id);
        if (!submenu) return;

        if (id === targetSubmenuId) {
            // إذا ضغطنا على القائمة الظاهرة حالياً، نقوم بإخفاءها/إظهارها
            const isCurrentlyHidden = submenu.classList.contains('hidden');
            submenu.classList.toggle('hidden', !isCurrentlyHidden);

            if (isCurrentlyHidden) {
                initSidebarSubmenu(sectionId === 'student-lists' ? 'lists' : sectionId);
            }
        } else {
            // إغلاق كل القوائم الفرعية الأخرى
            submenu.classList.add('hidden');
        }
    });

    // إعادة ضبط وضع التعديل عند تبديل الأقسام
    if (sectionId !== 'student-lists' && sectionId !== 'grading') {
        isEditMode = false;
    }

    renderCurrentView();
};

window.toggleEditMode = function () {
    isEditMode = !isEditMode;
    
    // When exiting edit mode (saving), cleanup empty students from the current class
    if (!isEditMode) {
        const cls = appState.classes[currentActiveClassIndex];
        if (cls && cls.students) {
            cls.students = cls.students.filter(s => 
                (s.surname && s.surname.trim() !== '') || 
                (s.name && s.name.trim() !== '') || 
                (s.dob && s.dob.trim() !== '')
            );
        }
    }

    // When exiting edit mode, we show the success toast
    saveAppState(isEditMode); // Silent if entering edit mode, verbose if exiting
    renderCurrentView();
};

window.switchTrimester = function (trim) {
    currentTrimester = trim;

    // تحديث جميع حاويات الفصول (الفصل والسنة الدراسية)
    const containers = document.querySelectorAll('.trimester-tabs-container, .trimester-select-grid');
    containers.forEach(container => {
        Array.from(container.children).forEach((btn, idx) => {
            if (idx + 1 === trim) btn.classList.add('active-trim');
            else btn.classList.remove('active-trim');
        });
    });

    renderCurrentView();
};

function initSidebarSubmenu(sectionId) {
    let listId = 'sidebar-class-list';
    if (sectionId === 'monitoring') listId = 'sidebar-monitoring-class-list';
    if (sectionId === 'grading') listId = 'sidebar-grading-class-list';
    if (sectionId === 'lists') listId = 'sidebar-lists-class-list';
    if (sectionId === 'absences') listId = 'sidebar-absences-class-list';

    const classList = document.getElementById(listId);
    if (!classList) return;

    classList.innerHTML = '';
    appState.classes.forEach((cls, index) => {
        const li = document.createElement('li');
        li.className = index === currentActiveClassIndex ? 'active' : '';

        // Append subject name for specific subjects
        const specialSubjects = ['اللغة العربية', 'التربية الاسلامية', 'التاريخ و الجغرافيا', 'التربية المدنية'];
        const displaySubject = specialSubjects.includes(cls.subject) ? ` - ${cls.subject}` : '';
        li.textContent = `${cls.name}${displaySubject}`;

        li.onclick = () => {
            currentActiveClassIndex = index;
            Array.from(classList.children).forEach((el, i) => {
                el.classList.toggle('active', i === index);
            });
            renderCurrentView();
        };
        classList.appendChild(li);
    });

    // Dynamically widen sidebar if any class has a dual subject name appended
    const hasDualSubject = appState.classes.some(cls => {
        const specialSubjects = ['اللغة العربية', 'التربية الاسلامية', 'التاريخ و الجغرافيا', 'التربية المدنية'];
        return specialSubjects.includes(cls.subject);
    });
    document.body.classList.toggle('sidebar-wide', hasDualSubject);

    // التأكد من تنشيط الفصل الصحيح في القائمة الفرعية
    let submenuId = 'continuous-submenu';
    if (sectionId === 'monitoring') submenuId = 'monitoring-submenu';
    if (sectionId === 'grading') submenuId = 'grading-submenu';
    if (sectionId === 'lists') submenuId = 'lists-submenu';
    if (sectionId === 'absences') submenuId = 'absences-submenu';

    const trimBtns = document.querySelectorAll(`#${submenuId} .trimester-select-grid .sub-btn`);
    trimBtns.forEach((btn, idx) => {
        btn.classList.toggle('active-trim', idx + 1 === currentTrimester);
    });
}

// --- وظائف مساعدة (Helpers) ---
// Flag to prevent subjectName handler from modifying classes during year loading
let _isLoadingYear = false;

function initGlobalEvents() {
    document.getElementById('classesCount').addEventListener('input', (e) => {
        const count = parseInt(e.target.value) || 0;
        if (count < 0) return;
        renderClassInputs(count);
    });

    // Listen for both change and input to ensure updates happen on manual selection and automatic triggers
    ['change', 'input'].forEach(evt => {
        document.getElementById('subjectName').addEventListener(evt, () => {
            const subject = document.getElementById('subjectName').value;
            const count = parseInt(document.getElementById('classesCount').value) || 0;

            // Update subject in state
            appState.teacherInfo.subject = subject;

            // CRITICAL: Do NOT modify appState.classes during year loading.
            // This prevents the subject handler from accidentally creating or
            // overwriting groups that belong to the year being loaded.
            if (_isLoadingYear) {
                // Only re-render, do not touch appState.classes
                renderClassInputs(count);
                if (typeof applySubjectTheme === 'function') applySubjectTheme();
                return;
            }

            for (let i = 0; i < count; i++) {
                // Only update EXISTING classes - do NOT create new ones here.
                // New classes are created ONLY via executeSaveConfiguration.
                if (!appState.classes[i]) continue;

                const c = appState.classes[i];
                const classInput = document.getElementById(`class-input-${i}`);
                const classSubjectSelect = document.getElementById(`class-subject-${i}`);

                // Priority: UI Value > State Value
                const currentName = classInput ? classInput.value : (c.name || '');
                const currentSubject = classSubjectSelect ? classSubjectSelect.value : subject;

                // Calculate and sync
                const newCoeff = getCoeffForClass(currentSubject, currentName);
                c.name = currentName;
                c.coefficient = newCoeff;
                c.subject = currentSubject;
            }

            // Re-render class inputs to reflect new coefficients and possible subject selectors
            renderClassInputs(count);
            if (typeof applySubjectTheme === 'function') applySubjectTheme();
        })
    });

    // Track sidebar hover state
    const sidebar = document.querySelector('.sidebar');
    let isSidebarHovered = false;
    if (sidebar) {
        sidebar.addEventListener('mouseenter', () => isSidebarHovered = true);
        sidebar.addEventListener('mouseleave', () => isSidebarHovered = false);
    }

    // Close submenus on scroll ONLY if not hovering sidebar
    window.addEventListener('scroll', () => {
        if (!isSidebarHovered) {
            closeAllSubmenus();
        }
    }, { passive: true });

    // إغلاق نافذة الإحصائيات عند الضغط خارجها
    const statsModal = document.getElementById('stats-modal');
    if (statsModal) {
        statsModal.addEventListener('click', (e) => {
            if (e.target === statsModal) {
                closeStatsModal();
            }
        });
    }
}

// --- نظام ملئ الشاشة بالضغط المطول (ثانيتين) ---
let fullscreenTimer = null;

function initFullscreenLongPress() {
    const toggleBtns = ['sidebar-toggle', 'floating-sidebar-toggle'];

    toggleBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;

        const start = (e) => {
            // منع السلوك الافتراضي للمس لتجنب القائمة المنبثقة
            if (e.type === 'touchstart') e.preventDefault();

            fullscreenTimer = setTimeout(toggleAppFullscreen, 2000);

            // إضافة تأثير بصري بسيط للضغط المطول (اختياري)
            btn.style.opacity = '0.7';
        };

        const cancel = () => {
            if (fullscreenTimer) {
                clearTimeout(fullscreenTimer);
                fullscreenTimer = null;
            }
            btn.style.opacity = '1';
        };

        // أحداث الفأرة
        btn.addEventListener('mousedown', start);
        btn.addEventListener('mouseup', cancel);
        btn.addEventListener('mouseleave', cancel);

        // أحداث اللمس
        btn.addEventListener('touchstart', start, { passive: false });
        btn.addEventListener('touchend', cancel);
    });
}

async function toggleAppFullscreen() {
    if (window.electronAPI && window.electronAPI.toggleFullScreen) {
        try {
            const isNowFullscreen = await window.electronAPI.toggleFullScreen();
            document.body.classList.toggle('fullscreen-app-mode', isNowFullscreen);

            if (window.showActivationToast) {
                window.showActivationToast(
                    isNowFullscreen ? t('toast_fullscreen_enter') : t('toast_fullscreen_exit'),
                    'success'
                );
            }
        } catch (err) {
            console.error("Fullscreen toggle error:", err);
        }
    }
}

function closeAllSubmenus() {
    document.querySelectorAll('.sidebar-submenu').forEach(el => {
        el.classList.add('hidden');
    });
}

// --- Dark Mode Logic ---
function initDarkMode() {
    const isDark = localStorage.getItem('teacherAppDarkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon(true);
    }
}

window.toggleDarkMode = function () {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('teacherAppDarkMode', isDark);
    updateDarkModeIcon(isDark);
};

function updateDarkModeIcon(isDark) {
    const btn = document.getElementById('dark-mode-toggle');
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
    btn.title = isDark ? t('day_mode') : t('title_dark_mode');
}


function renderHomeInputs() {
    if (document.getElementById('teacherName')) {
        document.getElementById('teacherName').value = appState.teacherInfo.name;
        document.getElementById('schoolName').value = appState.teacherInfo.school;
        document.getElementById('subjectName').value = appState.teacherInfo.subject;
        document.getElementById('academicYear').value = appState.teacherInfo.year;
        document.getElementById('classesCount').value = appState.teacherInfo.classesCount;

        // Trigger subject input listener
        const subjectInput = document.getElementById('subjectName');
        if (subjectInput) {
            subjectInput.dispatchEvent(new Event('change'));
            subjectInput.dispatchEvent(new Event('input'));
        }

        updateDynamicCredit();
        renderClassInputs(appState.teacherInfo.classesCount);
    }
}

function updateDynamicCredit() {
    const el = document.getElementById('dynamic-credit-footer');
    if (el) {
        const currentYear = new Date().getFullYear();
        el.textContent = `الأستاذ تليلي محمد لمين (π) ${t('copyright_notice')} - ${currentYear}`;
    }
}

function renderClassInputs(count) {
    const container = document.getElementById('classes-config-container');
    const grid = document.getElementById('classes-inputs-grid');
    grid.innerHTML = '';

    const subject = document.getElementById('subjectName').value;
    let isDualSubject = false;
    let subjects = [];

    if (subject === 'اللغة العربية / التربية الاسلامية') {
        isDualSubject = true;
        subjects = ['اللغة العربية', 'التربية الاسلامية'];
    } else if (subject === 'التاريخ و الجغرافيا / التربية المدنية') {
        isDualSubject = true;
        subjects = ['التاريخ و الجغرافيا', 'التربية المدنية'];
    }

    if (count > 0) {
        container.style.display = 'block';
        for (let i = 0; i < count; i++) {
            const existingClass = appState.classes[i] || {};
            const wrapper = document.createElement('div');
            wrapper.className = 'form-group';

            let subjectSelector = '';
            if (isDualSubject) {
                const currentClassSubject = existingClass.subject || subjects[0];
                let options = '';
                subjects.forEach(s => {
                    options += `<option value="${s}" ${currentClassSubject === s ? 'selected' : ''}>${s}</option>`;
                });
                subjectSelector = `
                    <select id="class-subject-${i}" onchange="handleClassInput(document.getElementById('class-input-${i}'), ${i})">
                        ${options}
                    </select>
                `;
            }

            wrapper.innerHTML = `
                <label>${t('home_class_title_1')}${i + 1}${t('home_class_title_2')}</label>
                <div class="class-row-inputs">
                    <input type="text" id="class-input-${i}" placeholder="${currentLang === 'ar' ? `1م${i + 1}` : `1M${i + 1}`}" 
                           value="${existingClass.name || ''}" 
                           oninput="handleClassInput(this, ${i})"
                           title="${t('title_class_name')}">
                    ${subjectSelector}
                    <input type="number" value="${existingClass.coefficient || 1}" 
                           id="coeff-input-${i}"
                           title="${t('title_coefficient')}">
                </div>
            `;
            grid.appendChild(wrapper);
        }
    } else {
        container.style.display = 'none';
    }
}

const subjectCoefficients = {
    'اللغة العربية': { '1م': 2, '2م': 3, '3م': 3, '4م': 5 },
    'اللغة الفرنسية': { '1م': 1, '2م': 2, '3م': 2, '4م': 3 },
    'اللغة الانجليزية': { '1م': 1, '2م': 1, '3م': 1, '4م': 2 },
    'الرياضيات': { '1م': 2, '2م': 3, '3م': 3, '4م': 4 },
    'علوم الطبيعة و الحياة': { '1م': 1, '2م': 2, '3م': 2, '4م': 2 },
    'العلوم الفيزيائية': { '1م': 1, '2م': 2, '3م': 2, '4م': 2 },
    'التربية الاسلامية': { '1م': 1, '2م': 1, '3م': 1, '4م': 2 },
    'التاريخ و الجغرافيا': { '1م': 2, '2م': 2, '3م': 2, '4م': 3 },
    'التربية المدنية': { '1م': 1, '2م': 1, '3م': 1, '4م': 1 },
    'المعلوماتية': { '1م': 1, '2م': 1, '3م': 1, '4م': 1 },
    'التربية البدنية': { '1م': 1, '2م': 1, '3م': 1, '4م': 1 }
};

function getCoeffForClass(subject, className) {
    if (!subject || !className) return 1;

    // Normalize: remove all whitespace for better matching
    const normalizedName = className.replace(/\s+/g, '');

    // Find the level (1م, 2م, 3م, 4م) - Support standard "1م" and full "1 متوسط"
    let level = '';
    if (normalizedName.includes('1م') || normalizedName.includes('1متوسط') || normalizedName.includes('1M') || normalizedName.includes('1m')) level = '1م';
    else if (normalizedName.includes('2م') || normalizedName.includes('2متوسط') || normalizedName.includes('2M') || normalizedName.includes('2m')) level = '2م';
    else if (normalizedName.includes('3م') || normalizedName.includes('3متوسط') || normalizedName.includes('3M') || normalizedName.includes('3m')) level = '3م';
    else if (normalizedName.includes('4م') || normalizedName.includes('4متوسط') || normalizedName.includes('4M') || normalizedName.includes('4m')) level = '4م';

    if (!level) return 1;

    // Find the matching subject in the mapping (loose match)
    const matchingSubject = Object.keys(subjectCoefficients).find(s =>
        subject.includes(s) || s.includes(subject)
    );

    if (matchingSubject && subjectCoefficients[matchingSubject][level]) {
        return subjectCoefficients[matchingSubject][level];
    }

    return 1; // Default
}

window.handleClassInput = function (input, index) {
    const val = input.value;
    const classSpecificSubject = document.getElementById(`class-subject-${index}`);
    const subject = classSpecificSubject ? classSpecificSubject.value : document.getElementById('subjectName').value;
    const coeffInput = document.getElementById(`coeff-input-${index}`);

    const coeff = getCoeffForClass(subject, val);
    coeffInput.value = coeff;

    // Update state
    if (appState.classes[index]) {
        appState.classes[index].name = val;
        appState.classes[index].coefficient = coeff;
        if (classSpecificSubject) appState.classes[index].subject = classSpecificSubject.value;
    }
};

window.saveConfiguration = function () {
    // Open Confirmation Modal
    const modal = document.getElementById('save-settings-modal');
    if (modal) modal.classList.add('open');
};

window.closeSaveSettingsModal = function () {
    const modal = document.getElementById('save-settings-modal');
    if (modal) modal.classList.remove('open');
};

window.executeSaveConfiguration = function () {
    appState.teacherInfo.name = document.getElementById('teacherName').value;
    appState.teacherInfo.school = document.getElementById('schoolName').value;
    appState.teacherInfo.subject = document.getElementById('subjectName').value;
    appState.teacherInfo.year = document.getElementById('academicYear').value;
    appState.teacherInfo.classesCount = parseInt(document.getElementById('classesCount').value) || 0;

    const newClasses = [];
    const inputs = document.querySelectorAll('#classes-inputs-grid input[id^="class-input-"]');

    inputs.forEach((input, index) => {
        const name = input.value;
        const coeff = parseInt(document.getElementById(`coeff-input-${index}`).value) || 1;
        const subject = document.getElementById(`class-subject-${index}`)?.value || appState.teacherInfo.subject;

        const existingClass = appState.classes[index];
        const students = existingClass ? JSON.parse(JSON.stringify(existingClass.students)) : initEmptyStudents(35);

        newClasses.push({
            id: `class_${index}`,
            name: name || `الفوج التربوي ${index + 1}`,
            coefficient: coeff,
            subject: subject,
            students: students
        });
    });

    appState.classes = newClasses;

    // Ensure the year field matches the actual current year (prevent cross-contamination)
    appState.teacherInfo.year = allYearsData.currentYear;

    // Update allYearsData immediately to keep them in sync
    allYearsData.years[allYearsData.currentYear] = JSON.parse(JSON.stringify(appState));

    saveAppState();
    closeSaveSettingsModal();

    // Refresh UI - use flag to prevent subjectName handler from overwriting freshly saved classes
    _isLoadingYear = true;
    renderHomeInputs();
    _isLoadingYear = false;
};

window.handleLogoUpload = function (input) {
    const file = input.files[0];
    if (!file) return;

    // Validate size (e.g. max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('حجم الملف كبير جداً. يرجى اختيار صورة أقل من 2 ميجابايت.');
        input.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const base64 = e.target.result;
        appState.teacherInfo.logo = base64;
        updateLogoPreview(base64);
        // We don't save automatically, user must click Save Settings
    };
    reader.readAsDataURL(file);
};

window.removeTeacherLogo = function () {
    appState.teacherInfo.logo = null;
    updateLogoPreview(null);
    document.getElementById('teacher-logo-input').value = '';
};

function updateLogoPreview(base64) {
    const img = document.getElementById('teacher-logo-preview');
    const placeholder = document.getElementById('upload-placeholder');
    const box = document.getElementById('logo-preview-box');
    const removeBtn = document.getElementById('remove-logo-btn');

    if (base64) {
        img.src = base64;
        img.classList.remove('hidden');
        placeholder.style.display = 'none';
        box.classList.add('has-image');
        if (removeBtn) removeBtn.classList.remove('hidden');
    } else {
        img.src = '';
        img.classList.add('hidden');
        placeholder.style.display = 'flex';
        box.classList.remove('has-image');
        if (removeBtn) removeBtn.classList.add('hidden');
    }
}

function initEmptyStudents(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
        arr.push(createEmptyStudent());
    }
    return arr;
}

function createEmptyStudent() {
    return {
        id: "std_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
        surname: '',
        name: '',
        dob: '',
        monitoringData: createEmptyMonitoringData(),
        continuousData: createEmptyContinuousData(),
        gradingData: createEmptyGradingData(),
        absenceData: createEmptyAbsenceData(),
        activeTrimesters: [1, 2, 3]
    };
}

function createEmptyGradingData() {
    return {
        t1: { continuous: '', assignment: '', monitoring: '', exam: '', average: '', product: '', appreciation: '' },
        t2: { continuous: '', assignment: '', monitoring: '', exam: '', average: '', product: '', appreciation: '' },
        t3: { continuous: '', assignment: '', monitoring: '', exam: '', average: '', product: '', appreciation: '' }
    };
}

function createEmptyAbsenceData() {
    return {
        t1: {},
        t2: {},
        t3: {}
    };
}

function createEmptyContinuousData() {
    return {
        t1: { discipline: ['', '', '', ''], inClass: ['', '', ''], outClass: ['', '', ''] },
        t2: { discipline: ['', '', '', ''], inClass: ['', '', ''], outClass: ['', '', ''] },
        t3: { discipline: ['', '', '', ''], inClass: ['', '', ''], outClass: ['', '', ''] }
    };
}

function createEmptyMonitoringData() {
    return {
        t1: { discipline: '', homework: ['', '', '', ''], monthly: ['', '', ''] },
        t2: { discipline: '', homework: ['', '', '', ''], monthly: ['', '', ''] },
        t3: { discipline: '', homework: ['', '', '', ''], monthly: ['', '', ''] }
    };
}


// --- منطق تبويبات الأقسام (Class Tabs logic) ---
currentActiveClassIndex = 0;

function initClassTabs(sectionStr) {
    if (appState.classes.length === 0) return;

    let targetTabsId = 'student-list-tabs';
    if (sectionStr === 'grading') targetTabsId = 'grading-tabs';
    if (sectionStr === 'monitoring') targetTabsId = 'monitoring-class-tabs';
    if (sectionStr === 'continuous') targetTabsId = 'continuous-tabs';

    if (!sectionStr) {
        initClassTabs('student-lists');
        initClassTabs('grading');
        initClassTabs('monitoring');
        initClassTabs('continuous');
        return;
    }

    if (!container) return;

    container.innerHTML = '';
    appState.classes.forEach((cls, index) => {
        const btn = document.createElement('button');
        btn.className = `tab-btn ${index === currentActiveClassIndex ? 'active' : ''}`;
        btn.textContent = cls.name;
        btn.onclick = () => {
            currentActiveClassIndex = index;
            updateActiveTabUI(container, index);
            renderCurrentView();
        };
        container.appendChild(btn);
    });

    renderCurrentView();
}

function updateActiveTabUI(container, activeIndex) {
    Array.from(container.children).forEach((btn, idx) => {
        if (idx === activeIndex) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

function populateHeaderInfo() {
    const containers = [
        document.getElementById('teacher-info-header'),
        document.getElementById('teacher-info-header-monitoring'),
        document.getElementById('teacher-info-header-grading'),
        document.getElementById('teacher-info-header-lists'),
        document.getElementById('teacher-info-header-absences'),
        document.getElementById('teacher-info-header-comparison')
    ];

    const info = appState.teacherInfo;
    const currentClass = appState.classes[currentActiveClassIndex] || { name: '---', students: [] };

    //Propagation Count: حساب عدد التلاميذ النشطين في الفصل الحالي فقط
    const studentCount = currentClass.students ? currentClass.students.filter(s =>
        !s.activeTrimesters || s.activeTrimesters.includes(currentTrimester)
    ).length : 0;

    containers.forEach(container => {
        if (!container) return;

        container.innerHTML = `
            <div class="info-item">
                <span class="info-label">${t('header_teacher')}</span>
                <span class="info-value">${info.name || '---'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">${t('header_school')}</span>
                <span class="info-value">${info.school || '---'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">${t('header_subject')}</span>
                <span class="info-value">${getSubjectTranslation(currentClass.subject || info.subject)}</span>
            </div>
            <div class="info-item">
                <span class="info-label">${t('header_coefficient')}</span>
                <span class="info-value">${currentClass.coefficient || 1}</span>
            </div>
            <div class="info-item">
                <span class="info-label">${t('header_group')}</span>
                <span class="info-value"><bdi dir="${currentLang === 'ar' ? 'rtl' : 'ltr'}">${currentClass.name}</bdi></span>
            </div>
            <div class="info-item">
                <span class="info-label">${t('header_students_count')}</span>
                <span class="info-value">${studentCount}</span>
            </div>
            <div class="info-item">
                <span class="info-label">${t('header_term')}</span>
                <span class="info-value">${currentTrimester}</span>
            </div>
            <div class="info-item">
                <span class="info-label">${t('header_academic_year')}</span>
                <span class="info-value"><bdi dir="${currentLang === 'ar' ? 'rtl' : 'ltr'}">${info.year || '---'}</bdi></span>
            </div>
        `;
    });
}

function renderCurrentView() {
    const activeSection = document.querySelector('.active-section');
    if (!activeSection) return;

    if (activeSection.id === 'student-lists-section') {
        populateHeaderInfo();
        renderStudentListTable();
    } else if (activeSection.id === 'grading-section') {
        populateHeaderInfo();
        renderGradingTable();
    } else if (activeSection.id === 'monitoring-section') {
        populateHeaderInfo();
        renderMonitoringTable();
    } else if (activeSection.id === 'continuous-section') {
        populateHeaderInfo();
        renderContinuousTable();
    } else if (activeSection.id === 'digitization-section') {
        renderDigitizationSheet();
    } else if (activeSection.id === 'absences-section') {
        populateHeaderInfo();
        renderAbsencesSection();
    }
}


// --- الإجراءات: قوائم التلاميذ (Student List Actions) ---

window.handleTablePaste = function (event, type) {
    const pasteData = (event.clipboardData || window.clipboardData).getData('text');
    if (!pasteData) return;

    // Split into lines (rows) and then by tabs (columns)
    let rows = pasteData.split(/\r?\n/);
    // Remove the last empty row if it exists (very common when copying from Excel/Sheets)
    if (rows.length > 0 && rows[rows.length - 1].trim() === "") {
        rows.pop();
    }

    if (rows.length === 0) return;

    // Check if it's a multi-cell paste (either multiple rows or multiple tabs in any row)
    const isMultiCell = rows.length > 1 || rows[0].includes('\t');
    if (!isMultiCell) return; // Let standard paste handle single cell

    event.preventDefault();
    const target = event.target;
    const studentId = target.dataset.studentId;
    const startField = target.dataset.field;
    const startSubIndex = target.dataset.subIndex !== undefined ? parseInt(target.dataset.subIndex) : 0;

    const cls = appState.classes[currentActiveClassIndex];
    if (!cls) return;

    const trimKey = `t${currentTrimester}`;

    // Get the filtered list of students that matches the visible rows in the current view
    const visibleStudents = cls.students.filter(s =>
        (type === 'lists')
            ? (s.activeTrimesters.includes(currentTrimester) || isEditMode)
            : (((s.surname && s.surname.trim()) || (s.name && s.name.trim())) && s.activeTrimesters.includes(currentTrimester))
    );

    const startStudentVisibleIdx = visibleStudents.findIndex(s => s.id == studentId);
    if (startStudentVisibleIdx === -1) return;

    // Define field sequences for each table type to allow horizontal flow
    const sequences = {
        'continuous': [
            { field: 'discipline', sub: 0 }, { field: 'discipline', sub: 1 }, { field: 'discipline', sub: 2 }, { field: 'discipline', sub: 3 },
            { field: 'inClass', sub: 0 }, { field: 'inClass', sub: 1 }, { field: 'inClass', sub: 2 },
            { field: 'outClass', sub: 0 }, { field: 'outClass', sub: 1 }, { field: 'outClass', sub: 2 }
        ],
        'monitoring': [
            { field: 'discipline', sub: 0 },
            { field: 'homework', sub: 0 }, { field: 'homework', sub: 1 }, { field: 'homework', sub: 2 }, { field: 'homework', sub: 3 },
            { field: 'monthly', sub: 0 }, { field: 'monthly', sub: 1 }, { field: 'monthly', sub: 2 }
        ],
        'grading': [
            { field: 'continuous' }, { field: 'assignment' }, { field: 'monitoring' }, { field: 'exam' }
        ],
        'lists': [
            { field: 'surname' }, { field: 'name' }, { field: 'dob' }
        ]
    };

    const sequence = sequences[type] || [];

    // Find starting point in the sequence
    let startSeqIdx = sequence.findIndex(item =>
        item.field === startField && (item.sub === undefined || item.sub === startSubIndex)
    );
    if (startSeqIdx === -1) startSeqIdx = 0;

    rows.forEach((row, r) => {
        let pastedHwTotal = null;
        const currentVisibleIdx = startStudentVisibleIdx + r;
        
        // --- Requirement: Add new rows if not enough students ---
        if (type === 'lists' && currentVisibleIdx >= visibleStudents.length) {
            const newStudent = createEmptyStudent();
            // Start participation from current trimester to 3
            newStudent.activeTrimesters = [];
            for (let i = currentTrimester; i <= 3; i++) {
                newStudent.activeTrimesters.push(i);
            }
            cls.students.push(newStudent);
            visibleStudents.push(newStudent);
        }

        if (currentVisibleIdx >= visibleStudents.length) return;
        const student = visibleStudents[currentVisibleIdx];

        const cols = row.split('\t');
        cols.forEach((cellVal, c) => {
            const seqIdx = startSeqIdx + c;
            if (seqIdx >= sequence.length) return;

            let item = sequence[seqIdx];
            let val = cellVal.trim();
            if (type !== 'lists') val = val.replace(',', '.'); // Normalize decimal separator for marks

            // --- تتبع إذا كان اللصق يستهدف عمود "الإجمالي" لضمان المزامنة الجماعية لاحقاً ---
            if (type === 'monitoring' && item.field === 'homework' && item.sub === 0) {
                pastedHwTotal = val;
            }

            // Update Data Structure
            if (type === 'lists') {
                // Special handling for DOB normalization
                if (item.field === 'dob') {
                    student.dob = normalizeDate(val);
                } else {
                    student[item.field] = val;
                }

                // --- Requirement: Copy to next trimester, don't update previous one ---
                // This ensures the student is active in current and all future trimesters
                for (let i = currentTrimester; i <= 3; i++) {
                    if (!student.activeTrimesters.includes(i)) {
                        student.activeTrimesters.push(i);
                    }
                }

            } else if (type === 'continuous') {
                if (!student.continuousData) student.continuousData = createEmptyContinuousData();
                if (!student.continuousData[trimKey]) student.continuousData[trimKey] = { discipline: ['', '', '', ''], inClass: ['', '', ''], outClass: ['', '', ''] };
                student.continuousData[trimKey][item.field][item.sub] = val;
            } else if (type === 'monitoring') {
                if (!student.monitoringData) student.monitoringData = createEmptyMonitoringData();
                if (!student.monitoringData[trimKey]) student.monitoringData[trimKey] = { discipline: '', homework: ['', '', '', ''], monthly: ['', '', ''] };

                if (item.field === 'discipline') {
                    student.monitoringData[trimKey].discipline = val;
                } else if (item.field === 'homework') {
                    student.monitoringData[trimKey].homework[item.sub] = val;
                } else if (item.field === 'monthly') {
                    student.monitoringData[trimKey].monthly[item.sub] = val;
                }
            } else if (type === 'grading') {
                if (!student.gradingData) student.gradingData = createEmptyGradingData();
                student.gradingData[trimKey][item.field] = val;
            }
        });

        // After updating all columns for this student, trigger specific logic/recalculations
        if (type === 'monitoring') {
            const data = student.monitoringData[trimKey];
            // Recalculate Homework
            const hTotal = parseFloat(data.homework[0]) || 0;
            const hDone = parseFloat(data.homework[1]) || 0;
            const hNotDone = Math.max(0, hTotal - hDone);
            data.homework[2] = hNotDone;
            let hMark = 0;
            if (hTotal > 0) hMark = (hDone / hTotal) * 3;
            data.homework[3] = parseFloat(hMark.toFixed(2));

            // Recalculate Monthly
            const m1 = parseFloat(data.monthly[0]) || 0;
            const m2 = parseFloat(data.monthly[1]) || 0;
            data.monthly[2] = m1 + m2;

            // Sync to continuous
            syncMonitoringToContinuous(student, trimKey, 'homework', hMark);
            syncMonitoringToContinuous(student, trimKey, 'monthly', data.monthly[2]);

            // --- منطق حفظ واسترجاع النماذج المخصصة ---
            // --- ميزة إضافية: إذا المزيج الملصق يحتوي على "الإجمالي"، يتم تعميمه على الجميع ---
            if (pastedHwTotal !== null) {
                const totalVal = pastedHwTotal;
                cls.students.forEach(s => {
                    if (!s.monitoringData) s.monitoringData = createEmptyMonitoringData();
                    if (!s.monitoringData[trimKey]) s.monitoringData[trimKey] = { discipline: '', homework: ['', '', '', ''], monthly: ['', '', ''] };

                    s.monitoringData[trimKey].homework[0] = totalVal;

                    // إعادة الحساب لكل تلميذ
                    const t = parseFloat(totalVal) || 0;
                    const d = parseFloat(s.monitoringData[trimKey].homework[1]) || 0;
                    let nd = '';
                    let m = '';
                    if (totalVal !== '') {
                        nd = Math.max(0, t - d);
                        m = t > 0 ? parseFloat(((d / t) * 3).toFixed(2)) : 0;
                    }
                    s.monitoringData[trimKey].homework[2] = nd;
                    s.monitoringData[trimKey].homework[3] = m;
                    syncMonitoringToContinuous(s, trimKey, 'homework', m);
                });
            }
        } else if (type === 'grading') {
            calculateStudentGrades(student, cls.coefficient, trimKey);
        }
    });

    saveAppState();
    renderCurrentView();
};


function renderStudentListTable() {
    const currentClass = appState.classes[currentActiveClassIndex];
    if (!currentClass) return;

    const controlsContainer = document.querySelector('#student-lists-section .table-controls');
    controlsContainer.innerHTML = '';
    controlsContainer.style.display = 'flex';
    controlsContainer.style.flexWrap = 'wrap';
    controlsContainer.style.justifyContent = 'flex-start';
    controlsContainer.style.alignItems = 'center';
    controlsContainer.style.gap = '0.75rem';
    controlsContainer.style.marginBottom = '1.5rem';

    const leftGroup = document.createElement('div');
    leftGroup.style.display = 'flex';
    leftGroup.style.gap = '0.5rem';

    const rightGroup = document.createElement('div');
    rightGroup.style.display = 'flex';
    rightGroup.style.flexWrap = 'wrap';
    rightGroup.style.gap = '0.5rem';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = isEditMode ? 'btn btn-success btn-action' : 'btn btn-gradient-purple btn-action';
    toggleBtn.innerHTML = isEditMode ? `<i class="fas fa-save"></i> ${t('btn_save_data')}` : `<i class="fas fa-edit"></i> ${t('btn_edit_list')}`;
    toggleBtn.onclick = toggleEditMode;
    rightGroup.appendChild(toggleBtn);

    if (isEditMode) {
        const addBtn = document.createElement('button');
        addBtn.className = 'btn btn-gradient-purple btn-action';
        addBtn.innerHTML = `<i class="fas fa-plus"></i> ${t('btn_add_student')}`;
        addBtn.onclick = addStudentToCurrentList;
        rightGroup.appendChild(addBtn);

        const deleteAllBtn = document.createElement('button');
        deleteAllBtn.className = 'btn btn-danger btn-action';
        deleteAllBtn.innerHTML = `<i class="fas fa-trash"></i> ${t('btn_delete_all')}`;
        deleteAllBtn.onclick = deleteAllStudents;
        rightGroup.appendChild(deleteAllBtn);

        const importBtnLabel = document.createElement('label');
        importBtnLabel.className = 'btn btn-dark-success btn-action';
        importBtnLabel.innerHTML = `<i class="fas fa-file-import"></i> ${t('btn_import_excel')}`;
        importBtnLabel.style.cursor = 'pointer';

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.xlsx, .xls';
        fileInput.style.display = 'none';
        fileInput.onchange = handleFileUpload;
        importBtnLabel.appendChild(fileInput);
        rightGroup.appendChild(importBtnLabel);
    }



    const exportWordBtn = document.createElement('button');
    exportWordBtn.className = 'btn btn-secondary btn-action';
    exportWordBtn.style.backgroundColor = '#2b579a';
    exportWordBtn.style.color = 'white';
    exportWordBtn.innerHTML = `<i class="fas fa-file-word"></i> ${t('btn_export_word')}`;
    exportWordBtn.onclick = exportStudentListToWord;
    rightGroup.appendChild(exportWordBtn);

    controlsContainer.appendChild(rightGroup);
    controlsContainer.appendChild(leftGroup);

    const tbody = document.getElementById('student-list-body');
    tbody.innerHTML = '';

    // Clear and Update Sort Icons
    ['surname', 'name', 'dob'].forEach(col => {
        const iconContainer = document.getElementById(`sort-icon-${col}`);
        if (iconContainer) {
            iconContainer.innerHTML = '';
            if (studentSortConfig.column === col) {
                const isAsc = studentSortConfig.direction === 'asc';
                const isDob = col === 'dob';

                // User requirements: 
                // Name/Surname: ascend (A-Z) = down arrow, descend (Z-A) = up arrow
                // DOB: ascend (youngest to oldest) = up arrow, descend (oldest to youngest) = down arrow

                let iconClass = '';
                if (isDob) {
                    iconClass = isAsc ? 'fa-arrow-up' : 'fa-arrow-down';
                } else {
                    iconClass = isAsc ? 'fa-arrow-down' : 'fa-arrow-up';
                }

                iconContainer.innerHTML = `<i class="fas ${iconClass}" style="font-size: 0.8rem; margin-right: 5px;"></i>`;
            }
        }
    });

    const table = document.querySelector('.students-list-table');
    table.classList.remove('read-only-mode', 'edit-mode');
    table.classList.add(isEditMode ? 'edit-mode' : 'read-only-mode');

    const allStudents = currentClass.students;
    const filteredStudents = isEditMode ? allStudents : allStudents.filter(s => s.activeTrimesters.includes(currentTrimester));

    filteredStudents.forEach((student, index) => {
        // البحث عن الفهرس الأصلي في allStudents للحفاظ على التناسق
        const originalIndex = allStudents.indexOf(student);
        const tr = document.createElement('tr');
        if (isEditMode) {
            tr.classList.add('draggable-row');
            tr.draggable = true;
            tr.addEventListener('dragstart', handleDragStart);
            tr.addEventListener('dragover', handleDragOver);
            tr.addEventListener('drop', handleDrop);
            tr.dataset.index = originalIndex;
        }

        const isVisibleInCurrentTrim = student.activeTrimesters.includes(currentTrimester);

        // Format DOB based on language
        let displayDob = student.dob || '';
        let dobPlaceholder = "YYYY-MM-DD";
        if (typeof currentLang !== 'undefined' && (currentLang === 'en' || currentLang === 'fr')) {
            dobPlaceholder = "DD-MM-YYYY";
            if (displayDob) {
                const dateRegex = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/;
                const match = displayDob.match(dateRegex);
                if (match) {
                    displayDob = `${match[3].padStart(2, '0')}-${match[2].padStart(2, '0')}-${match[1]}`;
                }
            }
        }

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><input type="text" value="${student.surname}" ${!isEditMode ? 'readonly' : ''} oninput="updateStudentField(${currentActiveClassIndex}, '${student.id}', 'surname', this.value)" onpaste="handleTablePaste(event, 'lists')" data-student-id="${student.id}" data-field="surname"></td>
            <td><input type="text" value="${student.name}" ${!isEditMode ? 'readonly' : ''} oninput="updateStudentField(${currentActiveClassIndex}, '${student.id}', 'name', this.value)" onpaste="handleTablePaste(event, 'lists')" data-student-id="${student.id}" data-field="name"></td>
            <td><input type="text" value="${displayDob}" ${!isEditMode ? 'readonly' : ''} placeholder="${dobPlaceholder}" oninput="updateStudentField(${currentActiveClassIndex}, '${student.id}', 'dob', this.value)" onpaste="handleTablePaste(event, 'lists')" data-student-id="${student.id}" data-field="dob"></td>
            <td class="management-col" style="text-align:center;">
                <button class="btn btn-sm ${isVisibleInCurrentTrim ? 'btn-success' : 'btn-secondary'}" style="padding:0.5rem 0.6rem"
                        ${!isEditMode ? 'disabled' : ''} 
                        onclick="toggleStudentVisibility('${student.id}')"
                        title="إظهار/إخفاء في هذا الفصل">
                    <i class="fas ${isVisibleInCurrentTrim ? 'fa-eye' : 'fa-eye-slash'}"></i>
                </button>
            </td>
            <td class="management-col" style="text-align:center;">
                <button class="btn btn-danger" style="padding:0.5rem 0.6rem" onclick="deleteStudent(${currentActiveClassIndex}, '${student.id}')" title="${t('list_col_delete')}"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // تحديث أعداد التلاميذ في الهيدر فوراً
    populateHeaderInfo();
}

window.handleStudentSort = function (column) {
    if (!isEditMode) {
        const reminder = document.getElementById('student-list-reminder');
        if (reminder) {
            const span = reminder.querySelector('span');
            if (span) {
                if (column === 'surname') {
                    span.textContent = `${t('msg_sort_edit_reminder')} ${t('msg_sort_surname')}`;
                } else if (column === 'name') {
                    span.textContent = `${t('msg_sort_edit_reminder')} ${t('msg_sort_name')}`;
                } else if (column === 'dob') {
                    span.textContent = `${t('msg_sort_edit_reminder')} ${t('msg_sort_dob')}`;
                }
            }
            reminder.classList.add('show');
            setTimeout(() => {
                reminder.classList.remove('show');
            }, 3000);
        }
        return;
    }

    const currentClass = appState.classes[currentActiveClassIndex];
    if (!currentClass || !currentClass.students) return;

    if (studentSortConfig.column === column) {
        studentSortConfig.direction = (studentSortConfig.direction === 'asc') ? 'desc' : 'asc';
    } else {
        studentSortConfig.column = column;
        studentSortConfig.direction = 'asc';
    }

    const directionFactor = studentSortConfig.direction === 'asc' ? 1 : -1;

    currentClass.students.sort((a, b) => {
        if (column === 'dob') {
            const dateA = a.dob || '0000-00-00';
            const dateB = b.dob || '0000-00-00';

            // ASC (directionFactor=1): Youngest to Oldest (Desc date value: late date to early date)
            // DESC (directionFactor=-1): Oldest to Youngest (Asc date value: early date to late date)
            // So we compare dateB to dateA for ASC.
            let res = dateB.localeCompare(dateA);
            return res * directionFactor;
        } else {
            const valA = (a[column] || '').trim();
            const valB = (b[column] || '').trim();
            let res = valA.localeCompare(valB, 'ar', { sensitivity: 'base' });

            if (res === 0) {
                // Secondary sort: if column is surname, sort by name. If name, sort by surname.
                const secondaryCol = (column === 'surname') ? 'name' : 'surname';
                const sValA = (a[secondaryCol] || '').trim();
                const sValB = (b[secondaryCol] || '').trim();
                res = sValA.localeCompare(sValB, 'ar', { sensitivity: 'base' });
            }
            return res * directionFactor;
        }
    });

    saveAppState();
    renderStudentListTable();
};

window.toggleStudentVisibility = function (studentId) {
    const cls = appState.classes[currentActiveClassIndex];
    const student = cls.students.find(s => s.id == studentId);
    if (student) {
        if (!student.activeTrimesters) student.activeTrimesters = [1, 2, 3];

        const isCurrentlyActive = student.activeTrimesters.includes(currentTrimester);

        // قاعدة الانتشار: التطبيق على الفصل الحالي وجميع الفصول المستقبلية
        for (let i = currentTrimester; i <= 3; i++) {
            const idx = student.activeTrimesters.indexOf(i);
            if (isCurrentlyActive) {
                // كان نشطاً، الآن يتم إلغاء التنشيط لهذا الفصل والمستقبل
                if (idx > -1) student.activeTrimesters.splice(idx, 1);
            } else {
                // كان غير نشط، الآن يتم التنشيط لهذا الفصل والمستقبل
                if (idx === -1) student.activeTrimesters.push(i);
            }
        }

        saveAppState();
        renderStudentListTable();
    }
}


window.updateStudentField = function (classIndex, studentId, field, value) {
    const cls = appState.classes[classIndex];
    if (!cls) return;
    const student = cls.students.find(s => s.id == studentId);
    if (student) {
        let finalValue = value;
        // If the field is Date of Birth, try to reformat DD-MM-YYYY to YYYY-MM-DD
        if (field === 'dob' && value && value.trim() !== '') {
            // Regex matches: DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
            const dateRegex = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/;
            const match = value.match(dateRegex);

            if (match) {
                // match[1] = DD, match[2] = MM, match[3] = YYYY
                const d = match[1].padStart(2, '0');
                const m = match[2].padStart(2, '0');
                const y = match[3];
                finalValue = `${y}-${m}-${d}`;

                // Try to update the input field visually if we are in an event flow
                // By finding the specific input element
                setTimeout(() => {
                    const inputElement = document.querySelector(`input[data-student-id="${studentId}"][data-field="dob"]`);
                    let visualValue = finalValue;
                    if (typeof currentLang !== 'undefined' && (currentLang === 'en' || currentLang === 'fr')) {
                        visualValue = `${d}-${m}-${y}`;
                    }
                    if (inputElement && inputElement.value !== visualValue) {
                        inputElement.value = visualValue;
                    }
                }, 0);
            }
        }

        student[field] = finalValue;
        saveAppState(true); // Silent save while typing
    }
};

window.addStudentToCurrentList = function () {
    const cls = appState.classes[currentActiveClassIndex];
    if (cls) {
        const student = createEmptyStudent();
        // إذا تمت الإضافة في فصل متأخر، فهم لم يكونوا موجودين في الفصول السابقة
        student.activeTrimesters = [];
        for (let i = currentTrimester; i <= 3; i++) {
            student.activeTrimesters.push(i);
        }
        cls.students.push(student);
        saveAppState();
        renderStudentListTable();
        const tbody = document.getElementById('student-list-body');
        tbody.lastElementChild.scrollIntoView({ behavior: 'smooth' });
    }
};

window.deleteStudent = function (classIndex, studentId) {
    const cls = appState.classes[classIndex];
    if (cls) {
        cls.students = cls.students.filter(s => s.id != studentId);
        saveAppState();
        renderStudentListTable();
    }
};

window.deleteAllStudents = function () {
    const modal = document.getElementById('delete-students-modal');
    if (modal) modal.classList.add('open');
};

window.closeDeleteStudentsModal = function () {
    const modal = document.getElementById('delete-students-modal');
    if (modal) modal.classList.remove('open');
};

window.executeDeleteAllStudents = function () {
    const cls = appState.classes[currentActiveClassIndex];
    if (cls) {
        // إعادة ضبط القائمة إلى 35 تلميذ فارغ
        cls.students = initEmptyStudents(35);
        saveAppState(); // Not silent to show feedback toast
        renderStudentListTable();
        closeDeleteStudentsModal();
    }
};

// --- خاصية السحب والإفلات (DRAG AND DROP) ---
let dragSrcEl = null;
function handleDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    this.classList.add('dragging');
}
function handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; return false; }
function handleDrop(e) {
    e.stopPropagation();
    const dragIdx = parseInt(dragSrcEl.dataset.index);
    const dropIdx = parseInt(this.dataset.index);
    if (dragIdx !== dropIdx) {
        const cls = appState.classes[currentActiveClassIndex];
        const [movedItem] = cls.students.splice(dragIdx, 1);
        cls.students.splice(dropIdx, 0, movedItem);
        saveAppState();
        renderStudentListTable();
    }
    dragSrcEl.classList.remove('dragging');
    return false;
}

// --- استيراد ملفات إكسل (ExcelJS) ---
window.handleFileUpload = async function (e) {
    const file = e.target.files[0];
    if (!file) return;

    // Helper to extract scalar value from an ExcelJS cell
    function getCellText(cell) {
        let val = cell.value;
        if (val === null || val === undefined) return '';
        if (val instanceof Date) return val.toISOString().split('T')[0];
        if (typeof val === 'object') {
            if (val.richText) return val.richText.map(t => t.text).join('');
            if (val.result !== undefined) return val.result;
            if (val.formula) return val.result !== undefined ? val.result : '';
            if (val.error) return '';
        }
        return val;
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
            alert('لم يتم العثور على أوراق في الملف.');
            return;
        }

        const newStudents = [];
        worksheet.eachRow({ includeEmpty: false }, function (row) {
            const rawSurname = getCellText(row.getCell(1));
            const surname = rawSurname ? String(rawSurname).trim() : '';
            if (!surname) return;

            const rawName = getCellText(row.getCell(2));
            const rawDob  = getCellText(row.getCell(3));
            const dob = normalizeDate(rawDob !== '' ? rawDob : null);

            newStudents.push({
                id: Date.now() + Math.random(),
                surname: surname,
                name: rawName ? String(rawName).trim() : '',
                dob: dob,
                monitoringData: createEmptyMonitoringData(),
                continuousData: createEmptyContinuousData(),
                gradingData: createEmptyGradingData(),
                activeTrimesters: (function () {
                    const trimList = [];
                    for (let i = currentTrimester; i <= 3; i++) trimList.push(i);
                    return trimList;
                })()
            });
        });

        if (newStudents.length > 0) {
            const cls = appState.classes[currentActiveClassIndex];
            let importIdx = 0;
            for (let i = 0; i < cls.students.length; i++) {
                if (importIdx >= newStudents.length) break;
                const s = cls.students[i];
                if (!s.surname.trim() && !s.name.trim()) {
                    Object.assign(s, {
                        surname: newStudents[importIdx].surname,
                        name: newStudents[importIdx].name,
                        dob: newStudents[importIdx].dob
                    });
                    importIdx++;
                }
            }
            while (importIdx < newStudents.length) {
                cls.students.push(newStudents[importIdx++]);
            }

            // Clean up: Remove trailing empty students
            while (cls.students.length > 0) {
                const last = cls.students[cls.students.length - 1];
                if (!last.surname.trim() && !last.name.trim()) {
                    cls.students.pop();
                } else {
                    break;
                }
            }

            saveAppState();
            renderStudentListTable();

            // Show Success Modal instead of Alert
            const modal = document.getElementById('import-success-modal');
            const countDisplay = document.getElementById('import-count-display');
            const classDisplay = document.getElementById('import-class-display');

            if (modal && countDisplay && classDisplay) {
                countDisplay.textContent = newStudents.length;
                classDisplay.textContent = cls.name;
                modal.classList.add('open');
            }
        } else {
            alert('لم يتم العثور على بيانات في أول ورقة من الملف.');
        }
    } catch (err) {
        alert('خطأ في قراءة ملف الإكسل: ' + err.message);
    }
};

window.closeImportSuccessModal = function () {
    const modal = document.getElementById('import-success-modal');
    if (modal) modal.classList.remove('open');
};

function normalizeDate(input) {
    if (!input) return '';
    try {
        // ExcelJS returns JavaScript Date objects for date cells
        if (input instanceof Date) {
            if (!isNaN(input.getTime())) {
                return input.toISOString().split('T')[0];
            }
            return '';
        }
        // Handle Excel serial date numbers (days since Dec 30, 1899)
        if (typeof input === 'number') {
            const excelEpoch = new Date(1899, 11, 30);
            const date = new Date(excelEpoch.getTime() + input * 86400000);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
        }
        let str = String(input).trim();
        // DD/MM/YYYY or DD-MM-YYYY
        if (str.match(/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/)) {
            const parts = str.split(/[\/\-]/);
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        // YYYY/MM/DD or YYYY-MM-DD
        if (str.match(/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/)) {
            const parts = str.split(/[\/\-]/);
            return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }
        const d = new Date(str);
        if (!isNaN(d.getTime())) {
            return d.toISOString().split('T')[0];
        }
        return str;
    } catch (e) {
        return String(input);
    }
}


// --- Continuous Assessment Validation Rules ---
function validateContinuousMark(type, subIndex, value) {
    const val = parseFloat(value);
    if (isNaN(val) || value === '') return true; // Allow empty

    const config = appState.continuousConfig || defaultContinuousConfig;
    const max = config[type][subIndex].max;

    return val >= 0 && val <= max;
}

// --- قسم التقويم المستمر (CONTINUOUS ASSESSMENT) ---
// Helper to robustly calculate total for Continuous Assessment (sums 10 columns)
function calculateContinuousTotal(data) {
    if (!data) return 0;
    const parse = (v) => parseFloat(v?.toString().replace(',', '.')) || 0;

    const disciplineSum = (data.discipline || []).reduce((a, b) => a + parse(b), 0);
    const inClassSum = (data.inClass || []).reduce((a, b) => a + parse(b), 0);
    const outClassSum = (data.outClass || []).slice(0, 3).reduce((a, b) => a + parse(b), 0); // Sum first 3 items (Homework, Monthly, Initiative)

    return disciplineSum + inClassSum + outClassSum;
}

function renderContinuousTable() {
    renderContinuousHeaders();
    const tbody = document.getElementById('continuousBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const currentClass = appState.classes[currentActiveClassIndex];
    if (!currentClass) return;

    // ... (Controls container logic remains same) ...
    const section = document.getElementById('continuous-section');
    const controlsContainer = section ? section.querySelector('.table-controls') : null;

    if (controlsContainer) {
        controlsContainer.innerHTML = '';
        controlsContainer.style.display = 'flex';
        controlsContainer.style.flexWrap = 'wrap';
        controlsContainer.style.justifyContent = 'flex-start';
        controlsContainer.style.alignItems = 'center';
        controlsContainer.style.gap = '0.75rem';
        controlsContainer.style.marginBottom = '1.5rem';

        const rightGroup = document.createElement('div');
        rightGroup.style.display = 'flex';
        rightGroup.style.flexWrap = 'wrap';
        rightGroup.style.gap = '0.5rem';

        const editBtn = document.createElement('button');
        editBtn.className = isEditMode ? 'btn btn-success btn-action' : 'btn btn-gradient-purple btn-action';
        editBtn.innerHTML = isEditMode ? `<i class="fas fa-save"></i> ${t('btn_save_data')}` : `<i class="fas fa-edit"></i> ${t('btn_edit_data')}`;
        editBtn.onclick = toggleEditMode;
        rightGroup.appendChild(editBtn);

        if (isEditMode) {
            const clearBtn = document.createElement('button');
            clearBtn.className = 'btn btn-danger btn-action';
            clearBtn.innerHTML = `<i class="fas fa-eraser"></i> ${t('btn_delete_all')}`;
            clearBtn.onclick = () => clearAllMarks('continuous');
            rightGroup.appendChild(clearBtn);
        }

        const leftGroup = document.createElement('div');
        leftGroup.style.display = 'flex';
        leftGroup.style.flexWrap = 'wrap';
        leftGroup.style.gap = '0.5rem';



        const wordBtn = document.createElement('button');
        wordBtn.className = 'btn btn-secondary btn-action';
        wordBtn.style.backgroundColor = '#2b579a';
        wordBtn.style.color = 'white';
        wordBtn.innerHTML = `<i class="fas fa-file-word"></i> ${t('btn_export_word')}`;
        wordBtn.onclick = exportContinuousToWord;
        leftGroup.appendChild(wordBtn);

        controlsContainer.appendChild(rightGroup);
        controlsContainer.appendChild(leftGroup);
    }

    const table = document.querySelector('.continuous-table');
    if (table) {
        table.classList.remove('read-only-mode', 'edit-mode');
        table.classList.add(isEditMode ? 'edit-mode' : 'read-only-mode');
    }

    const populatedStudents = currentClass.students.filter(s => ((s.surname && s.surname.trim()) || (s.name && s.name.trim())) && s.activeTrimesters.includes(currentTrimester));
    let hasTableError = false;

    populatedStudents.forEach((student, index) => {
        if (!student.continuousData) student.continuousData = createEmptyContinuousData();
        const trimKey = `t${currentTrimester}`;
        const prevTrimKey = currentTrimester > 1 ? `t${currentTrimester - 1}` : null;

        if (!student.continuousData[trimKey]) {
            student.continuousData[trimKey] = { discipline: ['', '', '', ''], inClass: ['', '', ''], outClass: ['', '', ''] };
        }

        const data = student.continuousData[trimKey];

        // التعبئة التلقائية للفصلين 2 و 3 من الفصل السابق لكل عمود على حدة (إذا كان فارغاً)
        if (prevTrimKey && student.continuousData[prevTrimKey]) {
            const prevData = student.continuousData[prevTrimKey];

            // 1. السلوك (discipline[0])
            if (data.discipline[0] === '' && prevData.discipline?.[0] !== undefined) {
                data.discipline[0] = prevData.discipline[0];
            }
            // 2. احضار الادوات (discipline[2])
            if (data.discipline[2] === '' && prevData.discipline?.[2] !== undefined) {
                data.discipline[2] = prevData.discipline[2];
            }
            // 3. تنظيم الكراس (discipline[3])
            if (data.discipline[3] === '' && prevData.discipline?.[3] !== undefined) {
                data.discipline[3] = prevData.discipline[3];
            }
            // 4. المشاركة (inClass[0])
            if (data.inClass[0] === '' && prevData.inClass?.[0] !== undefined) {
                data.inClass[0] = prevData.inClass[0];
            }
            // 5. الاستجوابات (inClass[1])
            if (data.inClass[1] === '' && prevData.inClass?.[1] !== undefined) {
                data.inClass[1] = prevData.inClass[1];
            }
            // 6. الكتابة على السبورة (inClass[2])
            if (data.inClass[2] === '' && prevData.inClass?.[2] !== undefined) {
                data.inClass[2] = prevData.inClass[2];
            }
            // 7. المبادرة (outClass[2])
            if (data.outClass[2] === '' && prevData.outClass?.[2] !== undefined) {
                data.outClass[2] = prevData.outClass[2];
            }
            // ملاحظة: العمود discipline[1] (الغياب) لا يُنسخ: يُحسب تلقائياً لكل فصل
        }

        const tr = document.createElement('tr');
        tr.setAttribute('data-student-id', student.id);

        let isRowInvalid = false;
        let subCols = '';

        // الانضباط (4 أعمدة)
        for (let i = 0; i < 4; i++) {
            let val = data.discipline?.[i] || '';
            let cellStyle = '';
            let cellTitle = '';

            // عمود "الغياب و التأخر" (الفهرس 1): يُحسب تلقائياً من بيانات الغيابات
            if (i === 1) {
                const autoScore = getAutoAbsenceScore(student, trimKey);
                const hasOverride = (data.absenceOverride !== null && data.absenceOverride !== undefined && data.absenceOverride !== '');
                if (!hasOverride) {
                    // تطبيق العلامة التلقائية وحفظها
                    val = autoScore;
                    data.discipline[1] = val;
                } else {
                    val = data.absenceOverride;
                }
                // تلوين خلفية الخانة لإبراز أنها محسوبة تلقائياً أو معدلة يدوياً
                cellStyle = hasOverride ? 'background-color:#fff8e1;' : 'background-color:#e8f5e9;';
                const absenceCount = (student.absenceData && student.absenceData[trimKey]) ? Object.keys(student.absenceData[trimKey]).length : 0;
                cellTitle = hasOverride ? t('title_manual_override') : t('title_auto_calculated_abs').replace('{n}', absenceCount);
            }

            const displayVal = formatValueWithComma(val, -1);
            const isInvalid = !validateContinuousMark('discipline', i, val);
            if (isInvalid) { isRowInvalid = true; }
            subCols += `<td class="${i === 0 ? 'group-separator' : ''}"><input type="text" value="${displayVal}" class="${isInvalid ? 'continuous-error-input' : ''}" ${!isEditMode ? 'readonly' : ''} style="${cellStyle}" title="${cellTitle}" oninput="updateContinuous(${currentActiveClassIndex}, '${student.id}', 'discipline', ${i}, this)" onblur="handleContinuousBlur(${currentActiveClassIndex}, '${student.id}', 'discipline', ${i}, this)" onfocus="this.select()" onpaste="handleTablePaste(event, 'continuous')" data-student-id="${student.id}" data-field="discipline" data-sub-index="${i}"></td>`;
        }
        // أنشطة داخل القسم (3 أعمدة)
        for (let i = 0; i < 3; i++) {
            const val = data.inClass?.[i] || '';
            const displayVal = formatValueWithComma(val, -1);
            const isInvalid = !validateContinuousMark('inClass', i, val);
            if (isInvalid) { isRowInvalid = true; }
            subCols += `<td class="${i === 0 ? 'group-separator' : ''}"><input type="text" value="${displayVal}" class="${isInvalid ? 'continuous-error-input' : ''}" ${(!isEditMode) ? 'readonly' : ''} oninput="updateContinuous(${currentActiveClassIndex}, '${student.id}', 'inClass', ${i}, this)" onblur="handleContinuousBlur(${currentActiveClassIndex}, '${student.id}', 'inClass', ${i}, this)" onfocus="this.select()" onpaste="handleTablePaste(event, 'continuous')" data-student-id="${student.id}" data-field="inClass" data-sub-index="${i}"></td>`;
        }
        // أنشطة خارج القسم (3 أعمدة)
        for (let i = 0; i < 3; i++) {
            let val = data.outClass?.[i] || '';
            let isReadOnly = false;
            // Sync with monitoring checks
            if (i === 0) {
                val = student.monitoringData?.[trimKey]?.homework?.[3] || 0;
                isReadOnly = true;
                data.outClass[0] = val;
            } else if (i === 1) {
                val = student.monitoringData?.[trimKey]?.monthly?.[2] || 0;
                isReadOnly = true;
                data.outClass[1] = val;
            }

            // Apply D,DD formatting for Homework and Monthly Homework (i=0,1 are from monitoring marks)
            // Initiative (i=2) uses dynamic comma formatting
            const displayVal = (i === 0 || i === 1) ? formatValueWithComma(val, 2) : formatValueWithComma(val, -1);

            const isInvalid = !validateContinuousMark('outClass', i, val);
            if (isInvalid) { isRowInvalid = true; }
            subCols += `<td class="${i === 0 ? 'group-separator' : ''}"><input type="text" value="${displayVal}" class="${isInvalid ? 'continuous-error-input' : ''}" ${(!isEditMode || isReadOnly) ? 'readonly' : ''} ${isReadOnly ? 'tabindex="-1" style="background-color: #f9fafb;"' : ''} oninput="updateContinuous(${currentActiveClassIndex}, '${student.id}', 'outClass', ${i}, this)" onblur="handleContinuousBlur(${currentActiveClassIndex}, '${student.id}', 'outClass', ${i}, this)" onfocus="this.select()" onpaste="handleTablePaste(event, 'continuous')" data-student-id="${student.id}" data-field="outClass" data-sub-index="${i}"></td>`;
        }

        if (isRowInvalid) {
            hasTableError = true;
            tr.classList.add('continuous-error-row');
        }

        // حساب المجموع
        const total = calculateContinuousTotal(data);

        subCols += `<td class="group-separator bg-gray-50"><input type="text" class="total-input" value="${formatNumber(total)}" readonly tabindex="-1" style="background-color: #f9fafb; color: #6b7280; font-weight:bold;"></td>`;

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td class="student-name-align" style="font-weight:bold;">${student.surname}</td>
            <td class="student-name-align">${student.name}</td>
            ${subCols}
        `;
        tbody.appendChild(tr);
    });

    const errorBar = document.getElementById('continuous-error-bar');
    if (errorBar) {
        if (hasTableError) errorBar.classList.add('show');
        else errorBar.classList.remove('show');
    }
}

window.updateContinuous = function (classIndex, studentId, type, subIndex, elementOrValue) {
    const isElement = elementOrValue instanceof HTMLElement;
    let value = isElement ? elementOrValue.value : elementOrValue;
    const cls = appState.classes[classIndex];
    if (!cls) return;
    const student = cls.students.find(s => s.id == studentId);
    if (!student) return;

    // --- تحويل النقطة إلى فاصلة تلقائياً أثناء الكتابة (للواجهة) ---
    if (isElement && value.includes('.')) {
        value = value.replace(/\./g, ',');
        elementOrValue.value = value;
    }

    // --- توحيد القيمة للأرقام (استخدام النقطة للتخزين والحسابات) ---
    const internalValue = value.toString().replace(',', '.');

    const syncableFields = {
        'discipline': [0, 2, 3], // 1 (Absences) is auto-calculated per trimester
        'inClass': [0, 1, 2],
        'outClass': [2]
    };

    const trimKey = `t${currentTrimester}`;
    if (!student.continuousData[trimKey]) student.continuousData[trimKey] = { discipline: ['', '', '', ''], inClass: ['', '', ''], outClass: ['', '', ''] };

    if (type === 'discipline') {
        if (subIndex === 1) {
            // عمود "الغياب و التأخر": التحقق من التعديل اليدوي
            if (internalValue === '' || internalValue === null || internalValue === undefined) {
                // حذف التعديل اليدوي → العودة للحساب التلقائي
                delete student.continuousData[trimKey].absenceOverride;
                const autoScore = getAutoAbsenceScore(student, trimKey);
                student.continuousData[trimKey].discipline[1] = autoScore;
                if (isElement) {
                    elementOrValue.value = formatValueWithComma(autoScore, -1);
                    elementOrValue.style.backgroundColor = '#e8f5e9';
                    elementOrValue.title = `محسوبة تلقائياً (${autoScore})`;
                }
            } else {
                // حفظ التعديل اليدوي
                student.continuousData[trimKey].absenceOverride = internalValue;
                student.continuousData[trimKey].discipline[1] = internalValue;
                if (isElement) {
                    elementOrValue.style.backgroundColor = '#fff8e1';
                    elementOrValue.title = 'علامة معدلة يدوياً - احذفها للعودة للحساب التلقائي';
                }
            }
        } else {
            student.continuousData[trimKey].discipline[subIndex] = internalValue;
        }
    }
    else if (type === 'inClass') student.continuousData[trimKey].inClass[subIndex] = internalValue;
    else if (type === 'outClass') student.continuousData[trimKey].outClass[subIndex] = internalValue;

    // --- تحديث الفصول اللاحقة تلقائياً حسب طلب المستخدم (Forward Sync) ---
    if (syncableFields[type] && syncableFields[type].includes(subIndex)) {
        for (let t = currentTrimester + 1; t <= 3; t++) {
            const nextTrimKey = `t${t}`;
            if (!student.continuousData[nextTrimKey]) {
                student.continuousData[nextTrimKey] = { discipline: ['', '', '', ''], inClass: ['', '', ''], outClass: ['', '', ''] };
            }
            if (type === 'discipline') {
                student.continuousData[nextTrimKey].discipline[subIndex] = internalValue;
            }
            else if (type === 'inClass') student.continuousData[nextTrimKey].inClass[subIndex] = internalValue;
            else if (type === 'outClass') student.continuousData[nextTrimKey].outClass[subIndex] = internalValue;
        }
    }

    // --- Targeted DOM Updates for performance and to avoid focus loss ---
    let targetElement = isElement ? elementOrValue : null;

    // If not provided as element (e.g. sync), try to find it in the DOM if possible
    if (!targetElement) {
        const row = document.querySelector(`#continuousBody tr[data-student-id="${student.id}"]`);
        if (row) {
            const inputs = row.querySelectorAll('input');
            // Mapping for outClass: subIndex 0 is index 7, 1 is 8, 2 is 9
            let idx = -1;
            if (type === 'discipline') idx = subIndex;
            else if (type === 'inClass') idx = 4 + subIndex;
            else if (type === 'outClass') idx = 7 + subIndex;

            if (idx !== -1 && inputs[idx]) targetElement = inputs[idx];
        }
    }

    // 1. Update individual input error state
    const isInvalidMark = !validateContinuousMark(type, subIndex, value);
    if (targetElement) {
        if (isInvalidMark) targetElement.classList.add('continuous-error-input');
        else targetElement.classList.remove('continuous-error-input');
    }

    // 2. Find row
    const tr = targetElement ? targetElement.closest('tr') : document.querySelector(`#continuousBody tr[data-student-id="${student.id}"]`);
    if (tr) {
        // 3. Update Row Total
        const total = calculateContinuousTotal(student.continuousData[trimKey]);

        const totalInput = tr.querySelector('.total-input');
        if (totalInput) totalInput.value = formatNumber(total);

        // 4. Update Row Error Class
        const hasRowError = tr.querySelector('.continuous-error-input') !== null;
        if (hasRowError) tr.classList.add('continuous-error-row');
        else tr.classList.remove('continuous-error-row');
    }

    // 5. Update Global Error Bar
    const errorBar = document.getElementById('continuous-error-bar');
    if (errorBar) {
        const anyTableError = document.getElementById('continuousBody').querySelector('.continuous-error-input') !== null;
        if (anyTableError) errorBar.classList.add('show');
        else errorBar.classList.remove('show');
    }

    saveAppState(true); // Silent save 
};

window.handleContinuousBlur = function (classIndex, studentId, type, subIndex, element) {
    let value = element.value;

    // عمود "الغياب و التأخر" (discipline[1]): عند حذف القيمة → العودة للحساب التلقائي
    if (type === 'discipline' && subIndex === 1 && value === '') {
        window.updateContinuous(classIndex, studentId, type, subIndex, element);
        return;
    }

    // إذا كانت الخانة فارغة، نحاول استحضار علامة الفصل السابق (Seeding)
    if (value === '' && currentTrimester > 1) {
        const syncableFields = {
            'discipline': [0, 2, 3], // 0: Behavior, 2: Tools, 3: Organization
            'inClass': [0, 1, 2],    // 0: Participation, 1: Quizzes, 2: Board
            'outClass': [2]          // 2: Initiative
        };

        if (syncableFields[type] && syncableFields[type].includes(subIndex)) {
            const cls = appState.classes[classIndex];
            const student = cls.students.find(s => s.id == studentId);
            const prevTrimKey = `t${currentTrimester - 1}`;

            if (student && student.continuousData[prevTrimKey]) {
                const prevVal = student.continuousData[prevTrimKey][type]?.[subIndex];
                if (prevVal !== '' && prevVal !== undefined && prevVal !== null) {
                    element.value = formatValueWithComma(prevVal, -1);
                    window.updateContinuous(classIndex, studentId, type, subIndex, element);
                    return;
                }
            }
        }
    }
    window.updateContinuous(classIndex, studentId, type, subIndex, element);
};




// --- قسم المراقبة المستمرة (MONITORING) ---
function renderMonitoringTable() {
    const tbody = document.getElementById('monitoringBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const currentClass = appState.classes[currentActiveClassIndex];
    if (!currentClass) return;

    // فرض رسم الأزرار بشكل قوي (Monitoring)
    const section = document.getElementById('monitoring-section');
    const controlsContainer = section ? section.querySelector('.table-controls') : null;

    if (controlsContainer) {
        controlsContainer.innerHTML = '';
        controlsContainer.style.display = 'flex';
        controlsContainer.style.flexWrap = 'wrap';
        controlsContainer.style.justifyContent = 'flex-start';
        controlsContainer.style.alignItems = 'center';
        controlsContainer.style.gap = '0.75rem';
        controlsContainer.style.marginBottom = '1.5rem';

        const rightGroup = document.createElement('div');
        rightGroup.style.display = 'flex';
        rightGroup.style.flexWrap = 'wrap';
        rightGroup.style.gap = '0.5rem';

        const editBtn = document.createElement('button');
        editBtn.className = isEditMode ? 'btn btn-success btn-action' : 'btn btn-gradient-purple btn-action';
        editBtn.innerHTML = isEditMode ? `<i class="fas fa-save"></i> ${t('btn_save_data')}` : `<i class="fas fa-edit"></i> ${t('btn_edit_data')}`;
        editBtn.onclick = toggleEditMode;
        rightGroup.appendChild(editBtn);

        if (isEditMode) {
            const clearBtn = document.createElement('button');
            clearBtn.className = 'btn btn-danger btn-action';
            clearBtn.innerHTML = `<i class="fas fa-eraser"></i> ${t('btn_delete_all')}`;
            clearBtn.onclick = () => clearAllMarks('monitoring');
            rightGroup.appendChild(clearBtn);
        }

        const leftGroup = document.createElement('div');
        leftGroup.style.display = 'flex';
        leftGroup.style.flexWrap = 'wrap';
        leftGroup.style.gap = '0.5rem';




        const wordBtn = document.createElement('button');
        wordBtn.className = 'btn btn-secondary btn-action';
        wordBtn.style.backgroundColor = '#2b579a';
        wordBtn.style.color = 'white';
        wordBtn.innerHTML = '<i class="fas fa-file-word"></i> تصدير Word';
        wordBtn.onclick = () => {
            if (typeof window.exportMonitoringToWord === 'function') {
                window.exportMonitoringToWord();
            } else {
                alert(t('msg_export_loading'));
            }
        };
        leftGroup.appendChild(wordBtn);

        controlsContainer.appendChild(rightGroup);
        controlsContainer.appendChild(leftGroup);
    }

    const table = document.querySelector('.monitoring-table');
    if (table) {
        table.classList.remove('read-only-mode', 'edit-mode');
        table.classList.add(isEditMode ? 'edit-mode' : 'read-only-mode');
    }

    const populatedStudents = currentClass.students.filter(s => ((s.surname && s.surname.trim()) || (s.name && s.name.trim())) && s.activeTrimesters.includes(currentTrimester));

    populatedStudents.forEach((student, index) => {
        if (!student.monitoringData) student.monitoringData = createEmptyMonitoringData();
        const trimKey = `t${currentTrimester}`;
        // Ensure the trimester object exists
        if (!student.monitoringData[trimKey]) {
            student.monitoringData[trimKey] = { discipline: '', homework: ['', '', '', ''], monthly: ['', '', ''] };
        }
        const data = student.monitoringData[trimKey];

        const tr = document.createElement('tr');

        let subCols = '';
        // الانضباط (Discipline)
        subCols += `<td><input type="number" step="0.5" value="${data.discipline || ''}" ${!isEditMode ? 'readonly' : ''} oninput="updateMonitoring(${currentActiveClassIndex}, '${student.id}', 'discipline', 0, this.value)" onpaste="handleTablePaste(event, 'monitoring')" data-student-id="${student.id}" data-field="discipline" data-sub-index="0"></td>`;

        // الواجبات (Homework - 4 أعمدة)
        for (let i = 0; i < 4; i++) {
            const isAlwaysReadOnly = (i === 2 || i === 3); // "لم تنجز" و "العلامة" للقراءة فقط دائماً
            const isReadOnly = !isEditMode || isAlwaysReadOnly;
            const readOnlyAttr = isReadOnly ? 'readonly tabindex="-1"' : '';
            // إضافة كلاسات محددة للمزامنة الدقيقة
            const classes = ['monitor-hw-total', 'monitor-hw-done', 'monitor-hw-notdone', 'monitor-hw-mark'];
            if (isReadOnly) classes[i] += ' monitor-readonly';
            const val = data.homework?.[i];

            // Format Mark column (index 3) specifically to e.g., 05,20
            const displayVal = i === 3 ? formatGradingVal(val) : ((val === 0 || val) ? val : '');
            const inputType = i === 3 ? 'text' : 'number';
            const extraStyle = i === 3 ? 'style="min-width: 55px; width: 55px;"' : '';

            subCols += `<td><input type="${inputType}" ${i !== 3 ? 'step="0.5"' : ''} value="${displayVal}" class="${classes[i]}" oninput="updateMonitoring(${currentActiveClassIndex}, '${student.id}', 'homework', ${i}, this.value)" onpaste="handleTablePaste(event, 'monitoring')" data-student-id="${student.id}" data-field="homework" data-sub-index="${i}" ${readOnlyAttr} ${extraStyle}></td>`;
        }

        // الفروض الشهرية (Monthly - 3 أعمدة)
        for (let i = 0; i < 3; i++) {
            const isAlwaysReadOnly = i === 2; // "العلامة" دائماً للقراءة فقط
            const isReadOnly = !isEditMode || isAlwaysReadOnly;
            const readOnlyAttr = isReadOnly ? 'readonly tabindex="-1"' : '';
            const classes = ['monitor-month-1', 'monitor-month-2', 'monitor-month-mark'];
            if (isReadOnly) classes[i] += ' monitor-readonly';
            const val = data.monthly?.[i];

            // Format Mark column (index 2) specifically to e.g., 05,20
            // Format Monthly Assignments (indices 0, 1) using formatValueWithComma(val, -1)
            let displayVal = '';
            if (i === 2) displayVal = formatGradingVal(val);
            else if (i === 0 || i === 1) displayVal = formatValueWithComma(val, -1);
            else displayVal = (val === 0 || val) ? val : '';

            const inputType = 'text'; // Using text for comma support
            const onInputLogic = (i === 0 || i === 1) ? "this.value = this.value.replace('.', ','); " : "";
            const extraStyle = i === 2 ? 'style="min-width: 55px; width: 55px;"' : 'style="min-width: 45px; width: 45px;"';

            subCols += `<td><input type="${inputType}" value="${displayVal}" class="${classes[i]}" oninput="${onInputLogic}updateMonitoring(${currentActiveClassIndex}, '${student.id}', 'monthly', ${i}, this.value)" onpaste="handleTablePaste(event, 'monitoring')" data-student-id="${student.id}" data-field="monthly" data-sub-index="${i}" ${readOnlyAttr} ${extraStyle}></td>`;
        }

        tr.setAttribute('data-student-id', student.id);
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td class="student-name-align" style="font-weight:bold;">${student.surname}</td>
            <td class="student-name-align">${student.name}</td>
            ${subCols}
        `;
        tbody.appendChild(tr);
        validateMonitoringRow(student.id);
    });
    refreshMonitoringGlobalErrorState();
}

window.updateMonitoring = function (classIndex, studentId, type, subIndex, value) {
    const cls = appState.classes[classIndex];
    if (!cls) return;
    const student = cls.students.find(s => s.id == studentId);
    if (!student) return;

    const trimKey = `t${currentTrimester}`;
    if (!student.monitoringData[trimKey]) student.monitoringData[trimKey] = { discipline: '', homework: ['', '', '', ''], monthly: ['', '', ''] };

    if (type === 'discipline') {
        student.monitoringData[trimKey].discipline = value;
    } else if (type === 'homework') {
        const val = value === '' ? '' : value;

        // --- الميزة الأساسية: مزامنة عمود "إجمالي" لجميع تلاميذ الفوج ---
        if (subIndex === 0) {
            cls.students.forEach(s => {
                if (!s.monitoringData[trimKey]) s.monitoringData[trimKey] = { discipline: '', homework: ['', '', '', ''], monthly: ['', '', ''] };

                // 1. تحديث البيانات (Data Layer)
                s.monitoringData[trimKey].homework[0] = val;

                // 2. إعادة حساب الإحصائيات (Logical Layer)
                const total = parseFloat(val) || 0;
                const done = parseFloat(s.monitoringData[trimKey].homework[1]) || 0;
                let notDone = '';
                let mark = '';

                if (val !== '') {
                    notDone = Math.max(0, total - done);
                    mark = 0;
                    const config = appState.continuousConfig || defaultContinuousConfig;
                    const hwMax = config.outClass[0].max;
                    if (total > 0) mark = (done / total) * hwMax;
                    mark = parseFloat(mark.toFixed(2));
                }

                s.monitoringData[trimKey].homework[2] = notDone;
                s.monitoringData[trimKey].homework[3] = mark;

                // 3. تحديث الواجهة (UI Layer) لجميع الصفوف المتاحة في الجدول
                const row = document.querySelector(`#monitoringBody tr[data-student-id="${s.id}"]`);
                if (row) {
                    const inputTotal = row.querySelector('.monitor-hw-total');
                    const inputNotDone = row.querySelector('.monitor-hw-notdone');
                    const inputMark = row.querySelector('.monitor-hw-mark');

                    if (inputTotal) inputTotal.value = val;
                    if (inputNotDone) inputNotDone.value = notDone;
                    if (inputMark) inputMark.value = formatGradingVal(mark);
                }

                // 4. مزامنة مع التقويم المستمر
                syncMonitoringToContinuous(s, trimKey, 'homework', mark || 0);

                // 5. التحقق من صحة السطر
                validateMonitoringRow(s.id);
            });
        } else {
            // تحديث عمود غير "إجمالي" (مثل "أنجزت")
            student.monitoringData[trimKey].homework[subIndex] = val;

            if (subIndex === 1) { // فقط إذا كان التغيير في "أنجزت"
                const total = parseFloat(student.monitoringData[trimKey].homework[0]) || 0;
                const done = parseFloat(val) || 0;
                let notDone = '';
                let mark = '';

                if (student.monitoringData[trimKey].homework[0] !== '') {
                    notDone = Math.max(0, total - done);
                    mark = 0;
                    const config = appState.continuousConfig || defaultContinuousConfig;
                    const hwMax = config.outClass[0].max;
                    if (total > 0) mark = (done / total) * hwMax;
                    mark = parseFloat(mark.toFixed(2));
                }

                student.monitoringData[trimKey].homework[2] = notDone;
                student.monitoringData[trimKey].homework[3] = mark;

                const row = document.querySelector(`#monitoringBody tr[data-student-id="${student.id}"]`);
                if (row) {
                    const inputNotDone = row.querySelector('.monitor-hw-notdone');
                    const inputMark = row.querySelector('.monitor-hw-mark');
                    if (inputNotDone) inputNotDone.value = notDone;
                    if (inputMark) inputMark.value = formatGradingVal(mark);
                }
                syncMonitoringToContinuous(student, trimKey, 'homework', mark || 0);

                // التحقق من صحة السطر
                validateMonitoringRow(student.id);
            }
        }
    } else if (type === 'monthly') {
        const val = value === '' ? '' : value.toString().replace('.', ',');
        student.monitoringData[trimKey].monthly[subIndex] = val;

        // حساب العلامة تلقائياً للفرض 1 أو الفرض 2
        if (subIndex === 0 || subIndex === 1) {
            const v1 = student.monitoringData[trimKey].monthly[0].toString().replace(',', '.');
            const v2 = student.monitoringData[trimKey].monthly[1].toString().replace(',', '.');
            const ass1 = parseFloat(v1) || 0;
            const ass2 = parseFloat(v2) || 0;
            const totalMark = ass1 + ass2;
            student.monitoringData[trimKey].monthly[2] = totalMark;

            const row = document.querySelector(`#monitoringBody tr[data-student-id="${student.id}"]`);
            if (row) {
                const monthlyInputs = row.querySelectorAll('input[oninput*="monthly"]');
                if (monthlyInputs[2]) monthlyInputs[2].value = formatGradingVal(totalMark);
            }

            // مزامنة مع التقويم المستمر
            syncMonitoringToContinuous(student, trimKey, 'monthly', totalMark);
        }
    }

    saveAppState();
    refreshMonitoringGlobalErrorState();
};

/**
 * تحديث حالة التحقق من صحة البيانات في سطر مراقبة الأعمال (أنجزت <= إجمالي)
 */
function validateMonitoringRow(studentId) {
    const row = document.querySelector(`#monitoringBody tr[data-student-id="${studentId}"]`);
    if (!row) return false;

    const inputTotal = row.querySelector('.monitor-hw-total');
    const inputDone = row.querySelector('.monitor-hw-done');

    if (inputTotal && inputDone) {
        const total = parseFloat(inputTotal.value) || 0;
        const done = parseFloat(inputDone.value) || 0;

        if (done > total && inputTotal.value !== '') {
            row.classList.add('monitoring-row-error');
            return true;
        } else {
            row.classList.remove('monitoring-row-error');
            return false;
        }
    }
    return false;
}

/**
 * تحديث حالة شريط الخطأ العالمي لصفحة مراقبة الأعمال
 */
function refreshMonitoringGlobalErrorState() {
    const errorBar = document.getElementById('monitoring-error-bar');
    if (!errorBar) return;

    const errorRows = document.querySelectorAll('#monitoringBody tr.monitoring-row-error');
    if (errorRows.length > 0) {
        errorBar.classList.add('visible');
    } else {
        errorBar.classList.remove('visible');
    }
}

function syncMonitoringToContinuous(student, trimKey, type, mark) {
    if (student.continuousData && student.continuousData[trimKey]) {
        if (!student.continuousData[trimKey].outClass) {
            student.continuousData[trimKey].outClass = [0, 0, 0];
        }

        const isNullOrEmpty = (mark === undefined || mark === null || mark === '' || mark === ' ');
        const markVal = isNullOrEmpty ? '' : (parseFloat(parseFloat(mark).toFixed(2)) || 0);

        let colIndex = -1;
        let inputIndex = -1;

        if (type === 'homework') {
            colIndex = 0;
            inputIndex = 7; // 4 انضباط + 3 داخل القسم + 0
        } else if (type === 'monthly') {
            colIndex = 1;
            inputIndex = 8; // 4 انضباط + 3 داخل القسم + 1
        }

        if (colIndex !== -1) {
            student.continuousData[trimKey].outClass[colIndex] = markVal;
            const continuousRow = document.querySelector(`#continuousBody tr[data-student-id="${student.id}"]`);
            if (continuousRow) {
                const continuousInputs = continuousRow.querySelectorAll('input');
                if (continuousInputs[inputIndex]) {
                    continuousInputs[inputIndex].value = formatValueWithComma(markVal, 2);
                    // Trigger updateContinuous for totals
                    updateContinuous(currentActiveClassIndex, student.id, 'outClass', colIndex, markVal);
                }
            }
        }
    }
}


// --- قسم التنقيط (GRADING) ---
function renderGradingTable() {
    const tbody = document.getElementById('gradingBody');
    tbody.innerHTML = '';
    const currentClass = appState.classes[currentActiveClassIndex];

    const controlsContainer = document.querySelector('#grading-section .table-controls');
    if (controlsContainer) {
        controlsContainer.innerHTML = '';
        controlsContainer.style.display = 'flex';
        controlsContainer.style.flexWrap = 'wrap';
        controlsContainer.style.justifyContent = 'flex-start';
        controlsContainer.style.alignItems = 'center';
        controlsContainer.style.gap = '0.75rem';

        const buttonsGroup = document.createElement('div');
        buttonsGroup.style.display = 'flex';
        buttonsGroup.style.flexWrap = 'wrap';
        buttonsGroup.style.gap = '0.5rem';

        const editBtn = document.createElement('button');
        editBtn.className = isEditMode ? 'btn btn-success btn-action' : 'btn btn-gradient-purple btn-action';
        editBtn.innerHTML = isEditMode ? `<i class="fas fa-save"></i> ${t('btn_save_data')}` : `<i class="fas fa-edit"></i> ${t('btn_edit_data')}`;
        editBtn.onclick = toggleEditMode;
        buttonsGroup.appendChild(editBtn);

        if (isEditMode) {
            const clearBtn = document.createElement('button');
            clearBtn.className = 'btn btn-danger btn-action';
            clearBtn.innerHTML = `<i class="fas fa-eraser"></i> ${t('btn_delete_all')}`;
            clearBtn.onclick = () => clearAllMarks('grading');
            buttonsGroup.appendChild(clearBtn);
        }

        // New Comparison Button
        if (currentTrimester > 1) {
            const compareBtn = document.createElement('button');
            compareBtn.className = 'btn btn-comparison-gradient btn-action';
            compareBtn.innerHTML = `<i class="fas fa-balance-scale"></i> ${t('btn_compare_trimesters')}`;
            compareBtn.onclick = () => window.showComparisonModal();
            buttonsGroup.appendChild(compareBtn);
        }

        const statsBtn = document.createElement('button');
        statsBtn.className = 'btn btn-vibrant-stats btn-action';
        statsBtn.innerHTML = `<i class="fas fa-chart-bar"></i> ${t('btn_detailed_stats')}`;
        statsBtn.onclick = showStatisticsModal;
        buttonsGroup.appendChild(statsBtn);

        const wordBtn = document.createElement('button');
        wordBtn.className = 'btn btn-secondary btn-action';
        wordBtn.style.backgroundColor = '#2b579a';
        wordBtn.style.color = 'white';
        wordBtn.innerHTML = `<i class="fas fa-file-word"></i> ${t('btn_export_word')}`;
        wordBtn.onclick = () => window.exportGradingToWord();
        buttonsGroup.appendChild(wordBtn);

        controlsContainer.appendChild(buttonsGroup);
    }

    const table = document.getElementById('gradingTable');
    if (table) {
        table.classList.remove('read-only-mode', 'edit-mode');
        table.classList.add(isEditMode ? 'edit-mode' : 'read-only-mode');
    }

    // Clear sort icons
    ['name', 'rank', 'annualAvg'].forEach(col => {
        const iconContainer = document.getElementById(`grading-sort-icon-${col}`);
        if (iconContainer) iconContainer.innerHTML = '';
    });

    const populatedStudents = currentClass ? currentClass.students.filter(s => ((s.surname && s.surname.trim()) || (s.name && s.name.trim())) && s.activeTrimesters.includes(currentTrimester)) : [];

    if (!currentClass) return;

    let realCount = 0;
    const trimKey = `t${currentTrimester}`;

    // حساب الرتب (Ranks)
    const studentsWithAvg = populatedStudents.map(s => {
        if (!s.gradingData) s.gradingData = createEmptyGradingData();
        calculateStudentGrades(s, currentClass.coefficient, trimKey);
        return { id: s.id, avg: s.gradingData[trimKey].average || 0 };
    });
    const sortedRanks = [...studentsWithAvg].sort((a, b) => b.avg - a.avg);
    const rankMap = {};
    let rank = 1;
    for (let i = 0; i < sortedRanks.length; i++) {
        if (i > 0 && sortedRanks[i].avg < sortedRanks[i - 1].avg) rank = i + 1;
        rankMap[sortedRanks[i].id] = rank;
    }

    // Apply Sorting
    if (gradingSortConfig.column) {
        // Precompute annual averages for sorting
        const annualAvgMap = {};
        populatedStudents.forEach(s => {
            if (!s.gradingData) s.gradingData = createEmptyGradingData();
            const a1 = parseFloat(s.gradingData['t1']?.average) || 0;
            const a2 = parseFloat(s.gradingData['t2']?.average) || 0;
            const a3 = parseFloat(s.gradingData['t3']?.average) || 0;
            annualAvgMap[s.id] = (a1 + a2 + a3) / 3;
        });

        populatedStudents.sort((a, b) => {
            const col = gradingSortConfig.column;
            const isAsc = gradingSortConfig.direction === 'asc';
            let res = 0;

            if (col === 'name') {
                const valA = (a.surname + ' ' + a.name).trim();
                const valB = (b.surname + ' ' + b.name).trim();
                res = valA.localeCompare(valB, 'ar', { sensitivity: 'base' });
            } else if (col === 'rank') {
                const rA = rankMap[a.id] || 999;
                const rB = rankMap[b.id] || 999;
                res = rA - rB;
            } else if (col === 'annualAvg') {
                const aAvg = annualAvgMap[a.id] || 0;
                const bAvg = annualAvgMap[b.id] || 0;
                res = bAvg - aAvg; // descending by default (highest first)
            }

            return isAsc ? res : -res;
        });

        // Update Sort Icon
        const iconContainer = document.getElementById(`grading-sort-icon-${gradingSortConfig.column}`);
        if (iconContainer) {
            const isAsc = gradingSortConfig.direction === 'asc';
            const col = gradingSortConfig.column;

            // User requirements: 
            // Name: ascend (A-Z) = down arrow, descend (Z-A) = up arrow
            // Rank: ascend (lowest to highest rank) = down arrow, descend (highest to lowest) = up arrow

            let iconClass = isAsc ? 'fa-arrow-down' : 'fa-arrow-up';
            iconContainer.innerHTML = `<i class="fas ${iconClass}" style="font-size: 0.8rem; margin-right: 5px;"></i>`;
        }
    }

    let hasTableError = false;

    // Helper: compute annual average = (avg_t1 + avg_t2 + avg_t3) / 3
    const getAnnualAvg = (student) => {
        if (!student.gradingData) return '';
        const a1 = parseFloat(student.gradingData['t1']?.average) || 0;
        const a2 = parseFloat(student.gradingData['t2']?.average) || 0;
        const a3 = parseFloat(student.gradingData['t3']?.average) || 0;
        // Only show if we are in trimester 3
        return ((a1 + a2 + a3) / 3);
    };

    // Add "المعدل السنوي" header right before التقديرات if T3
    if (currentTrimester === 3) {
        const theadRow = document.querySelector('#gradingTable thead tr');
        if (theadRow) {
            let annualTh = document.getElementById('annual-avg-th');
            if (!annualTh) {
                const scoreTh = theadRow.querySelector('th:nth-child(8)');
                annualTh = document.createElement('th');
                annualTh.id = 'annual-avg-th';
                annualTh.className = 'grading-header-interactive';
                annualTh.style.cursor = 'pointer';
                annualTh.onclick = () => handleGradingSort('annualAvg');
                annualTh.style.background = '';
                if (scoreTh && scoreTh.nextSibling) {
                    theadRow.insertBefore(annualTh, scoreTh.nextSibling);
                }
            }
            annualTh.title = t('stats_annual_sort_tooltip');
            annualTh.innerHTML = `${t('stats_lbl_annual_alt')} <span id="grading-sort-icon-annualAvg"></span>`;
        }
    } else {
        // Remove if present and we switched away from T3
        const oldTh = document.getElementById('annual-avg-th');
        if (oldTh) oldTh.remove();
    }

    populatedStudents.forEach((student) => {
        realCount++;
        if (!student.gradingData) student.gradingData = createEmptyGradingData();
        const data = student.gradingData[trimKey];

        const displayMonitoring = (data.monitoring !== undefined && data.monitoring !== null && data.monitoring !== '') ? data.monitoring : getContinuousTotal(student, trimKey);

        calculateStudentGrades(student, currentClass.coefficient, trimKey);

        const avg = parseFloat(data.average) || 0;
        let avgClass = '';
        if (avg > 0 && avg < 8) avgClass = 'avg-critical';
        else if (avg >= 8 && avg < 10) avgClass = 'avg-warning';
        else if (avg >= 17 && avg <= 20) avgClass = 'avg-excellent';

        const monVal = parseFloat(displayMonitoring);
        const assVal = parseFloat(data.assignment);
        const examVal = parseFloat(data.exam);

        // Validation logic: marks between 0 and 20 (ignore if empty)
        const isMonInvalid = (displayMonitoring !== '' && displayMonitoring !== undefined) && (monVal > 20 || monVal < 0);
        const isAssInvalid = (data.assignment !== '' && data.assignment !== undefined) && (assVal > 20 || assVal < 0);
        const isExamInvalid = (data.exam !== '' && data.exam !== undefined) && (examVal > 20 || examVal < 0);
        const isRowInvalid = isMonInvalid || isAssInvalid || isExamInvalid;

        if (isRowInvalid) hasTableError = true;

        const rowErrorClass = isRowInvalid ? 'grading-error-row' : '';
        const monErrorClass = isMonInvalid ? 'grading-error-input' : '';
        const assErrorClass = isAssInvalid ? 'grading-error-input' : '';
        const examErrorClass = isExamInvalid ? 'grading-error-input' : '';

        // Logic to toggle readonly based on isEditMode
        const readOnlyAttr = isEditMode ? '' : 'readonly';
        const inputClass = isEditMode ? '' : 'readonly-input';

        // Annual Average cell (only for trimester 3)
        const annualAvgCell = currentTrimester === 3 ? (() => {
            const annAvg = getAnnualAvg(student);
            const annAvgStr = (annAvg > 0) ? formatGradingVal(annAvg) : '-';
            let annClass = '';
            if (annAvg > 0 && annAvg < 8) annClass = 'avg-critical';
            else if (annAvg >= 8 && annAvg < 10) annClass = 'avg-warning';
            else if (annAvg >= 17) annClass = 'avg-excellent';
            // المعدل السنوي: غليظ
            return `<td class="avg-cell annual-avg-cell ${annClass}" style="font-weight: bold;">${annAvgStr}</td>`;
        })() : '';

        const tr = document.createElement('tr');
        if (rowErrorClass) tr.classList.add(rowErrorClass);

        tr.innerHTML = `
            <td>${realCount}</td>
            <td class="student-name-align" style="padding-right:1rem; font-weight: normal;"><strong>${student.surname}</strong> ${student.name}</td>
            <td class="${monErrorClass}"><input type="text" style="font-weight: normal;" value="${formatGradingVal(displayMonitoring)}" placeholder="${formatGradingVal(getContinuousTotal(student, trimKey))}" onchange="updateGrade(${currentActiveClassIndex}, '${student.id}', 'monitoring', this.value)" onfocus="this.select()" onpaste="handleTablePaste(event, 'grading')" data-student-id="${student.id}" data-field="monitoring" ${readOnlyAttr} class="${monErrorClass} ${inputClass}"></td>
            <td class="${assErrorClass}"><input type="text" class="${assErrorClass} ${inputClass}" style="font-weight: bold;" value="${formatGradingVal(data.assignment)}" onchange="updateGrade(${currentActiveClassIndex}, '${student.id}', 'assignment', this.value)" onfocus="this.select()" onpaste="handleTablePaste(event, 'grading')" data-student-id="${student.id}" data-field="assignment" ${readOnlyAttr}></td>
            <td class="bg-gray-50" style="font-weight: normal;">${formatGradingVal(data.continuousEval)}</td>
            <td class="${examErrorClass}"><input type="text" class="${examErrorClass} ${inputClass}" style="font-weight: bold;" value="${formatGradingVal(data.exam)}" onchange="updateGrade(${currentActiveClassIndex}, '${student.id}', 'exam', this.value)" onfocus="this.select()" onpaste="handleTablePaste(event, 'grading')" data-student-id="${student.id}" data-field="exam" ${readOnlyAttr}></td>
            <td class="avg-cell ${avgClass}" style="font-weight: bold;">${formatGradingVal(data.average)}</td>
            <td style="font-weight: normal;">${formatGradingVal(data.score)}</td>
            ${annualAvgCell}
            <td class="appr-cell">
                <input type="text" value="${data.appreciation || getAppreciation(data.average)}" 
                       ${!isEditMode ? 'readonly class="readonly-input"' : ''}
                       onchange="updateGrade(${currentActiveClassIndex}, '${student.id}', 'appreciation', this.value)"
                       style="width: 100%; border: none; background: transparent; text-align: center; font-family: 'Tajawal', sans-serif; font-size: 0.95rem; font-weight: normal; color: inherit;">
            </td>
            <td style="font-weight: bold;">${rankMap[student.id] || '-'}</td>
        `;

        tbody.appendChild(tr);
    });

    // Update visibility of the persistent error bar
    const errorBar = document.getElementById('grading-error-bar');
    if (errorBar) {
        if (hasTableError) errorBar.classList.add('show');
        else errorBar.classList.remove('show');
    }
}

window.handleGradingSort = function (column) {
    if (!isEditMode) {
        const reminder = document.getElementById('grading-edit-reminder');
        if (reminder) {
            const span = reminder.querySelector('span');
            if (span) {
                if (column === 'name') {
                    span.textContent = t('msg_grading_sort_name');
                } else if (column === 'rank') {
                    span.textContent = t('msg_grading_sort_rank');
                } else if (column === 'annualAvg') {
                    span.textContent = t('msg_grading_sort_annual');
                } else {
                    span.textContent = t('msg_grading_sort_edit');
                }
            }
            reminder.classList.add('show');
            setTimeout(() => {
                reminder.classList.remove('show');
            }, 3000);
        }
        return;
    }

    if (gradingSortConfig.column === column) {
        gradingSortConfig.direction = gradingSortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
        gradingSortConfig.column = column;
        gradingSortConfig.direction = 'asc';
    }

    saveAppState();
    renderGradingTable();
};

window.updateGrade = function (classIndex, studentId, field, value) {
    const cls = appState.classes[classIndex];
    if (!cls) return;
    const student = cls.students.find(s => s.id == studentId);
    if (student) {
        const trimKey = `t${currentTrimester}`;
        if (!student.gradingData) student.gradingData = createEmptyGradingData();

        let normalizedValue = value;
        // Normalize commas to dots for numerical fields before saving
        if (field === 'monitoring' || field === 'assignment' || field === 'exam') {
            if (typeof value === 'string') {
                normalizedValue = value.replace(',', '.');
            }
        }

        student.gradingData[trimKey][field] = normalizedValue;
        calculateStudentGrades(student, cls.coefficient, trimKey);
        saveAppState();
        renderGradingTable();
    }
};

window.clearAllMarks = function (section) {
    currentSectionToClear = section;
    const modal = document.getElementById('delete-marks-modal');
    if (modal) modal.classList.add('open');
};

window.closeClearMarksModal = function () {
    const modal = document.getElementById('delete-marks-modal');
    if (modal) modal.classList.remove('open');
    currentSectionToClear = null;
};

window.confirmClearMarks = function () {
    if (!currentSectionToClear) return;
    const section = currentSectionToClear;

    const cls = appState.classes[currentActiveClassIndex];
    if (!cls) return;

    const trimKey = `t${currentTrimester}`;

    cls.students.forEach(student => {
        if (section === 'monitoring') {
            if (student.monitoringData && student.monitoringData[trimKey]) {
                const m = student.monitoringData[trimKey];
                m.homework[0] = ''; // إجمالي
                m.homework[1] = ''; // أنجزت
                m.homework[2] = ''; // لم تنجز (تصفير تلقائي)
                m.homework[3] = ''; // العلامة (تصفير تلقائي)
                m.monthly[0] = ''; // الواجب 01
                m.monthly[1] = ''; // الواجب 02
                m.monthly[2] = ''; // العلامة (تصفير تلقائي)

                syncMonitoringToContinuous(student, trimKey, 'homework', 0);
                syncMonitoringToContinuous(student, trimKey, 'monthly', 0);
            }
        } else if (section === 'continuous') {
            if (student.continuousData && student.continuousData[trimKey]) {
                const c = student.continuousData[trimKey];
                const prevTrimKey = currentTrimester > 1 ? `t${currentTrimester - 1}` : null;

                if (prevTrimKey && student.continuousData[prevTrimKey]) {
                    // استرجاع علامات الفصل السابق
                    const prevData = student.continuousData[prevTrimKey];
                    if (prevData.discipline) {
                        c.discipline = [...prevData.discipline];
                        c.discipline[1] = ''; // يحسب تلقائيا للفصل الحالي
                    }
                    if (prevData.inClass) c.inClass = [...prevData.inClass];
                    if (prevData.outClass) {
                        // المبادرة هي index 2 في outClass
                        c.outClass[2] = prevData.outClass[2] || '';
                    }
                } else {
                    // الفصل الأول أو لا توجد بيانات سابقة: تصفير كامل
                    c.discipline = ['', '', '', ''];
                    c.inClass = ['', '', ''];
                    c.outClass[2] = ''; // المبادرة فقط
                }

                // حذف التعديل اليدوي في الفصل الحالي
                delete c.absenceOverride;

                // --- تحديث الفصول اللاحقة تلقائياً عند الحذف/الاسترجاع ---
                for (let t = currentTrimester + 1; t <= 3; t++) {
                    const nextTrimKey = `t${t}`;
                    if (student.continuousData[nextTrimKey]) {
                        const nc = student.continuousData[nextTrimKey];
                        nc.discipline[0] = c.discipline[0];
                        nc.discipline[2] = c.discipline[2];
                        nc.discipline[3] = c.discipline[3];
                        // الفهرس 1 (الغيابات) يحسب تلقائيا ولا ينقل
                        delete nc.absenceOverride;

                        nc.inClass = [...c.inClass];
                        nc.outClass[2] = c.outClass[2];
                    }
                }
            }
        } else if (section === 'grading') {
            if (student.gradingData && student.gradingData[trimKey]) {
                const g = student.gradingData[trimKey];
                g.assignment = '';
                g.exam = '';
                g.appreciation = '';
                calculateStudentGrades(student, cls.coefficient, trimKey);
            }
        }
    });

    saveAppState();
    renderCurrentView();
    closeClearMarksModal();
};

function calculateStudentGrades(student, coeff, trimKey) {
    if (!student.gradingData) student.gradingData = createEmptyGradingData();
    const data = student.gradingData[trimKey];

    // منطق الاحتفاظ بالقيم: إذا كان حقل المراقبة فارغاً، نستخدم نتيجة التقويم المستمر
    const hasManualMonitoring = (data.monitoring !== undefined && data.monitoring !== null && data.monitoring !== '');
    const mon = hasManualMonitoring ? parseFloat(data.monitoring) : getContinuousTotal(student, trimKey);

    const ass = parseFloat(data.assignment) || 0;
    const exam = parseFloat(data.exam) || 0;

    data.continuousEval = (mon + ass) / 2;
    data.average = (data.continuousEval + (exam * 2)) / 3;
    data.score = data.average * coeff;
}

function getAppreciation(avg) {
    const list = appState.appreciations || defaultAppreciations;
    for (const app of list) {
        if (avg >= app.min && avg <= app.max) {
            return app.text;
        }
    }
    // Fallback based on simple logic if something is weird
    if (avg >= 10) return 'عمل مقبول';
    return 'عمل ناقص';
}

window.openAppreciationModal = function () {
    if (!isEditMode) {
        const reminder = document.getElementById('grading-edit-reminder');
        if (reminder) {
            const span = reminder.querySelector('span');
            if (span) {
                span.textContent = 'يرجى تفعيل زر التعديل للتمكن من تعديل التقديرات';
            }
            reminder.classList.add('show');
            setTimeout(() => {
                reminder.classList.remove('show');
            }, 3000);
        }
        return;
    }
    const modal = document.getElementById('appreciation-modal');
    const container = document.getElementById('appreciation-inputs-container');
    if (!modal || !container) return;

    container.innerHTML = '';
    const list = appState.appreciations || defaultAppreciations;

    list.forEach((app, index) => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '0.8rem';
        item.style.padding = '0.4rem 0.8rem';
        item.style.background = '#f8fafc';
        item.style.borderRadius = '8px';
        item.style.border = '1px solid #e2e8f0';

        item.innerHTML = `
            <div style="flex: 1; font-weight: 600; color: #475569; font-size: 0.8rem; min-width: 90px; direction: ltr; text-align: left;">
                ${formatValueWithComma(app.min)} - ${formatValueWithComma(app.max)}
            </div>
            <input type="text" value="${app.text}" 
                id="appr-input-${index}"
                style="flex: 2; padding: 0.4rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem;">
        `;
        container.appendChild(item);
    });

    modal.classList.add('open');
};

window.closeAppreciationModal = function () {
    const modal = document.getElementById('appreciation-modal');
    if (modal) modal.classList.remove('open');
};

window.saveAppreciations = function () {
    const list = appState.appreciations || JSON.parse(JSON.stringify(defaultAppreciations));

    list.forEach((app, index) => {
        const input = document.getElementById(`appr-input-${index}`);
        if (input) {
            app.text = input.value;
        }
    });

    appState.appreciations = list;
    saveAppState();
    renderGradingTable(); // Refresh table to show new texts
    closeAppreciationModal();

    if (window.showActivationToast) {
        window.showActivationToast('تم حفظ التقديرات المخصصة بنجاح', 'success');
    }
};
window.renderContinuousHeaders = function () {
    const config = appState.continuousConfig || defaultContinuousConfig;
    const cursor = 'pointer';
    const title = 'اضغط لتعديل العنوان والنقاط';

    // Discipline
    config.discipline.forEach((item, i) => {
        const el = document.getElementById(`ca-header-discipline-${i}`);
        if (el) {
            el.innerHTML = `${item.label}<br>(${item.max} ن)`;
            el.className = 'vertical-text ca-header-editable';
            el.style.cursor = cursor;
            el.title = title;
        }
    });

    config.inClass.forEach((item, i) => {
        const el = document.getElementById(`ca-header-inClass-${i}`);
        if (el) {
            el.innerHTML = `${item.label}<br>(${item.max} ن)`;
            el.className = 'vertical-text ca-header-editable';
            el.style.cursor = cursor;
            el.title = title;
        }
    });

    config.outClass.forEach((item, i) => {
        const el = document.getElementById(`ca-header-outClass-${i}`);
        if (el) {
            el.innerHTML = `${item.label}<br>(${item.max} ن)`;
            el.className = 'vertical-text ca-header-editable';
            el.style.cursor = cursor;
            el.title = title;
        }
    });
};

window.openCAHeaderConfig = function (type, index) {
    if (!isEditMode) {
        const reminder = document.getElementById('edit-mode-reminder');
        if (reminder) {
            reminder.classList.add('show');
            setTimeout(() => {
                reminder.classList.remove('show');
            }, 3000);
        }
        return;
    }
    const config = appState.continuousConfig || defaultContinuousConfig;
    const item = config[type][index];

    document.getElementById('ca-header-label-input').value = item.label;
    document.getElementById('ca-header-max-input').value = item.max;
    document.getElementById('ca-header-type-hidden').value = type;
    document.getElementById('ca-header-index-hidden').value = index;

    document.getElementById('ca-header-modal').classList.add('open');
};

window.closeCAHeaderModal = function () {
    document.getElementById('ca-header-modal').classList.remove('open');
};

window.saveCAHeaderConfig = function () {
    const type = document.getElementById('ca-header-type-hidden').value;
    const index = parseInt(document.getElementById('ca-header-index-hidden').value);
    const label = document.getElementById('ca-header-label-input').value;
    const max = parseFloat(document.getElementById('ca-header-max-input').value);

    if (!label || isNaN(max)) return;

    if (!appState.continuousConfig) appState.continuousConfig = JSON.parse(JSON.stringify(defaultContinuousConfig));
    appState.continuousConfig[type][index] = { label, max };

    saveAppState();
    renderContinuousHeaders();
    renderContinuousTable(); // Refresh validation
    closeCAHeaderModal();

    if (window.showActivationToast) {
        window.showActivationToast('تم تحديث إعدادات العمود بنجاح', 'success');
    }
};
// Helper to format values with commas for display
function formatValueWithComma(val, decimals = 2) {
    if (val === undefined || val === null || val === '') return '';
    // Handle strings that already have commas by replacing them with dots for parsing
    const normalizedVal = typeof val === 'string' ? val.replace(',', '.') : val;
    const num = parseFloat(normalizedVal);
    if (isNaN(num)) return val;
    // If decimals is negative, use dynamic formatting (e.g., 2 or 2,5)
    if (decimals < 0) return num.toString().replace('.', ',');
    return num.toFixed(decimals).replace('.', ',');
}

function formatNumber(n) { return isNaN(n) ? '0,00' : n.toFixed(2).replace('.', ','); }

// Helper to format values specifically for the grading book with exactly 2 decimal places (e.g., 5,20 instead of 05,20)
function formatGradingVal(val) {
    if (val === undefined || val === null || val === '') return '';
    const normalizedVal = typeof val === 'string' ? val.replace(',', '.') : val;
    const num = parseFloat(normalizedVal);
    if (isNaN(num)) return val;

    // Format to 2 decimal places and replace dot with comma
    return num.toFixed(2).replace('.', ',');
}





window.showStatisticsModal = function () {
    const modal = document.getElementById('stats-modal');
    if (!modal) return;

    document.body.classList.add('stats-view-active');
    document.body.style.overflow = 'hidden'; // منع التمرير في الخلفية
    populateStatsHeader();
    renderDetailedStats();

    modal.classList.add('open');
};

window.closeStatsModal = function () {
    const modal = document.getElementById('stats-modal');
    if (modal) {
        modal.classList.remove('open');
        document.body.classList.remove('stats-view-active');
        document.body.style.overflow = ''; // استعادة التمرير
    }
};

function populateStatsHeader() {
    const container = document.getElementById('stats-header-info');
    if (!container) return;

    const info = appState.teacherInfo;
    const currentClass = appState.classes[currentActiveClassIndex] || { name: '---' };

    container.innerHTML = `
        <div class="info-item"><span>${t('header_teacher')}:</span> <strong>${info.name || '---'}</strong></div>
        <div class="info-item"><span>${t('header_school')}:</span> <strong>${info.school || '---'}</strong></div>
        <div class="info-item"><span>${t('header_subject')}:</span> <strong>${getSubjectTranslation(currentClass.subject || info.subject)}</strong></div>
        <div class="info-item"><span>${t('header_group')}:</span> <strong>${currentClass.name}</strong></div>
        <div class="info-item"><span>${t('header_students_count')}:</span> <strong>${currentClass.students.filter(s => ((s.surname && s.surname.trim()) || (s.name && s.name.trim())) && s.activeTrimesters.includes(currentTrimester)).length}</strong></div>
        <div class="info-item"><span>${t('header_term')}:</span> <strong>${currentTrimester}</strong></div>
    `;
}

let statsBarChart = null;
let statsPieChart = null;
let comparisonSuccessChart = null;
let comparisonFailureChart = null;

let detailedStatsData = null; // تخزين الإحصائيات عالمياً للتفاعل مع الرسوم البيانية

function renderDetailedStats() {
    const content = document.getElementById('stats-content');
    if (!content) return;

    const currentClass = appState.classes[currentActiveClassIndex];
    if (!currentClass) return;

    const students = currentClass.students.filter(s => ((s.surname && s.surname.trim()) || (s.name && s.name.trim())) && s.activeTrimesters.includes(currentTrimester));
    const trimKey = `t${currentTrimester}`;

    const stats = calculateDetailedStats(students, trimKey);
    detailedStatsData = stats; // Save for click handlers

    // مساعد لبناء صفوف توزيع الدرجات مع خاصية التفاعل
    const buildDistRow = (label, metricKey) => {
        const m = stats.metrics[metricKey];
        const counts = m.counts;
        const cells = counts.map((c, i) => {
            const groupTotal = (i < 2) ? m.failed : m.passed;
            const pct = groupTotal ? ((c / groupTotal) * 100).toFixed(1).replace('.', ',') + '%' : '0,0%';
            const displayValue = c > 0 ? `${c} <small>(${pct})</small>` : '0';

            if (c > 0) {
                return `<td><span class="clickable-stat" onclick="showStudentList(event, '${label}', '${metricKey}', ${i})">${displayValue}</span></td>`;
            }
            return `<td>${displayValue}</td>`;
        }).join('');
        return `<tr><td><strong>${label}</strong></td>${cells}</tr>`;
    };

    // مساعد لبناء صفوف الأوائل (Top Students)
    let topStudentsRows = '';
    if (stats.topStudents.length === 0) {
        topStudentsRows = `<tr><td colspan="5">${t('stats_no_top')}</td></tr>`;
    } else {
        topStudentsRows = stats.topStudents.map(s => `
            <tr>
                <td><strong>${s.rank}</strong></td>
                <td>${s.listIndex}</td>
                <td>${s.surname}</td>
                <td>${s.name}</td>
                <td><strong>${formatNumber(s.average)}</strong></td>
            </tr>
        `).join('');
    }

    const buildSummaryRow = (label, metricKey) => {
        const m = stats.metrics[metricKey];
        const passedPct = m.total ? ((m.passed / m.total) * 100).toFixed(2).replace('.', ',') : '0,00';
        const failedPct = m.total ? (100 - parseFloat(passedPct.replace(',', '.'))).toFixed(2).replace('.', ',') : '0,00';
        return `
            <tr>
                <td><strong>${label}</strong></td>
                <td class="score-good">${m.passed}</td>
                <td class="score-good">${passedPct}%</td>
                <td class="score-bad">${m.failed}</td>
                <td class="score-bad">${failedPct}%</td>
            </tr>
        `;
    };

    // --- Compute Annual Average stats (T3 only) ---
    let annualAvgStats = null;
    let annualTopStudentsRows = '';
    if (currentTrimester === 3) {
        let annSum = 0, annPassed = 0, annTotal = 0;
        const annualStudentData = [];

        students.forEach((s, index) => {
            if (!s.gradingData) return;
            const a1 = parseFloat(s.gradingData['t1']?.average) || 0;
            const a2 = parseFloat(s.gradingData['t2']?.average) || 0;
            const a3 = parseFloat(s.gradingData['t3']?.average) || 0;
            if (a1 === 0 && a2 === 0 && a3 === 0) return;
            const annAvg = (a1 + a2 + a3) / 3;
            annSum += annAvg;
            annTotal++;
            if (annAvg >= 10) annPassed++;
            annualStudentData.push({ student: s, annAvg, listIndex: index + 1 });
        });

        annualAvgStats = {
            avg: annTotal ? annSum / annTotal : 0,
            passed: annPassed,
            failed: annTotal - annPassed,
            total: annTotal
        };

        // Compute ranges and max/min for distribution row and popup
        const annRanges = [
            { min: 0, max: 8 }, { min: 8, max: 10 }, { min: 10, max: 12 },
            { min: 12, max: 16 }, { min: 16, max: 18 }, { min: 18, max: 21 }
        ];
        const annCounts = [0, 0, 0, 0, 0, 0];
        const annLists = [[], [], [], [], [], []];
        let annMaxScore = undefined, annMinScore = undefined, annMaxStudents = [], annMinStudents = [];
        annualStudentData.forEach(d => {
            let ri = 5;
            if (d.annAvg < 8) ri = 0;
            else if (d.annAvg < 10) ri = 1;
            else if (d.annAvg < 12) ri = 2;
            else if (d.annAvg < 16) ri = 3;
            else if (d.annAvg < 18) ri = 4;
            annCounts[ri]++;
            annLists[ri].push(d.student);
            if (annMaxScore === undefined || d.annAvg > annMaxScore) { annMaxScore = d.annAvg; annMaxStudents = [d.student]; }
            else if (d.annAvg === annMaxScore) annMaxStudents.push(d.student);
            if (annMinScore === undefined || d.annAvg < annMinScore) { annMinScore = d.annAvg; annMinStudents = [d.student]; }
            else if (d.annAvg === annMinScore) annMinStudents.push(d.student);
        });

        // Inject into stats.metrics (for buildDistRow) and detailedStatsData (for showMinMaxStudents popup)
        const annualMetric = {
            avg: annualAvgStats.avg,
            counts: annCounts,
            lists: annLists,
            passed: annPassed,
            failed: annTotal - annPassed,
            total: annTotal,
            maxScore: annMaxScore,
            maxStudents: annMaxStudents,
            minScore: annMinScore,
            minStudents: annMinStudents
        };
        stats.metrics.annualAvg = annualMetric;
        if (detailedStatsData) detailedStatsData.metrics.annualAvg = annualMetric;

        const topByAnn = annualStudentData.filter(d => d.annAvg >= 17)
            .sort((a, b) => b.annAvg - a.annAvg);
        let annRank = 1;
        if (topByAnn.length === 0) {
            annualTopStudentsRows = `<tr><td colspan="5">${t('stats_no_top')}</td></tr>`;
        } else {
            annualTopStudentsRows = topByAnn.map((d, i) => {
                if (i > 0 && d.annAvg < topByAnn[i - 1].annAvg) annRank = i + 1;
                return `<tr>
                    <td><strong>${annRank}</strong></td>
                    <td>${d.listIndex}</td>
                    <td>${d.student.surname}</td>
                    <td>${d.student.name}</td>
                    <td><strong>${formatNumber(d.annAvg)}</strong></td>
                </tr>`;
            }).join('');
        }
    }

    const buildAnnualSummaryRow = () => {
        if (!annualAvgStats) return '';
        const m = annualAvgStats;
        const passedPct = m.total ? ((m.passed / m.total) * 100).toFixed(2).replace('.', ',') : '0,00';
        const failedPct = m.total ? (100 - parseFloat(passedPct.replace(',', '.'))).toFixed(2).replace('.', ',') : '0,00';
        return `<tr>
            <td><strong>${t('stats_lbl_annual_alt')}</strong></td>
            <td class="score-good">${m.passed}</td>
            <td class="score-good">${passedPct}%</td>
            <td class="score-bad">${m.failed}</td>
            <td class="score-bad">${failedPct}%</td>
        </tr>`;
    };

    content.innerHTML = `
        <div class="averages-summary">
            <div class="avg-box clickable-stat" onclick="showMinMaxStudents(event, '${t('stats_avg_assignment')}', 'assignment')"><span>${t('stats_avg_assignment')}</span> <strong>${formatNumber(stats.metrics.assignment.avg)}</strong></div>
            <div class="avg-box clickable-stat" onclick="showMinMaxStudents(event, '${t('stats_avg_exam')}', 'exam')"><span>${t('stats_avg_exam')}</span> <strong>${formatNumber(stats.metrics.exam.avg)}</strong></div>
            <div class="avg-box clickable-stat" onclick="showMinMaxStudents(event, '${t('stats_avg_subject')}', 'average')"><span>${t('stats_avg_subject')}</span> <strong>${formatNumber(stats.metrics.average.avg)}</strong></div>
            ${annualAvgStats ? `<div class="avg-box clickable-stat" onclick="showMinMaxStudents(event, '${t('stats_avg_annual_alt')}', 'annualAvg')"><span>${t('stats_avg_annual_alt')}</span> <strong>${formatNumber(annualAvgStats.avg)}</strong></div>` : ''}
        </div>

        <h3 style="margin-top:1.5rem; margin-bottom:0.5rem; border-bottom:2px solid #eee; padding-bottom:0.5rem;" data-i18n="stats_summary_title">${t('stats_summary_title')}</h3>
        <table class="stats-grid-table">
            <thead>
                <tr>
                    <th rowspan="2" data-i18n="stats_col_metric">${t('stats_col_metric')}</th>
                    <th colspan="2" data-i18n="stats_col_passed_desc">${t('stats_col_passed_desc')}</th>
                    <th colspan="2" data-i18n="stats_col_failed_desc">${t('stats_col_failed_desc')}</th>
                </tr>
                <tr>
                    <th data-i18n="stats_col_count">${t('stats_col_count')}</th>
                    <th data-i18n="stats_col_pct">${t('stats_col_pct')}</th>
                    <th data-i18n="stats_col_count">${t('stats_col_count')}</th>
                    <th data-i18n="stats_col_pct">${t('stats_col_pct')}</th>
                </tr>
            </thead>
            <tbody>
                ${buildSummaryRow(t('stats_lbl_assignment'), 'assignment')}
                ${buildSummaryRow(t('stats_lbl_exam'), 'exam')}
                ${buildSummaryRow(t('stats_lbl_subject'), 'average')}
                ${buildAnnualSummaryRow()}
            </tbody>
        </table>

        <h3 style="margin-top:1.5rem; margin-bottom:0.5rem; border-bottom:2px solid #eee; padding-bottom:0.5rem;" data-i18n="stats_dist_title">${t('stats_dist_title')}</h3>
        <table class="stats-grid-table">
            <thead>
                <tr>
                    <th data-i18n="stats_col_metric">${t('stats_col_metric')}</th>
                    ${stats.ranges.map(r => `<th>${r.label}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${buildDistRow(t('stats_lbl_assignment'), 'assignment')}
                ${buildDistRow(t('stats_lbl_exam'), 'exam')}
                ${buildDistRow(t('stats_lbl_subject'), 'average')}
                ${annualAvgStats ? buildDistRow(t('stats_lbl_annual_alt'), 'annualAvg') : ''}
            </tbody>
        </table>

        <h3 style="margin-top:2rem; margin-bottom:0.5rem; border-bottom:2px solid #eee; padding-bottom:0.5rem;" data-i18n="stats_top_title">${t('stats_top_title')}</h3>
        <table class="stats-grid-table top-students-table">
            <thead>
                <tr>
                    <th data-i18n="stats_col_rank">${t('stats_col_rank')}</th>
                    <th data-i18n="stats_col_index">${t('stats_col_index')}</th>
                    <th data-i18n="list_col_surname">${t('list_col_surname')}</th>
                    <th data-i18n="list_col_name">${t('list_col_name')}</th>
                    <th data-i18n="stats_lbl_subject">${t('stats_lbl_subject')}</th>
                </tr>
            </thead>
            <tbody>${topStudentsRows}</tbody>
        </table>

        ${annualAvgStats ? `
        <h3 style="margin-top:2rem; margin-bottom:0.5rem; border-bottom:2px solid #eee; padding-bottom:0.5rem;" data-i18n="stats_top_annual_title">${t('stats_top_annual_title')}</h3>
        <table class="stats-grid-table top-students-table">
            <thead>
                <tr>
                    <th data-i18n="stats_col_rank">${t('stats_col_rank')}</th>
                    <th data-i18n="stats_col_index">${t('stats_col_index')}</th>
                    <th data-i18n="list_col_surname">${t('list_col_surname')}</th>
                    <th data-i18n="list_col_name">${t('list_col_name')}</th>
                    <th data-i18n="stats_avg_annual_alt">${t('stats_avg_annual_alt')}</th>
                </tr>
            </thead>
            <tbody>${annualTopStudentsRows}</tbody>
        </table>` : ''}

        <div class="stats-grid-layouts">
            <div class="chart-container"><canvas id="statsBarChart"></canvas></div>
            <div class="chart-container"><canvas id="statsPieChart"></canvas></div>
        </div>
    `;

    // مستمع عالمي لإغلاق القائمة المنبثقة عند الضغط خارجها
    document.removeEventListener('click', closeStudentPopoverOutside);
    document.addEventListener('click', closeStudentPopoverOutside);

    setTimeout(() => initDetailedCharts(stats), 100);
}

function showStudentList(event, label, metricKey, rangeIndex) {
    event.stopPropagation();

    // Close any open popover and clear previous highlighting
    closeStudentPopover();

    const target = event.currentTarget;
    target.classList.add('stat-active-highlight');

    // التأكد من وجود القائمة المنبثقة في الصفحة
    let popover = document.getElementById('studentListPopover');
    if (!popover) {
        popover = document.createElement('div');
        popover.id = 'studentListPopover';
        popover.className = 'student-list-popover';
        document.body.appendChild(popover);
    } else if (popover.parentNode !== document.body) {
        // Move to body if not already
        popover.parentNode.removeChild(popover);
        document.body.appendChild(popover);
    }

    const list = detailedStatsData.metrics[metricKey].lists[rangeIndex];
    if (!list || list.length === 0) return;

    const rangeLabel = detailedStatsData.ranges[rangeIndex].label;
    const listHTML = list.map(s => `<li>${s.surname} ${s.name}</li>`).join('');

    popover.innerHTML = `
        <div class="popover-header">${label} - ${rangeLabel}</div>
        <ul>${listHTML}</ul>
    `;
    popover.style.display = 'block';

    // تحديد موقع القائمة عند مؤشر الفأرة (دائماً تحت المؤشر)
    const x = event.clientX;
    const y = event.clientY;

    const top = y + 15;
    let left = x + 15;

    // تفعيل العرض المؤقت لحساب الأبعاد
    popover.style.display = 'block';
    popover.style.position = 'fixed';
    popover.style.top = `${top}px`;

    // حساب الارتفاع الأقصى المتاح لضمان رؤية العنوان وعدم الخروج عن الشاشة
    const maxHeight = Math.max(150, window.innerHeight - top - 15);
    popover.style.maxHeight = `${maxHeight}px`;

    // معالجة الحافة اليمنى فقط
    const rect = popover.getBoundingClientRect();
    if (left + rect.width > window.innerWidth) {
        left = x - rect.width - 15;
    }

    popover.style.left = `${left}px`;
}

window.showMinMaxStudents = function (event, label, metricKey) {
    event.stopPropagation();
    closeStudentPopover();

    const target = event.currentTarget;
    target.classList.add('stat-active-highlight');

    let popover = document.getElementById('studentListPopover');
    if (!popover) {
        popover = document.createElement('div');
        popover.id = 'studentListPopover';
        popover.className = 'student-list-popover';
        document.body.appendChild(popover);
    }

    const m = detailedStatsData.metrics[metricKey];
    if (!m) return;

    const maxList = (m.maxStudents || []).map(s => `<li>${s.surname} ${s.name} <span class="badge badge-success">${formatNumber(m.maxScore)}</span></li>`).join('');
    const minList = (m.minStudents || []).map(s => `<li>${s.surname} ${s.name} <span class="badge badge-danger">${formatNumber(m.minScore)}</span></li>`).join('');

    popover.innerHTML = `
        <div class="popover-header">${label} - ${t('stats_popover_minmax')}</div>
        <div style="padding: 10px;">
            <div style="margin-bottom: 10px;">
                <strong style="color: #10b981;"><i class="fas fa-trophy"></i> ${t('stats_popover_max')}</strong>
                <ul style="margin-top: 5px; max-height: 150px; overflow-y: auto;">${maxList || '<li>---</li>'}</ul>
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0;">
            <div>
                <strong style="color: #ef4444;"><i class="fas fa-arrow-down"></i> ${t('stats_popover_min')}</strong>
                <ul style="margin-top: 5px; max-height: 150px; overflow-y: auto;">${minList || '<li>---</li>'}</ul>
            </div>
        </div>
    `;
    popover.style.display = 'block';

    // موقع النافذة (دائماً تحت المؤشر)
    const x = event.clientX;
    const y = event.clientY;

    const top = y + 15;
    let left = x + 15;

    popover.style.display = 'block';
    popover.style.position = 'fixed';
    popover.style.top = `${top}px`;

    // حساب الارتفاع الأقصى المتاح
    const maxHeight = Math.max(200, window.innerHeight - top - 15);
    popover.style.maxHeight = `${maxHeight}px`;

    const rect = popover.getBoundingClientRect();
    if (left + rect.width > window.innerWidth) left = x - rect.width - 15;

    popover.style.left = `${left}px`;
};

function closeStudentPopover() {
    const popover = document.getElementById('studentListPopover');
    if (popover) popover.style.display = 'none';

    // إزالة التلوين الأخضر من جميع العناصر
    document.querySelectorAll('.clickable-stat').forEach(el => {
        el.classList.remove('stat-active-highlight');
    });
}

function closeStudentPopoverOutside(event) {
    if (!event.target.closest('.student-list-popover') && !event.target.closest('.clickable-stat')) {
        closeStudentPopover();
    }
}



function initDetailedCharts(stats) {
    // تسجيل الإضافة (Plugin) إذا كانت متوفرة
    const plugins = (typeof ChartDataLabels !== 'undefined') ? [ChartDataLabels] : [];

    // ====== إعدادات موضع الكتابة في مخطط الأعمدة ======
    // يمكنك تغيير هذه القيم للتحكم في موضع النصوص
    const BAR_LABEL_ANCHOR = 'center';   // 'start', 'center', 'end'
    const BAR_LABEL_ALIGN = 'center';    // 'start', 'center', 'end', 'left', 'right', 'top', 'bottom'
    const BAR_LABEL_OFFSET = -10;        // إزاحة من نقطة الارتكاز بالبكسل (+ = بعيد عن المركز، - = قريب من المركز)
    // ملاحظة: للتحكم الأفقي استخدم align: 'left' أو 'right' مع anchor: 'center'
    // ================================================

    // Bar Chart
    const ctxBar = document.getElementById('statsBarChart');
    if (ctxBar) {
        if (statsBarChart) statsBarChart.destroy();
        const labels = [t('stats_lbl_assignment'), t('stats_lbl_exam'), t('stats_lbl_subject')];
        const passedData = [stats.metrics.assignment.passed, stats.metrics.exam.passed, stats.metrics.average.passed];
        const failedData = [stats.metrics.assignment.failed, stats.metrics.exam.failed, stats.metrics.average.failed];

        if (currentTrimester === 3 && stats.metrics.annualAvg) {
            labels.push(t('stats_lbl_annual_alt'));
            passedData.push(stats.metrics.annualAvg.passed);
            failedData.push(stats.metrics.annualAvg.failed);
        }

        statsBarChart = new Chart(ctxBar, {
            type: 'bar', // مخطط الأعمدة
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '>= 10.00',
                        data: passedData,
                        backgroundColor: '#10b981'
                    },
                    {
                        label: '< 10.00',
                        data: failedData,
                        backgroundColor: '#ef4444'
                    }
                ]
            },
            plugins: plugins,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 25
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: t('chart_success_failure_title'),
                        font: { size: 18, weight: 'bold', family: "'Tajawal', Tahoma, Geneva, Verdana, sans-serif" },
                        padding: { top: 0, bottom: 25 },
                        color: '#333',
                        align: 'center'
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    datalabels: {
                        display: false
                    }
                }
            }
        });
    }

    // مخطط الدائرة (Pie Chart)
    const ctxPie = document.getElementById('statsPieChart');
    if (ctxPie) {
        if (statsPieChart) statsPieChart.destroy();

        const passedPct = (stats.metrics.average.total > 0)
            ? ((stats.metrics.average.passed / stats.metrics.average.total) * 100).toFixed(1).replace('.', ',')
            : 0;
        const failedPct = (stats.metrics.average.total > 0)
            ? (100 - parseFloat(passedPct.replace(',', '.'))).toFixed(1).replace('.', ',')
            : 0;

        statsPieChart = new Chart(ctxPie, {
            type: 'pie',
            data: {
                labels: [`${t('chart_label_success')} (${passedPct}%)`, `${t('chart_label_failure')} (${failedPct}%)`],
                datasets: [{
                    data: [stats.metrics.average.passed, stats.metrics.average.failed],
                    backgroundColor: ['#10b981', '#ef4444']
                }]
            },
            plugins: plugins,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: t('chart_success_rate_title'),
                        font: { size: 18, weight: 'bold', family: "'Tajawal', Tahoma, Geneva, Verdana, sans-serif" },
                        padding: { bottom: 20 },
                        color: '#333',
                        align: 'center'
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    datalabels: {
                        display: false
                    }
                }
            }
        });
    }
}

window.showComparisonModal = function () {
    console.log("Triggering showComparisonModal..."); // Debug Log
    const modal = document.getElementById('comparison-modal');
    if (!modal) {
        console.error("Critical: #comparison-modal element not found in DOM!");
        return;
    }

    modal.classList.add('open');
    document.body.classList.add('stats-view-active'); // Ensure consistent backdrop behavior
    
    // Ensure modal scrolls to the top
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) modalContent.scrollTop = 0;
    modal.scrollTop = 0;

    // Populate header information
    populateHeaderInfo();

    // Close on outside click
    modal.onclick = (e) => {
        if (e.target === modal) window.closeComparisonModal();
    };

    try {
        renderComparisonTable();
        initComparisonCharts();
    } catch (err) {
        console.error("Error rendering comparison content:", err);
    }
};

window.closeComparisonModal = function () {
    const modal = document.getElementById('comparison-modal');
    if (modal) modal.classList.remove('open');
    document.body.classList.remove('stats-view-active');
};

function renderComparisonTable() {
    const table = document.getElementById('comparison-table');
    if (!table) {
        console.warn("Table container #comparison-table not found!");
        return;
    }

    const currentClass = appState.classes[currentActiveClassIndex];
    if (!currentClass) return;

    const students = currentClass.students.filter(s => ((s.surname && s.surname.trim()) || (s.name && s.name.trim())) && s.activeTrimesters.some(trim => trim <= currentTrimester));

    // Two-row header like the main Score Book
    let html = '<thead><tr>';
    html += `<th rowspan="2" style="width: 50px;">${t('list_col_num')}</th>`;
    html += `<th rowspan="2" class="comp-name-col" style="width: 220px;">${t('home_teacher_name_ph')}</th>`;

    // 1. Assignments Category
    html += `<th colspan="${currentTrimester}">${t('comp_col_assignment')}</th>`;
    // 2. Exams Category
    html += `<th colspan="${currentTrimester}">${t('comp_col_exam')}</th>`;
    // 3. Averages Category
    html += `<th colspan="${currentTrimester}">${t('comp_col_average')}</th>`;

    // 4. Annual Avg header
    const annualLabel = currentTrimester === 2 ? t('comp_avg_two_terms') : (currentTrimester === 3 ? t('comp_avg_three_terms') : t('comp_col_annual_avg'));
    html += `<th rowspan="2" class="annual-avg-col" style="width: 100px;">${annualLabel}</th>`;
    
    html += '</tr><tr>';
    
    // Level 2: Trimester numbers
    for (let c = 0; c < 3; c++) {
        for (let tri = 1; tri <= currentTrimester; tri++) {
            html += `<th class="comp-trim-col">${tri}</th>`;
        }
    }

    html += '</tr></thead><tbody>';

    const getGradeColor = (val) => {
        if (isNaN(val)) return 'inherit';
        if (val >= 17) return '#10b981'; // Green
        if (val >= 10) return 'inherit'; // Black (Standard)
        if (val >= 8) return '#f59e0b';  // Orange
        return '#ef4444';               // Red
    };

    students.forEach((s, idx) => {
        const isRTL = currentLang === 'ar';
        const nameAlign = isRTL ? 'right' : 'left';
        const namePadding = isRTL ? 'padding-right: 1.5rem;' : 'padding-left: 1.5rem;';
        
        html += `<tr><td>${idx + 1}</td><td class="comp-name-col" style="text-align: ${nameAlign}; ${namePadding}"><strong>${s.surname}</strong> ${s.name}</td>`;

        let annualSum = 0;
        let trimestersCount = 0;

        // Collect all data for this student
        const studentData = {};
        for (let tri = 1; tri <= currentTrimester; tri++) {
            const tk = `t${tri}`;
            const g = s.gradingData ? s.gradingData[tk] : null;
            studentData[tri] = {
                ass: g ? formatGradingVal(g.assignment) || '---' : '---',
                exa: g ? formatGradingVal(g.exam) || '---' : '---',
                avg: g ? formatGradingVal(g.average) || '---' : '---',
                assVal: (g && g.assignment !== '') ? parseFloat(g.assignment.toString().replace(',', '.')) : NaN,
                exaVal: (g && g.exam !== '') ? parseFloat(g.exam.toString().replace(',', '.')) : NaN,
                avgRaw: (g && g.average !== '' && g.average !== undefined) ? parseFloat(g.average.toString().replace(',', '.')) : NaN
            };
            if (!isNaN(studentData[tri].avgRaw)) {
                annualSum += studentData[tri].avgRaw;
                trimestersCount++;
            }
        }

        // Comparison Bolding (Between T1, T2, and T3 if available)
        const getBolding = (mKey, triNum) => {
            if (currentTrimester < 2) return '';
            
            // Collect all available scores for this metric
            const scores = [];
            for (let t = 1; t <= currentTrimester; t++) {
                const val = studentData[t][mKey];
                if (!isNaN(val)) scores.push({ tri: t, val: val });
            }
            
            if (scores.length < 2) return '';

            // Find max value
            const maxVal = Math.max(...scores.map(s => s.val));
            const currentVal = studentData[triNum][mKey];
            
            if (!isNaN(currentVal) && currentVal === maxVal) {
                // Check if it's uniquely the max or if there are others (usually bolding all maxes is fine)
                return 'font-weight: bold;';
            }
            return '';
        };

        // Render Assignments
        for (let tri = 1; tri <= currentTrimester; tri++) {
            const bold = getBolding('assVal', tri);
            html += `<td class="comparison-col-shaded comp-trim-col" style="${bold}">${studentData[tri].ass}</td>`;
        }
        // Render Exams
        for (let tri = 1; tri <= currentTrimester; tri++) {
            const bold = getBolding('exaVal', tri);
            html += `<td class="comp-trim-col" style="${bold}">${studentData[tri].exa}</td>`;
        }
        // Render Averages
        for (let tri = 1; tri <= currentTrimester; tri++) {
            const avgVal = studentData[tri].avgRaw;
            const bold = getBolding('avgRaw', tri);
            const color = getGradeColor(avgVal);
            const extraStyle = (color === 'inherit' && !bold) ? '' : `style="color: ${color} !important; ${bold}"`;
            html += `<td class="comparison-col-shaded comp-trim-col"><span ${extraStyle}>${studentData[tri].avg}</span></td>`;
        }

        const annAvg = trimestersCount > 0 ? (annualSum / trimestersCount) : 0;
        const annColor = getGradeColor(annAvg);
        const annColorAttr = annColor === 'inherit' ? 'style="font-weight: bold;"' : `style="font-weight: bold; color: ${annColor} !important;"`;
        html += `<td class="annual-avg-col" ${annColorAttr}>${trimestersCount > 0 ? formatGradingVal(annAvg) : '---'}</td>`;
        html += '</tr>';
    });

    html += '</tbody>';
    table.innerHTML = html;
}

window.exportComparisonToWord = function () {
    const feedback = document.createElement('div');
    feedback.style = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#2b579a; color:white; padding:15px 30px; border-radius:30px; z-index:99999; box-shadow:0 10px 25px rgba(0,0,0,0.2); font-family:Tajawal; font-weight:bold;";
    feedback.innerText = t('msg_preparing_word');
    document.body.appendChild(feedback);

    try {
        const cls = appState.classes[currentActiveClassIndex];
        if (!cls) throw new Error(t('msg_select_class'));

        const info = appState.teacherInfo;
        const tri = parseInt(currentTrimester);
        const isRTL = currentLang === 'ar';
        const docDir = isRTL ? 'rtl' : 'ltr';
        const alignStart = isRTL ? 'right' : 'left';
        const alignEnd = isRTL ? 'left' : 'right';

        // Capture Charts as Images
        const barCanvasSuccess = document.getElementById('comparisonSuccessChart');
        const barCanvasFailure = document.getElementById('comparisonFailureChart');
        let chartImg1 = '', chartImg2 = '';
        if (barCanvasSuccess) chartImg1 = barCanvasSuccess.toDataURL('image/png');
        if (barCanvasFailure) chartImg2 = barCanvasFailure.toDataURL('image/png');

        // Word-specific styles
        const tableStyle = `
            border-collapse: collapse;
            width: 100%;
            font-size: 10pt;
            font-family: 'Tajawal', sans-serif;
            text-align: center;
            margin-left: auto;
            margin-right: auto;
            table-layout: fixed;
            word-wrap: break-word;
        `;

        const thStyle = `
            border: 1px solid #000;
            padding: 8px 4px;
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
        `;

        const tdStyle = `
            border: 1px solid #000;
            padding: 6px 4px;
            text-align: center;
            vertical-align: middle;
        `;

        // 1. Identification Header
        const headerHtml = `
            <div style="text-align: center; margin-bottom: 30px;">
                <table align="center" style="border: 2px solid #2b579a; border-collapse: collapse; margin-bottom: 20px; max-width: 95%; margin-left: auto; margin-right: auto;">
                    <tr>
                        <td style="padding: 10px 20px; text-align: center;">
                            <p style="margin: 0; font-size: 24pt; font-weight: bold; color: #2b579a; white-space: normal; text-align: center;">${t('comparison_modal_title')}</p>
                        </td>
                    </tr>
                </table>
                <p style="margin: 10px 0 0 0; font-size: 12pt; text-align: center;"><span style="font-weight: bold;">${t('header_academic_year')}:</span> <span dir="${docDir}" style="unicode-bidi: embed;">${info.year || '---'}</span></p>
            </div>
            
            <table style="width: 100%; margin-bottom: 20px; font-size: 12pt; border: none;" dir="${docDir}">
                <tr>
                    <td style="border: none; text-align: ${alignStart}; width: 33%; padding: 5px;"><b>${t('header_teacher')}:</b> ${info.name || '---'}</td>
                    <td style="border: none; text-align: center; width: 33%; padding: 5px;"><b>${t('header_school')}:</b> ${info.school || '---'}</td>
                    <td style="border: none; text-align: ${alignEnd}; width: 33%; padding: 5px;"><b>${t('header_group')}:</b> ${cls.name}</td>
                </tr>
                <tr>
                    <td style="border: none; text-align: ${alignStart}; padding: 5px;"><b>${t('header_subject')}:</b> ${getSubjectTranslation(cls.subject || info.subject)}</td>
                    <td style="border: none; text-align: center; padding: 5px;"><b>${t('header_term')}:</b> ${tri}</td>
                    <td style="border: none; text-align: ${alignEnd}; padding: 5px;"><b>${t('header_students_count')}:</b> ${cls.students.length}</td>
                </tr>
            </table>
        `;

        // Clone the table and clean up for Word
        const originalTable = document.getElementById('comparison-table');
        if (!originalTable) throw new Error('Table not found');
        
        const clonedTable = originalTable.cloneNode(true);
        clonedTable.removeAttribute('id');
        
        // Apply inline styles to all TH and TD for Word compatibility
        clonedTable.querySelectorAll('tr').forEach(tr => {
            const cells = Array.from(tr.children);
            cells.forEach((cell, cellIdx) => {
                const isTh = cell.tagName === 'TH';
                let s = isTh ? thStyle : tdStyle;
                
                // --- SPECIAL: TRIMESTER COLUMN WIDTH ---
                if (cell.classList.contains('comp-trim-col')) {
                    s += " width: 60px; min-width: 60px;";
                }
                
                // --- SPECIAL: NAME COLUMN WIDTH ---
                if (cell.classList.contains('comp-name-col')) {
                    s += " width: 250px; min-width: 250px;"; // Larger width for names
                }

                if (cell.getAttribute('colspan')) {
                    const cs = parseInt(cell.getAttribute('colspan'));
                    if (cs > 1 && cell.innerText !== t('home_teacher_name_ph')) {
                        s += ` width: ${cs * 60}px;`;
                    }
                }
                
                if (!isTh) {
                    if (cell.classList.contains('annual-avg-col')) s += " background-color: #f9fbfd; font-weight: bold;";
                    if (cell.classList.contains('comparison-col-shaded')) s += " background-color: #fcfcfc;";
                    
                    // Check for alignment
                    if (cell.style.textAlign === 'right') s += " text-align: right; padding-right: 10px;";
                    if (cell.style.textAlign === 'left') s += " text-align: left; padding-left: 10px;";
                    
                    // Handle child spans (colors/bold)
                    cell.querySelectorAll('span').forEach(span => {
                        if (span.style.color) span.style.color = span.style.color; 
                        if (span.style.fontWeight === 'bold') span.style.fontWeight = 'bold';
                    });
                }
                
                cell.style.cssText = s;
            });
        });
        
        clonedTable.style.cssText = tableStyle;
        clonedTable.setAttribute('dir', docDir);

        const fullHtml = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>${t('comparison_modal_title')} - ${cls.name}</title>

                <style>
                    @page {
                        mso-page-orientation: landscape;
                        size: A4 landscape;
                        margin: 0.5in;
                        mso-header-margin: 0.5in;
                        mso-footer-margin: 0.5in;
                    }
                    div.Section1 { 
                        page: Section1;
                        mso-page-orientation: landscape;
                        margin: 0.5in;
                    }
                    body { font-family: 'Tajawal', 'Arial', sans-serif; direction: ${docDir}; }
                    table { border-collapse: collapse; width: 100%; }
                    .chart-title { font-size: 14pt; font-weight: bold; color: #2b579a; margin-top: 30px; border-bottom: 1px solid #2b579a; padding-bottom: 5px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="Section1">
                    ${headerHtml}
                    ${clonedTable.outerHTML}
                    
                    <br><br>
                    
                    ${chartImg1 ? `
                    <div style="page-break-before: auto; text-align: center;">
                        <h3 class="chart-title">${t('chart_comparison_success_title')}</h3>
                        <div style="text-align: center; margin-top: 10px;">
                            <img src="${chartImg1}" width="700" style="width: 18.5cm; border: 1px solid #eee;">
                        </div>
                    </div>` : ''}

                    ${chartImg2 ? `
                    <div style="page-break-before: auto; text-align: center; margin-top: 40px;">
                        <h3 class="chart-title">${t('chart_comparison_failure_title')}</h3>
                        <div style="text-align: center; margin-top: 10px;">
                            <img src="${chartImg2}" width="700" style="width: 18.5cm; border: 1px solid #eee;">
                        </div>
                    </div>` : ''}

                    <br>
                    <div style="float: ${alignEnd}; text-align: ${alignEnd}; margin-top: 10px;">
                        <p style="font-size: 10pt; color: #666; margin: 0;">${t('msg_export_date')} ${getFormattedDate()}</p>
                        ${info.logo ? `<img src="${info.logo}" width="80" height="80" style="width: 2.12cm; height: 2.12cm; margin-top: 5px;">` : ''}
                    </div>
                </div>
            </body>
            </html>
        `;

        const filename = `${t('comparison_modal_title')}_${cls.name}.docx`;
        showWordPreview(fullHtml, filename, 'landscape');

        feedback.remove();
    } catch (err) {
        if (feedback) feedback.remove();
        console.error(err);
        alert('حدث خطأ أثناء تصدير المقارنة لـ Word: ' + err.message);
    }
};

function initComparisonCharts() {
    const currentClass = appState.classes[currentActiveClassIndex];
    if (!currentClass) return;
    const students = currentClass.students.filter(s => ((s.surname && s.surname.trim()) || (s.name && s.name.trim())));

    const datasetsSuccess = [];
    const datasetsFailure = [];

    const labels = [t('comp_col_assignment'), t('comp_col_exam'), t('comp_col_average')];

    // Metrics: [Assignment, Exam, Term Avg]
    for (let tri = 1; tri <= currentTrimester; tri++) {
        const tk = `t${tri}`;
        let countAss = 0, countExa = 0, countAvg = 0;
        let failAss = 0, failExa = 0, failAvg = 0;

        students.forEach(s => {
            if (!s.activeTrimesters || !s.activeTrimesters.includes(tri)) return;
            const g = s.gradingData ? s.gradingData[tk] : null;

            if (g) {
                const assVal = parseFloat(g.assignment?.toString().replace(',', '.'));
                const exaVal = parseFloat(g.exam?.toString().replace(',', '.'));
                const avgVal = parseFloat(g.average?.toString().replace(',', '.'));

                if (!isNaN(assVal)) { if (assVal >= 10) countAss++; else failAss++; }
                if (!isNaN(exaVal)) { if (exaVal >= 10) countExa++; else failExa++; }
                if (!isNaN(avgVal)) { if (avgVal >= 10) countAvg++; else failAvg++; }
            }
        });

        const successColors = ['#4f46e5', '#10b981', '#f59e0b']; // Indigo, Green, Amber
        const failureColors = ['#f87171', '#fb923c', '#f472b6']; // Red, Orange, Pink

        datasetsSuccess.push({
            label: `${t('header_term')} ${tri}`,
            data: [countAss, countExa, countAvg],
            backgroundColor: successColors[tri - 1],
            borderRadius: 8
        });

        datasetsFailure.push({
            label: `${t('header_term')} ${tri}`,
            data: [failAss, failExa, failAvg],
            backgroundColor: failureColors[tri - 1],
            borderRadius: 8
        });
    }

    // Drawing Success Chart
    const ctxSuccess = document.getElementById('comparisonSuccessChart');
    if (ctxSuccess) {
        if (comparisonSuccessChart) comparisonSuccessChart.destroy();
        comparisonSuccessChart = new Chart(ctxSuccess, {
            type: 'bar',
            data: { labels, datasets: datasetsSuccess },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: t('chart_comparison_success_title'), font: { size: 18, weight: '700', family: 'Tajawal' }, padding: 20 },
                    legend: { position: 'bottom', labels: { font: { family: 'Tajawal' } } }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1, font: { family: 'Tajawal' } } },
                    x: { ticks: { font: { family: 'Tajawal', weight: '600' } } }
                }
            }
        });
    }

    // Drawing Failure Chart
    const ctxFailure = document.getElementById('comparisonFailureChart');
    if (ctxFailure) {
        if (comparisonFailureChart) comparisonFailureChart.destroy();
        comparisonFailureChart = new Chart(ctxFailure, {
            type: 'bar',
            data: { labels, datasets: datasetsFailure },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: t('chart_comparison_failure_title'), font: { size: 18, weight: '700', family: 'Tajawal' }, padding: 20 },
                    legend: { position: 'bottom', labels: { font: { family: 'Tajawal' } } }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1, font: { family: 'Tajawal' } } },
                    x: { ticks: { font: { family: 'Tajawal', weight: '600' } } }
                }
            }
        });
    }
}

function calculateDetailedStats(students, trimKey) {
    // النطاقات: <8، 8-9.99، 10-11.99، 12-15.99، 16-17.99، 18-20.00
    // المؤشرات: 0، 1، 2، 3، 4، 5
    const ranges = [
        { min: 0, max: 8, label: t('range_under_8') },
        { min: 8, max: 10, label: t('range_8_10') },
        { min: 10, max: 12, label: t('range_10_12') },
        { min: 12, max: 16, label: t('range_12_16') },
        { min: 16, max: 18, label: t('range_16_18') },
        { min: 18, max: 21, label: t('range_18_20') }
    ];

    const stats = {
        assignment: { counts: [0, 0, 0, 0, 0, 0], lists: [[], [], [], [], [], []], total: 0, sum: 0, passed: 0, maxScore: undefined, maxStudents: [], minScore: undefined, minStudents: [] },
        exam: { counts: [0, 0, 0, 0, 0, 0], lists: [[], [], [], [], [], []], total: 0, sum: 0, passed: 0, maxScore: undefined, maxStudents: [], minScore: undefined, minStudents: [] },
        average: { counts: [0, 0, 0, 0, 0, 0], lists: [[], [], [], [], [], []], total: 0, sum: 0, passed: 0, maxScore: undefined, maxStudents: [], minScore: undefined, minStudents: [] }
    };

    const topStudents = [];

    students.forEach((s, index) => {
        if (!s.gradingData) return;
        const data = s.gradingData[trimKey];

        const processMetric = (val, type) => {
            const num = parseFloat(val);
            if (!isNaN(num)) {
                stats[type].sum += num;
                stats[type].total++;
                if (num >= 10) stats[type].passed++;

                // تتبع أعلى وأقل علامة
                if (stats[type].maxScore === undefined || num > stats[type].maxScore) {
                    stats[type].maxScore = num;
                    stats[type].maxStudents = [s];
                } else if (num === stats[type].maxScore) {
                    stats[type].maxStudents.push(s);
                }

                if (stats[type].minScore === undefined || num < stats[type].minScore) {
                    stats[type].minScore = num;
                    stats[type].minStudents = [s];
                } else if (num === stats[type].minScore) {
                    stats[type].minStudents.push(s);
                }

                // تحديد النطاق (Range)
                let rangeIndex = 5;
                if (num < 8) rangeIndex = 0;
                else if (num < 10) rangeIndex = 1;
                else if (num < 12) rangeIndex = 2;
                else if (num < 16) rangeIndex = 3;
                else if (num < 18) rangeIndex = 4;

                stats[type].counts[rangeIndex]++;
                stats[type].lists[rangeIndex].push(s);
            }
        };

        processMetric(data.assignment, 'assignment');
        processMetric(data.exam, 'exam');
        processMetric(data.average, 'average');

        // الأوائل في المادة (المعدل >= 17)
        const avg = parseFloat(data.average);
        if (!isNaN(avg) && avg >= 17) {
            topStudents.push({
                listIndex: index + 1, // تخزين الرقم الأصلي (يبدأ من 1)
                surname: s.surname,
                name: s.name,
                average: avg
            });
        }
    });

    // ترتيب الأوائل تنازلياً
    topStudents.sort((a, b) => b.average - a.average);
    // تعيين الرتب (Ranks)
    let currentRank = 1;
    topStudents.forEach((s, i) => {
        if (i > 0 && s.average < topStudents[i - 1].average) {
            currentRank = i + 1;
        }
        s.rank = currentRank;
    });

    // حساب المعدلات والنسب المئوية
    const results = {
        ranges: ranges,
        topStudents: topStudents,
        metrics: {}
    };

    ['assignment', 'exam', 'average'].forEach(key => {
        const s = stats[key];
        results.metrics[key] = {
            avg: s.total ? (s.sum / s.total) : 0,
            counts: s.counts,
            lists: s.lists,
            passed: s.passed,
            failed: s.total - s.passed,
            total: s.total,
            maxScore: s.maxScore,
            maxStudents: s.maxStudents,
            minScore: s.minScore,
            minStudents: s.minStudents
        };
    });

    return results;
}

// --- منطق تصدير ملفات PDF ---
window.exportMonitoringToPDF = function () {
    // 1. المنطق الأساسي واحتياطات السلامة
    if (typeof html2pdf === 'undefined') {
        alert('خطأ: مكتبة تسيير PDF لم يتم تحميلها بشكل صحيح. يرجى التحقق من الاتصال بالإنترنت.');
        return;
    }

    // إعلام المستخدم فوراً
    const feedback = document.createElement('div');
    feedback.style = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#e74c3c; color:white; padding:15px 30px; border-radius:30px; z-index:99999; box-shadow:0 10px 25px rgba(0,0,0,0.2); font-family:Tajawal; font-weight:bold;";
    feedback.innerText = "جاري تحضير ملف PDF... يرجى الانتظار";
    document.body.appendChild(feedback);

    try {
        const cls = appState.classes[currentActiveClassIndex];
        if (!cls) throw new Error("يرجى اختيار قسم أولاً");

        const info = appState.teacherInfo;
        const tri = parseInt(currentTrimester);
        const trimKey = `t${tri}`;

        const students = cls.students.filter(s =>
            ((s.surname && s.surname.trim()) || (s.name && s.name.trim())) &&
            (!s.activeTrimesters || s.activeTrimesters.includes(tri))
        );

        // 2. Build Table Content
        const tableHeadersHtml = `
            <thead>
                <tr>
                    <th rowspan="2" style="background: #f0f0f0; width: 35px;">رقم</th>
                    <th rowspan="2" style="background: #f0f0f0; width: 100px;">اللقب</th>
                    <th rowspan="2" style="background: #f0f0f0; width: 100px;">الاسم</th>
                    <th rowspan="2" style="background: #f0f0f0; width: 60px;">الإنضباط</th>
                    <th colspan="4" style="background: #f0f0f0;">الواجبات المنزلية</th>
                    <th colspan="3" style="background: #f0f0f0;">الواجبات الشهرية</th>
                </tr>
                <tr>
                    <th style="background: #f0f0f0;">إجمالي</th>
                    <th style="background: #f0f0f0;">أنجزت</th>
                    <th style="background: #f0f0f0;">لم تنجز</th>
                    <th style="background: #f0f0f0;">العلامة</th>
                    <th style="background: #f0f0f0;">الواجب 01</th>
                    <th style="background: #f0f0f0;">الواجب 02</th>
                    <th style="background: #f0f0f0;">العلامة</th>
                </tr>
            </thead>
        `;

        let rowsHtml = '';
        students.forEach((s, i) => {
            const d = (s.monitoringData && s.monitoringData[trimKey]) || { discipline: '', homework: ['', '', '', ''], monthly: ['', '', ''] };
            rowsHtml += `
            <tr style="page-break-inside: avoid;">
                <td style="text-align: center; font-weight: bold;">${i + 1}</td>
                <td style="text-align: right; font-weight: bold;">${s.surname || ''}</td>
                <td style="text-align: right;">${s.name || ''}</td>
                <td style="text-align: center;">${formatValueWithComma(d.discipline)}</td>
                <td style="text-align: center;">${formatValueWithComma(d.homework?.[0], 0)}</td>
                <td style="text-align: center;">${formatValueWithComma(d.homework?.[1], 0)}</td>
                <td style="text-align: center;">${formatValueWithComma(d.homework?.[2], 0)}</td>
                <td style="text-align: center; font-weight: bold;">${formatValueWithComma(d.homework?.[3])}</td>
                <td style="text-align: center;">${formatValueWithComma(d.monthly?.[0])}</td>
                <td style="text-align: center;">${formatValueWithComma(d.monthly?.[1])}</td>
                <td style="text-align: center; font-weight: bold;">${formatValueWithComma(d.monthly?.[2])}</td>
            </tr>`;
        });

        // 3. Refined Template (Margins & Taller Rows)
        const html = `
        <div style="direction: rtl; font-family: Tajawal, sans-serif; width: 100%; margin: 0; padding: 5mm;">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap');
                * { box-sizing: border-box; }
                tbody tr { page-break-inside: avoid; }
                thead { display: table-header-group; }
                .top-bar { border-bottom: 3px solid #f00; margin: 0 0 8px 0; padding: 0; text-align: center; }
                .title { margin: 0; padding: 0; font-size: 22px; color: #f00; font-weight: bold; line-height: 1.2; }
                .info-tbl { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 11px; table-layout: fixed; direction: rtl; }
                .info-tbl td { border: 1px solid #000; padding: 7px 10px; text-align: right; vertical-align: middle; }
                .main-tbl { width: 100%; border-collapse: collapse; font-size: 9px; table-layout: fixed; direction: rtl; }
                .main-tbl th, .main-tbl td { border: 1px solid #000; padding: 8px 4px; overflow: hidden; text-align: center; }
                .main-tbl th:first-child, .main-tbl td:first-child { border-right: 2px solid #000 !important; }
                .main-tbl th:last-child, .main-tbl td:last-child { border-left: 2px solid #000 !important; }
            </style>
            
            <div class="top-bar">
                <h1 class="title">جدول مراقبة  الأعمال</h1>
                <div style="font-size: 12px; margin: 2px 0;"><span>السنة الدراسية</span> : <bdi dir="rtl">${info.year || '---'}</bdi></div>
            </div>

            <table class="info-tbl">
                <tr>
                    <td><b>الأستاذ</b> : ${info.name || '---'}</td>
                    <td style="width:33.3%"><b>المؤسسة</b> : ${info.school || '---'}</td>
                    <td style="width:33.3%"><b>الفوج التربوي</b> : <bdi dir="rtl">${cls.name}</bdi></td>
                </tr>
                <tr>
                    <td><b>المادة</b> : ${cls.subject || info.subject || '---'}</td>
                    <td><b>الفصل</b> : ${tri}</td>
                    <td><b>عدد التلاميذ</b> : ${students.length}</td>
                </tr>
            </table>

            <table class="main-tbl">
                ${tableHeadersHtml}
                <tbody>${rowsHtml}</tbody>
            </table>
        </div>`;

        // 4. PDF Config (Side Margins & Vertical Flow)
        const options = {
            margin: [10, 2, 10, 12], // 10mm top margin for all pages
            filename: `مراقبة_${cls.name}_الفصل_${tri}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] }
        };

        // --- Try Electron save dialog first ---
        if (window.electronAPI && window.electronAPI.saveFile) {
            html2pdf().set(options).from(html).output('arraybuffer').then(async (buffer) => {
                const saved = await window.electronAPI.saveFile({
                    defaultPath: options.filename,
                    buffer: Array.from(new Uint8Array(buffer)),
                    filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
                });
                if (saved) {
                    if (window.showActivationToast) {
                        window.showActivationToast('تم حفظ ملف PDF بنجاح ✓', 'success');
                    }
                }
                feedback.remove();
            }).catch(e => {
                feedback.remove();
                alert("خطأ أثناء الحفظ (Electron): " + e.message);
                alert(t('error_save') + ": " + e.message);
            });
            return;
        }

        // --- Fallback: browser-style download ---
        html2pdf().set(options).from(html).save().then(() => {
            feedback.remove();
        }).catch(e => {
            feedback.remove();
            alert(t('error_save') + ": " + e.message);
        });

    } catch (err) {
        feedback.remove();
        alert(t('error') + ': ' + err.message);
    }
};


window.exportMonitoringToWord = function () {
    const feedback = document.createElement('div');
    feedback.style = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#2b579a; color:white; padding:15px 30px; border-radius:30px; z-index:99999; box-shadow:0 10px 25px rgba(0,0,0,0.2); font-family:Tajawal; font-weight:bold;";
    feedback.innerHTML = `<i class="fas fa-sync-alt fa-spin" style="margin-inline-end:10px;"></i> ${t('msg_preparing_word')}`;
    document.body.appendChild(feedback);

    try {
        const cls = appState.classes[currentActiveClassIndex];
        if (!cls) throw new Error(t('msg_select_class') || "Please select a group first");

        const info = appState.teacherInfo;
        const tri = parseInt(currentTrimester);
        const trimKey = `t${tri}`;

        const students = cls.students.filter(s =>
            ((s.surname && s.surname.trim()) || (s.name && s.name.trim())) &&
            (!s.activeTrimesters || s.activeTrimesters.includes(tri))
        );

        const isRTL = currentLang === 'ar';
        const docDir = isRTL ? 'rtl' : 'ltr';
        const alignStart = isRTL ? 'right' : 'left';
        const alignEnd = isRTL ? 'left' : 'right';

        // Word-specific styles for better table formatting
        const tableStyle = `
            border-collapse: collapse;
            width: 100%;
            font-size: 11pt;
            font-family: 'Tajawal', sans-serif;
            text-align: center;
            direction: ${docDir};
        `;

        const thStyle = `
            border: 1px solid #000;
            padding: 8px 4px;
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
        `;

        const tdStyle = `
            border: 1px solid #000;
            padding: 6px 4px;
            text-align: center;
            vertical-align: middle;
        `;

        const tdNameStyle = `
            border: 1px solid #000;
            padding: 6px 4px;
            text-align: ${alignStart};
            vertical-align: middle;
            font-weight: bold;
        `;

        const tableHeadersHtml = `
            <thead>
                <tr>
                    <th rowspan="2" style="${thStyle} width: 40px;">${t('list_col_num')}</th>
                    <th rowspan="2" style="${thStyle} width: 120px;">${t('list_col_surname')}</th>
                    <th rowspan="2" style="${thStyle} width: 120px;">${t('list_col_name')}</th>
                    <th rowspan="2" style="${thStyle} width: 70px;">${t('monitoring_col_disc')}</th>
                    <th colspan="4" style="${thStyle}">${t('monitoring_col_hw')}</th>
                    <th colspan="3" style="${thStyle}">${t('monitoring_col_mhw')}</th>
                </tr>
                <tr>
                    <th style="${thStyle}">${t('monitoring_sub_total')}</th>
                    <th style="${thStyle}">${t('monitoring_sub_done')}</th>
                    <th style="${thStyle}">${t('monitoring_sub_miss')}</th>
                    <th style="${thStyle}">${t('monitoring_sub_mark')}</th>
                    <th style="${thStyle}">${t('monitoring_sub_hw1')}</th>
                    <th style="${thStyle}">${t('monitoring_sub_hw2')}</th>
                    <th style="${thStyle}">${t('monitoring_sub_mark')}</th>
                </tr>
            </thead>
        `;

        let rowsHtml = '';
        students.forEach((s, i) => {
            const d = (s.monitoringData && s.monitoringData[trimKey]) || { discipline: '', homework: ['', '', '', ''], monthly: ['', '', ''] };
            rowsHtml += `
            <tr>
                <td style="${tdStyle} font-weight: bold;">${i + 1}</td>
                <td style="${tdNameStyle}">${s.surname || ''}</td>
                <td style="${tdNameStyle.replace('font-weight: bold;', 'font-weight: normal;')}">${s.name || ''}</td>
                <td style="${tdStyle}">${formatValueWithComma(d.discipline)}</td>
                <td style="${tdStyle}">${formatValueWithComma(d.homework?.[0], 0)}</td>
                <td style="${tdStyle} color: #10b981; font-weight: bold;">${formatValueWithComma(d.homework?.[1], 0)}</td>
                <td style="${tdStyle} color: #ef4444; font-weight: bold;">${formatValueWithComma(d.homework?.[2], 0)}</td>
                <td style="${tdStyle} font-weight: bold; background-color: #fafafa;">${formatValueWithComma(d.homework?.[3])}</td>
                <td style="${tdStyle}">${formatValueWithComma(d.monthly?.[0], -1)}</td>
                <td style="${tdStyle}">${formatValueWithComma(d.monthly?.[1], -1)}</td>
                <td style="${tdStyle} font-weight: bold; background-color: #fafafa;">${formatValueWithComma(d.monthly?.[2])}</td>
            </tr>`;
        });

        const headerHtml = `
            <div style="text-align: center; margin-bottom: 30px;">
                <table align="center" style="border: 2px solid #2b579a; border-collapse: collapse; margin-bottom: 20px; max-width: 95%; margin-left: auto; margin-right: auto;">
                    <tr>
                        <td style="padding: 10px 20px; text-align: center;">
                            <p style="margin: 0; font-size: 24pt; font-weight: bold; color: #2b579a; white-space: normal; text-align: center;">${t('export_title_monitoring')}</p>
                        </td>
                    </tr>
                </table>
                <p style="margin: 10px 0 0 0; font-size: 12pt; text-align: center;"><span style="font-weight: bold;">${t('header_academic_year')}:</span> <span dir="${docDir}" style="unicode-bidi: embed;">${info.year || '---'}</span></p>
            </div>
            
            <table style="width: 100%; margin-bottom: 20px; font-size: 12pt; border: none;" dir="${docDir}">
                <tr>
                    <td style="border: none; text-align: ${alignStart}; width: 33%; padding: 5px;"><b>${t('header_teacher')}:</b> ${info.name || '---'}</td>
                    <td style="border: none; text-align: center; width: 33%; padding: 5px;"><b>${t('header_school')}:</b> ${info.school || '---'}</td>
                    <td style="border: none; text-align: ${alignEnd}; width: 33%; padding: 5px;"><b>${t('header_group')}:</b> ${cls.name}</td>
                </tr>
                <tr>
                    <td style="border: none; text-align: ${alignStart}; padding: 5px;"><b>${t('header_subject')}:</b> ${getSubjectTranslation(cls.subject || info.subject)}</td>
                    <td style="border: none; text-align: center; padding: 5px;"><b>${t('header_term')}:</b> ${tri}</td>
                    <td style="border: none; text-align: ${alignEnd}; padding: 5px;"><b>${t('header_students_count')}:</b> ${students.length}</td>
                </tr>
            </table>
        `;

        const fullHtml = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>${t('export_title_monitoring')}</title>

                <style>
                    /* Narrow Margins: 0.5cm */
                    /* Narrow Margins: 0.5in = 1.27cm, but using specific page directives for Word */
                    @page {
                        size: A4 portrait;
                        margin: 0.5in; 
                        mso-header-margin: 0.5in;
                        mso-footer-margin: 0.5in;
                        mso-paper-source: 0;
                    }
                    div.Section1 {
                        page: Section1;
                    }
                    body { 
                        font-family: 'Tajawal', 'Arial', sans-serif; 
                        direction: ${docDir}; 
                    }
                </style>
            </head>
            <body style="tab-interval:.5in">
                <div class="Section1">
                    ${headerHtml}
                    <table style="${tableStyle}" dir="${docDir}">
                        ${tableHeadersHtml}
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                    <br>
                <div style="float: ${alignEnd}; text-align: ${alignEnd}; margin-top: 20px;">
                    <p style="font-size: 10pt; color: #666; margin: 0;">${t('msg_export_date')} ${getFormattedDate()}</p>
                    ${info.logo ? `<img src="${info.logo}" width="122" height="122" style="width: 3.24cm; height: 3.24cm; margin-top: 5px; mso-wrap-style: square; float: ${alignEnd};">` : ''}
                </div>
                <div style="clear: both;"></div>
                </div>
            </body>
            </html>
        `;

        // Use Preview instead of immediate download
        showWordPreview(fullHtml, `${t('export_title_monitoring')}_${cls.name}_${t('header_term')}_${tri}.docx`, 'portrait');

        feedback.remove();
    } catch (err) {
        if (feedback) feedback.remove();
        alert('حدث خطأ أثناء التصدير لـ Word: ' + err.message);
    }
};

window.exportContinuousToWord = function () {
    const feedback = document.createElement('div');
    feedback.style = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#2b579a; color:white; padding:15px 30px; border-radius:30px; z-index:99999; box-shadow:0 10px 25px rgba(0,0,0,0.2); font-family:Tajawal; font-weight:bold;";
    feedback.innerText = t('msg_preparing_word') || "Preparing Word file... Please wait";
    document.body.appendChild(feedback);

    try {
        const cls = appState.classes[currentActiveClassIndex];
        if (!cls) throw new Error(t('msg_select_class') || "Please select a group first");

        const info = appState.teacherInfo;
        const tri = parseInt(currentTrimester);
        const trimKey = `t${tri}`;

        const students = cls.students.filter(s =>
            ((s.surname && s.surname.trim()) || (s.name && s.name.trim())) &&
            (!s.activeTrimesters || s.activeTrimesters.includes(tri))
        );

        const isRTL = currentLang === 'ar';
        const docDir = isRTL ? 'rtl' : 'ltr';
        const alignStart = isRTL ? 'right' : 'left';
        const alignEnd = isRTL ? 'left' : 'right';

        // Word-specific styles
        const tableStyle = `
            border-collapse: collapse;
            width: 100%;
            font-size: 10pt;
            font-family: 'Tajawal', sans-serif;
            text-align: center;
            margin-left: auto;
            margin-right: auto;
            direction: ${docDir};
        `;

        const thStyle = `
            border: 1px solid #000;
            padding: 8px 4px;
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
        `;

        const verticalThStyle = `
            border: 1px solid #000;
            padding: 2px;
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
            height: 155px;
        `;

        // Word processes text rotation at paragraph level, not cell level
        const verticalPStyle = `
            margin: 0;
            padding: 0;
            layout-flow: vertical;
            mso-layout-flow-alt: bottom-to-top;
            text-align: center;
        `;

        const tdStyle = `
            border: 1px solid #000;
            padding: 6px 4px;
            text-align: center;
            vertical-align: middle;
        `;

        const tdNameStyle = `
            border: 1px solid #000;
            padding: 6px 4px;
            text-align: ${alignStart};
            vertical-align: middle;
            font-weight: bold;
        `;

        // Continuous Assessment Headers
        const config = appState.continuousConfig || defaultContinuousConfig;

        // Helper to label/translate headers
        const getColLabel = (label) => {
            if (label === 'السلوك') return t('continuous_header_behavior');
            if (label === 'الغياب و التأخر') return t('continuous_header_abs');
            if (label === 'إحضار الأدوات') return t('continuous_header_tools');
            if (label === 'تنظيم الكراس') return t('continuous_header_org');
            if (label === 'المشاركة') return t('continuous_header_part');
            if (label === 'الاستجوابات') return t('continuous_header_quiz');
            if (label === 'الكتابة على السبورة') return t('continuous_header_board');
            if (label === 'الواجبات المنزلية') return t('continuous_header_hw');
            if (label === 'الواجبات الشهرية') return t('continuous_header_monthly');
            if (label === 'المبادرة') return t('continuous_header_init');
            return label;
        };

        const tableHeadersHtml = `
            <thead>
                <tr>
                    <th rowspan="2" style="${thStyle} width: 30px;">${t('list_col_num')}</th>
                    <th rowspan="2" style="${thStyle} width: 15%;">${t('list_col_surname')}</th>
                    <th rowspan="2" style="${thStyle} width: 15%;">${t('list_col_name')}</th>
                    <th colspan="4" style="${thStyle}">${t('continuous_col_discipline')}</th>
                    <th colspan="3" style="${thStyle}">${t('continuous_col_inclass')}</th>
                    <th colspan="3" style="${thStyle}">${t('continuous_col_outclass')}</th>
                    <th rowspan="2" style="${thStyle} width: 50px;">${t('continuous_col_total')}</th>
                </tr>
                <tr>
                    <!-- Discipline -->
                    <th class="vertical-text" style="${verticalThStyle} width: 5%;"><p style="${verticalPStyle}">${getColLabel(config.discipline[0].label)}<br>(${config.discipline[0].max} ${t('unit_points')})</p></th>
                    <th class="vertical-text" style="${verticalThStyle} width: 5%;"><p style="${verticalPStyle}">${getColLabel(config.discipline[1].label)}<br>(${config.discipline[1].max} ${t('unit_points')})</p></th>
                    <th class="vertical-text" style="${verticalThStyle} width: 5%;"><p style="${verticalPStyle}">${getColLabel(config.discipline[2].label)}<br>(${config.discipline[2].max} ${t('unit_points')})</p></th>
                    <th class="vertical-text" style="${verticalThStyle} width: 5%;"><p style="${verticalPStyle}">${getColLabel(config.discipline[3].label)}<br>(${config.discipline[3].max} ${t('unit_points')})</p></th>
                    
                    <!-- In-Class -->
                    <th class="vertical-text" style="${verticalThStyle} width: 6%;"><p style="${verticalPStyle}">${getColLabel(config.inClass[0].label)}<br>(${config.inClass[0].max} ${t('unit_points')})</p></th>
                    <th class="vertical-text" style="${verticalThStyle} width: 6%;"><p style="${verticalPStyle}">${getColLabel(config.inClass[1].label)}<br>(${config.inClass[1].max} ${t('unit_points')})</p></th>
                    <th class="vertical-text" style="${verticalThStyle} width: 6%;"><p style="${verticalPStyle}">${getColLabel(config.inClass[2].label)}<br>(${config.inClass[2].max} ${t('unit_points')})</p></th>
                    
                    <!-- Out-Class -->
                    <th class="vertical-text" style="${verticalThStyle} width: 6%;"><p style="${verticalPStyle}">${getColLabel(config.outClass[0].label)}<br>(${config.outClass[0].max} ${t('unit_points')})</p></th>
                    <th class="vertical-text" style="${verticalThStyle} width: 6%;"><p style="${verticalPStyle}">${getColLabel(config.outClass[1].label)}<br>(${config.outClass[1].max} ${t('unit_points')})</p></th>
                    <th class="vertical-text" style="${verticalThStyle} width: 6%;"><p style="${verticalPStyle}">${getColLabel(config.outClass[2].label)}<br>(${config.outClass[2].max} ${t('unit_points')})</p></th>
                </tr>
            </thead>
        `;

        let rowsHtml = '';
        students.forEach((s, i) => {
            const d = (s.continuousData && s.continuousData[trimKey]) || { discipline: ['', '', '', ''], inClass: ['', '', ''], outClass: ['', '', ''] };

            // Helpers for cells
            const discCells = (d.discipline || ['', '', '', '']).map(v => `<td style="${tdStyle}">${formatValueWithComma(v, -1)}</td>`).join('');
            const inClassCells = (d.inClass || ['', '', '']).map(v => `<td style="${tdStyle}">${formatValueWithComma(v, -1)}</td>`).join('');
            const outClassCells = (d.outClass || ['', '', '']).map((v, idx) => {
                const decimals = (idx === 0 || idx === 1) ? 2 : -1;
                return `<td style="${tdStyle}">${formatValueWithComma(v, decimals)}</td>`;
            }).join('');

            const disciplineSum = (d.discipline || []).reduce((a, b) => a + (parseFloat(b) || 0), 0);
            const inClassSum = (d.inClass || []).reduce((a, b) => a + (parseFloat(b) || 0), 0);
            const outClassSum = (d.outClass || []).reduce((a, b) => a + (parseFloat(b) || 0), 0);
            const total = (disciplineSum + inClassSum + outClassSum);

            rowsHtml += `
            <tr>
                <td style="${tdStyle} font-weight: bold;">${i + 1}</td>
                <td style="${tdNameStyle}">${s.surname || ''}</td>
                <td style="${tdNameStyle.replace('font-weight: bold;', '')}">${s.name || ''}</td>
                ${discCells}
                ${inClassCells}
                ${outClassCells}
                <td style="${tdStyle} font-weight: bold; background-color: #fafafa;">${formatValueWithComma(total)}</td>
            </tr>`;
        });

        const headerHtml = `
            <div style="text-align: center; margin-bottom: 30px;">
                <table align="center" style="border: 2px solid #2b579a; border-collapse: collapse; margin-bottom: 20px; max-width: 95%; margin-left: auto; margin-right: auto;">
                    <tr>
                        <td style="padding: 10px 20px; text-align: center;">
                            <p style="margin: 0; font-size: 24pt; font-weight: bold; color: #2b579a; white-space: normal; text-align: center;">${t('export_title_continuous')}</p>
                        </td>
                    </tr>
                </table>
                <p style="margin: 10px 0 0 0; font-size: 12pt; text-align: center;"><span style="font-weight: bold;">${t('header_academic_year')}:</span> <span dir="${docDir}" style="unicode-bidi: embed;">${info.year || '---'}</span></p>
            </div>
            
            <table style="width: 100%; margin-bottom: 20px; font-size: 12pt; border: none;" dir="${docDir}">
                <tr>
                    <td style="border: none; text-align: ${alignStart}; width: 33%; padding: 5px;"><b>${t('header_teacher')}:</b> ${info.name || '---'}</td>
                    <td style="border: none; text-align: center; width: 33%; padding: 5px;"><b>${t('header_school')}:</b> ${info.school || '---'}</td>
                    <td style="border: none; text-align: ${alignEnd}; width: 33%; padding: 5px;"><b>${t('header_group')}:</b> ${cls.name}</td>
                </tr>
                <tr>
                    <td style="border: none; text-align: ${alignStart}; padding: 5px;"><b>${t('header_subject')}:</b> ${getSubjectTranslation(cls.subject || info.subject)}</td>
                    <td style="border: none; text-align: center; padding: 5px;"><b>${t('header_term')}:</b> ${tri}</td>
                    <td style="border: none; text-align: ${alignEnd}; padding: 5px;"><b>${t('header_students_count')}:</b> ${students.length}</td>
                </tr>
            </table>
        `;

        const fullHtml = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>${t('export_title_continuous')}</title>

                <style>
                    /* Narrow Margins: 0.5in = 1.27cm, but using specific page directives for Word */
                    @page {
                        size: A4 portrait;
                        margin: 0.5in; 
                        mso-header-margin: 0.5in;
                        mso-footer-margin: 0.5in;
                        mso-paper-source: 0;
                    }
                    div.Section1 {
                        page: Section1;
                    }
                    body { 
                        font-family: 'Tajawal', 'Arial', sans-serif; 
                        direction: ${docDir}; 
                    }
                </style>
            </head>
            <body style="tab-interval:.5in">
                <div class="Section1">
                    ${headerHtml}
                    <table align="center" style="${tableStyle}" dir="${docDir}">
                        ${tableHeadersHtml}
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                    <br>
                    <div style="float: ${alignEnd}; text-align: ${alignEnd}; margin-top: 20px;">
                        <p style="font-size: 10pt; color: #666; margin: 0;">${t('msg_export_date')} ${getFormattedDate()}</p>
                        ${info.logo ? `<img src="${info.logo}" width="122" height="122" style="width: 3.24cm; height: 3.24cm; margin-top: 5px; mso-wrap-style: square; float: ${alignEnd};">` : ''}
                    </div>
                    <div style="clear: both;"></div>
                </div>
            </body>
            </html>
        `;

        // Use Preview instead of immediate download
        const filename = `${t('export_title_continuous')}_${cls.name}_${t('header_term')}_${tri}.docx`;
        showWordPreview(fullHtml, filename, 'portrait');

        feedback.remove();
    } catch (err) {
        if (feedback) feedback.remove();
        alert(t('msg_export_error_word') + ': ' + err.message);
    }
};

window.exportGradingToWord = function () {
    const feedback = document.createElement('div');
    feedback.style = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#2b579a; color:white; padding:15px 30px; border-radius:30px; z-index:99999; box-shadow:0 10px 25px rgba(0,0,0,0.2); font-family:Tajawal; font-weight:bold;";
    feedback.innerText = t('msg_preparing_word');
    document.body.appendChild(feedback);

    try {
        const cls = appState.classes[currentActiveClassIndex];
        if (!cls) throw new Error(t('msg_select_class_first'));

        const info = appState.teacherInfo;
        const tri = parseInt(currentTrimester);
        const trimKey = `t${tri}`;

        const students = cls.students.filter(s =>
            ((s.surname && s.surname.trim()) || (s.name && s.name.trim())) &&
            (!s.activeTrimesters || s.activeTrimesters.includes(tri))
        );

        const isRTL = currentLang === 'ar';
        const docDir = isRTL ? 'rtl' : 'ltr';
        const alignStart = isRTL ? 'right' : 'left';
        const alignEnd = isRTL ? 'left' : 'right';

        // Word-specific styles
        const tableStyle = `
            border-collapse: collapse;
            width: 100%;
            font-size: 9pt;
            font-family: 'Tajawal', sans-serif;
            text-align: center;
            margin-left: auto;
            margin-right: auto;
        `;

        const thStyle = `
            border: 1px solid #000;
            padding: 8px 4px;
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
        `;

        const tdStyle = `
            border: 1px solid #000;
            padding: 6px 4px;
            text-align: center;
            vertical-align: middle;
        `;

        const tdNameStyle = `
            border: 1px solid #000;
            padding: 6px 4px;
            text-align: ${alignStart};
            vertical-align: middle;
            font-weight: bold;
        `;

        // Calculate Ranks for the export
        const studentsWithAvg = students.map(s => {
            if (!s.gradingData) s.gradingData = createEmptyGradingData();
            calculateStudentGrades(s, cls.coefficient, trimKey);
            return { id: s.id, avg: s.gradingData[trimKey].average || 0 };
        });
        const sorted = [...studentsWithAvg].sort((a, b) => b.avg - a.avg);
        const rankMap = {};
        let rank = 1;
        for (let i = 0; i < sorted.length; i++) {
            if (i > 0 && sorted[i].avg < sorted[i - 1].avg) rank = i + 1;
            rankMap[sorted[i].id] = rank;
        }

        const tableHeadersHtml = `
            <thead>
                <tr>
                    <th style="${thStyle} width: 3%;">${t('list_col_num')}</th>
                    <th style="${thStyle} width: 20%;">${t('list_col_surname')} & ${t('list_col_name')}</th>
                    <th style="${thStyle} width: 8%;">${t('grading_col_continuous')}</th>
                    <th style="${thStyle} width: 8%;">${t('grading_col_quiz')}</th>
                    <th style="${thStyle} width: 8%;">${t('grading_col_monitoring')}</th>
                    <th style="${thStyle} width: 8%;">${t('grading_col_exam')}</th>
                    <th style="${thStyle} width: 8%;">${t('grading_col_avg')}</th>
                    <th style="${thStyle} width: 8%;">${t('grading_col_product')}</th>
                    ${tri === 3 ? `<th style="${thStyle} width: 8%;">${t('stats_lbl_annual_alt')}</th>` : ''}
                    <th style="${thStyle} width: 24%;">${t('grading_col_appreciation')}</th>
                    <th style="${thStyle} width: 5%;">${t('grading_col_rank')}</th>
                </tr>
            </thead>
        `;

        const getAvgColor = (avgStr) => {
            const avg = parseFloat(avgStr);
            if (isNaN(avg)) return '#000';
            if (avg >= 10) return '#10b981'; // أخضر
            if (avg >= 9) return '#f59e0b'; // برتقالي
            return '#ef4444'; // أحمر
        };

        let rowsHtml = '';
        students.forEach((s, i) => {
            if (!s.gradingData) s.gradingData = createEmptyGradingData();
            const data = s.gradingData[trimKey];
            const displayMonitoring = (data.monitoring !== undefined && data.monitoring !== null && data.monitoring !== '') ? data.monitoring : getContinuousTotal(s, trimKey);
            // Re-calculate to be sure
            calculateStudentGrades(s, cls.coefficient, trimKey);

            // Annual Average for T3
            let annualAvgCell = '';
            if (tri === 3) {
                const a1 = parseFloat(s.gradingData['t1']?.average) || 0;
                const a2 = parseFloat(s.gradingData['t2']?.average) || 0;
                const a3 = parseFloat(s.gradingData['t3']?.average) || 0;
                const annAvg = (a1 + a2 + a3) / 3;

                if (a1 > 0 || a2 > 0 || a3 > 0) {
                    const annAvgStr = formatGradingVal(annAvg);
                    const annAvgColor = getAvgColor(annAvg);
                    annualAvgCell = `<td style="${tdStyle} font-weight: bold; background-color: #eeeeee; color: ${annAvgColor};">${annAvgStr}</td>`;
                } else {
                    annualAvgCell = `<td style="${tdStyle} font-weight: bold; background-color: #eeeeee;">-</td>`;
                }
            }

            const avgColor = getAvgColor(data.average);

            rowsHtml += `
            <tr>
                <td style="${tdStyle} font-weight: bold;">${i + 1}</td>
                <td style="${tdNameStyle.replace('font-weight: bold;', '')}"><strong>${s.surname || ''}</strong> ${s.name || ''}</td>
                <td style="${tdStyle}">${formatGradingVal(displayMonitoring)}</td>
                <td style="${tdStyle}">${formatGradingVal(data.assignment)}</td>
                <td style="${tdStyle} font-weight: bold;">${formatGradingVal(data.continuousEval)}</td>
                <td style="${tdStyle}">${formatGradingVal(data.exam)}</td>
                <td style="${tdStyle} font-weight: bold; background-color: #eeeeee; color: ${avgColor};">${formatGradingVal(data.average)}</td>
                <td style="${tdStyle}">${formatGradingVal(data.score)}</td>
                ${annualAvgCell}
                <td style="${tdStyle}">${data.appreciation || getAppreciation(data.average)}</td>
                <td style="${tdStyle} font-weight: bold;">${rankMap[s.id] || '-'}</td>
            </tr>`;
        });

        const headerHtml = `
            <div style="text-align: center; margin-bottom: 30px;">
                <table align="center" style="border: 2px solid #2b579a; border-collapse: collapse; margin-bottom: 20px; max-width: 95%; margin-left: auto; margin-right: auto;">
                    <tr>
                        <td style="padding: 10px 20px; text-align: center;">
                            <p style="margin: 0; font-size: 24pt; font-weight: bold; color: #2b579a; white-space: normal; text-align: center;">${t('stats_grading_title')}</p>
                        </td>
                    </tr>
                </table>
                <p style="margin: 10px 0 0 0; font-size: 12pt; text-align: center;"><span style="font-weight: bold;">${t('header_academic_year')}:</span> <span dir="${docDir}" style="unicode-bidi: embed;">${info.year || '---'}</span></p>
            </div>
            
            <table style="width: 100%; margin-bottom: 20px; font-size: 11pt; border: none;" dir="${docDir}">
                <tr>
                    <td style="border: none; text-align: ${alignStart}; width: 33%; padding: 5px;"><b>${t('header_teacher')}:</b> ${info.name || '---'}</td>
                    <td style="border: none; text-align: center; width: 33%; padding: 5px;"><b>${t('header_school')}:</b> ${info.school || '---'}</td>
                    <td style="border: none; text-align: ${alignEnd}; width: 33%; padding: 5px;"><b>${t('header_group')}:</b> ${cls.name}</td>
                </tr>
                <tr>
                    <td style="border: none; text-align: ${alignStart}; padding: 5px;"><b>${t('header_subject')}:</b> ${getSubjectTranslation(cls.subject || info.subject)}</td>
                    <td style="border: none; text-align: center; padding: 5px;"><b>${t('header_term')}:</b> ${tri}</td>
                    <td style="border: none; text-align: ${alignEnd}; padding: 5px;"><b>${t('header_students_count')}:</b> ${students.length}</td>
                </tr>
            </table>
        `;

        const fullHtml = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>${t('app_name')}</title>

                <style>
                    @page {
                        size: A4 portrait;
                        margin: 0.5in; 
                        mso-header-margin: 0.5in;
                        mso-footer-margin: 0.5in;
                        mso-paper-source: 0;
                    }
                    div.Section1 { page: Section1; }
                    body { font-family: 'Tajawal', 'Arial', sans-serif; direction: ${docDir}; }
                </style>
            </head>
            <body style="tab-interval:.5in">
                <div class="Section1">
                    ${headerHtml}
                    <table align="center" style="${tableStyle}" dir="${docDir}">
                        ${tableHeadersHtml}
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                    <br>
                    <div style="float: ${alignEnd}; text-align: ${alignEnd}; margin-top: 20px;">
                        <p style="font-size: 10pt; color: #666; margin: 0;">${t('msg_export_date')} ${getFormattedDate()}</p>
                        ${info.logo ? `<img src="${info.logo}" width="122" height="122" style="width: 3.24cm; height: 3.24cm; margin-top: 5px; mso-wrap-style: square; float: ${alignEnd};">` : ''}
                    </div>
                    <div style="clear: both;"></div>
                </div>
            </body>
            </html>
        `;

        // Use Preview instead of immediate download
        const filename = `${t('stats_grading_title')}_${cls.name}_${t('header_term')}_${tri}.docx`;
        showWordPreview(fullHtml, filename, 'portrait');

        feedback.remove();
    } catch (err) {
        if (feedback) feedback.remove();
        alert('حدث خطأ أثناء التصدير لـ Word: ' + err.message);
    }
};

window.exportStatsToWord = function () {
    const feedback = document.createElement('div');
    feedback.style = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#2b579a; color:white; padding:15px 30px; border-radius:30px; z-index:99999; box-shadow:0 10px 25px rgba(0,0,0,0.2); font-family:Tajawal; font-weight:bold;";
    feedback.innerText = t('msg_preparing_word');
    document.body.appendChild(feedback);

    try {
        const cls = appState.classes[currentActiveClassIndex];
        if (!cls) throw new Error(t('msg_select_class'));

        const info = appState.teacherInfo;
        const tri = parseInt(currentTrimester);
        const trimKey = `t${tri}`;
        const students = cls.students.filter(s => ((s.surname && s.surname.trim()) || (s.name && s.name.trim())) && s.activeTrimesters.includes(tri));

        const stats = calculateDetailedStats(students, trimKey);

        // --- Compute Annual Average stats for T3 ---
        if (tri === 3) {
            let annSum = 0, annPassed = 0, annTotal = 0;
            const annCounts = [0, 0, 0, 0, 0, 0];
            const annLists = [[], [], [], [], [], []];
            let annMaxScore, annMinScore, annMaxStudents = [], annMinStudents = [];

            students.forEach(s => {
                if (!s.gradingData) return;
                const a1 = parseFloat(s.gradingData['t1']?.average) || 0;
                const a2 = parseFloat(s.gradingData['t2']?.average) || 0;
                const a3 = parseFloat(s.gradingData['t3']?.average) || 0;
                if (a1 === 0 && a2 === 0 && a3 === 0) return;
                const ann = (a1 + a2 + a3) / 3;
                annSum += ann; annTotal++;
                if (ann >= 10) annPassed++;
                let ri = 5;
                if (ann < 8) ri = 0; else if (ann < 10) ri = 1;
                else if (ann < 12) ri = 2; else if (ann < 16) ri = 3; else if (ann < 18) ri = 4;
                annCounts[ri]++; annLists[ri].push(s);
                if (annMaxScore === undefined || ann > annMaxScore) { annMaxScore = ann; annMaxStudents = [s]; }
                else if (ann === annMaxScore) annMaxStudents.push(s);
                if (annMinScore === undefined || ann < annMinScore) { annMinScore = ann; annMinStudents = [s]; }
                else if (ann === annMinScore) annMinStudents.push(s);
            });

            stats.metrics.annualAvg = {
                avg: annTotal ? annSum / annTotal : 0,
                counts: annCounts, lists: annLists,
                passed: annPassed, failed: annTotal - annPassed, total: annTotal,
                maxScore: annMaxScore, maxStudents: annMaxStudents,
                minScore: annMinScore, minStudents: annMinStudents
            };

            // Top students by annual average (>= 17)
            const annStudents = students.map(s => {
                if (!s.gradingData) return null;
                const a1 = parseFloat(s.gradingData['t1']?.average) || 0;
                const a2 = parseFloat(s.gradingData['t2']?.average) || 0;
                const a3 = parseFloat(s.gradingData['t3']?.average) || 0;
                return (a1 || a2 || a3) ? { s, ann: (a1 + a2 + a3) / 3 } : null;
            }).filter(d => d && d.ann >= 17).sort((a, b) => b.ann - a.ann);
            stats.annualTopStudents = annStudents;
        } else {
            stats.annualTopStudents = [];
        }

        // Capture Charts as Images
        const barCanvas = document.getElementById('statsBarChart');
        const pieCanvas = document.getElementById('statsPieChart');
        let barImg = '', pieImg = '';

        if (barCanvas) barImg = barCanvas.toDataURL('image/png');
        if (pieCanvas) pieImg = pieCanvas.toDataURL('image/png');

        const isRTL = currentLang === 'ar';
        const docDir = isRTL ? 'rtl' : 'ltr';
        const alignStart = isRTL ? 'right' : 'left';
        const alignEnd = isRTL ? 'left' : 'right';

        // Word-specific styles
        const tableStyle = `
            border-collapse: collapse;
            width: 100%;
            font-size: 10pt;
            font-family: 'Tajawal', sans-serif;
            text-align: center;
            margin-left: auto;
            margin-right: auto;
        `;

        const thStyle = `
            border: 1px solid #000;
            padding: 8px 4px;
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
        `;

        const tdStyle = `
            border: 1px solid #000;
            padding: 6px 4px;
            text-align: center;
            vertical-align: middle;
        `;

        // 1. Identification Header
        const headerHtml = `
            <div style="text-align: center; margin-bottom: 30px;">
                <table align="center" style="border: 2px solid #2b579a; border-collapse: collapse; margin-bottom: 20px; max-width: 95%; margin-left: auto; margin-right: auto;">
                    <tr>
                        <td style="padding: 10px 20px; text-align: center;">
                            <p style="margin: 0; font-size: 24pt; font-weight: bold; color: #2b579a; white-space: normal; text-align: center;">${t('stats_title')}</p>
                        </td>
                    </tr>
                </table>
                <p style="margin: 10px 0 0 0; font-size: 12pt; text-align: center;"><span style="font-weight: bold;">${t('header_academic_year')}:</span> <span dir="${docDir}" style="unicode-bidi: embed;">${info.year || '---'}</span></p>
            </div>
            
            <table style="width: 100%; margin-bottom: 20px; font-size: 12pt; border: none;" dir="${docDir}">
                <tr>
                    <td style="border: none; text-align: ${alignStart}; width: 33%; padding: 5px;"><b>${t('header_teacher')}:</b> ${info.name || '---'}</td>
                    <td style="border: none; text-align: center; width: 33%; padding: 5px;"><b>${t('header_school')}:</b> ${info.school || '---'}</td>
                    <td style="border: none; text-align: ${alignEnd}; width: 33%; padding: 5px;"><b>${t('header_group')}:</b> ${cls.name}</td>
                </tr>
                <tr>
                    <td style="border: none; text-align: ${alignStart}; padding: 5px;"><b>${t('header_subject')}:</b> ${getSubjectTranslation(cls.subject || info.subject)}</td>
                    <td style="border: none; text-align: center; padding: 5px;"><b>${t('header_term')}:</b> ${tri}</td>
                    <td style="border: none; text-align: ${alignEnd}; padding: 5px;"><b>${t('header_students_count')}:</b> ${students.length}</td>
                </tr>
            </table>
        `;

        // 2. Averages Summary
        const avgSummaryHtml = `
            <table align="center" style="width: 100%; margin-bottom: 30px; border-collapse: collapse; table-layout: fixed;" dir="${docDir}">
                <tr>
                    <td style="padding: 10px; border: 2px solid #2b579a; text-align: center; background-color: #f9fbfd;">
                        <span style="font-size: 12pt; color: #666;">${t('stats_avg_assignment')}</span><br>
                        <strong style="font-size: 18pt; color: #2b579a;">${formatNumber(stats.metrics.assignment.avg)}</strong>
                    </td>
                    <td style="width: 20px; border: none;"></td>
                    <td style="padding: 10px; border: 2px solid #2b579a; text-align: center; background-color: #f9fbfd;">
                        <span style="font-size: 12pt; color: #666;">${t('stats_avg_exam')}</span><br>
                        <strong style="font-size: 18pt; color: #2b579a;">${formatNumber(stats.metrics.exam.avg)}</strong>
                    </td>
                    <td style="width: 20px; border: none;"></td>
                    <td style="padding: 10px; border: 2px solid #2b579a; text-align: center; background-color: #f9fbfd;">
                        <span style="font-size: 12pt; color: #666;">${t('stats_avg_subject')}</span><br>
                        <strong style="font-size: 18pt; color: #2b579a;">${formatNumber(stats.metrics.average.avg)}</strong>
                    </td>
                    ${stats.metrics.annualAvg ? `
                    <td style="width: 20px; border: none;"></td>
                    <td style="padding: 10px; border: 2px solid #2b579a; text-align: center; background-color: #f9fbfd;">
                        <span style="font-size: 12pt; color: #666;">${t('stats_avg_annual_alt')}</span><br>
                        <strong style="font-size: 18pt; color: #2b579a;">${formatNumber(stats.metrics.annualAvg.avg)}</strong>
                    </td>` : ''}
                </tr>
            </table>
        `;

        // 3. Results Summary Table
        const buildSummaryRow = (label, metricKey) => {
            const m = stats.metrics[metricKey];
            const passedPct = m.total ? ((m.passed / m.total) * 100).toFixed(2).replace('.', ',') : '0,00';
            const failedPct = m.total ? (100 - parseFloat(passedPct.replace(',', '.'))).toFixed(2).replace('.', ',') : '0,00';
            const rowTdStyle = tdStyle + " font-size: 12pt;";
            return `
                <tr>
                    <td style="${rowTdStyle}"><strong>${label}</strong></td>
                    <td style="${rowTdStyle} color: #28a745;">${m.passed}</td>
                    <td style="${rowTdStyle} color: #28a745; font-weight: bold;">${passedPct}%</td>
                    <td style="${rowTdStyle} color: #dc3545;">${m.failed}</td>
                    <td style="${rowTdStyle} color: #dc3545; font-weight: bold;">${failedPct}%</td>
                </tr>
            `;
        };

        const resultsSummaryTable = `
            <h3 style="margin-top:1.5rem; margin-bottom:0.8rem; border-bottom:1px solid #2b579a; padding-bottom:5px; color: #2b579a;">${t('stats_summary_title')}</h3>
            <table align="center" style="${tableStyle} font-size: 12pt;" dir="${docDir}">
                <thead>
                    <tr>
                        <th rowspan="2" style="${thStyle}">${t('stats_col_metric')}</th>
                        <th colspan="2" style="${thStyle}">${t('stats_col_passed_desc')}</th>
                        <th colspan="2" style="${thStyle}">${t('stats_col_failed_desc')}</th>
                    </tr>
                    <tr>
                        <th style="${thStyle}">${t('stats_col_count')}</th>
                        <th style="${thStyle}">${t('stats_col_pct')}</th>
                        <th style="${thStyle}">${t('stats_col_count')}</th>
                        <th style="${thStyle}">${t('stats_col_pct')}</th>
                    </tr>
                </thead>
                <tbody>
                    ${buildSummaryRow(t('stats_lbl_assignment'), 'assignment')}
                    ${buildSummaryRow(t('stats_lbl_exam'), 'exam')}
                    ${buildSummaryRow(t('stats_lbl_subject'), 'average')}
                    ${stats.metrics.annualAvg ? buildSummaryRow(t('stats_lbl_annual_alt'), 'annualAvg') : ''}
                </tbody>
            </table>
        `;

        // 4. Grade Distribution Table
        const buildDistRow = (label, metricKey) => {
            const m = stats.metrics[metricKey];
            const cells = m.counts.map((c, i) => {
                const groupTotal = (i < 2) ? m.failed : m.passed;
                const pct = groupTotal ? ((c / groupTotal) * 100).toFixed(1).replace('.', ',') + '%' : '0,0%';
                const displayValue = c > 0 ? `${c} <small style="font-size: 12pt;">(${pct})</small>` : '0';
                return `<td style="${tdStyle} font-size: 12pt;">${displayValue}</td>`;
            }).join('');
            return `<tr><td style="${tdStyle} font-size: 12pt;"><strong>${label}</strong></td>${cells}</tr>`;
        };

        const distributionTable = `
            <h3 style="margin-top:2rem; margin-bottom:0.8rem; border-bottom:1px solid #2b579a; padding-bottom:5px; color: #2b579a;">${t('stats_dist_title')}</h3>
            <table align="center" style="${tableStyle}" dir="${docDir}">
                <thead>
                    <tr>
                        <th style="${thStyle}">${t('stats_col_metric')}</th>
                        ${stats.ranges.map(r => `<th style="${thStyle}">${r.label}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${buildDistRow(t('stats_lbl_assignment'), 'assignment')}
                    ${buildDistRow(t('stats_lbl_exam'), 'exam')}
                    ${buildDistRow(t('stats_lbl_subject'), 'average')}
                    ${stats.metrics.annualAvg ? buildDistRow(t('stats_lbl_annual_alt'), 'annualAvg') : ''}
                </tbody>
            </table>
        `;

        // 5. Top Students Table (Starts Page 2)
        const topStudentsRows = stats.topStudents.length === 0
            ? `<tr><td colspan="5" style="${tdStyle} font-size: 12pt;">${t('stats_no_top')}</td></tr>`
            : stats.topStudents.map(s => `
                <tr>
                    <td style="${tdStyle} font-size: 12pt;"><strong>${s.rank}</strong></td>
                    <td style="${tdStyle} font-size: 12pt;">${s.listIndex}</td>
                    <td style="${tdStyle} text-align: right; font-size: 12pt;">${s.surname}</td>
                    <td style="${tdStyle} text-align: right; font-size: 12pt;">${s.name}</td>
                    <td style="${tdStyle} font-size: 12pt;"><strong>${formatNumber(s.average)}</strong></td>
                </tr>
            `).join('');

        // Pre-compute annual top students HTML (avoids IIFE issues inside template literals)
        let annualTopStudentsSectionHtml = '';
        if (tri === 3 && stats.annualTopStudents !== undefined) {
            let ar = 1;
            const annRows = stats.annualTopStudents.length === 0
                ? '<tr><td colspan="5" style="' + tdStyle + ' font-size: 12pt;">' + t('stats_no_top') + '</td></tr>'
                : stats.annualTopStudents.map((d, i) => {
                    if (i > 0 && d.ann < stats.annualTopStudents[i - 1].ann) ar = i + 1;
                    return '<tr>' +
                        '<td style="' + tdStyle + ' font-size: 12pt;"><strong>' + ar + '</strong></td>' +
                        '<td style="' + tdStyle + ' font-size: 12pt;">' + (i + 1) + '</td>' +
                        '<td style="' + tdStyle + ' text-align: right; font-size: 12pt;">' + d.s.surname + '</td>' +
                        '<td style="' + tdStyle + ' text-align: right; font-size: 12pt;">' + d.s.name + '</td>' +
                        '<td style="' + tdStyle + ' font-size: 12pt;"><strong>' + formatNumber(d.ann) + '</strong></td>' +
                        '</tr>';
                }).join('');

            annualTopStudentsSectionHtml =
                '<h3 style="margin-top:2rem; margin-bottom:0.8rem; border-bottom:1px solid #2b579a; padding-bottom:5px; color: #2b579a;">' + t('stats_top_annual_title') + '</h3>' +
                '<table align="center" style="' + tableStyle + ' font-size: 12pt;" dir="' + docDir + '">' +
                '<thead><tr>' +
                '<th style="' + thStyle + ' width: 10%;">' + t('stats_col_rank') + '</th>' +
                '<th style="' + thStyle + ' width: 10%;">' + t('stats_col_index') + '</th>' +
                '<th style="' + thStyle + ' width: 30%;">' + t('list_col_surname') + '</th>' +
                '<th style="' + thStyle + ' width: 30%;">' + t('list_col_name') + '</th>' +
                '<th style="' + thStyle + ' width: 20%;">' + t('stats_lbl_annual_alt') + '</th>' +
                '</tr></thead>' +
                '<tbody>' + annRows + '</tbody>' +
                '</table>';
        }

        const topStudentsSection = `
            <div style="page-break-before: always;">
                <h3 style="margin-top:2rem; margin-bottom:0.8rem; border-bottom:1px solid #2b579a; padding-bottom:5px; color: #2b579a;">${t('stats_top_title')}</h3>
                <table align="center" style="${tableStyle} font-size: 12pt;" dir="${docDir}">
                    <thead>
                        <tr>
                            <th style="${thStyle} width: 10%;">${t('stats_col_rank')}</th>
                            <th style="${thStyle} width: 10%;">${t('stats_col_index')}</th>
                            <th style="${thStyle} width: 30%;">${t('list_col_surname')}</th>
                            <th style="${thStyle} width: 30%;">${t('list_col_name')}</th>
                            <th style="${thStyle} width: 20%;">${t('stats_lbl_subject')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topStudentsRows}
                    </tbody>
                </table>
            </div>
            ${annualTopStudentsSectionHtml}
        `;

        // 6. Charts Section (Stacked on Page 2)
        const chartsSection = `
            <div style="text-align: center; margin-top: 20px;">
                <div style="margin-bottom: 30px;">
                    ${barImg ? `<img src="${barImg}" style="width: 500px; max-height: 320px; object-fit: contain;">` : '---'}
                </div>
                <div>
                    ${pieImg ? `<img src="${pieImg}" style="width: 400px; max-height: 320px; object-fit: contain;">` : '---'}
                </div>
            </div>
        `;

        const fullHtml = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>${t('stats_title')}</title>
                <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
                <style>
                    @page {
                        mso-page-orientation: portrait;
                        size: A4 portrait;
                        margin: 0.5in 0.5in 0.5in 0.5in;
                        mso-header-margin: 0.5in;
                        mso-footer-margin: 0.5in;
                        mso-gutter-margin: 0in;
                    }
                    div.Section1 { 
                        page: Section1;
                        mso-page-orientation: portrait;
                        margin: 0.5in 0.5in 0.5in 0.5in;
                    }
                    body { font-family: 'Tajawal', 'Arial', sans-serif; direction: ${docDir}; }
                    small { font-size: 12pt; color: #555; }
                    .date-line { text-align: left; font-size: 10pt; color: #666; margin-top: 50px; border-top: 1px solid #eee; padding-top: 5px; }
                </style>
            </head>
            <body dir="${docDir}">
                <div class="Section1">
                    ${headerHtml}
                    ${avgSummaryHtml}
                    ${resultsSummaryTable}
                    ${distributionTable}
                    
                    ${topStudentsSection}
                    ${chartsSection}
                    
                    <div style="float: ${alignEnd}; text-align: ${alignEnd}; margin-top: 20px;">
                        <p style="font-size: 10pt; color: #666; margin: 0;">${t('msg_export_date')} ${getFormattedDate()}</p>
                        ${info.logo ? `<img src="${info.logo}" width="122" height="122" style="width: 3.24cm; height: 3.24cm; margin-top: 5px; mso-wrap-style: square; float: ${alignEnd};">` : ''}
                    </div>
                    <div style="clear: both;"></div>
                </div>
            </body>
            </html>
        `;

        // Use Preview instead of immediate download
        const filename = `${t('stats_title')}_${cls.name}_${t('header_term')}_${tri}.docx`;
        showWordPreview(fullHtml, filename, 'portrait');

        feedback.remove();
    } catch (err) {
        if (feedback) feedback.remove();
        alert(t('msg_export_error_word') + ': ' + err.message);
    }
};

window.exportStudentListToWord = function () {
    const feedback = document.createElement('div');
    feedback.style = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#2b579a; color:white; padding:15px 30px; border-radius:30px; z-index:99999; box-shadow:0 10px 25px rgba(0,0,0,0.2); font-family:Tajawal; font-weight:bold;";
    feedback.innerText = "جاري تحضير ملف Word لقائمة التلاميذ... يرجى الانتظار";
    document.body.appendChild(feedback);

    try {
        const cls = appState.classes[currentActiveClassIndex];
        if (!cls) throw new Error("يرجى اختيار فوج تربوي أولاً");

        const info = appState.teacherInfo;
        const tri = parseInt(currentTrimester);
        const students = cls.students.filter(s => ((s.surname && s.surname.trim()) || (s.name && s.name.trim())) && s.activeTrimesters.includes(tri));

        if (students.length === 0) {
            if (feedback) feedback.remove();
            openEmptyListWarningModal();
            return;
        }

        const tableStyle = `
            border-collapse: collapse;
            width: 100%;
            font-size: 12pt;
            font-family: 'Tajawal', sans-serif;
            text-align: center;
        `;

        const thStyle = `
            border: 1px solid #000;
            padding: 8px 4px;
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center;
        `;

        const tdStyle = `
            border: 1px solid #000;
            padding: 6px 4px;
            text-align: center;
        `;

        const globalSubject = info.subject || '';
        const isDualSubject = globalSubject === 'اللغة العربية / التربية الاسلامية' || globalSubject === 'التاريخ و الجغرافيا / التربية المدنية';
        const displaySubject = (isDualSubject && cls.subject) ? cls.subject : globalSubject;

        const isRTL = currentLang === 'ar';
        const docDir = isRTL ? 'rtl' : 'ltr';
        const alignStart = isRTL ? 'right' : 'left';
        const alignEnd = isRTL ? 'left' : 'right';

        // 1. Identification Header
        const headerHtml = `
            <div style="text-align: center; margin-bottom: 30px;">
                <table align="center" style="border: 2px solid #2b579a; border-collapse: collapse; margin-bottom: 20px; max-width: 95%; margin-left: auto; margin-right: auto;">
                    <tr>
                        <td style="padding: 10px 20px; text-align: center;">
                            <p style="margin: 0; font-size: 24pt; font-weight: bold; color: #2b579a; white-space: normal; text-align: center;">${t('export_title_students')}</p>
                        </td>
                    </tr>
                </table>
                <p style="margin: 10px 0 0 0; font-size: 12pt; text-align: center;"><span style="font-weight: bold;">${t('header_academic_year')}:</span> <span dir="${docDir}" style="unicode-bidi: embed;">${info.year || '---'}</span></p>
            </div>
            
            <table style="width: 100%; margin-bottom: 20px; font-size: 12pt; border: none;" dir="${docDir}">
                <tr>
                    <td style="border: none; text-align: ${alignStart}; width: 33%; padding: 5px;"><b>${t('header_teacher')}:</b> ${info.name || '---'}</td>
                    <td style="border: none; text-align: center; width: 33%; padding: 5px;"><b>${t('header_school')}:</b> ${info.school || '---'}</td>
                    <td style="border: none; text-align: ${alignEnd}; width: 33%; padding: 5px;"><b>${t('header_group')}:</b> ${cls.name}</td>
                </tr>
                <tr>
                    <td style="border: none; text-align: ${alignStart}; padding: 5px;"><b>${t('header_subject')}:</b> ${getSubjectTranslation(displaySubject)}</td>
                    <td style="border: none; text-align: center; padding: 5px;"><b>${t('header_term')}:</b> ${tri}</td>
                    <td style="border: none; text-align: ${alignEnd}; padding: 5px;"><b>${t('header_students_count')}:</b> ${students.length}</td>
                </tr>
            </table>
        `;

        // 2. Student List Table
        let studentRows = '';
        students.forEach((s, index) => {
            studentRows += `
                <tr>
                    <td style="${tdStyle} width: 10%; font-weight: bold;">${index + 1}</td>
                    <td style="${tdStyle} width: 35%; text-align: ${alignStart}; padding-${alignStart}: 15px;">${s.surname}</td>
                    <td style="${tdStyle} width: 35%; text-align: ${alignStart}; padding-${alignStart}: 15px;">${s.name}</td>
                    <td style="${tdStyle} width: 20%;">${(() => {
                    let d = s.dob || '---';
                    if (d !== '---') {
                        // For Arabic, keep YYYY-MM-DD as requested (matching Student Lists page)
                        if (typeof currentLang !== 'undefined' && currentLang === 'ar') {
                            return d;
                        }
                        // For other languages, convert to DD-MM-YYYY
                        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
                            const p = d.split('-'); return p[2] + '-' + p[1] + '-' + p[0];
                        }
                        if (/^\d{4}\/\d{2}\/\d{2}$/.test(d)) {
                            const p = d.split('/'); return p[2] + '-' + p[1] + '-' + p[0];
                        }
                    }
                    return d;
                })()}</td>
                </tr>
            `;
        });

        const listTableHtml = `
            <table align="center" style="${tableStyle}" dir="${docDir}">
                <thead>
                    <tr>
                        <th style="${thStyle}">${t('list_col_num')}</th>
                        <th style="${thStyle}">${t('list_col_surname')}</th>
                        <th style="${thStyle}">${t('list_col_name')}</th>
                        <th style="${thStyle}">${t('list_col_dob')}</th>
                    </tr>
                </thead>
                <tbody>
                    ${studentRows}
                </tbody>
            </table>
        `;

        const fullHtml = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>${t('export_title_students')} - ${cls.name}</title>
                <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
                <style>
                    @page {
                        mso-page-orientation: portrait;
                        size: A4 portrait;
                        margin: 0.5in 0.5in 0.5in 0.5in;
                        mso-header-margin: 0.5in;
                        mso-footer-margin: 0.5in;
                        mso-gutter-margin: 0in;
                    }
                    div.Section1 { 
                        page: Section1;
                        mso-page-orientation: portrait;
                        margin: 0.5in 0.5in 0.5in 0.5in;
                    }
                    body { font-family: 'Tajawal', 'Arial', sans-serif; direction: ${docDir}; }
                </style>
            </head>
            <body>
                <div class="Section1">
                    ${headerHtml}
                    ${listTableHtml}
                    <br>
                    <div style="float: ${alignEnd}; text-align: ${alignEnd}; margin-top: 20px;">
                        <p style="font-size: 10pt; color: #666; margin: 0;">${t('msg_export_date')} ${getFormattedDate()}</p>
                        ${info.logo ? `<img src="${info.logo}" width="122" height="122" style="width: 3.24cm; height: 3.24cm; margin-top: 5px; mso-wrap-style: square; float: ${alignEnd};">` : ''}
                    </div>
                    <div style="clear: both;"></div>
                </div>
            </body>
            </html>
        `;

        // Use Preview instead of immediate download
        const filename = `${t('export_title_students')}_${cls.name}_${t('header_term')}_${tri}.docx`;
        showWordPreview(fullHtml, filename, 'portrait');

        feedback.remove();
    } catch (err) {
        if (feedback) feedback.remove();
        alert('حدث خطأ أثناء تصدير القائمة لـ Word: ' + err.message);
    }
};

// --- وظائف الرقمنة (Digitization Functions) ---

window.handleDigitizationUpload = function (event) {
    const file = event.target.files[0];
    if (!file) return;

    if (typeof ExcelJS === 'undefined') {
        alert('خطأ: مكتبة ExcelJS لم يتم تحميلها بشكل صحيح. يرجى التحقق من الاتصال بالإنترنت.');
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const reader = new FileReader();
    reader.onload = async function (e) {
        const arrayBuffer = e.target.result;
        try {
            await workbook.xlsx.load(arrayBuffer);
            digitizationState.workbook = workbook;

            // فلترة الصفحات التي تمثل الأفواج (تحتوي على أرقام)
            const numericSheets = [];
            workbook.eachSheet(sheet => {
                if (/\d/.test(sheet.name)) {
                    numericSheets.push(sheet.name);
                }
            });

            if (numericSheets.length === 0) {
                alert('لم يتم العثور على صفحات تحتوي على أرقام (أفواج تربوية) في الملف.');
                return;
            }

            digitizationState.originalFileName = file.name;
            digitizationState.availableSheets = numericSheets;
            digitizationState.sheetMappings = {}; // تهيئة الربط لكل ملف جديد

            // تحضير واجهة العمل
            document.getElementById('digitization-upload-area').style.display = 'none';
            document.getElementById('digitization-workspace').style.display = 'block';

            // --- Smart Trimester Detection ---
            let detectedTrimester = null;
            const fileNameLower = file.name.toLowerCase();
            const trimesterKeywords = [
                { val: "1", keywords: ["فصل 1", "فصل1", "trim 1", "trim1", "الفصل الأول", "trimestre 1", "trimestre1"] },
                { val: "2", keywords: ["فصل 2", "فصل2", "trim 2", "trim2", "الفصل الثاني", "trimestre 2", "trimestre2"] },
                { val: "3", keywords: ["فصل 3", "فصل3", "trim 3", "trim3", "الفصل الثالث", "trimestre 3", "trimestre3"] }
            ];

            // 1. Check filename
            for (const item of trimesterKeywords) {
                if (item.keywords.some(k => fileNameLower.includes(k.toLowerCase()))) {
                    detectedTrimester = item.val;
                    break;
                }
            }

            // 2. If not found in filename, check sheet name (of the first numeric sheet)
            if (!detectedTrimester && numericSheets.length > 0) {
                const firstSheetName = numericSheets[0].toLowerCase();
                for (const item of trimesterKeywords) {
                    if (item.keywords.some(k => firstSheetName.includes(k.toLowerCase()))) {
                        detectedTrimester = item.val;
                        break;
                    }
                }
            }

            // 3. Fallback: Scan first few rows of the first sheet for keywords
            if (!detectedTrimester && numericSheets.length > 0) {
                const firstSheet = workbook.getWorksheet(numericSheets[0]);
                for (let i = 1; i <= 10; i++) {
                    const row = firstSheet.getRow(i);
                    const rowStr = row.values.join(' ').toLowerCase();
                    for (const item of trimesterKeywords) {
                        if (item.keywords.some(k => rowStr.includes(k.toLowerCase()))) {
                            detectedTrimester = item.val;
                            break;
                        }
                    }
                    if (detectedTrimester) break;
                }
            }

            // Set the dropdown value if detected
            if (detectedTrimester) {
                document.getElementById('sync-trimester-select').value = detectedTrimester;
            }

            // --- Global Pre-Scan for Class Mappings ---
            // نقوم بمسح جميع الصفحات لمعرفة الفوج المقابل لكل واحدة منها وحفظه
            numericSheets.forEach(sName => {
                const ws = workbook.getWorksheet(sName);
                const sData = [];
                ws.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                    const rv = [];
                    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                        let val = cell.value;
                        if (val && typeof val === 'object') {
                            if (val.richText) val = val.richText.map(t => t.text).join('');
                            else if (val.result !== undefined) val = val.result;
                        }
                        rv[colNumber - 1] = val;
                    });
                    sData[rowNumber - 1] = rv;
                });

                let hIndex = 0;
                for (let i = 0; i < Math.min(sData.length, 15); i++) {
                    const rowValues = sData[i] || [];
                    const rowStr = JSON.stringify(rowValues);
                    if (rowStr.includes('اللقب') || rowStr.includes('الاسم') || rowStr.includes('Nom')) {
                        hIndex = i;
                        break;
                    }
                }

                const mIdx = detectDigitizationClass(sData, hIndex);
                if (mIdx !== -1) {
                    digitizationState.sheetMappings[sName] = mIdx;
                }
            });

            // ملء القوائم المنسدلة
            const sheetSelect = document.getElementById('excel-sheet-select');
            sheetSelect.innerHTML = numericSheets.map(name => `<option value="${name}">${name}</option>`).join('');

            const classSelect = document.getElementById('app-class-mapping-select');
            classSelect.innerHTML = `
                <option value="">-- اختر الفوج المقابل --</option>
                ${appState.classes.map((cls, idx) => `<option value="${idx}">${cls.name}</option>`).join('')}
            `;

            // Let renderDigitizationSheet handle initial matching since it knows the data
            renderDigitizationSheet(true); // pass true to trigger auto-matching
        } catch (err) {
            alert('خطأ في قراءة ملف الإكسل (ExcelJS): ' + err.message);
        }
    };
    reader.readAsArrayBuffer(file);
};

window.renderDigitizationSheet = function (autoMatchClass = false) {
    const sheetName = document.getElementById('excel-sheet-select').value;
    if (!sheetName || !digitizationState.workbook) return;

    const worksheet = digitizationState.workbook.getWorksheet(sheetName);
    const jsonData = [];

    // تحويل بيانات ExcelJS إلى مصفوفة بسيطة (AOA) للمعاينة
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        const rowValues = [];
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            let val = cell.value;
            // التعامل مع كائنات ExcelJS المعقدة
            if (val && typeof val === 'object') {
                if (val.richText) val = val.richText.map(t => t.text).join('');
                else if (val.result !== undefined) val = val.result;
                else if (val.formula) val = val.result || '';
            }
            rowValues[colNumber - 1] = val;
        });
        jsonData[rowNumber - 1] = rowValues;
    });

    digitizationState.sheets[sheetName] = { data: jsonData };

    const thead = document.getElementById('digitization-thead');
    const tbody = document.getElementById('digitization-tbody');

    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (jsonData.length === 0) return;

    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(jsonData.length, 15); i++) {
        const rowValues = jsonData[i] || [];
        const rowStr = JSON.stringify(rowValues);
        if (rowStr.includes('اللقب') || rowStr.includes('الاسم') || rowStr.includes('Nom')) {
            headerRowIndex = i;
            break;
        }
    }

    // --- Smart Class Detection ---
    if (autoMatchClass) {
        // استخدم الربط المسبق إذا وجد، وإلا قم بمسح حالي (Lazy scan)
        let matchedIdx = digitizationState.sheetMappings[sheetName];

        if (matchedIdx === undefined) {
            matchedIdx = detectDigitizationClass(jsonData, headerRowIndex);
            if (matchedIdx !== -1) digitizationState.sheetMappings[sheetName] = matchedIdx;
        }

        if (matchedIdx !== undefined && matchedIdx !== -1) {
            document.getElementById('app-class-mapping-select').value = matchedIdx;
        } else {
            // إذا لم يتم العثور على مطابقة، اختر الخيار الافتراضي
            document.getElementById('app-class-mapping-select').value = "";
        }
    }

    const headers = jsonData[headerRowIndex] || [];
    thead.innerHTML = `<tr>${headers.map(h => `<th>${h || ''}</th>`).join('')}</tr>`;

    // عرض أول 50 صفاً للمعاينة
    const previewRows = jsonData.slice(headerRowIndex + 1, headerRowIndex + 51);
    previewRows.forEach(row => {
        if (!row || row.every(cell => cell === null || cell === undefined || cell === "")) return;
        const tr = document.createElement('tr');
        tr.innerHTML = row.map(cell => {
            if (typeof cell === 'number') return `<td>${formatValueWithComma(cell)}</td>`;
            return `<td>${cell !== undefined && cell !== null ? cell : ''}</td>`;
        }).join('');
        tbody.appendChild(tr);
    });
};

/**
 * دالة ذكية لمقارنة أسماء التلاميذ في ملف الإكسل مع الأفواج المسجلة في البرنامج
 * لاختيار الفوج التربوي المناسب تلقائياً
 */
function detectDigitizationClass(data, headerRowIndex) {
    if (!appState.classes || appState.classes.length === 0) return -1;

    const headers = data[headerRowIndex] || [];
    const surnameCol = headers.findIndex(h => h && (h.toString().includes('اللقب') || h.toString().includes('Nom')));
    const nameCol = headers.findIndex(h => h && (h.toString().includes('الاسم') || h.toString().includes('Prénom')));

    if (surnameCol === -1 || nameCol === -1) return -1;

    // استخراج أسماء التلاميذ من الإكسل (أول 30 تلميذ يكفي للمقارنة)
    const excelStudents = [];
    for (let i = headerRowIndex + 1; i < Math.min(data.length, headerRowIndex + 31); i++) {
        const row = data[i];
        if (!row) continue;
        const sName = (row[surnameCol] || '').toString().trim().toLowerCase();
        const fName = (row[nameCol] || '').toString().trim().toLowerCase();
        if (sName && fName) {
            excelStudents.push({ sName, fName });
        }
    }

    if (excelStudents.length === 0) return -1;

    let bestMatchIdx = -1;
    let maxMatchCount = 0;

    appState.classes.forEach((cls, idx) => {
        let matchCount = 0;
        cls.students.forEach(student => {
            const appSName = (student.surname || '').trim().toLowerCase();
            const appFName = (student.name || '').trim().toLowerCase();

            // محاولة المطابقة بعدة طرق لضمان الدقة
            const isMatch = excelStudents.some(es =>
                (es.sName === appSName && es.fName === appFName) ||
                (es.sName === appFName && es.fName === appSName) // في حال كان الاسم واللقب مقلوبين
            );

            if (isMatch) matchCount++;
        });

        if (matchCount > maxMatchCount) {
            maxMatchCount = matchCount;
            bestMatchIdx = idx;
        }
    });

    // عتبة التحقق: يجب أن يتطابق 3 تلاميذ على الأقل (أو 50% من التلاميذ لو الفوج صغير)
    if (maxMatchCount >= Math.min(3, excelStudents.length / 2)) {
        return bestMatchIdx;
    }

    return -1;
}

window.syncDigitizationTable = function () {
    renderDigitizationSheet();
};

window.syncGradingToDigitization = function () {
    const sheetName = document.getElementById('excel-sheet-select').value;
    const classIdx = document.getElementById('app-class-mapping-select').value;
    const selectedTrim = document.getElementById('sync-trimester-select').value;

    if (!sheetName || classIdx === "" || !digitizationState.workbook) {
        alert('يرجى اختيار الصفحة والفوج المقابل أولاً.');
        return;
    }

    const cls = appState.classes[classIdx];
    const triNames = [t('digitization_term_1'), t('digitization_term_2'), t('digitization_term_3')];

    const notifyBar = document.getElementById('sync-notify-bar');
    if (notifyBar) {
        notifyBar.style.backgroundColor = '#ef4444'; // أحمر للمزامنة
        notifyBar.textContent = t('msg_syncing_data')
            .replace('{n}', cls.students.length)
            .replace('{c}', cls.name)
            .replace('{t}', triNames[selectedTrim - 1]);
        notifyBar.style.display = 'block';
    }

    // الانتظار قليلاً للسماح للمتصفح برسم الشريط قبل بدء العمل الثقيل
    setTimeout(() => {
        const worksheet = digitizationState.workbook.getWorksheet(sheetName);
        const sheetData = digitizationState.sheets[sheetName].data;

        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(sheetData.length, 15); i++) {
            const rowValues = sheetData[i] || [];
            const rowStr = JSON.stringify(rowValues);
            if (rowStr.includes('اللقب') || rowStr.includes('الاسم') || rowStr.includes('Nom')) {
                headerRowIndex = i;
                break;
            }
        }

        // تحديد الأعمدة الثابتة كما في ملف الرقمنة الأصلي لضمان التوافق التام
        const colMon = 5;  // معدل تقويم النشاطات /20
        const colAss = 6;  // الفرض /20
        const colExam = 7; // الإختبار /20
        const colRem = 8;  // التقديرات


        let syncCount = 0;
        const trimKey = 't' + selectedTrim;
        let studentRowOffset = headerRowIndex + 1;
        const targetTrim = parseInt(selectedTrim);

        // فلترة التلاميذ النشطين فقط في هذا الفصل لتجنب إزاحة البيانات (Misalignment)
        // إذا كان التلميذ مخفياً (غير نشط) في هذا الفصل، يجب ألا تتم مزامنة علاماته
        const activeStudents = cls.students.filter(student => 
            !student.activeTrimesters || student.activeTrimesters.includes(targetTrim)
        );

        activeStudents.forEach((student, idx) => {
            const rIndexAoa = studentRowOffset + idx;
            const targetAoaRow = sheetData[rIndexAoa];
            if (!targetAoaRow) return;

            // تجاهل صفوف الفراغ تماماً (الحفاظ على نظافة الرؤوس والتذييلات)
            if (targetAoaRow.every(c => c === null || c === undefined || c === "")) return;

            if (!student.gradingData) student.gradingData = createEmptyGradingData();
            calculateStudentGrades(student, cls.coefficient, trimKey);

            const gData = student.gradingData[trimKey];
            const displayMonitoring = (gData.monitoring !== undefined && gData.monitoring !== null && gData.monitoring !== '')
                ? gData.monitoring
                : getContinuousTotal(student, trimKey);

            const grades = {
                monitoring: parseFloat(displayMonitoring) || 0,
                assignment: parseFloat(gData.assignment) || 0,
                exam: parseFloat(gData.exam) || 0,
                remark: gData.appreciation || getAppreciation(gData.average)
            };

            const mappings = [
                { col: colMon, val: grades.monitoring },
                { col: colAss, val: grades.assignment },
                { col: colExam, val: grades.exam },
                { col: colRem, val: grades.remark }
            ];

            const excelRow = worksheet.getRow(rIndexAoa + 1);

            mappings.forEach(m => {
                const cell = excelRow.getCell(m.col);
                // حقن القيمة فقط كـ "قيمة" دون تغيير أي تنسيق أو حماية (حسب طلب المستخدم)
                cell.value = m.val;

                // تحديث المعاينة المرئية
                targetAoaRow[m.col - 1] = m.val;
            });

            syncCount++;
        });

        // تحديث الإشعار ليصبح أخضر (نجاح) ويختفي تلقائياً كما طلب المستخدم
        if (notifyBar) {
            notifyBar.style.backgroundColor = '#10b981';
            notifyBar.textContent = t('msg_sync_success')
                .replace('{n}', syncCount)
                .replace('{t}', triNames[selectedTrim - 1]);

            setTimeout(() => {
                notifyBar.style.display = 'none';
            }, 3000); // يزول تلقائياً بعد 3 ثوانٍ
        }
        renderDigitizationSheet();
    }, 100);
};

window.exportDigitizationExcel = async function () {
    const sheetName = document.getElementById('excel-sheet-select').value;
    const selectedTrim = document.getElementById('sync-trimester-select').value;
    if (!sheetName || !digitizationState.workbook) {
        alert(t('msg_excel_upload_reminder'));
        return;
    }

    const triNames = [t('digitization_term_1'), t('digitization_term_2'), t('digitization_term_3')];
    const triName = triNames[selectedTrim - 1] || selectedTrim;
    let finalFileName = digitizationState.originalFileName || `${t('filename_digitization_results')}_${sheetName}_${t('header_term')}_${triName}.xlsx`;

    try {
        const buffer = await digitizationState.workbook.xlsx.writeBuffer();

        // --- Try Electron save dialog first ---
        if (window.electronAPI && window.electronAPI.saveFile) {
            const saved = await window.electronAPI.saveFile({
                defaultPath: finalFileName,
                buffer: Array.from(new Uint8Array(buffer)),
                filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
            });
            if (saved) {
                if (window.showActivationToast) {
                    window.showActivationToast(t('msg_excel_save_success'), 'success');
                }
            }
            return;
        }

        // --- Fallback: browser-style download ---
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = finalFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Show success toast
        if (window.showActivationToast) {
            window.showActivationToast(t('msg_excel_export_success'), 'success');
        }

    } catch (err) {
        alert(t('msg_excel_export_error') + ' (ExcelJS): ' + err.message);
    }
};

window.closeDigitizationWorkspace = function () {
    // Reset digitization state
    digitizationState.workbook = null;
    digitizationState.sheets = {};
    digitizationState.availableSheets = [];
    digitizationState.originalFileName = '';

    // Switch UI back to upload area
    document.getElementById('digitization-upload-area').style.display = 'block';
    document.getElementById('digitization-workspace').style.display = 'none';

    // Reset input file so it can be re-uploaded if needed
    const uploadInput = document.getElementById('excel-upload-input');
    if (uploadInput) uploadInput.value = '';
};

// --- Word Preview & Download Functions ---

window.showWordPreview = function (html, filename, orientation = 'portrait') {
    currentWordExportData = { html, filename, orientation };
    const container = document.getElementById('word-preview-container');
    const modal = document.getElementById('word-preview-modal');

    if (container && modal) {
        // Extract content within body if possible to avoid redundant html/body tags in preview
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const content = doc.querySelector('.Section1') || doc.body;
        container.innerHTML = content.innerHTML;
        modal.classList.add('open');
        document.body.classList.add('modal-open');

        // Close on outside click (if not already attached)
        if (!modal.dataset.listenerAttached) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    closeWordPreview();
                }
            });
            modal.dataset.listenerAttached = "true";
        }
    }
};

window.closeWordPreview = function () {
    const modal = document.getElementById('word-preview-modal');
    if (modal) modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    const container = document.getElementById('word-preview-container');
    if (container) container.innerHTML = ''; // Prevent duplicate IDs
};

window.openEmptyListWarningModal = function () {
    const modal = document.getElementById('empty-list-warning-modal');
    if (modal) {
        modal.classList.add('open');
        document.body.classList.add('modal-open');
    }
};

window.closeEmptyListWarningModal = function () {
    const modal = document.getElementById('empty-list-warning-modal');
    if (modal) modal.classList.remove('open');
    document.body.classList.remove('modal-open');
};

window.executeWordDownload = async function () {
    if (!currentWordExportData.html) return;

    const { html, filename } = currentWordExportData;

    // --- Try Electron save dialog first ---
    if (window.electronAPI && window.electronAPI.saveFile) {
        // Use html-docx-js to convert HTML to real .docx Blob with narrow margins (720 dxa = 0.5in)
        const docxBlob = htmlDocx.asBlob(html, {
            orientation: currentWordExportData.orientation || 'portrait',
            margins: { top: 720, right: 720, bottom: 720, left: 720, header: 720, footer: 720 }
        });
        const arrayBuffer = await docxBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const saved = await window.electronAPI.saveFile({
            defaultPath: filename,
            buffer: Array.from(uint8Array),
            filters: [{ name: 'Word Documents', extensions: ['docx'] }]
        });

        if (saved) {
            if (window.showActivationToast) {
                window.showActivationToast(t('msg_word_save_success'), 'success');
            }
            closeWordPreview();
        }
        return;
    }

    // --- Fallback: browser-style download ---
    showDownloadNotification();

    setTimeout(() => {
        // Use html-docx-js to convert HTML to real .docx Blob with narrow margins
        const docxBlob = htmlDocx.asBlob(html, {
            orientation: currentWordExportData.orientation || 'portrait',
            margins: { top: 720, right: 720, bottom: 720, left: 720, header: 720, footer: 720 }
        });
        
        const url = URL.createObjectURL(docxBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        closeWordPreview();
    }, 800);
};

function showDownloadNotification() {
    const notif = document.getElementById('word-download-notif');
    if (!notif) return;

    notif.classList.add('visible');

    setTimeout(() => {
        notif.classList.remove('visible');
    }, 4000); // Visible for 4 seconds
}


// --- Sound Effects (Synthesized for maximum reliability) ---
let audioCtx = null;

function initClickSounds() {
    // Handle interaction to unlock AudioContext and trigger sounds
    document.addEventListener('pointerdown', (e) => {
        const target = e.target.closest('button, .nav-btn, .tab-btn, .sub-btn, .submenu-list li, .social-links a, .plan-box, .btn');
        if (target) {
            playClickSound();
        }
    }, { passive: true });
}

function playClickSound() {
    try {
        // Initialize AudioContext on first interaction
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Resume if suspended (browser requirement)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        // Create a sharp, short "click" sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
        console.warn('Sound synthesis error:', e);
    }
}

window.animateSplashLogo = function (el) {
    const logo = el || document.querySelector('.splash-logo img');
    if (!logo) return;

    // تشغيل الرنة
    playLogoChime();

    // إضافة الأنيميشن
    logo.classList.remove('logo-bounce-active');
    void logo.offsetWidth; // فرض إعادة التصيير لتشغيل الأنيميشن مجدداً
    logo.classList.add('logo-bounce-active');

    // إزالة الكلاس بعد انتهاء الأنيميشن
    setTimeout(() => {
        logo.classList.remove('logo-bounce-active');
    }, 600);
};

function playLogoChime() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;

        // تأثير "بريق" (Sparkle) متصاعد يتناسب مع حركة القفز
        // ترددات: C5, E5, G5, C6, E6
        const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];

        freqs.forEach((f, i) => {
            const time = now + (i * 0.05); // تتابع سريع للأصوات
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, time);
            // انخفاض طفيف في النغمة ليعطي طابعاً حيوياً
            osc.frequency.exponentialRampToValueAtTime(f * 0.95, time + 0.4);

            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.15, time + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(time);
            osc.stop(time + 0.7);
        });

        // إضافة صوت "نقرة" (Tap) خفيفة في البداية لتعزيز الشعور بالضغط
        const tap = audioCtx.createOscillator();
        const tapGain = audioCtx.createGain();
        tap.type = 'triangle';
        tap.frequency.setValueAtTime(200, now);
        tap.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        tapGain.gain.setValueAtTime(0.1, now);
        tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        tap.connect(tapGain);
        tapGain.connect(audioCtx.destination);
        tap.start(now);
        tap.stop(now + 0.1);

    } catch (e) {
        console.warn('Chime sound error:', e);
    }
}

// --- Creator Info Modal ---
window.revealCreatorInfo = function () {
    const hiddenInfo = document.getElementById('creator-hidden-info');
    const avatar = document.querySelector('.creator-dynamic-avatar');
    const clickHint = document.getElementById('creator-click-hint');

    if (hiddenInfo && avatar) {
        hiddenInfo.classList.add('revealed');
        avatar.classList.add('avatar-revealed-state');
        avatar.style.cursor = 'default';
        avatar.onclick = null;
        if (clickHint) clickHint.style.display = 'none';
    }
};

window.showCreatorInfo = function () {
    const hiddenInfo = document.getElementById('creator-hidden-info');
    const avatar = document.querySelector('.creator-dynamic-avatar');
    const clickHint = document.getElementById('creator-click-hint');

    if (hiddenInfo && avatar) {
        // Reset state so logo is alone on entry (Force instant reset)
        hiddenInfo.style.transition = 'none';
        hiddenInfo.classList.remove('revealed');

        // Trigger reflow
        void hiddenInfo.offsetHeight;

        hiddenInfo.style.transition = ''; // Restore transition for the user click

        avatar.classList.remove('avatar-revealed-state');
        avatar.style.cursor = 'pointer';
        avatar.onclick = window.revealCreatorInfo;
        if (clickHint) clickHint.style.display = 'block';
    }

    document.getElementById('creator-info-modal').classList.add('open');
};

window.closeCreatorModal = function () {
    document.getElementById('creator-info-modal').classList.remove('open');
};

window.closeCreatorModalOutside = function (event) {
    // Only close if clicking exactly on the overlay background (not inside the modal content)
    if (event.target.id === 'creator-info-modal') {
        const hiddenInfo = document.getElementById('creator-hidden-info');
        // Only close if the hidden info has been revealed
        if (hiddenInfo && hiddenInfo.classList.contains('revealed')) {
            window.closeCreatorModal();
        }
    }
};

// --- Initialization ---

// --- Sidebar Toggle Logic ---
window.toggleSidebar = function () {
    const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
    // Optional: Play sound
    if (typeof playClickSound === 'function') playClickSound();
};

// --- Data Backup & Restore ---
let tempImportedData = null;

window.exportAppData = async function () {
    try {
        const dataStr = JSON.stringify(allYearsData, null, 2);
        const date = new Date().toISOString().split('T')[0];
        const filename = `MasterMarks_Data_${date}.json`;

        // --- Try Electron save dialog first ---
        if (window.electronAPI && window.electronAPI.saveFile) {
            const encoder = new TextEncoder();
            const uint8Array = encoder.encode(dataStr);

            const saved = await window.electronAPI.saveFile({
                defaultPath: filename,
                buffer: Array.from(uint8Array),
                filters: [{ name: 'JSON Files', extensions: ['json'] }]
            });

            if (saved) {
                if (window.showActivationToast) {
                    window.showActivationToast('تم تصدير ملف البيانات بنجاح', 'success');
                }
            }
            return;
        }

        // --- Fallback: browser-style download ---
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        if (window.showActivationToast) {
            window.showActivationToast('تم تصدير ملف البيانات بنجاح', 'success');
        }
    } catch (error) {
        console.error("Export failed:", error);
        alert('حدث خطأ أثناء تصدير البيانات');
    }
};

window.handleImportSelection = function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // Basic validation: must have 'years' object
            if (!importedData.years || typeof importedData.years !== 'object') {
                throw new Error("Invalid format: Missing 'years' object");
            }

            // Store temporarily and show modal
            tempImportedData = importedData;
            document.getElementById('import-confirm-modal').classList.add('open');

            // Reset input so same file can be selected again if needed
            event.target.value = '';

        } catch (error) {
            console.error("Import failed:", error);
            alert('فشل قراءة الملف. يرجى التأكد من اختيار ملف بيانات ScoreBook صحيح (.json).');
            event.target.value = '';
        }
    };
    reader.readAsText(file);
};

window.closeImportModal = function () {
    document.getElementById('import-confirm-modal').classList.remove('open');
    tempImportedData = null;
};

window.executeImportAppData = async function () {
    if (!tempImportedData) return;

    try {
        // Update app data
        allYearsData = tempImportedData;

        // Ensure appState points to the current reference
        if (allYearsData.years[allYearsData.currentYear]) {
            appState = JSON.parse(JSON.stringify(allYearsData.years[allYearsData.currentYear]));
        } else {
            const firstAvailableYear = Object.keys(allYearsData.years)[0];
            allYearsData.currentYear = firstAvailableYear;
            appState = JSON.parse(JSON.stringify(allYearsData.years[firstAvailableYear]));
        }

        // Save and reload
        await saveAppState(true);

        closeImportModal();

        if (window.showActivationToast) {
            window.showActivationToast('تم استيراد البيانات بنجاح، جاري إعادة التحميل...', 'success');
        }

        setTimeout(() => {
            location.reload();
        }, 1500);

    } catch (error) {
        console.error("Import execution failed:", error);
        alert('حدث خطأ أثناء تطبيق البيانات الجديدة.');
        closeImportModal();
    }
};

// --- Theme Management logic ---
const appThemes = [
    { id: 'default', name: t('theme_name_default'), previewClass: 'preview-default' },
    { id: 'theme-midnight', name: t('theme_name_midnight'), previewClass: 'preview-midnight' },
    { id: 'theme-royal', name: t('theme_name_royal'), previewClass: 'preview-royal' },
    { id: 'theme-emerald', name: t('theme_name_emerald'), previewClass: 'preview-emerald' },
    { id: 'theme-nordic', name: t('theme_name_nordic'), previewClass: 'preview-nordic' },
    { id: 'theme-autumn', name: t('theme_name_autumn'), previewClass: 'preview-autumn' },
    { id: 'theme-matrix', name: t('theme_name_matrix'), previewClass: 'preview-matrix' },
    { id: 'theme-strawberry', name: t('theme_name_strawberry'), previewClass: 'preview-strawberry' },
    { id: 'theme-nebula', name: t('theme_name_nebula'), previewClass: 'preview-nebula' },
    { id: 'theme-crimson', name: t('theme_name_crimson'), previewClass: 'preview-crimson' },
    { id: 'theme-custom', name: t('theme_name_custom'), previewClass: 'preview-custom' }
];

function initAppTheme() {
    const savedTheme = localStorage.getItem('scorebook_app_theme') || 'default';
    if (savedTheme === 'theme-custom') {
        const config = JSON.parse(localStorage.getItem('scorebook_custom_theme_config'));
        if (config) applyCustomThemeVariables(config);
    }
    setTheme(savedTheme, false);
}

function showThemePicker() {
    const grid = document.getElementById('theme-options-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const currentTheme = localStorage.getItem('scorebook_app_theme') || 'default';

    appThemes.forEach(theme => {
        const card = document.createElement('div');
        card.className = `theme-option-card ${theme.id === currentTheme ? 'active' : ''}`;
        card.setAttribute('data-id', theme.id);
        card.onclick = () => {
            if (theme.id === 'theme-custom') {
                showCustomThemeModal();
            } else {
                setTheme(theme.id);
            }
        };

        let innerHTML = `
            <div class="theme-preview-circle ${theme.previewClass}"></div>
            <span>${theme.name}</span>
        `;

        if (theme.id === 'theme-custom') {
            innerHTML += `<div class="edit-custom-theme" onclick="event.stopPropagation(); showCustomThemeModal();"><i class="fas fa-edit"></i></div>`;
        }

        card.innerHTML = innerHTML;
        grid.appendChild(card);
    });

    document.getElementById('theme-picker-modal').classList.add('open');
}

function setTheme(themeId, shouldSave = true) {
    // Remove all theme classes
    appThemes.forEach(theme => {
        if (theme.id !== 'default') {
            document.body.classList.remove(theme.id);
        }
    });

    // Reset inline styles if switching away from custom
    if (themeId !== 'theme-custom') {
        resetCustomThemeVariables();
    } else {
        const config = JSON.parse(localStorage.getItem('scorebook_custom_theme_config'));
        if (config) applyCustomThemeVariables(config);
    }

    // Add new theme class
    if (themeId !== 'default' && themeId !== 'theme-custom') {
        document.body.classList.add(themeId);
    }

    // Save choice
    if (shouldSave) {
        localStorage.setItem('scorebook_app_theme', themeId);
        // Update UI if modal is open
        const cards = document.querySelectorAll('.theme-option-card');
        cards.forEach((card) => {
            card.classList.toggle('active', card.getAttribute('data-id') === themeId);
        });
    }
}

function closeThemePicker() {
    document.getElementById('theme-picker-modal').classList.remove('open');
}

let originalThemeBeforeCustom = 'default';

function showCustomThemeModal() {
    originalThemeBeforeCustom = localStorage.getItem('scorebook_app_theme') || 'default';
    const config = JSON.parse(localStorage.getItem('scorebook_custom_theme_config')) || {
        primary: '#5b50e5',
        secondary: '#4338ca',
        accent: '#818cf8',
        headerStart: '#4338ca',
        headerEnd: '#5b50e5',
        sidebarStart: '#1e1b4b',
        sidebarEnd: '#312e81'
    };

    document.getElementById('custom-primary').value = config.primary;
    document.getElementById('custom-secondary').value = config.secondary;
    document.getElementById('custom-accent').value = config.accent;
    document.getElementById('custom-header-start').value = config.headerStart;
    document.getElementById('custom-header-end').value = config.headerEnd;
    document.getElementById('custom-sidebar-start').value = config.sidebarStart;
    document.getElementById('custom-sidebar-end').value = config.sidebarEnd;

    document.getElementById('custom-theme-modal').classList.add('open');
}

function closeCustomThemeModal() {
    document.getElementById('custom-theme-modal').classList.remove('open');
    // Revert to original theme if not saved
    setTheme(originalThemeBeforeCustom, false);
}

function previewCustomTheme() {
    const config = {
        primary: document.getElementById('custom-primary').value,
        secondary: document.getElementById('custom-secondary').value,
        accent: document.getElementById('custom-accent').value,
        headerStart: document.getElementById('custom-header-start').value,
        headerEnd: document.getElementById('custom-header-end').value,
        sidebarStart: document.getElementById('custom-sidebar-start').value,
        sidebarEnd: document.getElementById('custom-sidebar-end').value
    };
    applyCustomThemeVariables(config);
}

function saveCustomTheme() {
    const config = {
        primary: document.getElementById('custom-primary').value,
        secondary: document.getElementById('custom-secondary').value,
        accent: document.getElementById('custom-accent').value,
        headerStart: document.getElementById('custom-header-start').value,
        headerEnd: document.getElementById('custom-header-end').value,
        sidebarStart: document.getElementById('custom-sidebar-start').value,
        sidebarEnd: document.getElementById('custom-sidebar-end').value
    };

    localStorage.setItem('scorebook_custom_theme_config', JSON.stringify(config));
    applyCustomThemeVariables(config);
    originalThemeBeforeCustom = 'theme-custom'; // Update original so closing doesn't revert
    setTheme('theme-custom');
    closeCustomThemeModal();
}

function applyCustomThemeVariables(config) {
    const root = document.body;
    root.style.setProperty('--primary-color', config.primary);
    root.style.setProperty('--primary-light', config.accent); // Use accent as light version
    root.style.setProperty('--secondary-color', config.secondary);
    root.style.setProperty('--accent-color', config.accent);
    root.style.setProperty('--header-gradient', `linear-gradient(135deg, ${config.headerStart} 0%, ${config.headerEnd} 100%)`);
    root.style.setProperty('--sidebar-gradient', `linear-gradient(180deg, ${config.sidebarStart} 0%, ${config.sidebarEnd} 100%)`);
}

function resetCustomThemeVariables() {
    const root = document.body;
    root.style.removeProperty('--primary-color');
    root.style.removeProperty('--primary-light');
    root.style.removeProperty('--secondary-color');
    root.style.removeProperty('--accent-color');
    root.style.removeProperty('--header-gradient');
    root.style.removeProperty('--sidebar-gradient');
}

// --- منطق الغيابات (Absences Logic) ---
function renderAbsencesSection() {
    const headerAbsences = document.getElementById("teacher-info-header-absences");
    if (headerAbsences) {
        const info = appState.teacherInfo;
        const currentClass = appState.classes[currentActiveClassIndex] || { name: "---", students: [] };
        const studentCount = currentClass.students ? currentClass.students.filter(s =>
            !s.activeTrimesters || s.activeTrimesters.includes(currentTrimester)
        ).length : 0;

        headerAbsences.innerHTML = `
            <div class="info-item">
                <span class="info-label">${t('header_teacher')}</span>
                <span class="info-value">${info.name || "---"}</span>
            </div>
            <div class="info-item">
                <span class="info-label">${t('header_group')}</span>
                <span class="info-value"><bdi dir="${currentLang === 'ar' ? 'rtl' : 'ltr'}">${currentClass.name}</bdi></span>
            </div>
            <div class="info-item">
                <span class="info-label">${t('header_term')}</span>
                <span class="info-value">${currentTrimester}</span>
            </div>
             <div class="info-item">
                <span class="info-label">${t('header_students_count')}</span>
                <span class="info-value">${studentCount}</span>
            </div>
        `;
    }

    // --- تحديث توقيت التقويم حسب الفصل المختار ---
    const academicYear = appState.teacherInfo.year || "2025 / 2026";
    const years = academicYear.split("/").map(y => parseInt(y.trim()));
    const startYear = years[0] || new Date().getFullYear();
    const endYear = years[1] || startYear + 1;

    // تحديد الشهر والسنة الافتراضية لكل فصل حسب طلب الأستاذ
    let targetMonth, targetYear;
    if (currentTrimester === 1) {
        targetMonth = 8; // سبتمبر (0-indexed)
        targetYear = startYear;
    } else if (currentTrimester === 2) {
        targetMonth = 0; // جانفي
        targetYear = endYear;
    } else {
        targetMonth = 3; // أفريل
        targetYear = endYear;
    }

    // إذا كان التاريخ المعروض حالياً خارج شهور الفصل، نضبطه على الشهر الأول للفصل
    const currentMonth = calendarViewDate.getMonth();
    const currentYear = calendarViewDate.getFullYear();

    let isOutOfRange = false;
    if (currentTrimester === 1 && (currentYear !== startYear || currentMonth < 8)) isOutOfRange = true;
    if (currentTrimester === 2 && (currentYear !== endYear || currentMonth > 2)) isOutOfRange = true;
    if (currentTrimester === 3 && (currentYear !== endYear || currentMonth < 3 || currentMonth > 5)) isOutOfRange = true;

    if (isOutOfRange) {
        calendarViewDate = new Date(targetYear, targetMonth, 1);
    }

    renderAbsencesCalendar();
    renderAbsenceStudentList();
    renderAbsenceStats();

    document.getElementById("absences-stats-trimester").textContent = currentTrimester;
}

function renderAbsencesCalendar() {
    const grid = document.getElementById("calendar-days-grid");
    const monthYearTitle = document.getElementById("calendar-month-year");
    if (!grid || !monthYearTitle) return;

    grid.innerHTML = "";
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();

    const monthNames = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    let monthName = monthNames[month];
    if (typeof t === 'function') {
        const mKey = (month + 1).toString().padStart(2, '0');
        monthName = t(`month_${mKey}`) || monthNames[month];
    }
    monthYearTitle.textContent = `${monthName} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "calendar-day empty-day";
        grid.appendChild(emptyCell);
    }

    const currentClass = appState.classes[currentActiveClassIndex];
    const trimKey = `t${currentTrimester}`;

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayCell = document.createElement("div");
        dayCell.className = "calendar-day";
        dayCell.textContent = day;

        const dateObj = new Date(year, month, day);
        if (dateObj.getDay() === 5 || dateObj.getDay() === 6) {
            dayCell.classList.add("weekend");
        }

        if (dateStr === currentAbsenceDate) dayCell.classList.add("selected");
        if (dateStr === new Date().toISOString().split("T")[0]) dayCell.classList.add("today");

        const hasAbsences = currentClass && currentClass.students.some(s =>
            s.absenceData && s.absenceData[trimKey] && s.absenceData[trimKey][dateStr]
        );
        if (hasAbsences) dayCell.classList.add("has-absences");

        dayCell.onclick = () => selectAbsenceDate(dateStr);
        grid.appendChild(dayCell);
    }
}

window.changeAbsenceMonth = function (offset) {
    const tempDate = new Date(calendarViewDate);
    tempDate.setMonth(tempDate.getMonth() + offset);
    const month = tempDate.getMonth();
    const year = tempDate.getFullYear();

    // استخراج السنوات من العام الدراسي
    const academicYear = appState.teacherInfo.year || "2025 / 2026";
    const years = academicYear.split("/").map(y => parseInt(y.trim()));
    const startYear = years[0];
    const endYear = years[1];

    // تقييد التنقل حسب الفصل وشهوره المحددة
    if (currentTrimester === 1) { // T1: Sept (8) to Dec (11)
        if (year !== startYear || month < 8 || month > 11) return;
    } else if (currentTrimester === 2) { // T2: Jan (0) to Mar (2)
        if (year !== endYear || month < 0 || month > 2) return;
    } else if (currentTrimester === 3) { // T3: Apr (3) to Jun (5)
        if (year !== endYear || month < 3 || month > 5) return;
    }

    calendarViewDate = tempDate;
    renderAbsencesCalendar();
};

window.selectAbsenceDate = function (dateStr) {
    currentAbsenceDate = dateStr;
    const dateLabel = document.getElementById("selected-absence-date");
    if (dateLabel) {
        const dateObj = new Date(dateStr);
        const monthNames = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
        const day = dateObj.getDate();
        const mIndex = dateObj.getMonth();
        let month = monthNames[mIndex];
        if (typeof t === 'function') {
            const mKey = (mIndex + 1).toString().padStart(2, '0');
            month = t(`month_${mKey}`) || month;
        }
        const year = dateObj.getFullYear();
        dateLabel.textContent = `${day} ${month} ${year}`;
    }
    renderAbsencesCalendar();
    renderAbsenceStudentList();

    // إظهار النافذة المنبثقة
    const modal = document.getElementById("absences-list-modal");
    if (modal) modal.classList.add("open");
};

window.closeAbsencesListModal = function () {
    const modal = document.getElementById("absences-list-modal");
    if (modal) modal.classList.remove("open");
};

function renderAbsenceStudentList() {
    const tbody = document.getElementById("absences-student-list-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const currentClass = appState.classes[currentActiveClassIndex];
    if (!currentClass) return;

    const trimKey = `t${currentTrimester}`;
    const filteredStudents = currentClass.students.filter(s =>
        !s.activeTrimesters || s.activeTrimesters.includes(currentTrimester)
    );

    filteredStudents.forEach((student, index) => {
        const isAbsent = student.absenceData && student.absenceData[trimKey] && student.absenceData[trimKey][currentAbsenceDate];
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td class="student-name-align" style="cursor: pointer;" onclick="toggleAbsence('${student.id}')">
                ${student.surname} ${student.name}
            </td>
            <td>
                <button class="btn-absence-toggle ${isAbsent ? "absent" : ""}" onclick="toggleAbsence('${student.id}')">
                    ${isAbsent ? t('btn_absent') : t('btn_present')}
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.toggleAbsence = function (studentId) {
    const currentClass = appState.classes[currentActiveClassIndex];
    if (!currentClass) return;
    const student = currentClass.students.find(s => s.id === studentId);
    if (!student) return;

    const trimKey = `t${currentTrimester}`;
    if (!student.absenceData) student.absenceData = createEmptyAbsenceData();
    if (!student.absenceData[trimKey]) student.absenceData[trimKey] = {};

    if (student.absenceData[trimKey][currentAbsenceDate]) {
        delete student.absenceData[trimKey][currentAbsenceDate];
    } else {
        student.absenceData[trimKey][currentAbsenceDate] = true;
    }

    saveAppState(true);
    renderAbsencesCalendar();
    renderAbsenceStudentList();
    renderAbsenceStats();
};

let absenceStatsSortColumn = null;
let absenceStatsSortDirection = 'asc';

window.sortAbsenceStats = function (column) {
    if (column === 'name') {
        absenceStatsSortColumn = 'name';
        absenceStatsSortDirection = 'asc';
    } else {
        if (absenceStatsSortColumn === column) {
            absenceStatsSortDirection = absenceStatsSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            absenceStatsSortColumn = column;
            absenceStatsSortDirection = 'desc';
        }
    }

    const nameHeader = document.getElementById("th-absences-name");
    const countHeader = document.getElementById("th-absences-count");

    if (nameHeader) {
        let icon = '<i class="fas fa-sort" style="opacity:0.3"></i>';
        if (absenceStatsSortColumn === 'name') {
            icon = '<i class="fas fa-sort-down"></i>';
        }
        nameHeader.innerHTML = `${t('list_col_surname')} & ${t('list_col_name')} ${icon}`;
    }

    if (countHeader) {
        let icon = '<i class="fas fa-sort" style="opacity:0.3"></i>';
        if (absenceStatsSortColumn === 'count') {
            icon = absenceStatsSortDirection === 'asc' ? '<i class="fas fa-sort-up"></i>' : '<i class="fas fa-sort-down"></i>';
        }
        countHeader.innerHTML = `${t('absences_col_count')} ${icon}`;
    }

    renderAbsenceStats();
};

function renderAbsenceStats() {
    const tbody = document.getElementById("absences-stats-body");
    if (!tbody) return;
    const isRTL = currentLang === 'ar';
    tbody.innerHTML = "";

    const currentClass = appState.classes[currentActiveClassIndex];
    if (!currentClass) return;

    const trimKey = `t${currentTrimester}`;
    let studentsWithStats = currentClass.students
        .filter(s => !s.activeTrimesters || s.activeTrimesters.includes(currentTrimester))
        .map(student => {
            const absences = student.absenceData && student.absenceData[trimKey] ? Object.keys(student.absenceData[trimKey]) : [];
            const formattedDates = absences.sort().map(dateStr => {
                const d = new Date(dateStr);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                // المطلب: 08-09-2026 (YYYY-MM-DD) عند اختيار العربية
                return currentLang === 'ar' ? `${year}-${month}-${day}` : `${day}-${month}-${year}`;
            });
            return {
                student: student,
                absencesCount: absences.length,
                absencesDates: formattedDates
            };
        })
        .filter(item => item.absencesCount > 0);

    // Sorting logic
    if (absenceStatsSortColumn) {
        studentsWithStats.sort((a, b) => {
            if (absenceStatsSortColumn === 'name') {
                const nameA = (a.student.surname + " " + a.student.name).trim();
                const nameB = (b.student.surname + " " + b.student.name).trim();
                return absenceStatsSortDirection === 'asc' ? nameA.localeCompare(nameB, 'ar') : nameB.localeCompare(nameA, 'ar');
            } else if (absenceStatsSortColumn === 'count') {
                return absenceStatsSortDirection === 'asc' ? a.absencesCount - b.absencesCount : b.absencesCount - a.absencesCount;
            }
            return 0;
        });
    }

    studentsWithStats.forEach((item, index) => {
        const student = item.student;
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="width: 1%; white-space: nowrap;">${index + 1}</td>
            <td class="student-name-align" style="width: 1%; white-space: nowrap;"><strong>${student.surname}</strong> ${student.name}</td>
            <td style="width: 1%; white-space: nowrap; font-weight: 700; color: var(--danger-color);">${item.absencesCount}</td>
            <td style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">
                ${item.absencesDates.join(isRTL ? " ، " : ", ")}
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (tbody.innerHTML === "") {
        tbody.innerHTML = `<tr><td colspan='4' style='text-align:center; padding: 2rem; color: var(--text-muted);'>${t('absences_stats_empty_table')}</td></tr>`;
    }
}

window.openAbsencesStatsModal = function () {
    const modal = document.getElementById("absences-stats-modal");
    if (modal) {
        const tableView = document.getElementById("absences-stats-table-view");
        const chartView = document.getElementById("absences-stats-chart-view");
        const btn = document.getElementById("btn-toggle-chart");

        if (tableView && chartView) {
            tableView.classList.remove("hidden");
            chartView.classList.add("hidden");
            if (btn) {
                btn.style.backgroundColor = "";
                btn.classList.remove("btn-danger");
                btn.classList.add("btn-primary");
                btn.innerHTML = `<i class="fas fa-chart-pie"></i> ${t('absences_stats_analyze')}`;
            }
        }

        modal.classList.add("open");
    }
};

window.closeAbsencesStatsModal = function () {
    const modal = document.getElementById("absences-stats-modal");
    if (modal) modal.classList.remove("open");
};

window.toggleAbsencesChart = function () {
    const tableView = document.getElementById("absences-stats-table-view");
    const chartView = document.getElementById("absences-stats-chart-view");
    const btn = document.getElementById("btn-toggle-chart");

    if (tableView && chartView) {
        if (chartView.style.display !== "block") {
            tableView.classList.add("hidden");
            chartView.classList.remove("hidden");
            tableView.style.display = "none";
            chartView.style.display = "block";

            if (btn) {
                btn.classList.remove("btn-primary");
                btn.classList.add("btn-danger");
                btn.style.backgroundColor = "var(--danger-color)";
                btn.innerHTML = `<i class="fas fa-times"></i> ${t('absences_stats_close_analyze')}`;
            }
            buildAbsencesChart();
        } else {
            chartView.classList.add("hidden");
            tableView.classList.remove("hidden");
            chartView.style.display = "none";
            tableView.style.display = "block";

            if (btn) {
                btn.style.backgroundColor = "";
                btn.classList.remove("btn-danger");
                btn.classList.add("btn-primary");
                btn.innerHTML = `<i class="fas fa-chart-pie"></i> ${t('absences_stats_analyze')}`;
            }
        }
    }
};

function buildAbsencesChart() {
    const container = document.getElementById("absences-chart-container");
    if (!container) return;
    container.innerHTML = "";

    const currentClass = appState.classes[currentActiveClassIndex];
    if (!currentClass) return;

    const trimKey = `t${currentTrimester}`;
    const filteredStudents = currentClass.students.filter(s =>
        !s.activeTrimesters || s.activeTrimesters.includes(currentTrimester)
    );

    const monthCounts = {};
    const monthNames = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    let totalAbsences = 0;

    filteredStudents.forEach(student => {
        if (student.absenceData && student.absenceData[trimKey]) {
            Object.keys(student.absenceData[trimKey]).forEach(dateStr => {
                const dateObj = new Date(dateStr);
                const mIndex = dateObj.getMonth();
                let monthName = monthNames[mIndex];
                if (typeof t === 'function') {
                    const mKey = (mIndex + 1).toString().padStart(2, '0');
                    monthName = t(`month_${mKey}`) || monthName;
                }
                if (!monthCounts[monthName]) monthCounts[monthName] = 0;
                monthCounts[monthName]++;
                totalAbsences++;
            });
        }
    });

    if (totalAbsences === 0) {
        container.innerHTML = `<div style='text-align:center; padding: 2rem; color: var(--text-muted);'>${t('absences_stats_no_data')}</div>`;
        return;
    }

    const sortedMonths = Object.keys(monthCounts).sort((a, b) => {
        return monthNames.indexOf(a) - monthNames.indexOf(b);
    });

    // Create Pie Chart logic using conic-gradient
    let gradientParts = [];
    let currentAngle = 0;
    const colors = ["#FFB7B2", "#B5EAD7", "#C7CEEA", "#FFDAC1", "#E2F0CB", "#FF9AA2", "#F3B0C3", "#B19CD9", "#AEC6CF", "#FDFD96"];
    let colorIndex = 0;
    let legendHTML = `<div style="display:flex; justify-content:center; gap:15px; flex-wrap:wrap; margin-top:20px;">`;

    sortedMonths.forEach(month => {
        const count = monthCounts[month];
        const percentage = (count / totalAbsences) * 100;
        const startAngle = currentAngle;
        const endAngle = currentAngle + percentage;

        const color = colors[colorIndex % colors.length];

        gradientParts.push(`${color} ${startAngle}% ${endAngle}%`);

        legendHTML += `
            <div style="display:flex; align-items:center; gap:5px; font-size:0.95rem;">
                <div style="width:15px; height:15px; background-color:${color}; border-radius:3px;"></div>
                <span style="color:var(--text-color);">${month} (${count})</span>
            </div>
        `;

        currentAngle = endAngle;
        colorIndex++;
    });

    const gradientString = gradientParts.join(", ");

    let chartHTML = `
        <div style="font-size: 1.1rem; text-align: center; margin-bottom: 20px; font-weight: bold; color: var(--text-color);">
            ${t('absences_stats_chart_title')}
        </div>
        <div style="display:flex; justify-content:center; margin-top: 10px;">
            <div style="width: 220px; height: 220px; border-radius: 50%; background: conic-gradient(${gradientString}); box-shadow: 0 4px 10px rgba(0,0,0,0.15);"></div>
        </div>
        ${legendHTML}
    `;

    container.innerHTML = chartHTML;
}

window.exportAbsencesToWord = function () {
    const feedback = document.createElement('div');
    feedback.style = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#2b579a; color:white; padding:15px 30px; border-radius:30px; z-index:99999; box-shadow:0 10px 25px rgba(0,0,0,0.2); font-family:Tajawal; font-weight:bold;";
    feedback.innerText = t('msg_preparing_word');
    document.body.appendChild(feedback);

    try {
        const cls = appState.classes[currentActiveClassIndex];
        if (!cls) throw new Error("يرجى اختيار قسم أولاً");

        const info = appState.teacherInfo;
        const triNames = [t('digitization_term_1'), t('digitization_term_2'), t('digitization_term_3')];
        const trimName = triNames[currentTrimester - 1] || currentTrimester;
        const trimKey = `t${currentTrimester}`;
        const academicYear = info.year || "2025 / 2026";

        const students = cls.students.filter(s => !s.activeTrimesters || s.activeTrimesters.includes(currentTrimester));

        let studentsWithStats = students
            .map(student => {
                const absences = student.absenceData && student.absenceData[trimKey] ? Object.keys(student.absenceData[trimKey]) : [];

                const formattedDates = absences.sort().map(dateStr => {
                    const d = new Date(dateStr);
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    // المطلب: 08-09-2026 (DD-MM-YYYY) عند اختيار العربية
                    return currentLang === 'ar' ? `${year}-${month}-${day}` : `${day}-${month}-${year}`;
                });

                return {
                    student: student,
                    absencesCount: absences.length,
                    absencesDates: formattedDates
                };
            })
            .filter(item => item.absencesCount > 0);

        if (absenceStatsSortColumn) {
            studentsWithStats.sort((a, b) => {
                if (absenceStatsSortColumn === 'name') {
                    const nameA = (a.student.surname + " " + a.student.name).trim();
                    const nameB = (b.student.surname + " " + b.student.name).trim();
                    return absenceStatsSortDirection === 'asc' ? nameA.localeCompare(nameB, 'ar') : nameB.localeCompare(nameA, 'ar');
                } else if (absenceStatsSortColumn === 'count') {
                    return absenceStatsSortDirection === 'asc' ? a.absencesCount - b.absencesCount : b.absencesCount - a.absencesCount;
                }
                return 0;
            });
        }

        const isRTL = currentLang === 'ar';
        const docDir = isRTL ? 'rtl' : 'ltr';
        const alignStart = isRTL ? 'right' : 'left';
        const alignEnd = isRTL ? 'left' : 'right';

        const tableStyle = `
            width: 100%;
            border-collapse: collapse;
            margin: 10px auto;
            direction: ${docDir};
            text-align: center;
            border: 1px solid black;
            font-size: 11pt;
        `;

        const thStyle = `
            border: 1px solid #000;
            padding: 8px 4px;
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
        `;

        const tdStyle = `
            border: 1px solid #000;
            padding: 6px 4px;
            text-align: center;
            vertical-align: middle;
        `;


        const tdNameStyle = `
            border: 1px solid #000;
            padding: 6px 4px;
            text-align: ${alignStart};
            vertical-align: middle;
        `;

        const tableHeadersHtml = `
            <thead>
                <tr>
                    <th style="${thStyle} width: 40px;">${t('list_col_num')}</th>
                    <th style="${thStyle} width: 250px;">${t('home_teacher_name_ph')}</th>
                    <th style="${thStyle} width: 120px;">${t('absences_col_count')}</th>
                    <th style="${thStyle}">${t('absences_col_dates')}</th>
                </tr>
            </thead>
        `;

        let rowsHtml = '';
        if (studentsWithStats.length === 0) {
            rowsHtml = `<tr><td colspan="4" style="${tdStyle}; font-weight:bold; height: 50px;">${t('export_no_absences')}</td></tr>`;
        } else {
            studentsWithStats.forEach((item, index) => {
                rowsHtml += `
                <tr>
                    <td style="${tdStyle} font-weight: bold;">${index + 1}</td>
                    <td style="${tdNameStyle}"><strong>${item.student.surname}</strong> ${item.student.name}</td>
                    <td style="${tdStyle} font-weight: bold;">${item.absencesCount}</td>
                    <td style="${tdStyle} font-size: 10pt;">${item.absencesDates.join(isRTL ? " ، " : ", ")}</td>
                </tr>`;
            });
        }

        const headerHtml = `
            <div style="text-align: center; margin-bottom: 30px;">
                <table align="center" style="border: 2px solid #2b579a; border-collapse: collapse; margin-bottom: 20px; max-width: 95%; margin-left: auto; margin-right: auto;">
                    <tr>
                        <td style="padding: 10px 20px; text-align: center;">
                            <p style="margin: 0; font-size: 24pt; font-weight: bold; color: #2b579a; white-space: normal; text-align: center;">${t('export_absences_title')}</p>
                        </td>
                    </tr>
                </table>
                <p style="margin: 10px 0 0 0; font-size: 12pt; text-align: center;"><span style="font-weight: bold;">${t('header_academic_year')}:</span> <span dir="${docDir}" style="unicode-bidi: embed;">${academicYear}</span></p>
            </div>
            
            <table style="width: 100%; margin-bottom: 20px; font-size: 12pt; border: none;" dir="${docDir}">
                <tr>
                    <td style="border: none; text-align: ${alignStart}; width: 33%; padding: 5px;"><b>${t('header_teacher')}:</b> ${info.name || '---'}</td>
                    <td style="border: none; text-align: center; width: 33%; padding: 5px;"><b>${t('header_school')}:</b> ${info.school || '---'}</td>
                    <td style="border: none; text-align: ${alignEnd}; width: 33%; padding: 5px;"><b>${t('header_group')}:</b> ${cls.name}</td>
                </tr>
                <tr>
                    <td style="border: none; text-align: ${alignStart}; padding: 5px;"><b>${t('header_subject')}:</b> ${getSubjectTranslation(cls.subject || info.subject)}</td>
                    <td style="border: none; text-align: center; padding: 5px;"><b>${t('header_term')}:</b> ${parseInt(currentTrimester)}</td>
                    <td style="border: none; text-align: ${alignEnd}; padding: 5px;"><b>${t('header_students_count')}:</b> ${students.length}</td>
                </tr>
            </table>
        `;

        const fullHtml = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>${t('export_absences_title')}</title>

                <style>
                    @page {
                        size: A4 portrait;
                        margin: 0.5in; 
                        mso-header-margin: 0.5in;
                        mso-footer-margin: 0.5in;
                        mso-paper-source: 0;
                    }
                    div.Section1 {
                        page: Section1;
                    }
                    body { 
                        font-family: 'Tajawal', 'Arial', sans-serif; 
                        direction: ${docDir}; 
                    }
                </style>
            </head>
            <body style="tab-interval:.5in">
                <div class="Section1">
                    ${headerHtml}
                    <table style="${tableStyle}" dir="${docDir}">
                        ${tableHeadersHtml}
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                    <br>
                    <div style="float: ${alignEnd}; text-align: ${alignEnd}; margin-top: 20px;">
                        <p style="font-size: 10pt; color: #666; margin: 0;">${t('msg_export_date')} ${getFormattedDate()}</p>
                        ${info.logo ? `<img src="${info.logo}" width="122" height="122" style="width: 3.24cm; height: 3.24cm; margin-top: 5px; mso-wrap-style: square; float: ${alignEnd};">` : ''}
                    </div>
                    <div style="clear: both;"></div>
                </div>
            </body>
            </html>
        `;

        const safeClassName = cls.name.replace(/[\\/:*?"<>|]/g, "_");
        const filename = `${t('export_absences_title')}_${safeClassName}_${t('header_term')}_${parseInt(currentTrimester)}.docx`;

        if (typeof showWordPreview === "function") {
            showWordPreview(fullHtml, filename, 'portrait');
        } else {
            alert("وظيفة تصدير الوورد غير متوفرة حالياً.");
        }

        feedback.remove();
    } catch (err) {
        if (feedback) feedback.remove();
        alert('حدث خطأ أثناء التصدير لـ Word: ' + err.message);
    }
};

// --- Language Change Multi-Component Sync ---
window.addEventListener('languageChanged', (e) => {
    // 1. Re-render Home configuration class inputs (Labels + Placeholders)
    if (typeof renderClassInputs === 'function' && appState.teacherInfo) {
        renderClassInputs(appState.teacherInfo.classesCount);
    }

    // 2. Re-render Header Information across sections
    if (typeof populateHeaderInfo === 'function') {
        populateHeaderInfo();
    }

    // 3. Re-render current active view if needed (tables, etc.)
    if (typeof renderCurrentView === 'function') {
        renderCurrentView();
    }

    // 4. Re-render Footer credits
    if (typeof updateDynamicCredit === 'function') {
        updateDynamicCredit();
    }

    // 5. Explicitly translate Creator Modal Close Button (Fixing unexpected DOM behavior)
    const creatorCloseBtn = document.querySelector('#creator-info-modal .btn-primary');
    if (creatorCloseBtn && typeof window.t === 'function') {
        creatorCloseBtn.innerHTML = window.t('btn_close_window_alt');
    }
});

// --- Update Check Logic ---
window.checkForUpdates = async function () {
    const btn = document.getElementById('btn-update-check');
    if (!btn) return;
    const originalContent = btn.innerHTML;
    
    try {
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>${window.t('update_checking')}</span>`;
        
        // Using GitHub API to get the latest release
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
        if (!response.ok) throw new Error('Failed to fetch from GitHub');
        
        const data = await response.json();
        latestReleaseData = data;
        
        // Clean version tag (e.g., "v1.2.0" -> "1.2.0")
        const latestVersion = data.tag_name.replace(/[^0-9.]/g, '');
        
        if (isNewerVersion(latestVersion, APP_VERSION)) {
            showUpdateModal(latestVersion, true);
        } else {
            showUpdateModal(latestVersion, false);
        }
    } catch (error) {
        console.error('Update check failed:', error);
        showUpdateError();
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalContent;
    }
};

function isNewerVersion(latest, current) {
    const l = latest.split('.').map(Number);
    const c = current.split('.').map(Number);
    for (let i = 0; i < Math.max(l.length, c.length); i++) {
        const lv = l[i] || 0;
        const cv = c[i] || 0;
        if (lv > cv) return true;
        if (lv < cv) return false;
    }
    return false;
}

function showUpdateModal(version, isAvailable) {
    const modal = document.getElementById('update-modal');
    const title = document.getElementById('update-modal-title');
    const message = document.getElementById('update-modal-message');
    const iconContainer = document.getElementById('update-icon-container');
    const actions = document.getElementById('update-actions');
    const closeAction = document.getElementById('update-close-action');
    
    if (!modal) return;

    if (isAvailable) {
        title.setAttribute('data-i18n', 'update_available_title');
        message.setAttribute('data-i18n', 'update_available_msg');
        message.innerHTML = window.t('update_available_msg').replace('{v}', version);
        iconContainer.innerHTML = '<i class="fas fa-rocket"></i>';
        iconContainer.style.color = 'var(--primary-color)';
        actions.style.display = 'flex';
        closeAction.style.display = 'none';
    } else {
        title.setAttribute('data-i18n', 'update_no_new_title');
        message.setAttribute('data-i18n', 'update_no_new_msg');
        message.innerHTML = window.t('update_no_new_msg');
        iconContainer.innerHTML = '<i class="fas fa-check-circle"></i>';
        iconContainer.style.color = '#10b981';
        actions.style.display = 'none';
        closeAction.style.display = 'flex';
    }
    
    // Refresh static translations for the modal
    title.innerHTML = window.t(title.getAttribute('data-i18n'));
    
    modal.classList.add('open');
}

function showUpdateError() {
    const modal = document.getElementById('update-modal');
    const title = document.getElementById('update-modal-title');
    const message = document.getElementById('update-modal-message');
    const iconContainer = document.getElementById('update-icon-container');
    const actions = document.getElementById('update-actions');
    const closeAction = document.getElementById('update-close-action');
    
    if (!modal) return;

    title.setAttribute('data-i18n', 'update_error_title');
    message.setAttribute('data-i18n', 'update_error_msg');
    title.innerHTML = window.t('update_error_title');
    message.innerHTML = window.t('update_error_msg');
    
    iconContainer.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
    iconContainer.style.color = '#ef4444';
    actions.style.display = 'none';
    closeAction.style.display = 'flex';
    
    modal.classList.add('open');
}

window.closeUpdateModal = function () {
    const modal = document.getElementById('update-modal');
    if (modal) modal.classList.remove('open');
};

window.downloadLatestUpdate = function () {
    if (latestReleaseData && latestReleaseData.html_url) {
        // Open the releases page or the direct download link
        // Usually, the html_url is the best place to send the user
        window.open(latestReleaseData.html_url, '_blank');
    }
    closeUpdateModal();
};


