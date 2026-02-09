// Numerology data and calculations
const NumerologyData = {
    // Calculate Life Path Number from birth date
    calculateLifePathNumber: function(dateString) {
        if (!dateString) return null;

        const [year, month, day] = dateString.split('-').map(Number);

        // Sum all digits
        let sum = 0;
        // Year
        sum += Math.floor(year / 1000) + Math.floor((year % 1000) / 100) + Math.floor((year % 100) / 10) + (year % 10);
        // Month
        sum += Math.floor(month / 10) + (month % 10);
        // Day
        sum += Math.floor(day / 10) + (day % 10);

        // Reduce to single digit (except master numbers 11, 22, 33)
        while (sum > 9) {
            if (sum === 11 || sum === 22 || sum === 33) return sum;
            sum = Math.floor(sum / 10) + (sum % 10);
        }

        return sum;
    },

    // Calculate Expression Number from name
    calculateExpressionNumber: function(name) {
        if (!name) return null;

        // A=1, B=2, ... Z=26 (regardless of case)
        let sum = 0;
        const cleaned = name.toUpperCase().replace(/[^A-Z가-힣]/g, '');

        for (let i = 0; i < cleaned.length; i++) {
            const char = cleaned[i];
            if (char >= 'A' && char <= 'Z') {
                sum += char.charCodeAt(0) - 64; // A=1, B=2, ...
            } else if (char >= '가' && char <= '힣') {
                // Korean characters: assign numerological values
                sum += ((char.charCodeAt(0) - 0xAC00) % 19) + 1;
            }
        }

        // Reduce to single digit (except master numbers)
        while (sum > 9) {
            if (sum === 11 || sum === 22 || sum === 33) return sum;
            sum = Math.floor(sum / 10) + (sum % 10);
        }

        return sum;
    },

    // Get numerology meaning for a number (1-33)
    getMeaning: function(number) {
        const meanings = {
            1: {
                name: "Leader",
                personality: "Independent, ambitious, pioneering, determined, courageous",
                strengths: ["Leadership", "Ambition", "Courage", "Innovation", "Self-reliance"],
                weaknesses: ["Arrogance", "Impatience", "Stubbornness", "Domination", "Insensitivity"],
                career: ["Executive", "Entrepreneur", "Pioneer", "CEO", "Manager"],
                love: "Passionate and direct in love, seeks dominant role, needs independence",
                color: "Red",
                day: "1, 10, 19, 28",
                compatible: "3, 5, 7",
                isMaster: false
            },
            2: {
                name: "Peacemaker",
                personality: "Diplomatic, sensitive, intuitive, cooperative, harmonious",
                strengths: ["Diplomacy", "Intuition", "Sensitivity", "Cooperation", "Balance"],
                weaknesses: ["Passivity", "Indecision", "Overly sensitive", "Dependency", "Shyness"],
                career: ["Diplomat", "Counselor", "Teacher", "Artist", "Mediator"],
                love: "Romantic, sensitive, seeks stable partnerships, values harmony",
                color: "Green",
                day: "2, 11, 20, 29",
                compatible: "4, 6, 8",
                isMaster: false
            },
            3: {
                name: "Creator",
                personality: "Creative, expressive, joyful, optimistic, communicative",
                strengths: ["Creativity", "Communication", "Optimism", "Sociability", "Enthusiasm"],
                weaknesses: ["Superficiality", "Scattered energy", "Irresponsibility", "Mood swings", "Impatience"],
                career: ["Artist", "Writer", "Entertainer", "Designer", "Musician"],
                love: "Flirty, charming, enjoys romantic excitement, values expression",
                color: "Yellow",
                day: "3, 12, 21, 30",
                compatible: "1, 5, 9",
                isMaster: false
            },
            4: {
                name: "Builder",
                personality: "Practical, stable, hardworking, disciplined, dependable",
                strengths: ["Stability", "Discipline", "Practicality", "Reliability", "Hard work"],
                weaknesses: ["Rigidity", "Stubbornness", "Lack of flexibility", "Dullness", "Heaviness"],
                career: ["Engineer", "Builder", "Manager", "Accountant", "Craftsperson"],
                love: "Loyal, steady, seeks security, traditional in approach to relationships",
                color: "Blue",
                day: "4, 13, 22, 31",
                compatible: "2, 6, 8",
                isMaster: false
            },
            5: {
                name: "Explorer",
                personality: "Adventurous, versatile, freedom-loving, dynamic, curious",
                strengths: ["Adaptability", "Versatility", "Curiosity", "Freedom", "Dynamism"],
                weaknesses: ["Restlessness", "Impulsiveness", "Irresponsibility", "Inconsistency", "Addiction"],
                career: ["Salesman", "Travel Agent", "Journalist", "Entrepreneur", "Explorer"],
                love: "Enjoys variety, fears commitment, seeks excitement and freedom",
                color: "Orange",
                day: "5, 14, 23",
                compatible: "1, 3, 7",
                isMaster: false
            },
            6: {
                name: "Caretaker",
                personality: "Responsible, nurturing, compassionate, loving, idealistic",
                strengths: ["Responsibility", "Compassion", "Nurturing", "Idealism", "Loyalty"],
                weaknesses: ["Martyrdom", "Intrusiveness", "Stubbornness", "Judgment", "Self-pity"],
                career: ["Counselor", "Healer", "Teacher", "Caregiver", "Social worker"],
                love: "Devoted, caring, seeks meaningful relationships, values family",
                color: "Pink",
                day: "6, 15, 24",
                compatible: "2, 4, 9",
                isMaster: false
            },
            7: {
                name: "Seeker",
                personality: "Analytical, spiritual, mysterious, intellectual, introspective",
                strengths: ["Analysis", "Spirituality", "Intuition", "Wisdom", "Introspection"],
                weaknesses: ["Isolation", "Suspicion", "Secrecy", "Pessimism", "Aloofness"],
                career: ["Researcher", "Scientist", "Analyst", "Spiritual guide", "Philosopher"],
                love: "Seeks deep spiritual connection, aloof, takes time to trust",
                color: "Violet",
                day: "7, 16, 25",
                compatible: "1, 5, 9",
                isMaster: false
            },
            8: {
                name: "Powerhouse",
                personality: "Ambitious, authoritative, powerful, success-oriented, executive",
                strengths: ["Ambition", "Power", "Executive ability", "Authority", "Material success"],
                weaknesses: ["Materialism", "Greed", "Aggression", "Ruthlessness", "Control issues"],
                career: ["Executive", "Entrepreneur", "Manager", "Banker", "Politician"],
                love: "Seeks power balance, respects strength, ambitious in relationships",
                color: "Gray",
                day: "8, 17, 26",
                compatible: "2, 4, 6",
                isMaster: false
            },
            9: {
                name: "Humanitarian",
                personality: "Compassionate, generous, tolerant, idealistic, universal",
                strengths: ["Compassion", "Generosity", "Tolerance", "Idealism", "Wisdom"],
                weaknesses: ["Emotional extremes", "Sacrifice", "Idealism", "Disconnection", "Indifference"],
                career: ["Humanitarian", "Counselor", "Teacher", "Activist", "Healer"],
                love: "Seeks universal love, deep compassion, sometimes detached emotionally",
                color: "Gold",
                day: "9, 18, 27",
                compatible: "3, 6, 9",
                isMaster: false
            },
            11: {
                name: "Master Illuminator",
                personality: "Intuitive, insightful, inspirational, visionary, spiritual awakening",
                strengths: ["Intuition", "Insight", "Inspiration", "Spiritual awareness", "Teaching"],
                weaknesses: ["Indecision", "Anxiety", "Impracticality", "Nervous tension", "Unrealistic"],
                career: ["Visionary", "Counselor", "Mentor", "Spiritual leader", "Inventor"],
                love: "Seeks deep spiritual connection, idealistic, transformative relationships",
                color: "Silver",
                day: "11, 20, 29",
                compatible: "2, 11, 22, 33",
                isMaster: true
            },
            22: {
                name: "Master Builder",
                personality: "Visionary, practical, powerful, transformative, builder of legacy",
                strengths: ["Vision", "Practicality", "Power", "Discipline", "Legacy building"],
                weaknesses: ["Overwhelm", "Self-doubt", "Controlling", "Inflexibility", "Perfectionism"],
                career: ["Architect", "Leader", "CEO", "Master builder", "Visionary entrepreneur"],
                love: "Seeks lasting legacy, values partnership with shared vision",
                color: "Purple",
                day: "22",
                compatible: "4, 11, 22, 33",
                isMaster: true
            },
            33: {
                name: "Master Teacher",
                personality: "Evolved, compassionate, teacher of masses, enlightened, transformative",
                strengths: ["Compassion", "Teaching", "Healing", "Enlightenment", "Blessings"],
                weaknesses: ["Sacrifice", "Overwhelm", "Perfectionism", "Emotional sensitivity", "Unrealistic"],
                career: ["Great teacher", "Healer", "Spiritual guide", "Counselor", "Illuminated leader"],
                love: "Seeks to uplift others, unconditional love, world service orientation",
                color: "Magenta",
                day: "33",
                compatible: "6, 9, 11, 22, 33",
                isMaster: true
            }
        };

        return meanings[number] || null;
    },

    // Calculate compatibility between two numbers
    calculateCompatibility: function(num1, num2) {
        // Ensure both are valid numbers
        if (!num1 || !num2 || num1 < 1 || num1 > 33 || num2 < 1 || num2 > 33) {
            return null;
        }

        // Base compatibility calculation
        let compatibility = 50; // Start at 50%

        // Same numbers are perfect
        if (num1 === num2) return 100;

        // Master numbers with each other have high compatibility
        const masterNumbers = [11, 22, 33];
        if (masterNumbers.includes(num1) && masterNumbers.includes(num2)) {
            compatibility = 90;
        }

        // Complementary pairs
        const pairs = {
            "1-3": 90, "1-5": 85, "1-7": 80, "1-9": 75,
            "2-4": 95, "2-6": 90, "2-8": 75, "2-11": 85,
            "3-5": 85, "3-9": 90,
            "4-6": 90, "4-8": 85,
            "5-7": 80, "5-3": 85, "5-1": 85,
            "6-9": 95, "6-2": 90, "6-4": 90,
            "7-5": 80, "7-9": 75,
            "8-4": 85, "8-2": 75, "8-6": 85,
            "9-3": 90, "9-6": 95, "9-7": 75, "9-9": 100
        };

        const key1 = `${num1}-${num2}`;
        const key2 = `${num2}-${num1}`;

        if (pairs[key1]) return pairs[key1];
        if (pairs[key2]) return pairs[key2];

        // Default compatibility based on number difference
        const diff = Math.abs(num1 - num2);
        if (diff <= 2) compatibility = 80;
        else if (diff <= 5) compatibility = 70;
        else if (diff <= 10) compatibility = 60;

        return compatibility;
    }
};

// Ensure the object is accessible globally
window.NumerologyData = NumerologyData;
