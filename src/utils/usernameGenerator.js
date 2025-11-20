// Anonymous PantryPal-style username generator
// Generates fun, food-themed usernames like "GenerousBanana42" or "HappyCarrot88"

const adjectives = [
    'Happy', 'Generous', 'Kind', 'Friendly', 'Cheerful',
    'Helpful', 'Caring', 'Sharing', 'Grateful', 'Joyful',
    'Fresh', 'Tasty', 'Yummy', 'Sweet', 'Savory',
    'Crispy', 'Juicy', 'Ripe', 'Golden', 'Bright'
];

const nouns = [
    'Apple', 'Banana', 'Carrot', 'Tomato', 'Pepper',
    'Lettuce', 'Cucumber', 'Broccoli', 'Potato', 'Onion',
    'Bread', 'Cheese', 'Milk', 'Yogurt', 'Butter',
    'Rice', 'Pasta', 'Bean', 'Corn', 'Pumpkin',
    'Berry', 'Melon', 'Orange', 'Grape', 'Peach'
];

const pantryPalThemed = [
    'PantryPal', 'ShareChef', 'KindCook', 'FoodSaver', 'GroceryHero',
    'WasteBuster', 'MunichMuncher', 'BavarianBite', 'IsarEater'
];

/**
 * Generate a random anonymous username
 * @param {boolean} includeTheme - Whether to include PantryPal-themed usernames
 * @returns {string} Generated username (e.g., "GenerousBanana42" or "PantryPal_123")
 */
export const generateUsername = (includeTheme = true) => {
    const randomNumber = Math.floor(Math.random() * 1000);

    // 30% chance to get a PantryPal-themed username
    if (includeTheme && Math.random() < 0.3) {
        const themeName = pantryPalThemed[Math.floor(Math.random() * pantryPalThemed.length)];
        return `${themeName}_${randomNumber}`;
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
 * @param {boolean} includeTheme - Whether to include PantryPal-themed usernames
 * @returns {Promise<string>} Unique username
 */
export const generateUniqueUsername = async (db, includeTheme = true) => {
    let username;
    let attempts = 0;
    const maxAttempts = 10;

    do {
        username = generateUsername(includeTheme);
        attempts++;

        if (attempts >= maxAttempts) {
            // Fallback: add timestamp to ensure uniqueness
            username = `${username}_${Date.now()}`;
            break;
        }
    } while (!(await isUsernameAvailable(username, db)));

    return username;
};
