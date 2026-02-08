const Sentiment = require('sentiment');
const sentiment = new Sentiment();

const analyzeReview = (text) => {
    const result = sentiment.analyze(text);
    // result.score: Positive number = good, Negative = bad
    let status = 'Neutral';
    if (result.score > 2) status = 'Positive';
    if (result.score < -2) status = 'Negative';

    return {
        score: result.score,
        comparative: result.comparative,
        status: status,
        words: result.words // Keywords triggered
    };
};

module.exports = analyzeReview;
