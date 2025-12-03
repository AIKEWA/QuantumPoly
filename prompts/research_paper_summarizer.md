---
title: 'Research Paper Summarizer'
version: 'v1.0.0'
tags: ['research', 'summary', 'technical', 'science', 'automation']
dependencies: []
---

# Title

Research Paper Summarizer — High-Fidelity Technical Distillation

# Introduction

This prompt is the first stage in the Research-to-Marketing pipeline. It is designed to ingest raw, token-heavy academic or technical papers and distill them into a structured, fact-dense breakdown.
It is intended for use by researchers, data scientists, and automation engineers who need to preserve the "truth" of a document while stripping away academic formatting and verbosity.

# Purpose

Convert full-length research papers (PDF text, white papers) into a **Structured Technical Breakdown**. This output serves as the reliable source of truth for downstream tasks (like executive briefings or marketing copy), ensuring no critical data is lost in translation.

# Objective

Produce a structured summary that:

- Retains specific metrics, percentages, and confidence intervals.
- Clearly separates methodology from results.
- Identifies the core hypothesis and its status (proven/disproven).
- Removes academic fluff (citations, lengthy intros, acknowledgments).
- Uses a rigid markdown structure for easy machine parsing.

# Brainstorming & Content Development

Before generating the output, analyze:

- **Core Hypothesis:** What is the paper trying to prove?
- **Methodology:** How was the research conducted? (Sample size, duration, tools).
- **Key Findings:** What are the hard numbers?
- **Limitations:** What did the researchers admit they don't know?
- **Implications:** What is the technical upshot of this work?

# Structure

Your output must follow this markdown structure exactly:

1. **Title & Authors**
2. **Core Hypothesis** (1-2 sentences)
3. **Methodology** (Bullet points: N=sample size, duration, control groups, etc.)
4. **Key Findings** (Data-heavy bullet points)
5. **Technical Limitations** (What variables were uncontrolled?)
6. **Primary Conclusion** (The main takeaway)

# Clarity & Precision

- **Do not simplify technical terms**; preserve the original terminology.
- **Do not infer missing data**; if the sample size is not listed, state "Not specified."
- **Tone:** Clinical, objective, dry.

# Risks & Error Mitigation

- **Risk:** Hallucinating numbers.
  - _Mitigation:_ Only quote numbers explicitly present in the text.
- **Risk:** Over-generalization.
  - _Mitigation:_ Keep specific scope qualifiers (e.g., "In mice," "Under high-pressure conditions").

# Output Format

Summarize the provided research paper into the standard breakdown.

**Structure:**

### [Paper Title]

**Hypothesis:** ...
**Methodology:**

- ...
  **Key Findings:**
- ...
  **Limitations:**
- ...
  **Conclusion:** ...

# User Input

Paste the full text of the research paper below:
[PASTE RESEARCH PAPER TEXT HERE]
