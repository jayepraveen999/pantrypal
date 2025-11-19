// Anonymous Reddit-style username generator
// Generates usernames like: HungryPanda42, FoodNinja88, MunichMuncher_123

const adjectives = [
    'Hungry', 'Happy', 'Friendly', 'Kind', 'Generous', 'Awesome',
    'Cool', 'Swift', 'Brave', 'Clever', 'Wise', 'Jolly',
    'Mighty', 'Noble', 'Quick', 'Silent', 'Sneaky', 'Witty'
];

const nouns = [
    'Panda', 'Ninja', 'Tiger', 'Dragon', 'Phoenix', 'Wolf',
    'Eagle', 'Bear', 'Fox', 'Hawk', 'Lion', 'Owl',
    'Muncher', 'Foodie', 'Saver', 'Hero', 'Helper', 'Sharer'
];

const munichThemed = [
    'MunichMuncher', 'BavarianBite', 'IsarEater', 'SchwabiingSnacker',
    'MaxvorstadtMuncher', 'GlockenFoodie', 'MarienplatzMeal', 'EnglishGardenGrub'
];

/**
 * Generate a random anonymous username
 * @param {boolean} includeMunichTheme - Whether to include Munich-themed usernames
 * @returns {string} Generated username (e.g., "HungryPanda42" or "MunichMuncher_123")
 */
export const generateUsername = (includeMunichTheme = true) => {
    const randomNumber = Math.floor(Math.random() * 1000);

    // 30% chance to get a Munich-themed username
    if (includeMunichTheme && Math.random() < 0.3) {
        const munichName = munichThemed[Math.floor(Math.random() * munichThemed.length)];
        return `${munichName}_${randomNumber}`;
    }

    // Otherwise, generate adjective + noun combination
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adjective}${noun}${randomNumber}`;
};

/**
 * Check if username is available in Firestore
 * @param {string} username - Username to check
 * @param {Object} db - Firestore database instance
 * @returns {Promise<boolean>} True if available, false if taken
 */
export const isUsernameAvailable = async (username, db) => {
    const { collection, query, where, getDocs } = await import('firebase/firestore');

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const snapshot = await getDocs(q);

    return snapshot.empty;
};

/**
 * Generate a unique username (checks Firestore for duplicates)
 * @param {Object} db - Firestore database instance
 * @param {boolean} includeMunichTheme - Whether to include Munich-themed usernames
 * @returns {Promise<string>} Unique username
 */
export const generateUniqueUsername = async (db, includeMunichTheme = true) => {
    let username;
    let attempts = 0;
    const maxAttempts = 10;

    do {
        username = generateUsername(includeMunichTheme);
        attempts++;

        if (attempts >= maxAttempts) {
            // Fallback: add timestamp to ensure uniqueness
            username = `${username}_${Date.now()}`;
            break;
        }
    } while (!(await isUsernameAvailable(username, db)));

    return username;
};
