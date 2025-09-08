/**
 * Simple fuzzy search implementation
 * Based on fuzzy matching algorithms similar to Fuse.js
 */

class SimpleFuzzySearch {
    constructor(data, options = {}) {
        this.data = data;
        this.keys = options.keys || ['content'];
        this.threshold = options.threshold || 0.4;
    }

    search(query) {
        if (!query || query.length < 2) {
            return [];
        }

        const queryLower = query.toLowerCase();
        const results = [];

        this.data.forEach((item, index) => {
            const content = this.keys.map(key => item[key]).join(' ').toLowerCase();
            const score = this.calculateScore(queryLower, content);
            
            if (score >= this.threshold) {
                results.push({
                    item: item,
                    score: score
                });
            }
        });

        // Sort by score (higher is better)
        return results.sort((a, b) => b.score - a.score);
    }

    calculateScore(query, text) {
        // Simple fuzzy matching algorithm
        let score = 0;
        let queryPos = 0;
        let textPos = 0;
        let consecutiveMatches = 0;
        
        // Exact match bonus
        if (text.includes(query)) {
            score += 0.7;
        }

        // Character-by-character fuzzy matching
        while (queryPos < query.length && textPos < text.length) {
            if (query[queryPos] === text[textPos]) {
                queryPos++;
                consecutiveMatches++;
                score += 0.1 + (consecutiveMatches * 0.05);
            } else {
                consecutiveMatches = 0;
            }
            textPos++;
        }

        // Bonus for matching all characters
        if (queryPos === query.length) {
            score += 0.3;
        }

        // Word start bonus
        const words = text.split(/\s+/);
        words.forEach(word => {
            if (word.startsWith(query)) {
                score += 0.5;
            }
        });

        return Math.min(score, 1.0);
    }
}

// Export for browser use
window.SimpleFuzzySearch = SimpleFuzzySearch;