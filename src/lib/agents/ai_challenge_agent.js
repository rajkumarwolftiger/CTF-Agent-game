import { GoogleGenerativeAI } from '@google/generative-ai';
import BaseAgent from './base_agent';

class AiChallengeAgent extends BaseAgent {
    constructor() {
        super('AiChallengeAgent', 'Architect');
        this.genAI = null;
        this.model = null;
    }

    _init() {
        if (!this.genAI) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            // Enable Google Search Tool for real-time data
            this.model = this.genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                tools: [{ googleSearch: {} }]
            });
        }
    }

    async execute(context) {
        this._init();
        // Context: { difficultyLevel, topic (optional) }
        const { difficultyLevel = 'Easy' } = context;

        const prompt = `
            You are a CTF Challenge Architect. 
            Step 1: Search for a real-world cybersecurity vulnerability (CVE) or exploit technique from the last 12 months.
            Step 2: Create a CTF challenge based on that specific vulnerability.
            
            Difficulty: ${difficultyLevel}
            
            The output must be a valid JSON object with this exact structure:
            {
                "id": "unique-id-string",
                "title": "Challenge Title (include the CVE ID if applicable)",
                "category": "Category Name",
                "difficulty": "${difficultyLevel}",
                "description": "Mission Briefing: Describe the scenario involving this specific real-world vulnerability. Do not reveal the flag yet.",
                "flag": "ctf{unique_flag_value}",
                "hints": ["Hint 1", "Hint 2"],
                "explanation": "Explain the real-world CVE and how this challenge simulates it.",
                "simulation": {
                    "tool": "Tool Name (e.g., nmap, wireshark, sqlmap)",
                    "command_trigger": "The command keyword (e.g., nmap)",
                    "output": "Realistic tool output showing the vulnerability. If nmap, show the specific service version associated with the CVE.",
                    "files": {
                        "filename.txt": "Content of the file (e.g., robots.txt content, or a password file)"
                    }
                }
            }

            For 'simulation.output', ensure it looks exactly like the real tool's output.
            For 'simulation.files', create realistic files relevant to the challenge (e.g., robots.txt, config.php, shadow).
            For Easy: Use simple misconfigurations or well-known default creds.
            For Medium: Use specific CVEs that require version detection.
            For Hard: Use complex RCEs or recent zero-days (simulated).

            Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            // Clean up potential markdown code blocks
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const challenge = JSON.parse(jsonStr);

            // Ensure ID is unique-ish
            challenge.id = `ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            return challenge;
        } catch (error) {
            console.error("AI Generation Error:", error);
            return null;
        }
    }
}

export default new AiChallengeAgent();
