const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// @POST /api/ai/generate-email
const generateEmail = async(req, res) => {
        try {
            const { type, customerName, company, context } = req.body;

            if (!type || !customerName) {
                return res.status(400).json({ message: 'Type and customer name are required' });
            }

            const prompt = `You are a professional sales and marketing expert. Generate a ${type} email for a customer named "${customerName}" ${company ? `from company "${company}"` : ''}. ${context ? `Additional context: ${context}` : ''}
    
    The email should be:
    - Professional but friendly
    - Clear and concise
    - Have a compelling subject line
    - Include a call to action
    
    Format the response as:
    Subject: [subject line]
    
    [email body]`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    res.json({ email: text });
  } catch (error) {
    console.error('AI Email Error:', error.message);
    res.status(500).json({ message: 'AI generation failed', error: error.message });
  }
};

// @POST /api/ai/customer-insights
const customerInsights = async (req, res) => {
  try {
    const { customers } = req.body;

    if (!customers || customers.length === 0) {
      return res.status(400).json({ message: 'Customer data is required' });
    }

    const prompt = `You are a business analytics AI expert. Analyze the following customer data and provide actionable insights:

    Customer Data:
    ${JSON.stringify(customers, null, 2)}

    Provide:
    1. Top 3 high-value customers and why
    2. Customers at risk of churning
    3. Best follow-up recommendations
    4. Revenue optimization suggestions
    5. Customer segmentation analysis
    
    Be specific and use the actual customer names and data provided.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    res.json({ insights: text });
  } catch (error) {
    console.error('AI Insights Error:', error.message);
    res.status(500).json({ message: 'AI generation failed', error: error.message });
  }
};

// @POST /api/ai/meeting-summary
const meetingSummary = async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ message: 'Meeting transcript is required' });
    }

    const prompt = `You are a professional meeting assistant. Analyze this meeting transcript and generate a structured summary:

    Transcript:
    "${transcript}"

    Provide:
    1. **Meeting Summary** (2-3 sentences)
    2. **Key Discussion Points** (bullet points)
    3. **Action Items** (who needs to do what, with deadlines if mentioned)
    4. **Follow-up Tasks** (next steps)
    5. **Important Decisions Made**
    
    Format it cleanly with markdown.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    res.json({ summary: text });
  } catch (error) {
    console.error('AI Summary Error:', error.message);
    res.status(500).json({ message: 'AI generation failed', error: error.message });
  }
};

// @POST /api/ai/chat
const aiChat = async (req, res) => {
  try {
    const { message, crmData } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const prompt = `You are an AI assistant for a CRM (Customer Relationship Management) system. The user is a business owner or sales team member.

    ${crmData ? `Here's the current CRM data for context:\n${JSON.stringify(crmData, null, 2)}\n` : ''}

    User's question: "${message}"

    Provide a helpful, concise response. If asked about data, reference the actual CRM data provided. If asked for suggestions, be specific and actionable.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    res.status(500).json({ message: 'AI generation failed', error: error.message });
  }
};

// @POST /api/ai/lead-scoring
const leadScoring = async (req, res) => {
  try {
    const { leads } = req.body;

    if (!leads || leads.length === 0) {
      return res.status(400).json({ message: 'Lead data is required' });
    }

    const prompt = `You are an AI sales expert. Analyze these leads and provide a conversion probability score for each:

    Leads Data:
    ${JSON.stringify(leads, null, 2)}

    For each lead provide:
    - Lead title/name
    - Conversion score (0-100%)
    - Reasoning (1 sentence)
    - Recommended action
    
    Also provide an overall summary of the sales pipeline health.
    Format as clean markdown.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    res.json({ scoring: text });
  } catch (error) {
    console.error('AI Scoring Error:', error.message);
    res.status(500).json({ message: 'AI generation failed', error: error.message });
  }
};

module.exports = { generateEmail, customerInsights, meetingSummary, aiChat, leadScoring };