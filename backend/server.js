/**
 * NeuroRead Backend Server
 * AI-powered API for content summarization and analysis
 * 
 * Features:
 * - AI Summarization (OpenAI/Gemini API)
 * - Content extraction
 * - Reading difficulty analysis
 * - Key points extraction
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'NeuroRead API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * AI Summarization Endpoint
 * POST /api/summarize
 * Body: { text: string, maxPoints?: number }
 */
app.post('/api/summarize', async (req, res) => {
  try {
    const { text, maxPoints = 5 } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        error: 'Text is required'
      });
    }

    // Truncate text if too long
    const truncatedText = text.substring(0, 8000);
    
    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (apiKey) {
      // Use OpenAI API
      const summary = await getOpenAISummary(truncatedText, maxPoints, apiKey);
      return res.json({ summary });
    } else {
      // Fallback: Generate summary using local algorithm
      const summary = generateLocalSummary(truncatedText, maxPoints);
      return res.json({ summary, fallback: true });
    }
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({
      error: 'Failed to generate summary',
      message: error.message
    });
  }
});

/**
 * Key Points Extraction Endpoint
 * POST /api/keypoints
 * Body: { text: string }
 */
app.post('/api/keypoints', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        error: 'Text is required'
      });
    }

    const keyPoints = extractKeyPoints(text);
    res.json({ keyPoints });
  } catch (error) {
    console.error('Key points extraction error:', error);
    res.status(500).json({
      error: 'Failed to extract key points'
    });
  }
});

/**
 * Reading Difficulty Analysis Endpoint
 * POST /api/analyze
 * Body: { text: string }
 */
app.post('/api/analyze', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        error: 'Text is required'
      });
    }

    const analysis = analyzeReadingDifficulty(text);
    res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze text'
    });
  }
});

/**
 * Content Extraction Endpoint
 * POST /api/extract
 * Body: { url: string }
 */
app.post('/api/extract', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        error: 'URL is required'
      });
    }

    // Note: In production, implement actual web scraping
    // For hackathon demo, return mock data
    res.json({
      url,
      title: 'Extracted Article Title',
      content: 'Article content would be extracted here...',
      author: 'Author Name',
      publishDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({
      error: 'Failed to extract content'
    });
  }
});

/**
 * OpenAI API Integration
 */
async function getOpenAISummary(text, maxPoints, apiKey) {
  const axios = require('axios');
  
  const prompt = `Summarize the following text into ${maxPoints} key bullet points. 
Make it concise and easy to read for someone with ADHD or dyslexia.
Use simple language and short sentences.

Text: ${text}

Format your response as HTML bullet points (<ul><li>...</li></ul>).`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates accessible summaries for neurodivergent readers.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.5
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    throw error;
  }
}

/**
 * Local Summary Generation (Fallback)
 */
function generateLocalSummary(text, maxPoints) {
  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  // Score sentences based on importance indicators
  const scoredSentences = sentences.map(sentence => {
    let score = 0;
    const lowerSentence = sentence.toLowerCase();
    
    // Boost score for sentences with important keywords
    const importantWords = [
      'important', 'key', 'main', 'significant', 'crucial',
      'essential', 'critical', 'vital', 'major', 'primary',
      'conclusion', 'summary', 'result', 'finding', 'therefore'
    ];
    
    importantWords.forEach(word => {
      if (lowerSentence.includes(word)) score += 2;
    });
    
    // Boost for sentences at beginning and end
    const index = sentences.indexOf(sentence);
    if (index < 2) score += 3;
    if (index > sentences.length - 3) score += 2;
    
    // Boost for longer sentences (more content)
    score += Math.min(sentence.length / 50, 3);
    
    return { sentence: sentence.trim(), score };
  });
  
  // Sort by score and take top sentences
  scoredSentences.sort((a, b) => b.score - a.score);
  const topSentences = scoredSentences.slice(0, maxPoints);
  
  // Generate HTML bullet points
  const bulletPoints = topSentences.map(s => {
    // Clean up the sentence
    let cleanSentence = s.sentence
      .replace(/^\s+/, '')
      .replace(/\s+/g, ' ')
      .substring(0, 150);
    
    if (s.sentence.length > 150) cleanSentence += '...';
    
    return `<li>${cleanSentence}</li>`;
  });
  
  return `<ul>${bulletPoints.join('')}</ul>`;
}

/**
 * Extract Key Points from Text
 */
function extractKeyPoints(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const keyPoints = [];
  
  // Look for patterns that indicate key information
  const patterns = [
    /\b(first|second|third|finally|lastly)\b/i,
    /\b(important|significant|crucial|essential)\b/i,
    /\b(result|conclusion|finding|summary)\b/i,
    /\b(for example|such as|like)\b/i,
    /\b(however|therefore|thus|consequently)\b/i
  ];
  
  sentences.forEach(sentence => {
    patterns.forEach(pattern => {
      if (pattern.test(sentence) && sentence.length > 20) {
        keyPoints.push(sentence.trim());
      }
    });
  });
  
  // Remove duplicates and limit
  return [...new Set(keyPoints)].slice(0, 10);
}

/**
 * Analyze Reading Difficulty
 */
function analyzeReadingDifficulty(text) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  // Calculate metrics
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
  const avgSentenceLength = words.length / sentences.length;
  
  // Count syllables (simplified)
  const syllableCount = words.reduce((sum, word) => {
    return sum + countSyllables(word);
  }, 0);
  
  const avgSyllablesPerWord = syllableCount / words.length;
  
  // Flesch Reading Ease Score
  const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  
  // Determine difficulty level
  let difficulty, level;
  if (fleschScore >= 90) {
    difficulty = 'Very Easy';
    level = '5th grade';
  } else if (fleschScore >= 80) {
    difficulty = 'Easy';
    level = '6th grade';
  } else if (fleschScore >= 70) {
    difficulty = 'Fairly Easy';
    level = '7th grade';
  } else if (fleschScore >= 60) {
    difficulty = 'Standard';
    level = '8th-9th grade';
  } else if (fleschScore >= 50) {
    difficulty = 'Fairly Difficult';
    level = '10th-12th grade';
  } else if (fleschScore >= 30) {
    difficulty = 'Difficult';
    level = 'College';
  } else {
    difficulty = 'Very Difficult';
    level = 'College Graduate';
  }
  
  return {
    metrics: {
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgWordLength: avgWordLength.toFixed(2),
      avgSentenceLength: avgSentenceLength.toFixed(2),
      avgSyllablesPerWord: avgSyllablesPerWord.toFixed(2),
      fleschScore: fleschScore.toFixed(2)
    },
    difficulty: {
      level: difficulty,
      gradeLevel: level
    },
    recommendations: generateRecommendations(fleschScore, avgSentenceLength)
  };
}

/**
 * Count syllables in a word
 */
function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  
  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(fleschScore, avgSentenceLength) {
  const recommendations = [];
  
  if (fleschScore < 60) {
    recommendations.push('Consider simplifying vocabulary for better accessibility');
  }
  
  if (avgSentenceLength > 20) {
    recommendations.push('Break long sentences into shorter ones');
  }
  
  if (fleschScore < 50) {
    recommendations.push('Use Bionic Reading mode to help guide the eye');
    recommendations.push('Enable Focus Mode to reduce distractions');
  }
  
  recommendations.push('Use Dyslexia-friendly font for better readability');
  recommendations.push('Enable word highlighting to maintain focus');
  
  return recommendations;
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🧠 NeuroRead Backend Server                          ║
║   Making the web accessible for everyone               ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║   Server running on port ${PORT}                        ║
║   Health check: http://localhost:${PORT}/api/health    ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
