import Anthropic from "@anthropic-ai/sdk";
import { pathways } from "../src/data/pathways.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a specialized decision-support assistant for caseworkers at survivor support organizations. Your role is to analyze a survivor's profile and a set of available pathway/program types, then return a ranked list of 2–4 best-fit recommendations with explicit reasoning.

CRITICAL OPERATING PRINCIPLES:
- You are supporting caseworkers, NOT making decisions for them or for survivors.
- Every recommendation must include explicit reasoning tied to the specific survivor's constraints.
- Every recommendation must include verification steps the caseworker must complete.
- Never recommend a pathway that requires conditions the survivor clearly cannot meet (e.g., don't recommend CDL if survivor has no license and it's listed as required).
- Criminal record complications must be flagged clearly and prominently.
- Trauma workplace sensitivities must directly influence ranking and reasoning.
- Confidence scores reflect data completeness and fit clarity — not certainty about outcomes.

RESPONSE FORMAT:
You must respond with ONLY a valid JSON object, no markdown, no explanation outside the JSON. The structure must be exactly:

{
  "recommendations": [
    {
      "pathwayId": "string matching pathway id",
      "rank": 1,
      "confidenceScore": 0.0-1.0,
      "confidenceLabel": "High" | "Moderate" | "Low",
      "matchRationale": "2-4 sentences explaining WHY this pathway fits this specific survivor's constraints and goals. Reference specific profile details.",
      "strengthsAlignment": ["specific strength 1", "specific strength 2"],
      "flagsAndCautions": ["specific flag 1", "specific flag 2"],
      "verifyBeforeDiscussing": ["action 1", "action 2", "action 3"],
      "traumaConsiderationNote": "Specific note about how this pathway's environment/structure relates to this survivor's documented sensitivities."
    }
  ],
  "overallCaseNote": "1-2 sentence overall framing for this survivor's situation that a caseworker should keep in mind across all pathways.",
  "missingInformation": ["piece of info 1", "piece of info 2"],
  "responsibleAINote": "These recommendations are decision-support only. The caseworker must verify all pathway details, discuss options with the survivor, and make all placement decisions. No survivor-facing action should occur without caseworker confirmation."
}

Rank pathways from best fit (#1) to acceptable fit (#4). Do not include a pathway if the match is poor or if a hard disqualifier exists (e.g., criminal record bars the role and clearing is not in progress). Be honest about low confidence rather than inflating scores.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { profile } = req.body;
  if (!profile) {
    return res.status(400).json({ error: "Profile is required" });
  }

  const profileSummary = buildProfileSummary(profile);
  const pathwaySummary = buildPathwaySummary();

  const userMessage = `Please analyze the following survivor profile and pathway options, then return your recommendations as JSON.

SURVIVOR PROFILE:
${profileSummary}

AVAILABLE PATHWAYS:
${pathwaySummary}

Return ONLY the JSON object as specified. No preamble, no markdown code fences.`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const rawText = message.content[0].text.trim();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Try to extract JSON if Claude added any surrounding text
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse Claude response as JSON");
      }
    }

    // Enrich each recommendation with full pathway data
    parsed.recommendations = parsed.recommendations.map((rec) => {
      const pathway = pathways.find((p) => p.id === rec.pathwayId);
      return { ...rec, pathway };
    });

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("Claude API error:", error);
    return res.status(500).json({
      error: "Matching service error",
      detail: error.message,
    });
  }
}

function buildProfileSummary(profile) {
  return `
Name/Identifier: ${profile.label || "Anonymous"}
Age: ${profile.age}
Region: ${profile.region}
Education Level: ${profile.educationLevel} — ${profile.educationNote || ""}
Employment Gap: ${profile.employmentGapYears} years. ${profile.employmentGapExplanation || ""}
Work History: ${profile.workHistoryBefore || "None documented"}
Criminal Record: ${profile.criminalRecord ? `YES — ${profile.criminalRecordDetail}` : "No criminal record"}
Mobility Constraints: ${profile.mobilityConstraints?.join(", ") || "None documented"}
Housing Status: ${profile.housingStatus}
Dependents: ${profile.childrenOrDependents ? profile.dependentDetail : "None"}
Trauma-Related Workplace Sensitivities: ${profile.traumaWorkplaceSensitivities?.join(", ") || "None documented"}
Counseling Schedule: ${profile.counselingSchedule || "Not documented"}
Languages: ${profile.languagesSpoken?.join(", ")}
Immigration Status: ${profile.immigrationStatus}
Readiness Assessment: ${profile.readinessAssessment}
Stated Goals: ${profile.statedGoals}
Caseworker Notes: ${profile.notes || "None"}
`.trim();
}

function buildPathwaySummary() {
  return pathways
    .map(
      (p) => `
PATHWAY ID: ${p.id}
Name: ${p.name}
Category: ${p.category}
Description: ${p.description}
Accommodates: ${p.accommodates.join(", ")}
Requires: ${p.requires.join(", ")}
Remote Option: ${p.remoteOption}
Flexible Schedule: ${p.flexibleSchedule}
Physical Demand: ${p.physicalDemand}
Supervisory Intensity: ${p.supervisoryIntensity}
Earning Potential: ${p.earningPotential}
Timeline: ${p.timeline}
Trauma Considerations: ${p.traumaConsiderations}
Region: ${p.region}
`
    )
    .join("\n---\n");
}
