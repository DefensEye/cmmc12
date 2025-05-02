import type { ComplianceStatus } from "../types"

const API_KEY = "AIzaSyAB_G6oXiXLVNq03ABFrDUpp_dc7uom5DI" // This should ideally be an environment variable

/**
 * Analyzes compliance data from CSV content
 *
 * @param csvContent - CSV data to analyze
 * @returns Promise resolving to an array of findings
 */
export async function analyzeComplianceData(csvContent: string) {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Please analyze the following CSV data for compliance and map it to CMMC Level 3 findings and gaps. Provide your analysis from the perspective of a Third Party Assessment Organization (3PAO).

              **STRICT INSTRUCTIONS:**
              - Adopt the perspective of a 3PAO assessor evaluating CMMC compliance
              - Focus on identifying gaps, risks, and required evidence from a 3PAO perspective
              - Be critical and thorough as a 3PAO would be during an official assessment
              - **Only return a valid JSON object** that starts with "{" and ends with "}"
              - **Do not include explanations, reasoning, or any extra text outside JSON**
              - **Do not wrap JSON inside markdown code blocks (e.g., \`\`\`json ... \`\`\`)**
              - **Ensure output is valid JSON without syntax errors**
              
              Example Format:
              {
                "findings": [
                  {
                    "CMMC_Control": "AC.L3-3.1.1",
                    "Description": "Limit system access to authorized users...",
                    "Severity": "Medium",
                    "Impact": "Unauthorized access risk...",
                    "3PAO_Assessment": "As a 3PAO, we would require evidence of access control policies, implementation details, and verification of enforcement. Current implementation lacks proper documentation and testing evidence."
                  },
                  {
                    "CMMC_Control": "SC.L3-3.13.1",
                    "Description": "Monitor, control, and protect communications...",
                    "Severity": "High",
                    "Impact": "Potential data leakage...",
                    "3PAO_Assessment": "From a 3PAO perspective, this control requires demonstration of boundary protection mechanisms. Current implementation shows insufficient network monitoring and lacks proper segmentation evidence."
                  }
                ]
              }

              Now, analyze this CSV data from a 3PAO perspective:
              ${csvContent}`,
                },
              ],
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      console.error("API Error:", response.status, await response.text())
      return [{ practiceId: "Error", status: "Failed", insights: "API request failed." }]
    }

    const data = await response.json()
    console.log("Raw AI Response:", data) // Debugging log

    // Extract the response text
    let aiText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    // Remove Markdown blocks or unexpected characters
    aiText = aiText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim()

    // Ensure JSON validity
    if (!aiText.startsWith("{") || !aiText.endsWith("}")) {
      console.error("Invalid JSON format received:", aiText)
      return [{ practiceId: "Error", status: "Failed", insights: "Invalid JSON format from AI." }]
    }

    try {
      const parsedData = JSON.parse(aiText)

      if (!parsedData.findings || !Array.isArray(parsedData.findings)) {
        console.error("Missing 'findings' in AI response:", parsedData)
        return [{ practiceId: "Error", status: "Failed", insights: "No findings in AI response." }]
      }

      interface Finding {
        CMMC_Control?: string
        Severity?: string
        Description?: string
        "3PAO_Assessment"?: string
        [key: string]: any
      }

      return parsedData.findings.map((finding: Finding, index: number) => ({
        practiceId: finding.CMMC_Control || `Insight ${index + 1}`,
        status: finding.Severity || "Unknown",
        insights: finding.Description || "No insights available.",
        threePAOAssessment: finding["3PAO_Assessment"] || "",
      }))
    } catch (jsonError) {
      console.error("Error parsing AI response as JSON:", jsonError, aiText)
      return [{ practiceId: "Error", status: "Failed", insights: "Failed to parse AI response as JSON." }]
    }
  } catch (error) {
    console.error("Error analyzing CSV:", error)
    return [{ practiceId: "Error", status: "Failed", insights: "AI processing failed." }]
  }
}

/**
 * Generates a compliance report based on the provided compliance status data
 *
 * In a real implementation, this would use Vertex AI to generate a detailed report
 * For demo purposes, this returns a mock report
 *
 * @param complianceStatuses - Array of compliance status objects
 * @returns Promise resolving to a string containing the report in markdown format
 */

// ADDED CODE: now accept cmmcLevel parameter
export const generateComplianceReport = async (
  complianceStatuses: ComplianceStatus[],
  cmmcLevel: "Level 1" | "Level 2" | "Level 3" = "Level 3", // ADDED CODE
): Promise<string> => {
  console.log("Generating compliance report with Gemini...")

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  // ADDED CODE: incorporate cmmcLevel into the prompt
                  text: `Generate a detailed ${cmmcLevel} compliance report based on the following compliance data:\n${JSON.stringify(
                    complianceStatuses,
                  )}`,
                },
              ],
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      console.error("API Error:", response.status, await response.text())
      return "Error generating the compliance report."
    }

    const data = await response.json()
    return data.candidates ? data.candidates[0].content.parts[0].text : "No compliance report generated."
  } catch (error) {
    console.error("Error generating compliance report:", error)
    return "Error processing the compliance report with Gemini AI."
  }
}

/**
 * Generates AI-powered recommendations for specific compliance gaps
 *
 * In a real implementation, this would use Vertex AI to analyze each gap
 * and provide tailored recommendations
 *
 * @param complianceStatuses - Array of compliance status objects
 * @returns Promise resolving to an array of enhanced gap objects with AI recommendations
 */
export const generateGapRecommendations = async (complianceStatuses: ComplianceStatus[]) => {
  console.log("Generating AI recommendations for compliance gaps...")

  // Filter for non-compliant and partially compliant items
  const gaps = complianceStatuses.filter((item) => item.status.toLowerCase() !== "compliant")

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Analyze these CMMC compliance gaps and provide detailed recommendations:
                  
                  **STRICT INSTRUCTIONS:**
                  - Return a valid JSON array of objects with recommendations for each gap
                  - Each object should include: aiRecommendation, threatLevel, impact, timeframe, estimatedEffort
                  - Do not include explanations outside the JSON
                  - Ensure output is valid JSON
                  
                  Gaps to analyze:
                  ${JSON.stringify(gaps)}`,
                },
              ],
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      console.error("API Error:", response.status, await response.text())
      // Fall back to local processing if API fails
      return fallbackGapRecommendations(gaps)
    }

    const data = await response.json()
    let aiText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    // Clean up response to ensure valid JSON
    aiText = aiText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim()

    try {
      // Parse the AI response
      const recommendations = JSON.parse(aiText)

      if (!Array.isArray(recommendations)) {
        console.error("Invalid recommendations format:", recommendations)
        return fallbackGapRecommendations(gaps)
      }

      // Merge the original gaps with AI recommendations
      return gaps
        .map((gap, index) => {
          const rec = recommendations[index] || {}
          return {
            ...gap,
            aiRecommendation: rec.aiRecommendation || getDefaultRecommendation(gap),
            threatLevel: rec.threatLevel || getDefaultThreatLevel(gap),
            impact: rec.impact || getDefaultImpact(gap),
            timeframe: rec.timeframe || (Math.random() > 0.5 ? "Short-term (1-3 months)" : "Medium-term (3-6 months)"),
            estimatedEffort:
              rec.estimatedEffort || (Math.random() > 0.7 ? "High" : Math.random() > 0.4 ? "Medium" : "Low"),
          }
        })
        .sort((a, b) => {
          // Sort by threat level (Critical first, then High, then Medium)
          const threatOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 }
          return (
            threatOrder[a.threatLevel as keyof typeof threatOrder] -
            threatOrder[b.threatLevel as keyof typeof threatOrder]
          )
        })
    } catch (jsonError) {
      console.error("Error parsing AI recommendations:", jsonError)
      return fallbackGapRecommendations(gaps)
    }
  } catch (error) {
    console.error("Error generating gap recommendations:", error)
    return fallbackGapRecommendations(gaps)
  }
}

/**
 * Fallback function to generate recommendations locally if API fails
 */
const fallbackGapRecommendations = (gaps: ComplianceStatus[]) => {
  return gaps
    .map((gap) => {
      // Extract domain ID but actually use it for determining threat level and recommendations
      const domainId = gap.practiceId?.split(".")[0] || "Unknown"

      return {
        ...gap,
        aiRecommendation: getDefaultRecommendation(gap),
        threatLevel: getDefaultThreatLevel(gap),
        impact: getDefaultImpact(gap),
        timeframe: Math.random() > 0.5 ? "Short-term (1-3 months)" : "Medium-term (3-6 months)",
        estimatedEffort: Math.random() > 0.7 ? "High" : Math.random() > 0.4 ? "Medium" : "Low",
      }
    })
    .sort((a, b) => {
      // Sort by threat level (Critical first, then High, then Medium)
      const threatOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 }
      return (
        threatOrder[a.threatLevel as keyof typeof threatOrder] - threatOrder[b.threatLevel as keyof typeof threatOrder]
      )
    })
}

/**
 * Helper function to get default recommendation based on domain
 */
const getDefaultRecommendation = (gap: ComplianceStatus): string => {
  const domainId = gap.practiceId?.split(".")[0] || "Unknown"

  switch (domainId) {
    case "AC": // Access Control
      return gap.status.toLowerCase() === "partial"
        ? "Enhance existing access control mechanisms with multi-factor authentication and implement regular access reviews."
        : "Implement comprehensive role-based access control (RBAC) with least privilege principles and separation of duties."

    case "AU": // Audit & Accountability
      return "Deploy a centralized logging solution with real-time alerting and implement automated log review procedures."

    case "CM": // Configuration Management
      return "Establish a secure baseline configuration for all systems and implement automated configuration monitoring."

    case "IA": // Identification & Authentication
      return "Implement multi-factor authentication for all privileged accounts and strengthen password policies."

    case "SC": // System & Communications
      return "Implement encrypted communications for all sensitive data in transit and enhance network segmentation."

    default:
      return "Develop and implement controls to address this compliance gap based on CMMC requirements."
  }
}

/**
 * Helper function to get default threat level based on status and domain
 */
const getDefaultThreatLevel = (gap: ComplianceStatus): string => {
  const domainId = gap.practiceId?.split(".")[0] || "Unknown"

  if (domainId === "AC" || domainId === "IA") {
    return gap.status.toLowerCase() === "non-compliant" ? "Critical" : "High"
  } else if (domainId === "AU" || domainId === "CM" || domainId === "SC") {
    return "High"
  } else {
    return "Medium"
  }
}

/**
 * Helper function to get default impact description based on domain
 */
const getDefaultImpact = (gap: ComplianceStatus): string => {
  const domainId = gap.practiceId?.split(".")[0] || "Unknown"

  switch (domainId) {
    case "AC": // Access Control
      return "Unauthorized access could lead to data breaches and compliance violations."

    case "AU": // Audit & Accountability
      return "Insufficient audit capabilities prevent detection of security incidents and hinder forensic investigations."

    case "CM": // Configuration Management
      return "Misconfigured systems create security vulnerabilities that can be exploited by attackers."

    case "IA": // Identification & Authentication
      return "Weak authentication controls allow credential theft and unauthorized system access."

    case "SC": // System & Communications
      return "Unencrypted communications expose sensitive data to interception and compromise."

    default:
      return "Non-compliance with CMMC requirements may affect certification status."
  }
}

/**
 * Tests the connection to Vertex AI
 *
 * @param apiKey - Google API Key
 * @returns Promise resolving to a boolean indicating success
 */
export const testVertexAIConnection = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-002", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
    })

    if (!response.ok) {
      console.error("Vertex AI Connection Failed:", response.status, await response.text())
      return false
    }

    return true // Connection successful
  } catch (error) {
    console.error("Error testing Vertex AI connection:", error)
    return false
  }
}
