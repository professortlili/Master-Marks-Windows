const translationDict = {
    // Splash screen
    "splash_title": {
        "ar": "دفتر التنقيط الالكتروني",
        "en": "Digital Score Book",
        "fr": "Carnet de Notes Numérique"
    },
    "splash_subtitle": {
        "ar": "تصميم و تطوير : الأستاذ تليلي محمد لمين",
        "en": "Design & Development: Prof. Tlili Mohamed Lamine",
        "fr": "Conception et développement: Prof. Tlili Mohamed Lamine"
    },
    "splash_loading": {
        "ar": "جاري التحميل...",
        "en": "Loading...",
        "fr": "Chargement..."
    },
    "splash_enter": {
        "ar": "دخول البرنامج",
        "en": "Enter Application",
        "fr": "Entrer dans l'application"
    },
    "splash_activate": {
        "ar": "تفعيل البرنامج",
        "en": "Activate Software",
        "fr": "Activer le logiciel"
    },

    // Sidebar
    "nav_activation": { "ar": "تفعيل البرنامج", "en": "Activate Software", "fr": "Activer le logiciel" },
    "nav_home": { "ar": "الرئيسية", "en": "Home", "fr": "Accueil" },
    "nav_lists": { "ar": "قوائم التلاميذ", "en": "Student Lists", "fr": "Listes des élèves" },
    "nav_absences": { "ar": "الغيابات", "en": "Absences", "fr": "Absences" },
    "nav_monitoring": { "ar": "مراقبة الأعمال", "en": "Work Monitoring", "fr": "Suivi des travaux" },
    "nav_continuous": { "ar": "التقويم المستمر", "en": "Continuous Assessment", "fr": "Évaluation continue" },
    "nav_grading": { "ar": "دفتر التنقيط", "en": "Score Book", "fr": "Carnet de notes" },
    "nav_digitization": { "ar": "بيانات الرقمنة", "en": "Digitization Data", "fr": "Données de numérisation" },
    "nav_backup": { "ar": "نقل البيانات", "en": "Backup & Transfer", "fr": "Sauvegarde & Transfert" },
    "submenu_group": { "ar": "الفوج التربوي:", "en": "Educ. Group:", "fr": "Groupe éduc.:" },
    "submenu_term": { "ar": "الفصل:", "en": "Term:", "fr": "Trimestre:" },

    // Activation Section
    "activation_title": { "ar": "تفعيل نسخة البرنامج", "en": "Software Activation", "fr": "Activation du Logiciel" },
    "activation_hwid_label": { "ar": "معرف الجهاز الخاص بك (HWID):", "en": "Your Device Identifier (HWID):", "fr": "Identifiant de votre appareil (HWID):" },
    "activation_hwid_hint": { "ar": "قم بنسخ هذا المعرف وإرساله للمطور للحصول على كود التفعيل.", "en": "Copy this ID and send it to the developer to get the activation code.", "fr": "Copiez cet identifiant et envoyez-le au développeur pour obtenir le code d'activation." },
    "activation_enter_code": { "ar": "إدخل كود التفعيل", "en": "Enter Activation Code", "fr": "Entrez le code d'activation" },

    // Home / Config Section
    "home_title": { "ar": "دفتر التنقيط الالكتروني", "en": "Digital Score Book", "fr": "Carnet de Notes Numérique" },
    "home_desc": { "ar": "قم بإدخال معلوماتك ومعلومات الأفواج التربوية هنا. هذه المعلومات ستظهر في جميع الأقسام.", "en": "Enter your info and the educational groups here. This info will appear in all sections.", "fr": "Saisissez vos informations et les groupes éducatifs ici. Ces infos apparaîtront partout." },
    "home_teacher_info_title": { "ar": "معلومات الأستاذ", "en": "Teacher Information", "fr": "Informations de l'enseignant" },
    "home_teacher_logo": { "ar": "شعار الأستاذ", "en": "Teacher Logo", "fr": "Logo de l'enseignant" },
    "home_teacher_logo_desc": { "ar": "اضغط على المربع المخصص لرفع صورة (PNG, JPG).<br>سيظهر هذا الشعار بشكل أنيق في أعلى التقارير والواجهة الرئيسية.", "en": "Click on the designated box to upload an image (PNG, JPG).<br>This logo will elegantly appear at the top of reports and the main interface.", "fr": "Cliquez sur la case pour télécharger une image (PNG, JPG).<br>Ce logo apparaîtra élégamment en haut des rapports." },
    "home_choose_logo": { "ar": "اختر شعار", "en": "Choose Logo", "fr": "Choisir un logo" },
    "home_delete_logo": { "ar": "حذف الشعار", "en": "Delete Logo", "fr": "Supprimer le logo" },
    "home_teacher_name_label": { "ar": "الأستاذ (الاسم و اللقب):", "en": "Teacher (Full Name):", "fr": "Enseignant (Nom complet):" },
    "home_teacher_name_ph": { "ar": "الاسم و اللقب", "en": "Full Name", "fr": "Nom complet" },
    "home_school_name_label": { "ar": "المؤسسة (المتوسطة):", "en": "School (Middle School):", "fr": "Établissement (Collège):" },
    "home_school_name_ph": { "ar": "اسم المتوسطة", "en": "School Name", "fr": "Nom de l'établissement" },
    "home_subject_label": { "ar": "المادة:", "en": "Subject:", "fr": "Matière:" },
    "home_subject_choose": { "ar": "اختر المادة...", "en": "Choose Subject...", "fr": "Choisir la matière..." },
    "home_year_label": { "ar": "السنة الدراسية:", "en": "Academic Year:", "fr": "Année scolaire:" },
    "home_classes_count_label": { "ar": "عدد الأفواج التربوية:", "en": "Number of Groups:", "fr": "Nombre de groupes:" },
    "home_classes_settings_title": { "ar": "إعدادات الأفواج والمعاملات", "en": "Groups and Coefficients Settings", "fr": "Paramètres des groupes et coefficients" },
    "home_classes_settings_hint": { "ar": "أدخل أسماء الأفواج (مثال: 1م1، 4م2). المعامل سيتم حسابه تلقائياً.", "en": "Enter group names (e.g. 1M1, 4M2). Coefficient is calculated automatically.", "fr": "Entrez les noms des groupes (ex: 1M1, 4M2). Le coefficient est calculé automatiquement." },
    "home_save_btn": { "ar": "حفظ الإعدادات", "en": "Save Settings", "fr": "Enregistrer les paramètres" },
    "home_class_title_1": { "ar": "الفوج التربوي رقم ", "en": "Educational Group No. ", "fr": "Groupe éducatif N° " },
    "home_class_title_2": { "ar": " & المادة & المعامل:", "en": " & Subject & Coeff:", "fr": " & Matière & Coeff:" },

    // Calendar & Months
    "day_sun": { "ar": "الأحد", "en": "Sun", "fr": "Dim" },
    "day_mon": { "ar": "الأثنين", "en": "Mon", "fr": "Lun" },
    "day_tue": { "ar": "الثلاثاء", "en": "Tue", "fr": "Mar" },
    "day_wed": { "ar": "الأربعاء", "en": "Wed", "fr": "Mer" },
    "day_thu": { "ar": "الخميس", "en": "Thu", "fr": "Jeu" },
    "day_fri": { "ar": "الجمعة", "en": "Fri", "fr": "Ven" },
    "day_sat": { "ar": "السبت", "en": "Sat", "fr": "Sam" },
    "month_01": { "ar": "جانفي", "en": "January", "fr": "Janvier" },
    "month_02": { "ar": "فيفري", "en": "February", "fr": "Février" },
    "month_03": { "ar": "مارس", "en": "March", "fr": "Mars" },
    "month_04": { "ar": "أفريل", "en": "April", "fr": "Avril" },
    "month_05": { "ar": "ماي", "en": "May", "fr": "Mai" },
    "month_06": { "ar": "جوان", "en": "June", "fr": "Juin" },
    "month_07": { "ar": "جويلية", "en": "July", "fr": "Juillet" },
    "month_08": { "ar": "أوت", "en": "August", "fr": "Août" },
    "month_09": { "ar": "سبتمبر", "en": "September", "fr": "Septembre" },
    "month_10": { "ar": "أكتوبر", "en": "October", "fr": "Octobre" },
    "month_11": { "ar": "نوفمبر", "en": "November", "fr": "Novembre" },
    "month_12": { "ar": "ديسمبر", "en": "December", "fr": "Décembre" },

    "header_teacher": { "ar": "الأستاذ", "en": "Teacher", "fr": "Enseignant" },
    "header_school": { "ar": "المؤسسة", "en": "School", "fr": "Établissement" },
    "header_subject": { "ar": "المادة", "en": "Subject", "fr": "Matière" },
    "header_coefficient": { "ar": "المعامل", "en": "Coefficient", "fr": "Coefficient" },
    "header_group": { "ar": "الفوج التربوي", "en": "Educational Group", "fr": "Groupe Éducatif" },
    "header_students_count": { "ar": "عدد التلاميذ", "en": "Number of Students", "fr": "Nombre d'Élèves" },
    "header_term": { "ar": "الفصل", "en": "Term", "fr": "Trimestre" },
    "header_academic_year": { "ar": "السنة الدراسية", "en": "Academic Year", "fr": "Année Scolaire" },

    "msg_year_deleted": { "ar": "تم حذف السنة الدراسية بنجاح", "en": "Academic year deleted successfully", "fr": "Année scolaire supprimée avec succès" },
    "msg_year_added": { "ar": "تم إضافة السنة الدراسية بنجاح", "en": "Academic year added successfully", "fr": "Année scolaire ajoutée avec succès" },
    "error_last_year": { "ar": "لا يمكن حذف السنة الدراسية الوحيدة المتبقية", "en": "Cannot delete the last remaining academic year", "fr": "Impossible de supprimer la seule année académique restante" },
    // Student Lists Section
    "lists_title": { "ar": "قوائم التلاميذ", "en": "Student Lists", "fr": "Listes des élèves" },
    "lists_add_student": { "ar": "إضافة تلميذ", "en": "Add Student", "fr": "Ajouter un élève" },
    "lists_export_word": { "ar": "تصدير Word", "en": "Export Word", "fr": "Exporter Word" },
    "list_col_num": { "ar": "الرقم", "en": "No.", "fr": "N°" },
    "list_col_surname": { "ar": "اللقب", "en": "Surname", "fr": "Nom" },
    "list_col_name": { "ar": "الاسم", "en": "Name", "fr": "Prénom" },
    "list_col_dob": { "ar": "تاريخ الميلاد", "en": "Date of Birth", "fr": "Date de naissance" },
    "list_col_visibility": { "ar": "الظهور", "en": "Visibility", "fr": "Visibilité" },
    "list_col_delete": { "ar": "حذف", "en": "Delete", "fr": "Supprimer" },
    "list_dob_placeholder": { "ar": "YYYY-MM-DD", "en": "DD-MM-YYYY", "fr": "DD-MM-YYYY" },
    "export_title_students": { "ar": "قوائم التلاميذ", "en": "Student List", "fr": "Liste des élèves" },
    "word_preview_title": { "ar": "معاينة ملف Word", "en": "Word Document Preview", "fr": "Aperçu du document Word" },
    "word_notif_preparing": { "ar": "جاري تجهيز ملف Word للتحميل... يرجى الانتظار", "en": "Preparing Word document... please wait", "fr": "Préparation du document Word... veuillez patienter" },
    "btn_close": { "ar": "إغلاق", "en": "Close", "fr": "Fermer" },
    "btn_download": { "ar": "تنزيل الملف", "en": "Download File", "fr": "Télécharger le fichier" },
    "export_title_grading": { "ar": "العلامات الفصلية", "en": "Term Grades", "fr": "Notes Trimestrielles" },
    "export_title_monitoring": { "ar": "جدول مراقبة الأعمال", "en": "Work Monitoring", "fr": "Suivi des Travaux" },
    "export_title_continuous": { "ar": "كشف التقويم المستمر", "en": "Continuous Assessment Report", "fr": "Bulletin d'Évaluation Continue" },
    "export_title_stats": { "ar": "إحصائيات النتائج", "en": "Results Statistics", "fr": "Statistiques des Résultats" },
    "export_title_absences": { "ar": "غيابات التلاميذ", "en": "Student Absences", "fr": "Absences des Élèves" },


    // Absences Section
    "absences_title": { "ar": "إحصاء الغيابات", "en": "Absences Tracking", "fr": "Suivi des Absences" },
    "absences_stats_btn": { "ar": "إحصائيات الفصل", "en": "Term Statistics", "fr": "Statistiques du trimestre" },
    "absences_list_modal_title": { "ar": "قائمة التلاميذ: ", "en": "Students List: ", "fr": "Liste des élèves: " },
    "absences_col_status": { "ar": "الحالة", "en": "Status", "fr": "Statut" },
    "absences_list_save": { "ar": "حفظ و إغلاق", "en": "Save & Close", "fr": "Enregistrer et fermer" },
    "absences_stats_modal_title": { "ar": "إحصائيات الغيابات للفصل ", "en": "Absences Statistics for Term ", "fr": "Statistiques des absences pour le trimestre " },
    "absences_stats_analyze": { "ar": "تحليل النتائج", "en": "Analyze Results", "fr": "Analyser les résultats" },
    "absences_stats_close_analysis": { "ar": "إغلاق التحليل", "en": "Close Analysis", "fr": "Fermer l'analyse" },
    "absences_chart_title": { "ar": "توزيع غيابات التلاميذ حسب الشهور", "en": "Student Absences Distribution by Month", "fr": "Répartition des absences des élèves par mois" },
    "absences_col_count": { "ar": "عدد مرات الغياب", "en": "Absence Count", "fr": "Nombre d'absences" },
    "absences_col_dates": { "ar": "تواريخ الغياب", "en": "Absence Dates", "fr": "Dates d'absence" },

    // Grading Section
    "grading_title": { "ar": "دفتر التنقيط", "en": "Score Book", "fr": "Carnet de Notes" },
    "grading_col_continuous": { "ar": "التقويم المستمر", "en": "Continuous Assess.", "fr": "Éval. continue" },
    "grading_col_quiz": { "ar": "الفرض", "en": "Quiz", "fr": "Devoir" },
    "grading_col_monitoring": { "ar": "المراقبة المستمرة", "en": "Continuous Monitor.", "fr": "Contrôle continu" },
    "grading_col_exam": { "ar": "الإختبار", "en": "Exam", "fr": "Examen" },
    "grading_col_avg": { "ar": "المعدل الفصلي", "en": "Term Average", "fr": "Moyenne du trimestre" },
    "grading_col_product": { "ar": "الحاصل", "en": "Product", "fr": "Produit" },
    "grading_col_appreciation": { "ar": "التقديرات", "en": "Appreciations", "fr": "Appréciations" },
    "grading_col_rank": { "ar": "الرتبة", "en": "Rank", "fr": "Classement" },
    "grading_error_marks": { "ar": "هناك خطأ في ادخال العلامات", "en": "There is an error in marks entry", "fr": "Il y a une erreur dans la saisie des notes" },
    "grading_edit_reminder": { "ar": "يرجى تفعيل زر التعديل لتخصيص التقديرات", "en": "Please enable edit mode to customize appreciations", "fr": "Veuillez activer le mode édition pour personnaliser les appréciations" },

    // Continuous Section
    "continuous_title": { "ar": "التقويم المستمر", "en": "Continuous Assessment", "fr": "Évaluation Continue" },
    "continuous_col_discipline": { "ar": "الانضباط و المواظبة", "en": "Discipline & Attendance", "fr": "Discipline & Assiduité" },
    "continuous_col_inclass": { "ar": "أنشطة التعلم داخل القسم", "en": "In-Class Activities", "fr": "Activités en classe" },
    "continuous_col_outclass": { "ar": "أنشطة التعلم خارج القسم", "en": "Out-of-Class Activities", "fr": "Activités hors classe" },
    "continuous_col_total": { "ar": "المجموع", "en": "Total", "fr": "Total" },
    "continuous_header_behavior": { "ar": "السلوك", "en": "Behavior", "fr": "Comportement" },
    "continuous_header_abs": { "ar": "الغياب و التأخر", "en": "Absence/Late", "fr": "Absence/Retard" },
    "continuous_header_tools": { "ar": "إحضار الأدوات", "en": "Bringing Tools", "fr": "Matériel" },
    "continuous_header_org": { "ar": "تنظيم الكراس", "en": "Notebook Org.", "fr": "Org. cahier" },
    "continuous_header_part": { "ar": "المشاركة", "en": "Participation", "fr": "Participation" },
    "continuous_header_quiz": { "ar": "الاستجوابات", "en": "Quizzes", "fr": "Interrogations" },
    "continuous_header_board": { "ar": "الكتابة على السبورة", "en": "Board Work", "fr": "Travail au tableau" },
    "continuous_header_hw": { "ar": "الواجبات المنزلية", "en": "Homework", "fr": "Devoirs" },
    "continuous_header_monthly": { "ar": "الالواجبات الشهرية", "en": "Monthly Homework", "fr": "Devoirs mensuels" },
    "continuous_header_init": { "ar": "المبادرة", "en": "Initiative", "fr": "Initiative" },
    "continuous_edit_reminder": { "ar": "يرجى تفعيل زر التعديل لتغيير عنوان العمود", "en": "Please enable edit mode to change column title", "fr": "Veuillez activer le mode édition pour changer le titre" },

    // Monitoring Section
    "monitoring_title": { "ar": "مراقبة الأعمال", "en": "Work Monitoring", "fr": "Suivi des Travaux" },
    "monitoring_col_disc": { "ar": "الإنضباط", "en": "Discipline", "fr": "Discipline" },
    "monitoring_col_hw": { "ar": "الواجبات المنزلية", "en": "Homework", "fr": "Devoirs" },
    "monitoring_col_mhw": { "ar": "الواجبات الشهرية", "en": "Monthly Homework", "fr": "Devoirs Mensuels" },
    "monitoring_sub_total": { "ar": "إجمالي", "en": "Total", "fr": "Total" },
    "monitoring_sub_done": { "ar": "أنجزت", "en": "Done", "fr": "Fait" },
    "monitoring_sub_miss": { "ar": "لم تنجز", "en": "Missed", "fr": "Manqué" },
    "monitoring_sub_mark": { "ar": "العلامة", "en": "Mark", "fr": "Note" },
    "monitoring_sub_hw1": { "ar": "الواجب 01", "en": "HW 01", "fr": "Devoir 01" },
    "monitoring_sub_hw2": { "ar": "الواجب 02", "en": "HW 02", "fr": "Devoir 02" },

    // Digitization Section
    "digitization_title": { "ar": "بيانات الرقمنة", "en": "Digitization Data", "fr": "Données de numérisation" },
    "digitization_proc_label": { "ar": "معالجة البيانات", "en": "Data Processing", "fr": "Traitement des données" },
    "digitization_proc_val": { "ar": "تلقائية وذكية", "en": "Automatic & Smart", "fr": "Automatique et intelligent" },
    "digitization_format_label": { "ar": "التنسيق", "en": "Format", "fr": "Format" },
    "digitization_sync_label": { "ar": "المزامنة", "en": "Synchronization", "fr": "Synchronisation" },
    "digitization_sync_val": { "ar": "آمنة بنسبة 100%", "en": "100% Secure", "fr": "100% Sécurisé" },
    "digitization_upload_title": { "ar": "ارفع ملف Excel للرقمنة", "en": "Upload Excel Digitization File", "fr": "Télécharger le fichier Excel de numérisation" },
    "digitization_upload_desc": { "ar": "قم باختيار ملف الرقمنة (Excel) المستخرج من موقع الرقمنة. سيقوم التطبيق تلقائياً بالتعرف على الأفواج والطلبة.", "en": "Choose the digitization file (Excel) exported from the digitization site. The app will automatically recognize groups and students.", "fr": "Choisissez le fichier de numérisation (Excel) exporté du site. L'application reconnaîtra automatiquement les groupes et les étudiants." },
    "digitization_specs_title": { "ar": "المواصفات التقنية:", "en": "Technical Specifications:", "fr": "Spécifications techniques:" },
    "digitization_spec_1": { "ar": "دعم ملفات .xlsx و .xls", "en": "Support for .xlsx and .xls files", "fr": "Prise en charge des fichiers .xlsx et .xls" },
    "digitization_spec_2": { "ar": "استخراج تلقائي للأفواج", "en": "Automatic group extraction", "fr": "Extraction automatique des groupes" },
    "digitization_spec_3": { "ar": "معالجة سريعة وآمنة", "en": "Fast and secure processing", "fr": "Traitement rapide et sécurisé" },
    "digitization_steps_title": { "ar": "خطوات المزامنة:", "en": "Synchronization Steps:", "fr": "Étapes de synchronisation:" },
    "digitization_step_1": { "ar": "اختر فوج الرقمنة ثم الفوج المقابل", "en": "Choose the digitization group then the corresponding group", "fr": "Choisissez le groupe de numérisation puis le groupe correspondant" },
    "digitization_step_2": { "ar": "تأكد من اختيار الفصل الدراسي", "en": "Make sure to select the term", "fr": "Assurez-vous de sélectionner le trimestre" },
    "digitization_step_3": { "ar": "راجع البيانات قبل التصدير", "en": "Review data before exporting", "fr": "Examinez les données avant d'exporter" },
    "digitization_upload_btn": { "ar": "اختيار ملف Excel و بدء المعالجة", "en": "Choose Excel file and start processing", "fr": "Choisir le fichier Excel et démarrer le traitement" },
    "digitization_step_sheet": { "ar": "اختر الصفحة (كود الفوج):", "en": "Choose Sheet (Group Code):", "fr": "Choisir la feuille (Code du groupe):" },
    "digitization_step_app_class": { "ar": "اختر الفوج المقابل:", "en": "Choose Corresponding Group:", "fr": "Choisir le groupe correspondant:" },
    "digitization_step_term": { "ar": "اختر الفصل الدراسي:", "en": "Choose Term:", "fr": "Choisir le trimestre:" },
    "digitization_term_1": { "ar": "الفصل الأول", "en": "First Term", "fr": "Premier trimestre" },
    "digitization_term_2": { "ar": "الفصل الثاني", "en": "Second Term", "fr": "Deuxième trimestre" },
    "digitization_term_3": { "ar": "الفصل الثالث", "en": "Third Term", "fr": "Troisième trimestre" },
    "digitization_sync_btn": { "ar": "مزامنة النقاط من البرنامج", "en": "Sync Marks from App", "fr": "Synchroniser les notes depuis l'application" },
    "digitization_export_btn": { "ar": "تصدير ملف Excel المحدّث", "en": "Export Updated Excel", "fr": "Exporter le fichier Excel mis à jour" },
    "digitization_close_btn": { "ar": "إغلاق الملف", "en": "Close File", "fr": "Fermer le fichier" },
    "digitization_preview_title": { "ar": "معاينة بيانات الصفحة", "en": "Sheet Data Preview", "fr": "Aperçu des données de la feuille" },

    // Backup Section
    "backup_title": { "ar": "نقل البيانات واسترجاعها", "en": "Backup and Restore", "fr": "Sauvegarde et Restauration" },
    "backup_backup_label": { "ar": "النسخ الاحتياطي", "en": "Backup", "fr": "Sauvegarde" },
    "backup_backup_val": { "ar": "آمن ومحمي", "en": "Safe and Protected", "fr": "Sûr et protégé" },
    "backup_data_label": { "ar": "البيانات", "en": "Data", "fr": "Données" },
    "backup_data_val": { "ar": "جميع السنوات الدراسية", "en": "All Academic Years", "fr": "Toutes les années scolaires" },
    "backup_export_title": { "ar": "تصدير النسخة الاحتياطية", "en": "Export Backup", "fr": "Exporter la sauvegarde" },
    "backup_export_desc": { "ar": "قم بتنزيل نسخة احتياطية كاملة من جميع بياناتك في ملف واحد محمي.", "en": "Download a full backup of all your data in one protected file.", "fr": "Téléchargez une sauvegarde complète de toutes vos données dans un seul fichier protégé." },
    "backup_export_feat_1": { "ar": "جميع السنوات الدراسية", "en": "All Academic Years", "fr": "Toutes les années scolaires" },
    "backup_export_feat_2": { "ar": "بيانات التلاميذ والنقاط", "en": "Student Data & Marks", "fr": "Données des étudiants et notes" },
    "backup_export_feat_3": { "ar": "الإعدادات المخصصة", "en": "Custom Settings", "fr": "Paramètres personnalisés" },
    "backup_export_btn": { "ar": "تصدير النسخة الاحتياطية", "en": "Export Backup", "fr": "Exporter la sauvegarde" },
    "backup_import_title": { "ar": "استيراد نسخة احتياطية", "en": "Import Backup", "fr": "Importer une sauvegarde" },
    "backup_import_desc": { "ar": "قم باستعادة بياناتك من ملف نسخة احتياطية سابق.", "en": "Restore your data from a previous backup file.", "fr": "Restaurez vos données à partir d'un fichier de sauvegarde précédent." },
    "backup_import_warn_1": { "ar": "سيتم استبدال البيانات الحالية", "en": "Current data will be replaced", "fr": "Les données actuelles seront remplacées" },
    "backup_import_warn_2": { "ar": "التراخيص والإعدادات تبقى كما هي", "en": "Licenses & settings remain unchanged", "fr": "Les licences et paramètres restent inchangés" },
    "backup_import_warn_3": { "ar": "سيتم إعادة تحميل البرنامج", "en": "App will be reloaded", "fr": "L'application sera rechargée" },
    "backup_import_btn": { "ar": "اختيار ملف الاستيراد", "en": "Choose Import File", "fr": "Choisir le fichier d'importation" },
    "import_confirm_title": { "ar": "تأكيد استيراد البيانات", "en": "Confirm Data Import", "fr": "Confirmer l'importation" },
    "import_confirm_desc": { "ar": "تنبيه: سيتم <strong>حذف واستبدال</strong> كافة البيانات والسنوات الدراسية الحالية في هذا الجهاز بالبيانات الموجودة في الملف المختارة. <br><br>هل أنت متأكد من رغبتك في المتابعة؟", "en": "Warning: All current data and academic years on this device will be <strong>deleted and replaced</strong> with data from the selected file. <br><br>Are you sure you want to proceed?", "fr": "Attention : Toutes les données actuelles sur cet appareil seront <strong>supprimées et remplacées</strong> par celles du fichier. <br><br>Voulez-vous vraiment continuer ?" },
    "btn_import_yes": { "ar": "نعم، استبدال واستيراد", "en": "Yes, Replace and Import", "fr": "Oui, remplacer et importer" },
    "btn_cancel_backup": { "ar": "إلغاء", "en": "Cancel", "fr": "Annuler" },
    "word_notif_preparing": { "ar": "جاري تجهيز ملف Word للتحميل... يرجى الانتظار", "en": "Preparing Word file for download... Please wait", "fr": "Préparation du fichier Word pour le téléchargement... Veuillez patienter" },
    "backup_security_tip": { "ar": "نصيحة أمنية:", "en": "Security Tip:", "fr": "Conseil de sécurité:" },
    "backup_security_desc": { "ar": "احرص على أخذ نسخة احتياطية بانتظام وحفظها في مكان آمن.", "en": "Make sure to backup regularly and keep it safe.", "fr": "Assurez-vous de faire des sauvegardes régulières et de les garder en sécurité." },

    // App Dynamic Buttons
    "btn_save_data": { "ar": "حفظ البيانات", "en": "Save Data", "fr": "Sauvegarder les données" },
    "btn_edit_list": { "ar": "تعديل القائمة", "en": "Edit List", "fr": "Modifier la liste" },
    "btn_edit_data": { "ar": "تعديل البيانات", "en": "Edit Data", "fr": "Modifier les données" },
    "btn_add_student": { "ar": "إضافة تلميذ", "en": "Add Student", "fr": "Ajouter un élève" },
    "btn_delete_all": { "ar": "حذف جميع البيانات", "en": "Delete All Data", "fr": "Tout supprimer" },
    "btn_import_excel": { "ar": "استيراد Excel", "en": "Import Excel", "fr": "Importer Excel" },
    "btn_export_word": { "ar": "تصدير Word", "en": "Export Word", "fr": "Exporter Word" },
    "btn_detailed_stats": { "ar": "إحصائيات مفصلة", "en": "Detailed Statistics", "fr": "Statistiques détaillées" },
    "msg_export_success": { "ar": "تم تصدير ملف البيانات بنجاح", "en": "Data file exported successfully", "fr": "Fichier de données exporté avec succès" },
    "msg_export_error": { "ar": "حدث خطأ أثناء تصدير البيانات", "en": "Error during data export", "fr": "Erreur lors de l'exportation des données" },
    "msg_import_invalid_file": { "ar": "فشل قراءة الملف. يرجى التأكد من اختيار ملف بيانات ScoreBook صحيح (.json).", "en": "Failed to read file. Please select a valid ScoreBook JSON file.", "fr": "Échec de la lecture du fichier. Veuillez sélectionner un fichier JSON valide." },
    "msg_import_success_reload": { "ar": "تم استيراد البيانات بنجاح، جاري إعادة التحميل...", "en": "Data imported successfully, reloading...", "fr": "Données importées avec succès, rechargement en cours..." },
    "msg_import_apply_error": { "ar": "حدث خطأ أثناء تطبيق البيانات الجديدة.", "en": "Error applying new data.", "fr": "Erreur lors de l'application des nouvelles données." },
    "import_no_data": { "ar": "لم يتم العثور على بيانات.", "en": "No data found.", "fr": "Aucune donnée trouvée." },
    "import_success_title": { "ar": "تم استيراد قائمة التلاميذ بنجاح!", "en": "Student list imported successfully!", "fr": "La liste des étudiants a été importée avec succès!" },
    "import_success_class": { "ar": "تم استيراد البيانات للفوج التربوي: ", "en": "Data imported for group: ", "fr": "Données importées pour le groupe: " },
    "unit_points": { "ar": "ن", "en": "pts", "fr": "pts" },
    "msg_select_class": { "ar": "يرجى اختيار قسم أولاً", "en": "Please select a group first", "fr": "Veuillez d'abord sélectionner un groupe" },
    "import_success_count": { "ar": "عدد التلاميذ في القائمة: ", "en": "Number of students in list: ", "fr": "Nombre d'étudiants dans la liste: " },
    "btn_understood": { "ar": "حسناً، فهمت", "en": "Okay, Understood", "fr": "D'accord, compris" },
    "btn_present": { "ar": "حاضر", "en": "Present", "fr": "Présent" },
    "btn_absent": { "ar": "غائب", "en": "Absent", "fr": "Absent" },
    "monitoring_error_msg": { "ar": "تنبيه: يوجد خلل في البيانات (عدد الأعمال المنجزة أكبر من الإجمالي)", "en": "Alert: Data error (completed tasks > total)", "fr": "Alerte: Erreur de données (tâches terminées > total)" },

    // Modals
    "stats_title": { "ar": "إحصائيات الفصل", "en": "Term Statistics", "fr": "Statistiques du trimestre" },
    "stats_close_btn": { "ar": "إغلاق", "en": "Close", "fr": "Fermer" },
    "activation_modal_title": { "ar": "تفعيل البرنامج", "en": "App Activation", "fr": "Activation de l'application" },
    "activation_modal_desc": { "ar": "يرجى إدخال كود التفعيل الذي حصلت عليه من المطور:", "en": "Please enter the activation code obtained from the developer:", "fr": "Veuillez saisir le code d'activation obtenu du développeur:" },
    "activation_modal_hint": { "ar": "تأكد من كتابة الكود بشكل صحيح كما وصلك.", "en": "Make sure to write the code exactly as received.", "fr": "Assurez-vous de saisir le code exactement tel qu'il a été reçu." },
    "btn_cancel": { "ar": "إلغاء", "en": "Cancel", "fr": "Annuler" },
    "btn_activate": { "ar": "تفعيل الآن", "en": "Activate Now", "fr": "Activer maintenant" },
    "license_title": { "ar": "معلومات الترخيص", "en": "License Information", "fr": "Informations de licence" },
    "license_desc": { "ar": "تفاصيل اشتراكك في البرنامج", "en": "Details of your app subscription", "fr": "Détails de votre abonnement" },
    "license_status_label": { "ar": "الحالة الحالية:", "en": "Current Status:", "fr": "Statut actuel:" },
    "license_expiry_date_label": { "ar": "تاريخ الانتهاء", "en": "Expiry Date", "fr": "Date d'expiration" },
    "license_expiry_time_label": { "ar": "وقت الانتهاء", "en": "Expiry Time", "fr": "Heure d'expiration" },
    "license_hwid_label": { "ar": "معرف الجهاز (HWID)", "en": "Device HWID", "fr": "Identifiant de l'appareil" },
    "license_countdown_title": { "ar": "الوقت المتبقي لانتهاء الصلاحية", "en": "Time remaining until expiration", "fr": "Temps restant avant l'expiration" },
    "cd_month": { "ar": "شهر", "en": "Month", "fr": "Mois" },
    "cd_day": { "ar": "يوم", "en": "Day", "fr": "Jour" },
    "cd_hour": { "ar": "ساعة", "en": "Hour", "fr": "Heure" },
    "cd_min": { "ar": "دقيقة", "en": "Minute", "fr": "Minute" },
    "license_close_btn": { "ar": "إغلاق النافذة", "en": "Close Window", "fr": "Fermer la fenêtre" },
    "license_cancel_btn": { "ar": "إلغاء الترخيص", "en": "Cancel License", "fr": "Annuler la licence" },
    "thank_you_title": { "ar": "تم التفعيل بنجاح!", "en": "Activated Successfully!", "fr": "Activé avec succès!" },
    "thank_you_desc": { "ar": "شكراً لك على اشتراكك في برنامج دفتر الأستاذ.", "en": "Thank you for subscribing to the Score Book app.", "fr": "Merci de vous être abonné à l'application Score Book." },
    "ty_license_type": { "ar": "نوع الترخيص:", "en": "License Type:", "fr": "Type de licence:" },
    "ty_license_expiry": { "ar": "تاريخ الانتهاء:", "en": "Expiry Date:", "fr": "Date d'expiration:" },
    "ty_enjoy": { "ar": "نتمنى لك تجربة ممتعة وموفقة.", "en": "We wish you an enjoyable and successful experience.", "fr": "Nous vous souhaitons une expérience agréable et réussie." },
    "ty_start_btn": { "ar": "ابدأ استخدام البرنامج", "en": "Start using the app", "fr": "Commencer à utiliser l'application" },
    "error_modal_title": { "ar": "عذراً!", "en": "Sorry!", "fr": "Désolé!" },
    "error_modal_desc": { "ar": "رسالة الخطأ تظهر هنا.", "en": "Error message appears here.", "fr": "Le message d'erreur apparaît ici." },
    "error_close_btn": { "ar": "إغلاق والمحاولة مرة أخرى", "en": "Close and try again", "fr": "Fermer et réessayer" },
    "exp_title": { "ar": "انتهت مدة الترخيص", "en": "License Expired", "fr": "Licence expirée" },
    "exp_desc": { "ar": "نشكرك جزيل الشكر على ثقتك واشتراكك في برنامج دفتر التنقيط الالكتروني.", "en": "Thank you for your trust and subscription.", "fr": "Merci pour votre confiance et votre abonnement." },
    "exp_last_plan": { "ar": "آخر باقة مسجلة:", "en": "Last registered plan:", "fr": "Dernier forfait enregistré:" },
    "exp_duration": { "ar": "المدة الإجمالية للاشتراك:", "en": "Total subscription duration:", "fr": "Durée totale de l'abonnement:" },
    "exp_msg": { "ar": "سنكون سعداء جداً بانضمامك إلينا مرة أخرى وتجديد اشتراكك السنوي لمواصلة الرحلة معاً.", "en": "We'd be glad to have you back to renew your annual subscription.", "fr": "Nous serions ravis de vous revoir pour renouveler votre abonnement." },
    "exp_renew_btn": { "ar": "تجديد الاشتراك الآن", "en": "Renew Subscription Now", "fr": "Renouveler l'abonnement maintenant" },
    "confirm_cancel_lic_title": { "ar": "هل أنت متأكد؟", "en": "Are you sure?", "fr": "Êtes-vous sûr?" },
    "confirm_cancel_lic_desc": { "ar": "هل أنت متأكد من رغبتك في إلغاء الترخيص الحالي؟ سيتم قفل البرنامج فوراً وستحتاج إلى مفتاح جديد للتفعيل.", "en": "Are you sure you want to cancel the license? The app will lock immediately.", "fr": "Êtes-vous sûr de vouloir annuler la licence? L'application sera verrouillée immédiatement." },
    "btn_back": { "ar": "تراجع", "en": "Go Back", "fr": "Retour" },
    "btn_yes_cancel": { "ar": "نعم، إلغاء الترخيص", "en": "Yes, Cancel License", "fr": "Oui, annuler la licence" },
    "confirm_save_title": { "ar": "حفظ الإعدادات؟", "en": "Save Settings?", "fr": "Enregistrer les paramètres?" },
    "confirm_save_desc": { "ar": "هل أنت متأكد من رغبتك في حفظ الإعدادات والتغييرات الحالية؟", "en": "Are you sure you want to save current settings?", "fr": "Êtes-vous sûr de vouloir enregistrer?" },
    "btn_yes_save": { "ar": "نعم، حفظ", "en": "Yes, Save", "fr": "Oui, enregistrer" },
    "confirm_del_all_students_title": { "ar": "حذف جميع البيانات؟", "en": "Delete All Data?", "fr": "Supprimer toutes les données?" },
    "confirm_del_all_students_desc": { "ar": "هل أنت متأكد من حذف جميع بيانات تلاميذ هذا الفوج؟ سيتم مسح القائمة الحالية وإعادتها إلى وضعها الأصلي (35 سطراً فارغاً).", "en": "Are you sure you want to delete all students? The list will reset to 35 empty rows.", "fr": "Êtes-vous sûr de vouloir supprimer tous les étudiants? La liste sera réinitialisée." },
    "btn_yes_del_all": { "ar": "نعم، حذف الكل", "en": "Yes, Delete All", "fr": "Oui, tout supprimer" },
    "confirm_del_marks_title": { "ar": "حذف جميع العلامات؟", "en": "Delete All Marks?", "fr": "Supprimer toutes les notes?" },
    "confirm_del_marks_desc": { "ar": "هل أنت متأكد من حذف جميع العلامات في هذا القسم؟ لا يمكن التراجع عن هذه العملية.", "en": "Are you sure you want to delete all marks? This cannot be undone.", "fr": "Êtes-vous sûr de vouloir supprimer toutes les notes? Cette action est irréversible." },
    "add_year_title": { "ar": "إضافة سنة دراسية جديدة", "en": "Add New Academic Year", "fr": "Ajouter une nouvelle année" },
    "add_year_desc": { "ar": "أدخل اسم السنة الدراسية الجديدة (مثال: 2025 / 2026):", "en": "Enter the new academic year name:", "fr": "Saisir le nom de la nouvelle année:" },
    "btn_add": { "ar": "إضافة", "en": "Add", "fr": "Ajouter" },
    "del_year_title": { "ar": "حذف السنة الدراسية؟", "en": "Delete Academic Year?", "fr": "Supprimer l'année scolaire?" },
    "del_year_desc": { "ar": "هل أنت متأكد من حذف هذه السنة الدراسية؟ سيتم حذف جميع البيانات المتعلقة بها نهائياً.", "en": "Are you sure? All related data will be deleted.", "fr": "Êtes-vous sûr? Toutes les données liées seront supprimées." },
    "btn_yes_del_final": { "ar": "نعم، حذف النهائي", "en": "Yes, permanently delete", "fr": "Oui, supprimer définitivement" },
    "hwid_copied_title": { "ar": "تم نسخ المعرف بنجاح!", "en": "HWID Copied Successfully!", "fr": "Identifiant copié avec succès!" },
    "hwid_copied_desc": { "ar": "يرجى إرسال هذا المعرف إلى المطور عبر أحد الوسائل التالية للحصول على كود التفعيل:", "en": "Please send this HWID to the developer via the following platforms:", "fr": "Veuillez envoyer cet identifiant au développeur:" },
    "btn_ok": { "ar": "موافق", "en": "OK", "fr": "D'accord" },
    "creator_title": { "ar": "حول المطور", "en": "About the Developer", "fr": "À propos du développeur" },
    "creator_hint": { "ar": "انقر على الشعار", "en": "Click on the logo", "fr": "Cliquez sur le logo" },

    // Tooltips
    "title_show_sidebar": { "ar": "إظهار القائمة", "en": "Show Sidebar", "fr": "Afficher la barre latérale" },
    "title_hide_sidebar": { "ar": "إخفاء القائمة", "en": "Hide Sidebar", "fr": "Masquer la barre latérale" },
    "title_dark_mode": { "ar": "الوضع الليلي", "en": "Dark Mode", "fr": "Mode sombre" },
    "title_send_email": { "ar": "إرسال إيميل", "en": "Send Email", "fr": "Envoyer un e-mail" },
    "title_blog": { "ar": "موقع الأستاذ تليلي", "en": "Prof. Tlili's Website", "fr": "Site du Prof. Tlili" },
    "title_copy_hwid": { "ar": "نسخ المعرف", "en": "Copy Identifier", "fr": "Copier l'identifiant" },
    "title_theme_picker": { "ar": "تغيير ثيم الألوان", "en": "Change Color Theme", "fr": "Changer le thème de couleur" },
    "title_language_select": { "ar": "تغيير اللغة", "en": "Change Language", "fr": "Changer de langue" },
    "title_add_year": { "ar": "إضافة سنة دراسية جديدة", "en": "Add New Academic Year", "fr": "Ajouter une nouvelle année" },
    "title_del_year": { "ar": "حذف السنة الدراسية الحالية", "en": "Delete Current Year", "fr": "Supprimer l'année en cours" },
    "title_sort_surname": { "ar": "ترتيب التلاميذ حسب اللقب", "en": "Sort Students by Surname", "fr": "Trier les élèves par nom" },
    "title_edit_appreciations": { "ar": "تعديل التقديرات", "en": "Edit Appreciations", "fr": "Modifier les appréciations" },
    "title_sort_avg": { "ar": "ترتيب التلاميذ حسب المعدل", "en": "Sort Students by Average", "fr": "Trier les élèves par moyenne" },
    "title_sort_rank": { "ar": "ترتيب التلاميذ حسب الرتبة", "en": "Sort Students by Rank", "fr": "Trier les élèves par rang" },
    "title_set_mark": { "ar": "نقرة واحدة لتعيين العلامة", "en": "Click to set the mark", "fr": "Cliquez pour définir la note" },
    "title_edit_ca_header": { "ar": "اضغط لتعديل العنوان والنقاط", "en": "Click to edit title and points", "fr": "Cliquez pour modifier le titre et les points" },
    "title_class_name": { "ar": "اسم الفوج", "en": "Class Name", "fr": "Nom du groupe" },
    "title_coefficient": { "ar": "المعامل", "en": "Coefficient", "fr": "Coefficient" },
    "title_visibility": { "ar": "إظهار/إخفاء في هذا الفصل", "en": "Show/Hide in this term", "fr": "Afficher/Masquer dans ce trimestre" },
    "title_manual_override": { "ar": "علامة معدلة يدوياً - احذفها للعودة للحساب التلقائي", "en": "Manually overridden - delete to return to auto calculation", "fr": "Modifié manuellement - supprimer pour le calcul automatique" },
    "title_auto_calculated_abs": { "ar": "محسوبة تلقائياً ({n} غياب)", "en": "Automatically calculated ({n} absences)", "fr": "Calculé automatiquement ({n} absences)" },
    "toast_fullscreen_enter": { "ar": "تم تفعيل وضع ملئ الشاشة", "en": "Fullscreen mode enabled", "fr": "Mode plein écran activé" },
    "toast_fullscreen_exit": { "ar": "تم الخروج من وضع ملئ الشاشة", "en": "Fullscreen mode exited", "fr": "Mode plein écran quitté" },
    "btn_close_window_alt": { "ar": "إغلاق النافذة", "en": "Close Window", "fr": "Fermer la fenêtre" },
    "btn_appreciation_custom": { "ar": "تخصيص التقديرات", "en": "Customize Appreciations", "fr": "Personnaliser les appréciations" },
    "msg_sort_edit_reminder": { "ar": "يرجى تفعيل زر التعديل لإعادة الترتيب", "en": "Please enable edit mode to reorder", "fr": "Veuillez activer le mode édition pour réorganiser" },
    "msg_sort_surname": { "ar": "حسب اللقب", "en": "by surname", "fr": "par nom" },
    "msg_sort_name": { "ar": "حسب الاسم", "en": "by name", "fr": "par prénom" },
    "msg_sort_dob": { "ar": "حسب تاريخ الميلاد", "en": "by date of birth", "fr": "par date de naissance" },
    "swipe_label": { "ar": "اسحب", "en": "Swipe", "fr": "Balayer" },
    "day_mode": { "ar": "الوضع النهاري", "en": "Light Mode", "fr": "Mode clair" },
    "copyright_notice": { "ar": "جميع الحقوق محفوظة", "en": "All rights reserved", "fr": "Tous droits réservés" },
    "msg_export_loading": { "ar": "عذراً، وظيفة التصدير قيد التحميل. يرجى المحاولة بعد ثانية.", "en": "Sorry, export function is loading. Please try again in a second.", "fr": "Désolé, la fonction d'exportation est en cours de chargement. Veuillez réessayer dans une seconde." },
    "msg_syncing_data": {
        "ar": "تتم مزامنة بيانات {n} تلميذا للقسم {c} - {t}",
        "en": "Syncing data for {n} students in class {c} - {t}",
        "fr": "Synchronisation des données pour {n} élèves de la classe {c} - {t}"
    },
    "msg_sync_success": {
        "ar": "تمت مزامنة بيانات {n} تلميذ لـ {t} بنجاح.",
        "en": "Successfully synced data for {n} students for {t}.",
        "fr": "Données de {n} élèves synchronisées avec succès pour {t}."
    },
    "msg_excel_upload_reminder": {
        "ar": "يرجى رفع ملف Excel أولاً ثم اختيار الصفحة.",
        "en": "Please upload an Excel file first then choose the sheet.",
        "fr": "Veuillez d'abord télécharger un fichier Excel, puis choisir la feuille."
    },
    "filename_digitization_results": { "ar": "نتائج_الرقمنة", "en": "Digitization_Results", "fr": "Resultats_Numerisation" },
    "msg_excel_save_success": { "ar": "تم حفظ ملف Excel بنجاح ✓", "en": "Excel file saved successfully ✓", "fr": "Fichier Excel enregistré avec succès ✓" },
    "msg_excel_export_success": { "ar": "تم تصدير ملف Excel بنجاح ✓", "en": "Excel file exported successfully ✓", "fr": "Fichier Excel exporté avec succès ✓" },
    "msg_excel_export_error": { "ar": "حدث خطأ أثناء التصدير", "en": "Error during export", "fr": "Erreur lors de l'exportation" },
    "msg_word_save_success": { "ar": "تم حفظ ملف Word بنجاح ✓", "en": "Word file saved successfully ✓", "fr": "Fichier Word enregistré avec succès ✓" },

    // License Info Modal
    "license_title": { "ar": "معلومات الترخيص", "en": "License Information", "fr": "Informations sur la licence" },
    "license_desc": { "ar": "تفاصيل اشتراكك في البرنامج", "en": "Your software subscription details", "fr": "Détails de votre abonnement logiciel" },
    "license_status_label": { "ar": "الحالة الحالية:", "en": "Current Status:", "fr": "Statut actuel :" },
    "license_expiry_date": { "ar": "تاريخ الانتهاء", "en": "Expiry Date", "fr": "Date d'expiration" },
    "license_expiry_time": { "ar": "وقت الانتهاء", "en": "Expiry Time", "fr": "Heure d'expiration" },
    "license_hwid_label": { "ar": "معرف الجهاز (HWID)", "en": "Hardware ID (HWID)", "fr": "ID matériel (HWID)" },
    "license_countdown_title": { "ar": "الوقت المتبقي لانتهاء الصلاحية", "en": "Time remaining until expiration", "fr": "Temps restant avant expiration" },
    "license_plan_premium": { "ar": "مفعل (Premium)", "en": "Activated (Premium)", "fr": "Activé (Premium)" },
    "license_plan_basic": { "ar": "مفعل (Basic)", "en": "Activated (Basic)", "fr": "Activé (Basic)" },
    "cd_month": { "ar": "شهر", "en": "Month", "fr": "Mois" },
    "cd_day": { "ar": "يوم", "en": "Day", "fr": "Jour" },
    "cd_hour": { "ar": "ساعة", "en": "Hour", "fr": "Heure" },
    "cd_min": { "ar": "دقيقة", "en": "Minute", "fr": "Minute" },
    "license_close_btn": { "ar": "إغلاق النافذة", "en": "Close Window", "fr": "Fermer la fenêtre" },
    "license_cancel_btn": { "ar": "إلغاء الترخيص", "en": "Deactivate License", "fr": "Désactiver la licence" },

    "theme_name_default": { "ar": "الافتراضي", "en": "Default", "fr": "Défaut" },

    "theme_name_midnight": { "ar": "الزهري المخملي", "en": "Velvet Pink", "fr": "Rose Velours" },
    "theme_name_royal": { "ar": "الأزرق الفيروزي", "en": "Turquoise Blue", "fr": "Bleu Turquoise" },
    "theme_name_emerald": { "ar": "وهج النار", "en": "Spark Fire", "fr": "Lueur de Feu" },
    "theme_name_nordic": { "ar": "الأزرق الكهربائي", "en": "Electric Blue", "fr": "Bleu Électrique" },
    "theme_name_autumn": { "ar": "حصاد الخريف", "en": "Autumn Harvest", "fr": "Récolte d'Automne" },
    "theme_name_matrix": { "ar": "مصفوفة التكنولوجيا", "en": "Tech Matrix", "fr": "Matrice Tech" },
    "theme_name_strawberry": { "ar": "مخفوق الفراولة", "en": "Strawberry Shake", "fr": "Milkshake Fraise" },
    "theme_name_nebula": { "ar": "سديم وردي", "en": "Pink Nebula", "fr": "Nébuleuse Rose" },
    "theme_name_crimson": { "ar": "ليل قرمزي", "en": "Crimson Night", "fr": "Nuit Cramoisie" },
    "theme_name_custom": { "ar": "ثيم مخصص (اصنعه بنفسك ✨)", "en": "Custom Theme (DIY ✨)", "fr": "Thème Personnalisé (DIY ✨)" },
    "custom_theme_title": { "ar": "صنع ثيم مخصص", "en": "Create Custom Theme", "fr": "Créer un Thème Personnalisé" },
    "custom_theme_base_colors": { "ar": "الألوان الأساسية", "en": "Base Colors", "fr": "Couleurs de Base" },
    "custom_theme_primary": { "ar": "اللون الرئيسي:", "en": "Primary Color:", "fr": "Couleur Primaire :" },
    "custom_theme_secondary": { "ar": "اللون الثانوي:", "en": "Secondary Color:", "fr": "Couleur Secondaire :" },
    "custom_theme_accent": { "ar": "لون التمييز:", "en": "Accent Color:", "fr": "Couleur d'Accent :" },
    "custom_theme_header_gradient": { "ar": "تدرج الهيدر (Header)", "en": "Header Gradient", "fr": "Dégradé de l'En-tête" },
    "custom_theme_sidebar_gradient": { "ar": "تدرج القائمة الجانبية", "en": "Sidebar Gradient", "fr": "Dégradé de la Barre Latérale" },
    "custom_theme_grad_start": { "ar": "بداية التدرج:", "en": "Gradient Start:", "fr": "Début du Dégradé :" },
    "custom_theme_grad_end": { "ar": "نهاية التدرج:", "en": "Gradient End:", "fr": "Fin du Dégradé :" },
    "btn_save_apply": { "ar": "حفظ وتطبيق", "en": "Save & Apply", "fr": "Sauvegarder et Appliquer" },

    // Creator / About Modal
    "creator_name": { "ar": "الأستاذ تليلي محمد لمين", "en": "Prof. Tlili Mohamed Lamine", "fr": "Prof. Tlili Mohamed Lamine" },
    "creator_job": { "ar": "أستاذ مادة الرياضيات للتعليم المتوسط", "en": "Middle School Mathematics Teacher", "fr": "Professeur de Mathématiques (Moyen)" },
    "creator_location": { "ar": "ولاية عنابة - المقاطعة 03", "en": "Annaba Province - District 03", "fr": "Wilaya de Annaba - District 03" },
    "creator_specialty": { "ar": "تصميم وتطوير الأنظمة", "en": "Systems Design & Development", "fr": "Conception et Développement de Systèmes" },
    "creator_contact_channels": { "ar": "قنوات التواصل مع المطور:", "en": "Contact Channels:", "fr": "Canaux de contact :" },
    "btn_send_email": { "ar": "إرسال إيميل (Email)", "en": "Send Email", "fr": "Envoyer un Email" },
    "social_facebook": { "ar": "فيسبوك", "en": "Facebook", "fr": "Facebook" },
    "social_instagram": { "ar": "انستغرام", "en": "Instagram", "fr": "Instagram" },
    "social_telegram": { "ar": "تيليجرام", "en": "Telegram", "fr": "Telegram" },
    "social_website": { "ar": "الموقع", "en": "Website", "fr": "Site Web" },

    // Update Check
    "update_section_title": { "ar": "تحديثات البرنامج", "en": "Software Updates", "fr": "Mises à jour du logiciel" },
    "update_section_desc": { "ar": "تحقق من توفر أحدث التحسينات والميزات الإضافية", "en": "Check for the latest improvements and new features", "fr": "Vérifiez les dernières améliorations et nouvelles fonctionnalités" },
    "btn_check_updates": { "ar": "التحقق من وجود تحديثات", "en": "Check for Updates", "fr": "Vérifier les mises à jour" },
    "update_checking": { "ar": "جاري التحقق...", "en": "Checking...", "fr": "Vérification..." },
    "update_available_title": { "ar": "تحديث جديد متاح!", "en": "New Update Available!", "fr": "Nouvelle mise à jour disponible !" },
    "update_available_msg": { "ar": "يتوفر إصدار جديد من البرنامج ({v}). هل ترغب في تحميله الآن؟", "en": "A new version of the software is available ({v}). Would you like to download it now?", "fr": "Une nouvelle version du logiciel est disponible ({v}). Voulez-vous la télécharger maintenant ?" },
    "update_no_new_title": { "ar": "البرنامج محدث", "en": "Software Up to Date", "fr": "Logiciel à jour" },
    "update_no_new_msg": { "ar": "أنت تستخدم أحدث إصدار من البرنامج.", "en": "You are using the latest version of the software.", "fr": "Vous utilisez la dernière version du logiciel." },
    "update_error_title": { "ar": "فشل التحقق", "en": "Check Failed", "fr": "Échec de la vérification" },
    "update_error_msg": { "ar": "حدث خطأ أثناء محاولة الاتصال بخادم التحديثات.", "en": "An error occurred while trying to connect to the update server.", "fr": "Une erreur s'est produite lors de la connexion au serveur de mise à jour." },
    "btn_download_now": { "ar": "تحميل الآن", "en": "Download Now", "fr": "Télécharger maintenant" },
    "btn_later": { "ar": "لاحقاً", "en": "Later", "fr": "Plus tard" },

    // Absence Stats Specific
    "absences_stats_close_analyze": { "ar": "إغلاق التحليل", "en": "Close Analysis", "fr": "Fermer l'analyse" },
    "absences_stats_no_data": { "ar": "لا توجد غيابات مسجلة لتحليلها في هذا الفصل.", "en": "No absences recorded for analysis in this term.", "fr": "Aucune absence enregistrée pour analyse ce trimestre." },
    "absences_stats_empty_table": { "ar": "لا توجد غيابات مسجلة لهذا الفصل حتى الآن.", "en": "No absences recorded for this term yet.", "fr": "Aucune absence enregistrée pour ce trimestre jusqu'à présent." },
    "absences_stats_chart_title": { "ar": "توزيع غيابات التلاميذ حسب الشهور", "en": "Distribution of Student Absences by Month", "fr": "Répartition des absences par mois" },
    "msg_preparing_word": { "ar": "جاري تحضير ملف Word... يرجى الانتظار", "en": "Preparing Word file... please wait", "fr": "Préparation du fichier Word... veuillez patienter" },
    "filename_absences_stats": { "ar": "إحصائيات_الغيابات", "en": "Absences_Statistics", "fr": "Statistiques_des_Absences" },
    "filename_grading": { "ar": "تقويم", "en": "Grading", "fr": "Evaluation" },
    "msg_export_date": { "ar": "تم استخراج هذا الملف بتاريخ :", "en": "File exported on :", "fr": "Fichier exporté le :" },
    "subject_math": { "ar": "الرياضيات", "en": "Mathematics", "fr": "Mathématiques" },
    "subject_arabic": { "ar": "اللغة العربية / التربية الاسلامية", "en": "Arabic / Islamic Education", "fr": "Arabe / Éducation Islamique" },
    "subject_french": { "ar": "اللغة الفرنسية", "en": "French Language", "fr": "Langue Française" },
    "subject_english": { "ar": "اللغة الانجليزية", "en": "English Language", "fr": "Langue Anglaise" },
    "subject_science": { "ar": "علوم الطبيعة و الحياة", "en": "Natural Sciences", "fr": "Sciences de la Nature et de la Vie" },
    "subject_physics": { "ar": "العلوم الفيزيائية", "en": "Physical Sciences", "fr": "Sciences Physiques" },
    "subject_history": { "ar": "التاريخ و الجغرافيا / التربية المدنية", "en": "History, Geo & Civics", "fr": "Hist-Géo & Éducation Civique" },
    "subject_it": { "ar": "المعلوماتية", "en": "Informatics", "fr": "Informatique" },
    "subject_pe": { "ar": "التربية البدنية", "en": "Physical Education", "fr": "Éducation Physique" },
    "export_absences_title": { "ar": "إحصائيات الغيابات", "en": "Absences Statistics", "fr": "Statistiques des Absences" },
    "export_absences_count_label": { "ar": "تعداد الغيابات :", "en": "Absence count :", "fr": "Nombre d'absences :" },
    "export_no_absences": { "ar": "لا توجد غيابات مسجلة لهذا الفصل.", "en": "No absences recorded for this term.", "fr": "Aucune absence enregistrée pour ce trimestre." },
    "msg_export_error_word": { "ar": "حدث خطأ أثناء التصدير لـ Word", "en": "An error occurred during Word export", "fr": "Une erreur s'est produite lors de l'exportation vers Word" },
    "msg_grading_sort_edit": { "ar": "يرجى تفعيل زر التعديل للتمكن من اعادة ترتيب القائمة", "en": "Please activate the edit button to re-sort the list", "fr": "Veuillez activer le bouton d'édition pour trier la liste" },
    "msg_grading_sort_name": { "ar": "يرجى تفعيل زر التعديل للتمكن من اعادة ترتيب القائمة حسب الاسم", "en": "Please activate the edit button to re-sort the list by name", "fr": "Veuillez activer le bouton d'édition pour trier la liste par nom" },
    "msg_grading_sort_rank": { "ar": "يرجى تفعيل زر التعديل للتمكن من اعادة ترتيب القائمة حسب الرتبة", "en": "Please activate the edit button to re-sort the list by rank", "fr": "Veuillez activer le bouton d'édition pour trier la liste par rang" },
    "msg_grading_sort_annual": { "ar": "يرجى تفعيل زر التعديل للتمكن من اعادة ترتيب القائمة حسب المعدل السنوي", "en": "Please activate the edit button to re-sort the list by annual average", "fr": "Veuillez activer le bouton d'édition pour trier la liste par moyenne annuelle" },

    // Term Stats Page
    "stats_avg_assignment": { "ar": "معدل القسم في الفرض", "en": "Class Average in the Quiz", "fr": "Moyenne de la Classe dans le Devoir" },
    "stats_avg_exam": { "ar": "معدل القسم في الاختبار", "en": "Class Average in the Exam", "fr": "Moyenne de la Classe dans l'Examen" },
    "stats_avg_subject": { "ar": "معدل القسم في المادة", "en": "Class Average in the Subject", "fr": "Moyenne de la Classe dans la Matière" },
    "stats_avg_annual_alt": { "ar": "معدل القسم السنوي", "en": "Class Annual Average", "fr": "Moyenne Annuelle de la Classe" },
    "stats_lbl_assignment": { "ar": "الفرض", "en": "Quiz", "fr": "Devoir" },
    "stats_lbl_exam": { "ar": "الاختبار", "en": "Exam", "fr": "Examen" },
    "stats_lbl_subject": { "ar": "معدل المادة", "en": "Subject Average", "fr": "Moyenne de la Matière" },
    "stats_lbl_annual_alt": { "ar": "المعدل السنوي", "en": "Annual Average", "fr": "Moyenne Annuelle" },
    "stats_summary_title": { "ar": "ملخص النتائج", "en": "Results summary", "fr": "Résumé des résultats" },
    "stats_grading_title": { "ar": "العلامات الفصلية", "en": "Term Marks", "fr": "Notes Trimestrielles" },
    "stats_col_metric": { "ar": "القـيـاس", "en": "Measurement", "fr": "Mesure" },
    "stats_col_passed_desc": { "ar": "عدد المتحصلين على المعدل 10 فما فوق (>= 10)", "en": "Number of those obtaining the average 10 and above (>= 10)", "fr": "Nombre de ceux ayant obtenu la moyenne 10 et plus (>= 10)" },
    "stats_col_failed_desc": { "ar": "عدد المتحصلين على معدل أقل من 10 (< 10)", "en": "Number of those obtaining an average less than 10 (< 10)", "fr": "Nombre de ceux ayant obtenu une moyenne inférieure à 10 (< 10)" },
    "stats_col_count": { "ar": "العدد", "en": "Number", "fr": "Nombre" },
    "stats_col_pct": { "ar": "النسبة", "en": "Percentage", "fr": "Pourcentage" },
    "stats_dist_title": { "ar": "توزيع العلامات (اضغط على العدد للعرض)", "en": "Marks distribution (click on the number to view)", "fr": "Distribution des notes (cliquez sur le nombre pour afficher)" },
    "stats_top_title": { "ar": "أوائل المادة (معدل >= 17.00)", "en": "Top of the subject (average >= 17.00)", "fr": "Premiers de la matière (moyenne >= 17.00)" },
    "stats_top_annual_title": { "ar": "أوائل المادة - المعدل السنوي (>= 17.00)", "en": "Top Performers - Annual Average (>= 17.00)", "fr": "Premiers de la Classe - Moyenne Annuelle (>= 17.00)" },
    "stats_col_rank": { "ar": "الترتيب", "en": "Rank", "fr": "Classement" },
    "stats_col_index": { "ar": "رقم", "en": "No.", "fr": "N°" },
    "stats_no_top": { "ar": "لا يوجد تلاميذ بمعدل >= 17.00", "en": "There are no students with average >= 17.00", "fr": "Il n'y a pas d'élèves avec moyenne >= 17.00" },
    "stats_popover_minmax": { "ar": "الأداء الأقصى والأدنى", "en": "Maximum and minimum performance", "fr": "Performance maximale et minimale" },
    "stats_popover_max": { "ar": "أعلى علامة:", "en": "Highest mark:", "fr": "Note la plus haute :" },
    "stats_popover_min": { "ar": "أقل علامة:", "en": "Lowest mark:", "fr": "Note la moins haute :" },
    "stats_annual_sort_tooltip": { "ar": "ترتيب التلاميذ حسب المعدل السنوي", "en": "Sort students by annual average", "fr": "Trier les élèves par moyenne annuelle" },

    // Ranges & Charts
    "range_under_8": { "ar": "أقل من 8.00", "en": "Less than 8.00", "fr": "Moins de 8.00" },
    "range_8_10": { "ar": "بين 8.00 و 9.99", "en": "Between 8.00 and 9.99", "fr": "Entre 8.00 et 9.99" },
    "range_10_12": { "ar": "بين 10.00 و 11.99", "en": "Between 10.00 and 11.99", "fr": "Entre 10.00 et 11.99" },
    "range_12_16": { "ar": "بين 12.00 و 15.99", "en": "Between 12.00 and 15.99", "fr": "Entre 12.00 et 15.99" },
    "range_16_18": { "ar": "بين 16.00 و 17.99", "en": "Between 16.00 and 17.99", "fr": "Entre 16.00 et 17.99" },
    "range_18_20": { "ar": "بين 18.00 و 20.00", "en": "Between 18.00 and 20.00", "fr": "Entre 18.00 et 20.00" },
    "chart_success_failure_title": { "ar": "النجاح والرسوب حسب النشاط", "en": "Success and failure by activity", "fr": "Réussite et échec par activité" },
    "chart_success_rate_title": { "ar": "نسبة النجاح في المادة", "en": "Success rate in the subject", "fr": "Taux de réussite dans la matière" },
    "chart_label_success": { "ar": "نسبة النجاح", "en": "Success rate", "fr": "Taux de réussite" },
    "chart_label_failure": { "ar": "نسبة الإخفاق", "en": "Failure rate", "fr": "Taux d'échec" },
    "filename_stats": { "ar": "إحصائيات", "en": "Statistics", "fr": "Statistiques" },
    "btn_compare_trimesters": { "ar": "المقارنة بين الفصول", "en": "Compare Trimesters", "fr": "Comparer les trimestres" },
    "comparison_modal_title": { "ar": "المقارنة بين النتائج الفصلية", "en": "Term Results Comparison", "fr": "Comparaison des résultats trimestriels" },
    "chart_comparison_success_title": { "ar": "مقارنة عدد الناجحين (>= 10)", "en": "Success Comparison (>= 10)", "fr": "Comparaison des réussites (>= 10)" },
    "chart_comparison_failure_title": { "ar": "مقارنة عدد الراسبين (< 10)", "en": "Failure Comparison (< 10)", "fr": "Comparaison des échecs (< 10)" },
    "comp_col_assignment": { "ar": "الفرض", "en": "Quiz", "fr": "Devoir" },
    "comp_col_exam": { "ar": "الاختبار", "en": "Exam", "fr": "Examen" },
    "comp_col_average": { "ar": "المعدل الفصلي", "en": "Term Avg", "fr": "Moy. Trim" },
    "comp_col_annual_avg": { "ar": "المعدل السنوي", "en": "Annual Avg", "fr": "Moy. Annuelle" },
    "comp_avg_two_terms": { "ar": "معدل الفصلين", "en": "Two Terms Avg", "fr": "Moy. des deux trimestres" },
    "comp_avg_three_terms": { "ar": "المعدل السنوي", "en": "Annual Avg", "fr": "Moy. Annuelle" },

    // Empty student list warning modal
    "empty_list_export_title": { "ar": "تصدير مستحيل", "en": "Export Impossible", "fr": "Exportation Impossible" },
    "empty_list_export_body": {
        "ar": "قائمة التلاميذ فارغة أو لا يوجد تلاميذ مسجلون في هذا الفصل.\nيرجى إضافة تلاميذ إلى الفوج التربوي وتفعيلهم في الفصل الحالي قبل محاولة تصدير ملف Word.",
        "en": "The student list is empty or no students are registered for this term.\nPlease add students to the group and activate them for the current term before exporting a Word document.",
        "fr": "La liste des élèves est vide ou aucun élève n'est inscrit pour ce trimestre.\nVeuillez ajouter des élèves au groupe et les activer pour le trimestre actuel avant d'exporter un document Word."
    },
    "btn_ok_understood": { "ar": "حسناً، فهمت", "en": "OK, Understood", "fr": "D'accord, compris" }
};

let currentLang = localStorage.getItem('appLang') || 'ar';

window.t = function (key) {
    if (translationDict[key] && translationDict[key][currentLang]) {
        return translationDict[key][currentLang];
    }
    return key;
};

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('appLang', lang);
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;

    // Update all text translations
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translationDict[key] && translationDict[key][currentLang]) {
            el.innerHTML = translationDict[key][currentLang];
        }
    });

    // Update all combined icons+text in sidebar or buttons
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        const iconHtml = el.getAttribute('data-i18n-icon') || '';
        if (translationDict[key] && translationDict[key][currentLang]) {
            el.innerHTML = iconHtml + ' ' + translationDict[key][currentLang];
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translationDict[key] && translationDict[key][currentLang]) {
            el.placeholder = translationDict[key][currentLang];
        }
    });

    // Update titles (tooltips)
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (translationDict[key] && translationDict[key][currentLang]) {
            el.title = translationDict[key][currentLang];
        }
    });

    // Trigger an event so dynamic components in script.js can update
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
}

function handleLanguageChange(event) {
    setLanguage(event.target.value);
}

// Initial application of language
document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);
    const langSelect = document.getElementById('app-language-select');
    if (langSelect) {
        langSelect.value = currentLang;
    }
});

