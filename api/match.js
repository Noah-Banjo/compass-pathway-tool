import Anthropic from "@anthropic-ai/sdk";
import { pathways } from "../src/data/pathways.js";

export const config = { maxDuration: 60 };

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a specialized decision-support assistant for caseworkers at survivor support organizations. Your role is to analyze a survivor's profile and a set of available pathway/program types, then return a ranked list of 2–4 best-fit recommendations with explicit reasoning.

CRITICAL OPERATING PRINCIPLES:
- You are supporting caseworkers, NOT making decisions for them or for survivors.
- Every recommendation must include explicit reasoning tied to the specific survivor's constraints.
- Every recommendation must include verification steps the caseworker must complete.
- Never recommend a pathway that requires conditions the survivor clearly cannot meet (e.g., don't recommend CDL if survivor has no license and it's listed as required).
- Criminal record complications must be flagged clearly and prominently.
- Trauma workplace sensitivities must directly influence ranking and reasoning.
- Confidence scores reflect data completeness and fit clarity — not certainty about outcomes.`;

const MATCH_TOOL = {
  name: "submit_pathway_recommendations",
  description: "Submit ranked pathway recommendations for a survivor profile. Call this once with your complete analysis.",
  input_schema: {
    type: "object",
    properties: {
      recommendations: {
        type: "array",
        minItems: 2,
        maxItems: 4,
        items: {
          type: "object",
          properties: {
            pathwayId: { type: "string", description: "Exact pathway id string from the provided list" },
            rank: { type: "integer", minimum: 1, maximum: 4 },
            confidenceScore: { type: "number", minimum: 0, maximum: 1 },
            confidenceLabel: { type: "string", enum: ["High", "Moderate", "Low"] },
            matchRationale: { type: "string", description: "2-4 sentences explaining WHY this pathway fits this specific survivor's constraints and goals, referencing specific profile details." },
            strengthsAlignment: { type: "array", items: { type: "string" }, minItems: 1 },
            flagsAndCautions: { type: "array", items: { type: "string" }, minItems: 1 },
            verifyBeforeDiscussing: { type: "array", items: { type: "string" }, minItems: 2 },
            traumaConsiderationNote: { type: "string", description: "Specific note about how this pathway's environment/structure relates to this survivor's documented sensitivities." },
          },
          required: ["pathwayId", "rank", "confidenceScore", "confidenceLabel", "matchRationale", "strengthsAlignment", "flagsAndCautions", "verifyBeforeDiscussing", "traumaConsiderationNote"],
        },
      },
      overallCaseNote: { type: "string", description: "1-2 sentence overall framing for this survivor's situation that a caseworker should keep in mind across all pathways." },
      missingInformation: { type: "array", items: { type: "string" } },
      responsibleAINote: { type: "string" },
    },
    required: ["recommendations", "overallCaseNote", "missingInformation", "responsibleAINote"],
  },
};

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

  const userMessage = `Analyze the following survivor profile and pathway options, then call submit_pathway_recommendations with your complete analysis.

SURVIVOR PROFILE:
${profileSummary}

AVAILABLE PATHWAYS:
${pathwaySummary}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools: [MATCH_TOOL],
      tool_choice: { type: "tool", name: "submit_pathway_recommendations" },
      messages: [{ role: "user", content: userMessage }],
    });

    const toolUse = message.content.find((b) => b.type === "tool_use");
    if (!toolUse) {
      const fallbackText = message.content.find((b) => b.type === "text")?.text || "(no content)";
      console.error("COMPASS: No tool_use block in response. Content:", JSON.stringify(message.content));
      return res.status(500).json({
        error: "Matching service error",
        detail: "Claude did not call the expected tool.",
        rawPreview: fallbackText.slice(0, 500),
      });
    }

    const parsed = toolUse.input;

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

function buildProfileSummary(p) {
  const lines = [
    `${p.label || "Anonymous"} | Age:${p.age} | Region:${p.region}`,
    `Education:${p.educationLevel}${p.educationNote ? " — " + p.educationNote : ""}`,
    `Gap:${p.employmentGapYears}yr${p.employmentGapExplanation ? " — " + p.employmentGapExplanation : ""}`,
    `Work history:${p.workHistoryBefore || "None"}`,
    `Criminal record:${p.criminalRecord ? "YES — " + p.criminalRecordDetail : "None"}`,
    `Mobility:${p.mobilityConstraints?.length ? p.mobilityConstraints.join(",") : "None"}`,
    `Housing:${p.housingStatus} | Dependents:${p.childrenOrDependents ? p.dependentDetail : "None"}`,
    `Trauma sensitivities:${p.traumaWorkplaceSensitivities?.join(",") || "None"}`,
    `Counseling:${p.counselingSchedule || "Not documented"}`,
    `Languages:${p.languagesSpoken?.join(",") || "Unknown"} | Immigration:${p.immigrationStatus}`,
    `Readiness:${p.readinessAssessment}`,
    `Goals:${p.statedGoals}`,
    p.notes ? `Notes:${p.notes}` : null,
  ];
  return lines.filter(Boolean).join("\n");
}

function buildPathwaySummary() {
  return pathways
    .map(
      (p) => `ID:${p.id} | ${p.name}
Accommodates:${p.accommodates.join(",")} | Requires:${p.requires.join(",")}
Remote:${p.remoteOption} | Flexible:${p.flexibleSchedule} | Physical:${p.physicalDemand} | Supervisory:${p.supervisoryIntensity}
Earning:${p.earningPotential} | Timeline:${p.timeline} | Region:${p.region}
Trauma:${p.traumaConsiderations}`
    )
    .join("\n---\n");
}
