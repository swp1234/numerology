// Main app logic
class NumerologyApp {
    constructor() {
        this.currentLifeNumber = null;
        this.currentExpressNumber = null;
        this.birthDate = null;
        this.name = null;
        this.initializeApp();
    }

    async initializeApp() {
        try {
            // Hide loader while loading translations
            const loader = document.getElementById('app-loader');

            // Load translations
            await i18n.loadTranslations(i18n.currentLang);
            document.documentElement.lang = i18n.currentLang;
            i18n.updateUI();

            // Initialize theme
            this.initTheme();

            // Setup event listeners
            this.setupEventListeners();
            this.initRelatedFunnels();

            // Hide loader
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 500);

            // Load saved data
            this.loadSavedData();

            // Track engagement for GA4 bounce rate
            this.engagementTracked = false;
            this.trackFirstInteraction();

            // Auto-focus input field after initialization
            setTimeout(() => {
                this.autoFocusInput();
                this.showEmptyStateHint();
                // Pulse the calculate button to draw attention
                const calcBtn = document.getElementById('calculate-life-btn');
                if (calcBtn) calcBtn.classList.add('pulse-glow');
            }, 300);
        } catch (error) {
            console.error('App initialization error:', error);
            // Hide loader even on error
            const loader = document.getElementById('app-loader');
            if (loader) {
                loader.classList.add('hidden');
                setTimeout(() => loader.remove(), 300);
            }
        }
    }

    initTheme() {
        const savedTheme = localStorage.getItem('app_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

        // Language selector
        document.getElementById('lang-toggle').addEventListener('click', () => this.toggleLanguageMenu());
        document.querySelectorAll('.lang-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeLanguage(e.target.dataset.lang));
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Life Path Number calculation
        document.getElementById('calculate-life-btn').addEventListener('click', () => this.calculateLifePath());
        document.getElementById('birth-date').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.calculateLifePath();
        });

        // Expression Number calculation
        document.getElementById('calculate-express-btn').addEventListener('click', () => this.calculateExpression());
        document.getElementById('name-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.calculateExpression();
        });

        // Compatibility calculation
        document.getElementById('calculate-compat-btn').addEventListener('click', () => this.calculateCompatibility());

        // Share & story card buttons
        document.getElementById('share-life').addEventListener('click', () => this.shareResult('life'));
        document.getElementById('save-life-card')?.addEventListener('click', () => this.generateLifeStoryCard());
        document.getElementById('share-ai-life').addEventListener('click', () => this.shareResult('ai-life'));
        document.getElementById('share-express').addEventListener('click', () => this.shareResult('express'));
        document.getElementById('share-compat').addEventListener('click', () => this.shareResult('compat'));

        // AI Analysis buttons
        document.getElementById('ai-life-analysis').addEventListener('click', () => this.showAIAnalysis('life'));
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('app_theme', newTheme);
        document.getElementById('theme-toggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }

    toggleLanguageMenu() {
        const menu = document.getElementById('lang-menu');
        menu.classList.toggle('hidden');
    }

    async changeLanguage(lang) {
        await i18n.setLanguage(lang);
        document.getElementById('lang-menu').classList.add('hidden');
        this.initRelatedFunnels();
        if (this.currentLifeNumber) {
            this.renderCuratedResources();
        }
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active from all buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Mark button as active
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Auto-focus input when switching tabs
        setTimeout(() => {
            this.autoFocusInput();
        }, 100);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    calculateLifePath(isUserAction = true) {
        const birthDate = document.getElementById('birth-date').value;
        if (!birthDate) {
            this.showToast(i18n.t('validation.selectDate') !== 'validation.selectDate' ? i18n.t('validation.selectDate') : 'Please select a date');
            return;
        }

        if (isUserAction && typeof gtag === 'function') {
            gtag('event', 'test_start', { event_category: 'numerology', app_name: 'numerology', mode: 'life_path' });
        }

        this.birthDate = birthDate;
        const number = NumerologyData.calculateLifePathNumber(birthDate);

        if (number === null) {
            this.showToast(i18n.t('validation.invalidDate') !== 'validation.invalidDate' ? i18n.t('validation.invalidDate') : 'Invalid date');
            return;
        }

        this.currentLifeNumber = number;
        this.displayLifePathResult(number, isUserAction);
        this.saveData('birthDate', birthDate);
        if (isUserAction && typeof gtag === 'function') {
            gtag('event', 'calculate_life_path', { event_category: 'numerology' });
            gtag('event', 'test_complete', {
                event_category: 'numerology',
                app_name: 'numerology',
                result_type: `life_path_${number}`
            });
            this.trackEngagement('calculate_life_path');
        }
    }

    displayLifePathResult(number, shouldScroll = true) {
        const meaning = NumerologyData.getMeaning(number);
        if (!meaning) return;

        // Remove empty state hint when result is shown
        const emptyHint = document.querySelector('.empty-state-hint');
        if (emptyHint) {
            emptyHint.remove();
        }

        const resultCard = document.getElementById('life-result');
        const numberGlow = document.getElementById('life-number-glow');
        const masterBadge = document.getElementById('master-badge');

        numberGlow.textContent = number;

        // Show master badge if applicable
        if (meaning.isMaster) {
            masterBadge.style.display = 'block';
        } else {
            masterBadge.style.display = 'none';
        }

        // Display personality
        document.getElementById('life-personality').textContent = meaning.personality;

        // Display strengths
        document.getElementById('life-strengths').innerHTML = meaning.strengths
            .map(s => `<div class="trait-item">${s}</div>`)
            .join('');

        // Display weaknesses
        document.getElementById('life-weaknesses').innerHTML = meaning.weaknesses
            .map(w => `<div class="trait-item">${w}</div>`)
            .join('');

        // Display career
        document.getElementById('life-career').innerHTML = meaning.career
            .map(c => `<div class="trait-item">${c}</div>`)
            .join('');

        // Display love
        document.getElementById('life-love').textContent = meaning.love;

        // Display lucky items
        document.getElementById('life-color').textContent = meaning.color;
        document.getElementById('life-day').textContent = meaning.day;
        document.getElementById('life-compatible').textContent = meaning.compatible;

        // Show result card
        resultCard.classList.remove('hidden');
        this.renderCuratedResources();

        // Scroll to result on interactive calculations
        if (shouldScroll) {
            resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    showAIAnalysis(type) {
        if (type === 'life' && !this.currentLifeNumber) return;

        const number = this.currentLifeNumber;
        const meaning = NumerologyData.getMeaning(number);

        // Generate AI analysis text
        const aiPurpose = this.generateAIPurpose(number, meaning);
        const aiPotential = this.generateAIPotential(number, meaning);
        const aiChallenge = this.generateAIChallenge(number, meaning);
        const aiKeys = this.generateAISuccessKeys(number, meaning);

        const aiResult = document.getElementById('ai-life-result');
        document.getElementById('ai-life-purpose').textContent = aiPurpose;
        document.getElementById('ai-life-potential').textContent = aiPotential;
        document.getElementById('ai-life-challenge').textContent = aiChallenge;

        // Display success keys
        document.getElementById('ai-life-keys').innerHTML = aiKeys
            .map((key, idx) => `
                <div class="action-item">
                    <span class="action-icon">${idx + 1}️⃣</span>
                    <span class="action-text">${key}</span>
                </div>
            `)
            .join('');

        // Hide life result, show AI result
        document.getElementById('life-result').classList.add('hidden');
        aiResult.classList.remove('hidden');

        aiResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    generateAIPurpose(number, meaning) {
        const purposes = {
            1: "Your life purpose is to lead, innovate, and blaze new trails. You are meant to be a trailblazer who inspires others through courage and originality.",
            2: "Your life purpose is to bring harmony, heal relationships, and create balance. You are meant to be a bridge-builder and peacemaker.",
            3: "Your life purpose is to express yourself creatively and spread joy. You are meant to inspire others through your unique talents and optimism.",
            4: "Your life purpose is to build lasting foundations and create stability. You are meant to be a reliable pillar in your community.",
            5: "Your life purpose is to explore, adapt, and bring change. You are meant to be a catalyst for growth and transformation.",
            6: "Your life purpose is to nurture, care, and serve others. You are meant to be a healer and beacon of compassion.",
            7: "Your life purpose is to seek truth and wisdom. You are meant to be a spiritual guide and deep thinker.",
            8: "Your life purpose is to achieve material success and exercise authority. You are meant to build empires and create abundance.",
            9: "Your life purpose is to embrace universal love and humanitarian ideals. You are meant to uplift humanity.",
            11: "Your life purpose is to inspire and illuminate others through spiritual awakening. You are meant to be a visionary teacher.",
            22: "Your life purpose is to build a legacy and transform the world. You are the master builder of grand visions.",
            33: "Your life purpose is to be a teacher of compassion and enlightenment. You are meant to guide humanity toward higher consciousness."
        };
        return purposes[number] || "Your life path holds unique purpose and meaning.";
    }

    generateAIPotential(number, meaning) {
        const potentials = {
            1: "Your hidden potential includes exceptional leadership abilities, innovative thinking, and the power to manifest dreams into reality.",
            2: "Your hidden potential includes profound intuitive gifts, healing abilities, and the capacity to create deep, meaningful connections.",
            3: "Your hidden potential includes artistic mastery, communication gifts, and the ability to uplift others through expression.",
            4: "Your hidden potential includes architectural genius, strategic planning, and the ability to create lasting structures of success.",
            5: "Your hidden potential includes adaptability that borders on genius, freedom-oriented innovation, and transformative energy.",
            6: "Your hidden potential includes deep compassion, problem-solving for others, and the ability to create harmonious communities.",
            7: "Your hidden potential includes mystical insight, scientific breakthrough thinking, and spiritual enlightenment.",
            8: "Your hidden potential includes business acumen, executive magnetism, and the capacity to build enormous wealth and influence.",
            9: "Your hidden potential includes humanitarian vision, universal compassion, and the ability to improve the world.",
            11: "Your hidden potential includes visionary insight, spiritual mastery, and the ability to inspire mass transformation.",
            22: "Your hidden potential includes the ability to manifest grand visions, create lasting legacies, and transform societies.",
            33: "Your hidden potential includes enlightened compassion, healing mastery, and the ability to awaken human consciousness."
        };
        return potentials[number] || "You have unique hidden talents waiting to be discovered.";
    }

    generateAIChallenge(number, meaning) {
        const challenges = {
            1: "Your main challenge is learning to collaborate and consider others' perspectives while maintaining your leadership vision.",
            2: "Your main challenge is developing confidence and assertiveness without losing your diplomatic nature.",
            3: "Your main challenge is focusing your creative energy and avoiding scattered efforts or superficial engagement.",
            4: "Your main challenge is learning flexibility and adaptability while maintaining your stability and discipline.",
            5: "Your main challenge is channeling your restlessness into productive pursuits and avoiding self-destructive patterns.",
            6: "Your main challenge is setting healthy boundaries and avoiding burnout from excessive caregiving.",
            7: "Your main challenge is overcoming isolation and trusting others while maintaining your introspective nature.",
            8: "Your main challenge is balancing material ambition with spiritual values and ethical considerations.",
            9: "Your main challenge is achieving closure and moving forward while maintaining your universal compassion.",
            11: "Your main challenge is managing anxiety and perfectionism while trusting your intuitive insights.",
            22: "Your main challenge is believing in yourself enough to pursue your grand vision without self-doubt.",
            33: "Your main challenge is protecting your own well-being while serving others with unconditional love."
        };
        return challenges[number] || "You have unique challenges that lead to personal growth.";
    }

    generateAISuccessKeys(number, meaning) {
        const keys = {
            1: ["Trust your instincts and bold vision", "Build a strong team around you", "Practice continuous innovation", "Develop patience and humility"],
            2: ["Honor your intuitive gifts", "Practice active listening", "Create balanced partnerships", "Embrace your sensitivity as strength"],
            3: ["Express yourself authentically", "Finish what you start", "Connect with your community", "Balance fun with responsibility"],
            4: ["Create solid foundations first", "Break large goals into steps", "Value quality over quantity", "Build lasting systems"],
            5: ["Embrace calculated risks", "Channel energy into passionate pursuits", "Maintain some structure", "Help others evolve"],
            6: ["Serve with wisdom not sacrifice", "Create healthy boundaries", "Build strong family bonds", "Trust your nurturing gifts"],
            7: ["Follow your spiritual path", "Share your knowledge", "Trust your analysis", "Develop meaningful connections"],
            8: ["Balance profit with purpose", "Use power for good", "Create opportunities for others", "Remember spiritual wealth matters"],
            9: ["Complete cycles with grace", "Embrace forgiveness", "Think globally", "Inspire through compassion"],
            11: ["Trust your visions", "Develop your intuition", "Teach and inspire", "Balance idealism with reality"],
            22: ["Believe in your vision", "Break dreams into phases", "Lead with integrity", "Build for the future"],
            33: ["Lead with unconditional love", "Teach what you learn", "Heal yourself first", "Inspire by example"]
        };
        return keys[number] || ["Follow your passion", "Trust the process", "Help others", "Stay true to yourself"];
    }

    calculateExpression() {
        const name = document.getElementById('name-input').value.trim();
        if (!name) {
            this.showToast(i18n.t('validation.enterName') !== 'validation.enterName' ? i18n.t('validation.enterName') : 'Please enter a name');
            return;
        }

        const number = NumerologyData.calculateExpressionNumber(name);
        if (number === null || number === 0) {
            this.showToast(i18n.t('validation.invalidName') !== 'validation.invalidName' ? i18n.t('validation.invalidName') : 'Invalid name');
            return;
        }

        this.currentExpressNumber = number;
        this.name = name;
        this.displayExpressionResult(number, name);
        this.saveData('name', name);
        if (typeof gtag === 'function') {
            gtag('event', 'calculate_expression', { event_category: 'numerology' });
            gtag('event', 'test_complete', {
                event_category: 'numerology',
                app_name: 'numerology',
                result_type: `expression_${number}`
            });
        }
    }

    displayExpressionResult(number, name) {
        const meaning = NumerologyData.getMeaning(number);
        if (!meaning) return;

        const resultCard = document.getElementById('express-result');
        const numberGlow = document.getElementById('express-number-glow');
        const masterBadge = document.getElementById('express-master-badge');

        numberGlow.textContent = number;

        if (meaning.isMaster) {
            masterBadge.style.display = 'block';
        } else {
            masterBadge.style.display = 'none';
        }

        document.getElementById('express-personality').textContent = `How you naturally express "${name}": ${meaning.personality}`;
        document.getElementById('express-talents').innerHTML = meaning.strengths
            .map(s => `<div class="trait-item">${s}</div>`)
            .join('');
        document.getElementById('express-challenges').innerHTML = meaning.weaknesses
            .map(w => `<div class="trait-item">${w}</div>`)
            .join('');

        resultCard.classList.remove('hidden');
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    calculateCompatibility() {
        const num1 = parseInt(document.getElementById('compat-num1').value, 10);
        const num2 = parseInt(document.getElementById('compat-num2').value, 10);

        if (!num1 || !num2 || num1 < 1 || num1 > 33 || num2 < 1 || num2 > 33) {
            this.showToast(i18n.t('validation.validNumbers') !== 'validation.validNumbers' ? i18n.t('validation.validNumbers') : 'Please enter valid numbers (1-33)');
            return;
        }

        const compatibility = NumerologyData.calculateCompatibility(num1, num2);
        this.displayCompatibilityResult(num1, num2, compatibility);
        if (typeof gtag === 'function') {
            const tier = compatibility >= 85 ? 'high' : compatibility >= 65 ? 'balanced' : 'growth';
            gtag('event', 'test_complete', {
                event_category: 'numerology',
                app_name: 'numerology',
                result_type: `compatibility_${tier}`
            });
        }
    }

    displayCompatibilityResult(num1, num2, score) {
        const resultCard = document.getElementById('compat-result');
        const meaning1 = NumerologyData.getMeaning(num1);
        const meaning2 = NumerologyData.getMeaning(num2);

        // Update display
        document.getElementById('compat-num1-display').textContent = num1;
        document.getElementById('compat-num2-display').textContent = num2;
        document.getElementById('compat-percentage').textContent = score + '%';

        // Update score fill
        const scoreFill = document.getElementById('compat-score-fill');
        scoreFill.style.width = '0%';
        setTimeout(() => {
            scoreFill.style.width = score + '%';
        }, 100);

        // Generate description
        const description = this.generateCompatDescription(num1, num2, score, meaning1, meaning2);
        document.getElementById('compat-description').textContent = description;

        // Generate strengths
        const strengths = this.generateCompatStrengths(num1, num2, meaning1, meaning2);
        document.getElementById('compat-strengths').innerHTML = strengths
            .map(s => `<div class="trait-item">${s}</div>`)
            .join('');

        // Generate cautions
        const cautions = this.generateCompatCautions(num1, num2, meaning1, meaning2);
        document.getElementById('compat-cautions').innerHTML = cautions
            .map(c => `<div class="trait-item">${c}</div>`)
            .join('');

        resultCard.classList.remove('hidden');
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    generateCompatDescription(num1, num2, score, m1, m2) {
        if (score >= 95) {
            return `${m1.name} (${num1}) and ${m2.name} (${num2}) are cosmically aligned! This is a match made in destiny.`;
        } else if (score >= 85) {
            return `${m1.name} (${num1}) and ${m2.name} (${num2}) are highly compatible. Strong natural synergy exists between these numbers.`;
        } else if (score >= 75) {
            return `${m1.name} (${num1}) and ${m2.name} (${num2}) share good chemistry. With effort, this can be a harmonious pairing.`;
        } else if (score >= 60) {
            return `${m1.name} (${num1}) and ${m2.name} (${num2}) have potential but need to work on differences. Growth comes through understanding.`;
        } else {
            return `${m1.name} (${num1}) and ${m2.name} (${num2}) are different. Success requires significant compromise and effort.`;
        }
    }

    generateCompatStrengths(num1, num2, m1, m2) {
        const strengths = [];
        if ([1, 8, 11, 22].includes(num1) && [1, 8, 11, 22].includes(num2)) {
            strengths.push("Both are powerful and ambitious");
        }
        if ([2, 4, 6].includes(num1) && [2, 4, 6].includes(num2)) {
            strengths.push("Shared appreciation for stability");
        }
        if ([3, 5, 9].includes(num1) && [3, 5, 9].includes(num2)) {
            strengths.push("Creative and free-spirited harmony");
        }
        strengths.push(`${m1.name}'s strengths: ${m1.strengths.slice(0, 2).join(', ')}`);
        strengths.push(`${m2.name}'s strengths: ${m2.strengths.slice(0, 2).join(', ')}`);
        return strengths.length > 0 ? strengths : ["Unique strengths to explore together"];
    }

    generateCompatCautions(num1, num2, m1, m2) {
        const cautions = [];
        if (num1 === 1 && num2 === 2) cautions.push("One may dominate while other submits");
        if (num1 === 3 && num2 === 4) cautions.push("Creative one may find practical one boring");
        if (num1 === 5 && num2 === 8) cautions.push("Freedom-seeker vs control-seeker tension");
        cautions.push(`${m1.name}'s potential weakness: ${m1.weaknesses[0]}`);
        cautions.push(`${m2.name}'s potential weakness: ${m2.weaknesses[0]}`);
        return cautions.length > 0 ? cautions : ["Work through differences with communication"];
    }

    shareResult(type) {
        let shareText = '';
        const lang = (window.i18n && window.i18n.currentLang) || i18n.getCurrentLanguage() || 'ko';
        const shareUrl = `https://dopabrain.com/numerology/?lang=${encodeURIComponent(lang)}&utm_source=share`;

        if (type === 'life') {
            const num = this.currentLifeNumber;
            const meaning = NumerologyData.getMeaning(num);
            shareText = `🔢 ${i18n.t('share.life')} ${num}${i18n.t('share.lifeNum')} ${meaning.name}${i18n.t('share.lifeMsg')} "${meaning.personality}" ${shareUrl}`;
        } else if (type === 'ai-life') {
            shareText = `✨ ${i18n.t('share.aiLife')} ${shareUrl}`;
        } else if (type === 'express') {
            const num = this.currentExpressNumber;
            const meaning = NumerologyData.getMeaning(num);
            shareText = `💝 ${i18n.t('share.express')} ${num}${i18n.t('share.expressNum')} ${meaning.name}${i18n.t('share.expressMsg')} "${this.name}" ${shareUrl}`;
        } else if (type === 'compat') {
            const num1 = parseInt(document.getElementById('compat-num1').value, 10);
            const num2 = parseInt(document.getElementById('compat-num2').value, 10);
            const score = NumerologyData.calculateCompatibility(num1, num2);
            shareText = `💫 ${num1}${i18n.t('share.compat')} ${num2}${i18n.t('share.compatNum')} ${score}${i18n.t('share.compatPercent')} ${shareUrl}`;
        }

        const copiedMsg = i18n.t('share.copied') !== 'share.copied' ? i18n.t('share.copied') : 'Copied to clipboard!';
        if (navigator.share) {
            navigator.share({
                title: 'Numerology Result',
                text: shareText,
                url: shareUrl
            }).catch(() => {});
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showToast(copiedMsg);
            }).catch(() => {});
        }

        if (typeof gtag === 'function') {
            gtag('event', 'share', {
                event_category: 'numerology',
                method: navigator.share ? 'native' : 'copy',
                content_type: `numerology_${type}`
            });
        }
    }

    

    loadSavedData() {
        const savedDate = localStorage.getItem('saved_birth_date');
        const savedName = localStorage.getItem('saved_name');

        if (savedDate) {
            document.getElementById('birth-date').value = savedDate;
        } else {
            // First visit: auto-fill with sample date and show result preview cleanly
            const sampleDate = '1995-06-15';
            document.getElementById('birth-date').value = sampleDate;
            setTimeout(() => this.calculateLifePath(false), 100);
        }
        if (savedName) {
            document.getElementById('name-input').value = savedName;
        }
    }

    saveData(key, value) {
        if (key === 'birthDate') {
            localStorage.setItem('saved_birth_date', value);
        } else if (key === 'name') {
            localStorage.setItem('saved_name', value);
        }
    }

    /**
     * Track first interaction for GA4 engagement (reduces bounce rate)
     */
    trackFirstInteraction() {
        const handler = () => {
            this.trackEngagement('first_interaction');
            document.removeEventListener('click', handler);
            document.removeEventListener('keydown', handler);
        };
        document.addEventListener('click', handler, { once: true });
        document.addEventListener('keydown', handler, { once: true });
    }

    /**
     * Track GA4 engagement event
     */
    trackEngagement(label) {
        if (this.engagementTracked) return;
        this.engagementTracked = true;
        if (typeof gtag === 'function') {
            gtag('event', 'engagement', {
                event_category: 'numerology',
                event_label: label
            });
        }
    }

    autoFocusInput() {
        // Focus on the active tab's input field
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            const dateInput = activeTab.querySelector('#birth-date');
            const nameInput = activeTab.querySelector('#name-input');
            const input = dateInput || nameInput;
            if (input) {
                input.focus();
                // Remove pulse animation after 3 seconds
                setTimeout(() => {
                    input.classList.add('animated');
                }, 3000);
            }
        }
    }

    
    initRelatedFunnels() {
        const lang = (window.i18n && window.i18n.currentLang) || 'ko';
        document.querySelectorAll('.related-card[data-base-href]').forEach(card => {
            const base = card.getAttribute('data-base-href');
            card.href = `${base}?lang=${encodeURIComponent(lang)}&source=numerology_result`;
            if (!card.dataset.funnelBound) {
                card.dataset.funnelBound = 'true';
                card.addEventListener('click', () => {
                    if (typeof gtag === 'function') {
                        gtag('event', 'content_cta_click', {
                            cta_surface: 'related_tools',
                            destination: card.getAttribute('href'),
                            source: 'numerology_result',
                            lang: (window.i18n && window.i18n.currentLang) || lang
                        });
                    }
                });
            }
        });
    }

    renderCuratedResources() {
        const card = document.getElementById('curated-resources-card');
        const list = document.getElementById('curated-resources-list');
        if (!card || !list) return;
        const lang = (window.i18n && window.i18n.currentLang) || 'ko';
        const domains = {
            ko: 'https://www.amazon.com/dp/{asin}?tag=dopabrain-20',
            en: 'https://www.amazon.com/dp/{asin}?tag=dopabrain-20',
            ja: 'https://www.amazon.co.jp/dp/{asin}?tag=dopabrain-20',
            zh: 'https://www.amazon.com/dp/{asin}?tag=dopabrain-20',
            es: 'https://www.amazon.es/dp/{asin}?tag=dopabrain-20',
            pt: 'https://www.amazon.com.br/dp/{asin}?tag=dopabrain-20',
            hi: 'https://www.amazon.in/dp/{asin}?tag=dopabrain-20',
            ru: 'https://www.amazon.com/dp/{asin}?tag=dopabrain-20',
            id: 'https://www.amazon.sg/dp/{asin}?tag=dopabrain-20',
            tr: 'https://www.amazon.com.tr/dp/{asin}?tag=dopabrain-20',
            de: 'https://www.amazon.de/dp/{asin}?tag=dopabrain-20',
            fr: 'https://www.amazon.fr/dp/{asin}?tag=dopabrain-20'
        };
        const tr = (k, fb) => {
            const v = i18n.t(k);
            return (v && v !== k) ? v : fb;
        };
        const books = [
            {
                key: 'completeNumerology',
                asin: '1561705152',
                icon: '🔢',
                title: tr('curated.completeNumerology.title', 'The Complete Book of Numerology'),
                author: tr('curated.completeNumerology.author', 'David A. Phillips'),
                why: tr('curated.completeNumerology.why', 'Clear guide to Pythagorean Life Path numbers, planes of expression, and personal cycles.')
            },
            {
                key: 'manAndSymbols',
                asin: '0440351839',
                icon: '🌌',
                title: tr('curated.manAndSymbols.title', 'Man and His Symbols'),
                author: tr('curated.manAndSymbols.author', 'Carl G. Jung'),
                why: tr('curated.manAndSymbols.why', 'Foundational exploration of archetypes and symbolic patterns behind self-reflection.')
            }
        ];

        list.innerHTML = '';
        books.forEach(book => {
            const href = (domains[lang] || domains.en).replace('{asin}', book.asin);
            const item = document.createElement('a');
            item.className = 'curated-item';
            item.href = href;
            item.target = '_blank';
            item.rel = 'noopener noreferrer sponsored';

            const iconSpan = document.createElement('span');
            iconSpan.className = 'curated-icon';
            iconSpan.textContent = book.icon;

            const copyDiv = document.createElement('div');
            copyDiv.className = 'curated-copy';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'curated-item-title';
            titleDiv.textContent = book.title;

            const authorDiv = document.createElement('div');
            authorDiv.className = 'curated-item-author';
            authorDiv.textContent = book.author;

            const whyDiv = document.createElement('div');
            whyDiv.className = 'curated-item-why';
            whyDiv.textContent = book.why;

            copyDiv.appendChild(titleDiv);
            copyDiv.appendChild(authorDiv);
            copyDiv.appendChild(whyDiv);

            const arrowSpan = document.createElement('span');
            arrowSpan.className = 'curated-arrow';
            arrowSpan.textContent = '→';

            item.appendChild(iconSpan);
            item.appendChild(copyDiv);
            item.appendChild(arrowSpan);

            item.addEventListener('click', () => {
                if (typeof gtag === 'function') {
                    gtag('event', 'curated_resource_click', {
                        app_name: 'numerology',
                        resource_key: book.key,
                        content_locale: lang,
                        cta_surface: 'curated_resources'
                    });
                    gtag('event', 'content_cta_click', {
                        cta_type: 'curated_book',
                        destination: href,
                        source: 'numerology'
                    });
                }
            });

            list.appendChild(item);
        });
        card.classList.remove('hidden');
    }

    generateLifeStoryCard() {
        const number = this.currentLifeNumber;
        if (!number) return;
        const meaning = NumerologyData.getMeaning(number);
        if (!meaning) return;
        const canvas = document.getElementById('result-canvas-life');
        if (!canvas) return;
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d');

        const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
        grad.addColorStop(0, '#0f0f23');
        grad.addColorStop(0.55, '#191938');
        grad.addColorStop(1, '#261e14');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1080, 1920);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText('DOPABRAIN · NUMEROLOGY', 540, 180);

        ctx.beginPath();
        ctx.arc(540, 460, 175, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(241, 196, 15, 0.14)';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(241, 196, 15, 0.55)';
        ctx.stroke();

        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 170px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText(String(number), 540, 520);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText(meaning.name || `Life Path ${number}`, 540, 720);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '600 32px -apple-system, BlinkMacSystemFont, sans-serif';
        const words = (meaning.personality || '').split(' ');
        const lines = [];
        let cur = '';
        words.forEach(w => {
            const test = cur ? `${cur} ${w}` : w;
            if (ctx.measureText(test).width > 820 && cur) {
                lines.push(cur);
                cur = w;
            } else {
                cur = test;
            }
        });
        if (cur) lines.push(cur);
        lines.slice(0, 6).forEach((line, idx) => {
            ctx.fillText(line, 540, 820 + idx * 54);
        });

        ctx.fillStyle = 'rgba(255,255,255,0.72)';
        ctx.font = '600 30px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText('dopabrain.com/numerology', 540, 1740);

        try {
            const a = document.createElement('a');
            a.download = `numerology-lifepath-${number}.png`;
            a.href = canvas.toDataURL('image/png');
            document.body.appendChild(a);
            a.click();
            a.remove();
            const savedMsg = i18n.t('common.cardSaved');
            this.showToast(savedMsg !== 'common.cardSaved' ? savedMsg : 'Story card saved!');
        } catch (e) {}

        if (typeof gtag === 'function') {
            gtag('event', 'save_image', {
                event_category: 'numerology',
                app_name: 'numerology',
                result_type: `life_path_${number}`,
                save_surface: 'result_story_1080x1920'
            });
        }
    }

    showToast(message) {
        let toast = document.getElementById('numerology-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'numerology-toast';
            toast.className = 'numerology-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.display = 'block';
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            if (toast) toast.style.display = 'none';
        }, 2400);
    }

    showEmptyStateHint() {
        // Show hint when result area is empty
        const lifeResult = document.getElementById('life-result');
        if (lifeResult && lifeResult.classList.contains('hidden')) {
            const inputCard = document.querySelector('#lifenum-tab .input-card');
            if (inputCard && !inputCard.querySelector('.empty-state-hint')) {
                const hint = document.createElement('p');
                hint.className = 'empty-state-hint';
                hint.style.cssText = 'text-align:center;margin-top:16px;padding:12px;background:var(--bg-dark-tertiary);border-radius:8px;color:var(--text-secondary);font-size:13px;opacity:0.9;';
                hint.setAttribute('data-i18n', 'lifeNumber.emptyHint');
                const tHint = i18n.t('lifeNumber.emptyHint');
                hint.textContent = (tHint && tHint !== 'lifeNumber.emptyHint') ? tHint : 'Enter your birth date to discover your Life Path number';
                inputCard.appendChild(hint);
            }
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NumerologyApp();
});
