// controllers/aiController.js
// AI-powered complaint analysis using OpenRouter API (free LLM)

const fetch = require("node-fetch");
const Complaint = require("../models/Complaint");

// OpenRouter API base URL
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const AI_MODEL = "openai/gpt-3.5-turbo"; // Free model on OpenRouter

/**
 * Helper: Call OpenRouter AI API
 */
const callAI = async (prompt) => {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost:5000",
      "X-Title": "Complaint Management System",
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
};

// @desc    Analyze a complaint with AI
// @route   POST /api/ai/analyze
// @access  Private
const analyzeComplaint = async (req, res) => {
  const { complaintId } = req.body;

  if (!complaintId) {
    return res.status(400).json({ message: "complaintId is required" });
  }

  try {
    // Fetch complaint from DB
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Build AI prompt — ask for JSON-structured response
    const prompt = `
You are an AI assistant for a government complaint management system in India.
Analyze the following complaint and respond ONLY with a valid JSON object (no extra text).

Complaint Details:
- Title: ${complaint.title}
- Category: ${complaint.category}
- Description: ${complaint.description}
- Location: ${complaint.location}

Respond with this exact JSON structure:
{
  "priority": "<High | Medium | Low>",
  "department": "<Name of the government department responsible>",
  "summary": "<2-3 sentence summary of the complaint>",
  "autoResponse": "<A polite, professional response to the citizen who filed the complaint. 2-3 sentences.>"
}

Rules:
- priority: High if involves safety/health/emergency, Medium for infrastructure issues, Low for minor issues
- department: Must be specific (e.g., "Jal Board - Water Supply Department", "PVVNL - Electricity Department", "Municipal Corporation - Sanitation Department")
- summary: Concise neutral summary
- autoResponse: Warm, empathetic, professional tone addressed to the citizen
`;

    const rawResponse = await callAI(prompt);

    // Parse JSON from AI response
    let aiResult;
    try {
      // Extract JSON from response (AI may wrap in backticks)
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in AI response");
      aiResult = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("JSON parse error:", parseError.message);
      console.error("Raw AI response:", rawResponse);
      // Fallback values
      aiResult = {
        priority: "Medium",
        department: "Municipal Corporation",
        summary: rawResponse.substring(0, 200),
        autoResponse:
          "Thank you for your complaint. We have received your submission and will process it shortly.",
      };
    }

    // Save AI results back to the complaint document
    complaint.aiAnalysis = {
      priority: aiResult.priority || "Medium",
      department: aiResult.department || "Municipal Corporation",
      summary: aiResult.summary || "",
      autoResponse: aiResult.autoResponse || "",
      analyzedAt: new Date(),
    };
    await complaint.save();

    res.json({
      message: "AI analysis complete",
      complaintId: complaint._id,
      aiAnalysis: complaint.aiAnalysis,
    });
  } catch (error) {
    console.error("AI Analysis Error:", error.message);
    res.status(500).json({ message: "AI analysis failed: " + error.message });
  }
};

// @desc    Quick AI analysis without saving (for direct input)
// @route   POST /api/ai/quick-analyze
// @access  Private
const quickAnalyze = async (req, res) => {
  const { title, description, category, location } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: "title and description are required" });
  }

  try {
    const prompt = `
You are an AI assistant for a government complaint management system in India.
Analyze the following complaint and respond ONLY with a valid JSON object.

Complaint:
- Title: ${title}
- Category: ${category || "General"}
- Description: ${description}
- Location: ${location || "Not specified"}

Respond ONLY with this JSON:
{
  "priority": "<High | Medium | Low>",
  "department": "<Specific government department name>",
  "summary": "<2-3 sentence summary>",
  "autoResponse": "<Professional response to citizen>"
}
`;

    const rawResponse = await callAI(prompt);

    let aiResult;
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      aiResult = JSON.parse(jsonMatch[0]);
    } catch {
      aiResult = {
        priority: "Medium",
        department: "Municipal Corporation",
        summary: description.substring(0, 150),
        autoResponse:
          "Thank you for submitting your complaint. We will look into this matter promptly.",
      };
    }

    res.json({ aiAnalysis: aiResult });
  } catch (error) {
    res.status(500).json({ message: "Quick analysis failed: " + error.message });
  }
};

module.exports = { analyzeComplaint, quickAnalyze };
