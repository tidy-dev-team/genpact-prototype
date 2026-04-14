/**
 * PRD Generator Tool
 * MCP tool that generates a structured Product Requirements Document (PRD)
 * optimized for use with Figma Make and other vibe-coding platforms.
 *
 * The PRD serves as an anchor document to keep AI-assisted development sessions
 * consistent and on-track throughout the build process.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { FigmaAPI } from "./figma-api.js";
import { extractFileKey } from "./figma-api.js";
import { createChildLogger } from "./logger.js";

const logger = createChildLogger({ component: "prd-tools" });

// ============================================================================
// Schema Definitions
// ============================================================================

const FeatureSchema = z.object({
	name: z.string().describe("Feature name"),
	description: z.string().describe("What this feature does"),
	requirements: z
		.array(z.string())
		.optional()
		.default([])
		.describe("Functional requirements for this feature"),
	ui_requirements: z
		.string()
		.optional()
		.default("")
		.describe("UI/UX requirements specific to this feature"),
	technical_notes: z
		.string()
		.optional()
		.default("")
		.describe("Technical implementation notes for this feature"),
});

type Feature = z.infer<typeof FeatureSchema>;

// ============================================================================
// Markdown Generation
// ============================================================================

function bulletList(items: string[]): string {
	if (!items || items.length === 0) return "_None specified_";
	return items.map((item) => `- ${item}`).join("\n");
}

function featureSection(feature: Feature, index: number): string {
	const lines: string[] = [
		`### Feature ${index + 1}: ${feature.name}`,
		"",
		feature.description,
		"",
	];

	if (feature.requirements && feature.requirements.length > 0) {
		lines.push("**Requirements:**");
		lines.push(bulletList(feature.requirements));
		lines.push("");
	}

	if (feature.ui_requirements) {
		lines.push("**UI Requirements:**");
		lines.push(feature.ui_requirements);
		lines.push("");
	}

	if (feature.technical_notes) {
		lines.push("**Technical Notes:**");
		lines.push(feature.technical_notes);
		lines.push("");
	}

	return lines.join("\n");
}

function buildDesignSystemSummary(kit: any): string {
	const lines: string[] = [];

	if (kit.tokens?.collections && kit.tokens.collections.length > 0) {
		lines.push("#### Design Tokens");
		for (const collection of kit.tokens.collections) {
			lines.push(`\n**${collection.name}** (${collection.variables?.length ?? 0} variables)`);
			if (collection.modes?.length > 1) {
				lines.push(`Modes: ${collection.modes.map((m: any) => m.name).join(", ")}`);
			}
			if (collection.variables) {
				const byType: Record<string, string[]> = {};
				for (const v of collection.variables) {
					if (!byType[v.type]) byType[v.type] = [];
					byType[v.type].push(v.name);
				}
				for (const [type, names] of Object.entries(byType)) {
					lines.push(`- ${type}: ${names.slice(0, 8).join(", ")}${names.length > 8 ? ` (+${names.length - 8} more)` : ""}`);
				}
			}
		}
		lines.push("");
	}

	if (kit.styles?.items && kit.styles.items.length > 0) {
		lines.push("#### Styles");
		const byType: Record<string, string[]> = {};
		for (const style of kit.styles.items) {
			if (!byType[style.styleType]) byType[style.styleType] = [];
			byType[style.styleType].push(style.name);
		}
		for (const [type, names] of Object.entries(byType)) {
			lines.push(`**${type}:** ${names.slice(0, 10).join(", ")}${names.length > 10 ? ` (+${names.length - 10} more)` : ""}`);
		}
		lines.push("");
	}

	if (kit.components?.items && kit.components.items.length > 0) {
		lines.push("#### Components");
		const names = kit.components.items.map((c: any) => c.name);
		lines.push(names.slice(0, 20).join(", ") + (names.length > 20 ? ` (+${names.length - 20} more)` : ""));
		lines.push("");
	}

	return lines.join("\n");
}

function generatePRDMarkdown(params: {
	product_name: string;
	description: string;
	goals: string[];
	non_goals: string[];
	users: string;
	problem: string;
	general_scope: string;
	features: Feature[];
	ui_requirements: string;
	requirements: string[];
	technical_notes: string;
	figmaKit?: any;
}): string {
	const {
		product_name,
		description,
		goals,
		non_goals,
		users,
		problem,
		general_scope,
		features,
		ui_requirements,
		requirements,
		technical_notes,
		figmaKit,
	} = params;

	const date = new Date().toISOString().split("T")[0];

	const sections: string[] = [
		`# PRD: ${product_name}`,
		`> **Version:** ${date} | **Status:** Draft`,
		"",
		"---",
		"",
		"## Overview",
		"",
		description,
		"",
		"---",
		"",
		"## Goals",
		"",
		bulletList(goals),
		"",
		"## Non-Goals",
		"",
		bulletList(non_goals),
		"",
		"---",
		"",
		"## Target Users",
		"",
		users,
		"",
		"## Problem Statement",
		"",
		problem,
		"",
		"## Scope",
		"",
		general_scope,
		"",
		"---",
		"",
	];

	// Features
	if (features && features.length > 0) {
		sections.push("## Features");
		sections.push("");
		for (let i = 0; i < features.length; i++) {
			sections.push(featureSection(features[i], i));
			if (i < features.length - 1) {
				sections.push("---");
				sections.push("");
			}
		}
		sections.push("---");
		sections.push("");
	}

	// General UI Requirements
	if (ui_requirements) {
		sections.push("## UI Requirements");
		sections.push("");
		sections.push(ui_requirements);
		sections.push("");
		sections.push("---");
		sections.push("");
	}

	// General Requirements
	if (requirements && requirements.length > 0) {
		sections.push("## Requirements");
		sections.push("");
		sections.push(bulletList(requirements));
		sections.push("");
		sections.push("---");
		sections.push("");
	}

	// Technical Notes
	if (technical_notes) {
		sections.push("## Technical Notes");
		sections.push("");
		sections.push(technical_notes);
		sections.push("");
		sections.push("---");
		sections.push("");
	}

	// Figma Design System Reference
	if (figmaKit) {
		sections.push("## Design System Reference");
		sections.push("");
		sections.push(`> Pulled from Figma file: \`${figmaKit.fileKey}\``);
		if (figmaKit.fileName) {
			sections.push(`> File: **${figmaKit.fileName}**`);
		}
		sections.push("");
		const summary = buildDesignSystemSummary(figmaKit);
		if (summary.trim()) {
			sections.push(summary);
		} else {
			sections.push("_Design system data fetched but no published tokens, styles, or components found._");
		}
		sections.push("---");
		sections.push("");
	}

	// Prompt guidance for vibe-coding platforms
	sections.push("## Vibe Coding Instructions");
	sections.push("");
	sections.push(
		"**Use this PRD as your single source of truth.** Before making any changes, re-read the relevant feature section. " +
		"Do not add features, change scope, or modify requirements unless explicitly asked. " +
		"When in doubt, refer back to this document."
	);
	sections.push("");
	sections.push(`**Building:** ${product_name}`);
	sections.push(`**Focus:** Implement features one at a time, in the order listed above.`);
	sections.push(`**Style:** Follow the UI Requirements section for all visual decisions.`);
	if (figmaKit) {
		sections.push(`**Design tokens:** Use the tokens and components listed in the Design System Reference section.`);
	}
	sections.push("");

	return sections.join("\n");
}

// ============================================================================
// Tool Registration
// ============================================================================

export function registerPRDTools(
	server: McpServer,
	getFigmaAPI: (() => Promise<FigmaAPI>) | null,
	getCurrentUrl: () => string | null,
): void {
	server.tool(
		"figma_generate_prd",
		"Generate a structured Product Requirements Document (PRD) for use with Figma Make and other vibe-coding platforms. " +
		"The PRD serves as an anchor document to keep AI-assisted development sessions consistent and on-track. " +
		"Accepts product details, goals, features (each with their own requirements and UI specs), and optionally " +
		"pulls live design system data (tokens, components, styles) from a Figma file to embed in the PRD. " +
		"Output is a copy-paste-ready Markdown document optimized for prompting vibe-coding platforms.",
		{
			product_name: z.string().describe("Name of the product or feature being built"),
			description: z
				.string()
				.describe("1-3 sentence overview of what this product does and why it exists"),
			goals: z
				.array(z.string())
				.optional()
				.default([])
				.describe("List of success criteria / goals for this product"),
			non_goals: z
				.array(z.string())
				.optional()
				.default([])
				.describe("Explicit list of what is OUT of scope to prevent scope creep"),
			users: z
				.string()
				.describe("Who the target users are and their key characteristics"),
			problem: z
				.string()
				.describe("The specific problem this product solves for users"),
			general_scope: z
				.string()
				.describe("High-level description of what is being built"),
			features: z
				.array(FeatureSchema)
				.optional()
				.default([])
				.describe(
					"List of features. Each feature has: name, description, requirements, ui_requirements, technical_notes"
				),
			ui_requirements: z
				.string()
				.optional()
				.default("")
				.describe("General UI/UX requirements that apply across the entire product (design language, accessibility, responsiveness, etc.)"),
			requirements: z
				.array(z.string())
				.optional()
				.default([])
				.describe("General non-feature-specific requirements (performance, security, compatibility, etc.)"),
			technical_notes: z
				.string()
				.optional()
				.default("")
				.describe("General technical implementation notes, stack choices, constraints, or architecture decisions"),
			include_design_system: z
				.boolean()
				.optional()
				.default(false)
				.describe(
					"If true, fetches the design system (tokens, components, styles) from the Figma file and embeds it in the PRD. " +
					"Requires a valid Figma file to be open or figma_file_key to be provided."
				),
			figma_file_key: z
				.string()
				.optional()
				.describe(
					"Figma file key to pull design data from. If omitted and include_design_system is true, " +
					"uses the currently open Figma file."
				),
		},
		async ({
			product_name,
			description,
			goals,
			non_goals,
			users,
			problem,
			general_scope,
			features,
			ui_requirements,
			requirements,
			technical_notes,
			include_design_system,
			figma_file_key,
		}) => {
			try {
				let figmaKit: any = null;

				// Optionally fetch design system data
				if (include_design_system && getFigmaAPI) {
					try {
						let resolvedFileKey = figma_file_key;
						if (!resolvedFileKey) {
							const currentUrl = getCurrentUrl();
							if (currentUrl) {
								resolvedFileKey = extractFileKey(currentUrl) || undefined;
							}
						}

						if (!resolvedFileKey) {
							logger.warn("include_design_system=true but no file key available — skipping design system fetch");
						} else {
							logger.info({ fileKey: resolvedFileKey }, "Fetching design system for PRD");
							const api = await getFigmaAPI();

							// Fetch variables (tokens)
							let tokens = null;
							try {
								const variablesData = await api.getAllVariables(resolvedFileKey);
								if (variablesData?.local?.meta) {
									tokens = variablesData.local.meta;
								}
							} catch (err) {
								logger.warn({ err }, "Could not fetch variables for PRD");
							}

							// Fetch styles
							let styles = null;
							try {
								const stylesData = await api.getStyles(resolvedFileKey);
								if (stylesData?.meta?.styles) {
									styles = { items: stylesData.meta.styles };
								}
							} catch (err) {
								logger.warn({ err }, "Could not fetch styles for PRD");
							}

							// Fetch components
							let components = null;
							try {
								const componentsData = await api.getComponents(resolvedFileKey);
								if (componentsData?.meta?.components) {
									components = {
										items: componentsData.meta.components.slice(0, 50), // cap at 50
									};
								}
							} catch (err) {
								logger.warn({ err }, "Could not fetch components for PRD");
							}

							figmaKit = {
								fileKey: resolvedFileKey,
								tokens: tokens ? buildTokenCollections(tokens) : null,
								styles,
								components,
							};
						}
					} catch (err) {
						const msg = err instanceof Error ? err.message : String(err);
						logger.warn({ error: msg }, "Failed to fetch Figma design system for PRD — continuing without it");
					}
				}

				const markdown = generatePRDMarkdown({
					product_name,
					description,
					goals,
					non_goals,
					users,
					problem,
					general_scope,
					features,
					ui_requirements,
					requirements,
					technical_notes,
					figmaKit,
				});

				logger.info({ product_name, featureCount: features.length }, "PRD generated");

				return {
					content: [
						{
							type: "text",
							text: markdown,
						},
					],
				};
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				logger.error({ error }, "Failed to generate PRD");
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({
								error: errorMessage,
								message: "Failed to generate PRD",
							}),
						},
					],
					isError: true,
				};
			}
		},
	);
}

// ============================================================================
// Helpers for design system data
// ============================================================================

function buildTokenCollections(meta: any): { collections: any[] } | null {
	if (!meta?.variableCollections || !meta?.variables) return null;

	const collections = Object.values(meta.variableCollections).map((col: any) => ({
		id: col.id,
		name: col.name,
		modes: col.modes || [],
		variables: Object.values(meta.variables)
			.filter((v: any) => v.variableCollectionId === col.id)
			.map((v: any) => ({
				id: v.id,
				name: v.name,
				type: v.resolvedType || v.type,
				description: v.description || undefined,
				valuesByMode: v.valuesByMode || {},
				scopes: v.scopes || [],
			})),
	}));

	return { collections };
}
