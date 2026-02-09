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
            i18n.updateUI();

            // Initialize theme
            this.initTheme();

            // Setup event listeners
            this.setupEventListeners();

            // Hide loader
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 500);

            // Load saved data
            this.loadSavedData();
        } catch (error) {
            console.error('App initialization error:', error);
            if (window.errorHandler) {
                window.errorHandler.handleError(error, 'App Initialization');
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

        // Share buttons
        document.getElementById('share-life').addEventListener('click', () => this.shareResult('life'));
        document.getElementById('share-ai-life').addEventListener('click', () => this.shareResult('ai-life'));
        document.getElementById('share-express').addEventListener('click', () => this.shareResult('express'));
        document.getElementById('share-compat').addEventListener('click', () => this.shareResult('compat'));

        // AI Analysis buttons
        document.getElementById('ai-life-analysis').addEventListener('click', () => this.showAIAnalysis('life'));

        // Ad countdown
        const closeAdBtn = document.getElementById('close-ad');
        if (closeAdBtn) {
            closeAdBtn.addEventListener('click', () => this.closeInterstitialAd());
        }
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

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    calculateLifePath() {
        const birthDate = document.getElementById('birth-date').value;
        if (!birthDate) {
            alert(i18n.t('validation.selectDate') || 'Please select a date');
            return;
        }

        this.birthDate = birthDate;
        const number = NumerologyData.calculateLifePathNumber(birthDate);

        if (number === null) {
            alert(i18n.t('validation.invalidDate') || 'Invalid date');
            return;
        }

        this.currentLifeNumber = number;
        this.displayLifePathResult(number);
        this.saveData('birthDate', birthDate);
    }

    displayLifePathResult(number) {
        const meaning = NumerologyData.getMeaning(number);
        if (!meaning) return;

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

        // Scroll to result
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
            alert(i18n.t('validation.enterName') || 'Please enter a name');
            return;
        }

        const number = NumerologyData.calculateExpressionNumber(name);
        if (number === null || number === 0) {
            alert(i18n.t('validation.invalidName') || 'Invalid name');
            return;
        }

        this.currentExpressNumber = number;
        this.name = name;
        this.displayExpressionResult(number, name);
        this.saveData('name', name);
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
        const num1 = parseInt(document.getElementById('compat-num1').value);
        const num2 = parseInt(document.getElementById('compat-num2').value);

        if (!num1 || !num2 || num1 < 1 || num1 > 33 || num2 < 1 || num2 > 33) {
            alert(i18n.t('validation.validNumbers') || 'Please enter valid numbers (1-33)');
            return;
        }

        const compatibility = NumerologyData.calculateCompatibility(num1, num2);
        this.displayCompatibilityResult(num1, num2, compatibility);
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
        let shareUrl = window.location.href;

        if (type === 'life') {
            const num = this.currentLifeNumber;
            const meaning = NumerologyData.getMeaning(num);
            shareText = `🔢 내 인생경로숫자는 ${num}번 ${meaning.name}! "${meaning.personality}" ${shareUrl}`;
        } else if (type === 'ai-life') {
            shareText = `✨ AI가 분석한 내 운명의 숫자! 신비로운 의미를 알아보세요! ${shareUrl}`;
        } else if (type === 'express') {
            const num = this.currentExpressNumber;
            const meaning = NumerologyData.getMeaning(num);
            shareText = `💝 내 표현숫자는 ${num}번 ${meaning.name}! "${this.name}"의 숨은 의미 ${shareUrl}`;
        } else if (type === 'compat') {
            const num1 = parseInt(document.getElementById('compat-num1').value);
            const num2 = parseInt(document.getElementById('compat-num2').value);
            const score = NumerologyData.calculateCompatibility(num1, num2);
            shareText = `💫 ${num1}번과 ${num2}번의 숫자 궁합: ${score}%! 당신의 궁합은? ${shareUrl}`;
        }

        // Copy to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText).then(() => {
                alert(i18n.t('share.copied') || 'Copied to clipboard!');
            });
        }

        // Try native share if available
        if (navigator.share) {
            navigator.share({
                title: 'Numerology Result',
                text: shareText,
                url: shareUrl
            }).catch(err => console.log('Share error:', err));
        }
    }

    closeInterstitialAd() {
        const ad = document.getElementById('interstitial-ad');
        ad.classList.add('hidden');
    }

    loadSavedData() {
        const savedDate = localStorage.getItem('saved_birth_date');
        const savedName = localStorage.getItem('saved_name');

        if (savedDate) {
            document.getElementById('birth-date').value = savedDate;
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
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NumerologyApp();
});
