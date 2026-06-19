import Anthropic from "@anthropic-ai/sdk";
import { pathways } from "../src/data/pathways.js";

export const config = { maxDuration: 60 };

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a decision-support assistant for caseworkers at survivor support organizations. Analyze a survivor profile and available pathways, then call the tool with 2-3 ranked recommendations. Be concise — keep all text fields short (1-2 sentences max). Never recommend pathways with hard disqualifiers. Flag criminal record barriers prominently.`;

const MATCH_TOOL = {
  name: "submit_pathway_recommendations",
  description: "Submit ranked pathway recommendations. Fill recommendations array FIRST.",
  input_schema: {
    type: "object",
    properties: {
      recommendations: {
        type: "array",
        minItems: 2,
        maxItems: 3,
        description: "REQUIRED. Fill this first. 2-3 best-fit pathways ranked by fit.",
        items: {
          type: "object",
          properties: {
            pathwayId:            { type: "string" },
            rank:                 { type: "integer", minimum: 1, maximum: 3 },
            confidenceScore:      { type: "number", minimum: 0, maximum: 1 },
            confidenceLabel:      { type: "string", enum: ["High", "Moderate", "Low"] },
            matchRationale:       { type: "string", description: "1-2 sentences: why this fits this survivor's specific constraints." },
            strengthsAlignment:   { type: "array", maxItems: 2, items: { type: "string" } },
            flagsAndCautions:     { type: "array", maxItems: 2, items: { type: "string" } },
            verifyBeforeDiscussing: { type: "array", maxItems: 2, items: { type: "string" } },
            traumaConsiderationNote: { type: "string", description: "1 sentence on trauma fit." },
          },
          required: ["pathwayId", "rank", "confidenceScore", "confidenceLabel", "matchRationale", "strengthsAlignment", "flagsAndCautions", "verifyBeforeDiscussing", "traumaConsiderationNote"],
        },
      },
      overallCaseNote:    { type: "string", description: "1 sentence framing for the caseworker." },
      missingInformation: { type: "array", maxItems: 3, items: { type: "string" } },
    },
    required: ["recommendations", "overallCaseNote", "missingInformation"],
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

  const userMessage = `Analyze this survivor and call submit_pathway_recommendations with 2-3 ranked pathways. Fill the recommendations array first. Keep all text short.

SURVIVOR:
${buildProfileSummary(profile)}

PATHWAYS:
${buildPathwaySummary()}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      tools: [MATCH_TOOL],
      tool_choice: { type: "tool", name: "submit_pathway_recommendations" },
      messages: [{ role: "user", content: userMessage }],
    });

    const toolUse = message.content.find((b) => b.type === "tool_use");
    if (!toolUse) {
      return res.status(500).json({
        error: "Matching service error",
        detail: "Claude did not call the expected tool.",
      });
    }

    const parsed = toolUse.input;

    if (!parsed.recommendations || !Array.isArray(parsed.recommendations) || parsed.recommendations.length === 0) {
      console.error("COMPASS: Missing recommendations in tool input:", JSON.stringify(parsed).slice(0, 800));
      return res.status(500).json({
        error: "Matching service error",
        detail: "Tool response missing recommendations. Stop reason: " + message.stop_reason,
        rawPreview: JSON.stringify(parsed).slice(0, 500),
      });
    }

    // Hardcode the responsible AI note so it doesn't eat into token budget
    parsed.responsibleAINote = "These recommendations are decision-support only. The caseworker must verify all pathway details, discuss options with the survivor, and make all placement decisions. No survivor-facing action should occur without caseworker confirmation.";

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
  return [
    `${p.label || "Anonymous"} | Age:${p.age} | Region:${p.region}`,
    `Education:${p.educationLevel}${p.educationNote ? " — " + p.educationNote : ""}`,
    `Gap:${p.employmentGapYears}yr${p.employmentGapExplanation ? " — " + p.employmentGapExplanation : ""}`,
    `Work:${p.workHistoryBefore || "None"}`,
    `Criminal:${p.criminalRecord ? "YES — " + p.criminalRecordDetail : "None"}`,
    `Mobility:${p.mobilityConstraints?.join(",") || "None"}`,
    `Housing:${p.housingStatus} | Dependents:${p.childrenOrDependents ? p.dependentDetail : "None"}`,
    `Trauma:${p.traumaWorkplaceSensitivities?.join(",") || "None"}`,
    `Counseling:${p.counselingSchedule || "Not documented"}`,
    `Languages:${p.languagesSpoken?.join(",") || "Unknown"} | Immigration:${p.immigrationStatus}`,
    `Readiness:${p.readinessAssessment}`,
    `Goals:${p.statedGoals}`,
    p.notes ? `Notes:${p.notes}` : null,
  ].filter(Boolean).join("\n");
}

function buildPathwaySummary() {
  return pathways
    .map((p) =>
      `ID:${p.id}|${p.name}\nAccom:${p.accommodates.join(",")}|Req:${p.requires.join(",")}\nRemote:${p.remoteOption}|Flex:${p.flexibleSchedule}|Phys:${p.physicalDemand}|Supv:${p.supervisoryIntensity}|Earn:${p.earningPotential}|Time:${p.timeline}\nTrauma:${p.traumaConsiderations}|Region:${p.region}`
    )
    .join("\n---\n");
}
