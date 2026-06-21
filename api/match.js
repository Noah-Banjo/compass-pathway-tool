import Anthropic from "@anthropic-ai/sdk";

export const config = { runtime: "edge" };

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a decision-support assistant for caseworkers at survivor support organizations. Analyze a survivor profile and pathway options, then return a ranked list of 2-3 best-fit recommendations.

CRITICAL RULES:
- Never recommend a pathway the survivor clearly cannot meet (hard disqualifiers).
- Flag criminal record barriers prominently.
- Trauma sensitivities must directly influence ranking.
- Be concise — 1-2 sentences per text field.

You must respond with ONLY a valid JSON object. No markdown fences, no text before or after. Start with { and end with }.

{
  "recommendations": [
    {
      "pathwayId": "exact-id-from-list",
      "rank": 1,
      "confidenceScore": 0.85,
      "confidenceLabel": "High",
      "matchRationale": "1-2 sentences on why this fits this specific survivor.",
      "strengthsAlignment": ["strength 1", "strength 2"],
      "flagsAndCautions": ["flag 1", "flag 2"],
      "verifyBeforeDiscussing": ["verify 1", "verify 2"],
      "traumaConsiderationNote": "1 sentence on trauma environment fit."
    }
  ],
  "overallCaseNote": "1 sentence framing for the caseworker.",
  "missingInformation": ["item 1"],
  "responsibleAINote": "These recommendations are decision-support only. The caseworker must verify all pathway details, discuss options with the survivor, and make all placement decisions."
}

confidenceLabel must be exactly one of: High, Moderate, Low
Return 2-3 recommendations only. Do not include pathways with hard disqualifiers.`;

export default async function handler(request) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let profile;
  try {
    const body = await request.json();
    profile = body.profile;
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  if (!profile) {
    return json({ error: "Profile is required" }, 400);
  }

  const userMessage = `Analyze this survivor profile and return ONLY a JSON object with 2-3 ranked pathway recommendations. No markdown, no preamble.

SURVIVOR:
${buildProfileSummary(profile)}

PATHWAYS:
${buildPathwaySummary()}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const rawText = message.content[0].text.trim();

    // Strip markdown fences if present
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (firstErr) {
      // Try extracting outermost JSON object
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (secondErr) {
          return json({
            error: "Matching service error",
            detail: "Response could not be parsed as JSON.",
            parseError: secondErr.message,
            rawPreview: cleaned.slice(0, 600),
          }, 500);
        }
      } else {
        return json({
          error: "Matching service error",
          detail: "No JSON object found in response.",
          parseError: firstErr.message,
          rawPreview: cleaned.slice(0, 600),
        }, 500);
      }
    }

    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      return json({
        error: "Matching service error",
        detail: "Response missing recommendations array.",
        rawPreview: JSON.stringify(parsed).slice(0, 600),
      }, 500);
    }

    return json(parsed, 200);
  } catch (error) {
    console.error("Claude API error:", error);
    return json({ error: "Matching service error", detail: error.message }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
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
