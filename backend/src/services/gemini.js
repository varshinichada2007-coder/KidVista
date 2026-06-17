const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

let genAI = null;
if (API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(API_KEY);
    console.log('✔ Gemini AI integration active.');
  } catch (error) {
    console.warn('⚠️ Failed to initialize Gemini AI: ' + error.message);
  }
} else {
  console.log('ℹ No Gemini API key provided. Using template-based local fallback generators.');
}

/**
 * Generate a preschool parent-friendly caption based on activity description
 */
async function generateCaption(description) {
  if (!description) return 'Exploring new learning activities today!';

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Write a short, engaging, single-sentence photo caption for a preschool newsletter/portal based on this activity description: "${description}". The caption should be sweet, enthusiastic, child-friendly, and celebrate their learning. Max 25 words. Do not include quotes around the caption.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      // Remove any surrounding quotes
      text = text.replace(/^["']|["']$/g, '');
      return text;
    } catch (error) {
      console.error('Gemini generateCaption error, using fallback:', error.message);
    }
  }

  // Fallback Template Generator
  const desc = description.toLowerCase();
  if (desc.includes('paint') || desc.includes('art') || desc.includes('color') || desc.includes('drawing')) {
    return 'Our little artists had a blast exploring vibrant colors and expressing their imagination today!';
  } else if (desc.includes('sport') || desc.includes('run') || desc.includes('jump') || desc.includes('play')) {
    return 'Energized and active! Our tiny champions had so much fun building strength and teamwork skills.';
  } else if (desc.includes('music') || desc.includes('sing') || desc.includes('song') || desc.includes('dance')) {
    return 'Dancing to the beat! Our little learners filled the room with joyful music and coordination.';
  } else if (desc.includes('story') || desc.includes('read') || desc.includes('book')) {
    return 'Lost in a world of wonder! Curiosities sparked as we enjoyed an interactive story reading session.';
  } else if (desc.includes('celebrate') || desc.includes('party') || desc.includes('festival')) {
    return 'Joyful smiles all around! Celebrating special moments and building beautiful school memories.';
  }
  
  return `Smiles, learning, and fun! Enjoying our preschool activity: "${description.length > 40 ? description.substring(0, 40) + '...' : description}"`;
}

/**
 * Generate a short parent-friendly activity summary detailing benefits
 */
async function generateSummary(title, description) {
  if (!title) return 'Children enjoyed an interactive development session today.';

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Write a professional, parent-friendly activity summary (max 3 sentences) for a preschool dashboard based on this activity: Title: "${title}", Description: "${description}". Outline what the children did and what developmental skills (like coordination, creativity, socialization, focus, or motor skills) they developed. Format as a warm message.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Gemini generateSummary error, using fallback:', error.message);
    }
  }

  // Fallback Template Generator
  const category = (title + ' ' + (description || '')).toLowerCase();
  if (category.includes('paint') || category.includes('art') || category.includes('color') || category.includes('draw')) {
    return `Today, the children participated in a creative art session. This hands-on activity helped improve their fine motor skills, hand-eye coordination, and allowed them to express their unique imaginations through colors.`;
  } else if (category.includes('sport') || category.includes('run') || category.includes('jump') || category.includes('play')) {
    return `Today, our little ones engaged in physical play. This activity focused on developing gross motor skills, balancing, and cooperative teamwork, promoting healthy lifestyles and physical coordination.`;
  } else if (category.includes('music') || category.includes('sing') || category.includes('dance')) {
    return `Today was filled with rhythm and music! The children practiced movement, auditory skills, and self-expression, fostering memory, rhythm coordination, and confidence.`;
  } else if (category.includes('story') || category.includes('read') || category.includes('book')) {
    return `Today we held a storytelling circle. This session enhanced language skills, vocabulary, active listening, and cognitive imagination as the children engaged with the plot.`;
  } else if (category.includes('math') || category.includes('count') || category.includes('number') || category.includes('learn')) {
    return `Today was a cognitive learning session. By engaging with shapes or numbers, children built foundations in logical thinking, critical analysis, and spatial awareness.`;
  }

  return `Today, the children participated in a delightful group activity. This session focused on building classroom socialization, focus, and peer-to-peer collaboration in a friendly environment.`;
}

module.exports = {
  generateCaption,
  generateSummary
};
