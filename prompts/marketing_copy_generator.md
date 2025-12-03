---
title: 'Marketing Copy Generator'
version: 'v1.0.0'
tags: ['marketing', 'copywriting', 'content', 'public_relations']
dependencies: ['executive_summary_composer']
---

# Title

Marketing Copy Generator — Strategic Storytelling from Insights

# Introduction

This prompt is the third and final stage of the Research-to-Marketing pipeline. It accepts a high-level **Strategic Brief** (or Executive Summary) and transforms it into persuasive, audience-ready marketing assets.
It is designed for content creators, social media managers, and PR teams who need to turn "dry facts" into "compelling narratives" without sacrificing accuracy.

# Purpose

Translate the strategic value propositions identified in the previous stage into specific content formats (Press Release, Blog Post, Social Media Thread) that resonate with a broader, non-technical audience.

# Objective

Produce a marketing asset that:

- Adopts the requested **Tone** and **Voice** (e.g., Exciting, Professional, Urgent).
- Highlights the "So What?" for the customer/public.
- Uses engaging headlines and subheadings.
- Includes a clear Call to Action (CTA).
- Remains faithful to the core facts provided in the input brief.

# Brainstorming & Content Development

Before writing, determine:

- **Target Audience:** Who is reading this? (Investors, Consumers, Developers?)
- **Key Message:** What is the one thing they must remember?
- **Emotional Hook:** Why should they care? (Fear of missing out, gain of efficiency, excitement for innovation?)
- **Format Constraints:** Does it need a dateline? Hashtags? SEO keywords?

# Structure

The output structure depends on the requested format, but generally includes:

1.  **Headline:** Catchy, SEO-friendly, under 60 chars.
2.  **Lead Paragraph:** The hook (Who, what, why).
3.  **Body:** Supporting details, quotes, and context (derived from the input).
4.  **Call to Action:** What should they do next?

# Inter-Stage Logic

- **Input:** This module strictly requires the **Strategic Brief** from the _Executive Summary Composer_.
- **Constraint:** Do not invent new technical claims. If the brief says "efficiency improved," you can say "boosts productivity," but do not invent "by 50%" if the number isn't in the source.

# Risks & Error Mitigation

- **Risk:** "Hype" overtaking fact.
  - _Mitigation:_ Review the final copy against the input brief to ensure no "absolute" claims were added where "potential" claims existed.
- **Risk:** Tone mismatch.
  - _Mitigation:_ Strictly adhere to the `[TONE]` parameter provided by the user.

# Output Format

Generate the following asset based on the input brief.

**Asset Type:** [e.g., Press Release / Blog Post / LinkedIn Post]
**Target Audience:** [e.g., General Public / Tech Community]
**Tone:** [e.g., Innovative / Serious]

---

## **[OUTPUT CONTENT HERE]**

# User Input

**1. Desired Asset Type:** [e.g., Press Release]
**2. Target Audience:** [e.g., Investors]
**3. Desired Tone:** [e.g., Confident]

**4. Source Strategic Brief:**
[PASTE EXECUTIVE SUMMARY / STRATEGIC BRIEF HERE]
