import { DateTime } from "luxon";
import { RunSummary } from "./Run";
import { ModeratorEntry } from "./User";

export interface CategoryEntry {
	id: number;
	gameId: number;
	name: string;
}

export interface CategoryDetails extends CategoryEntry {
	rules: string;
	scoreRule: 'none' | 'high' | 'low';
	verificationRequirement: number;
	createdAt: DateTime;
	updatedAt: DateTime;

	runs: RunSummary[];
	moderators: ModeratorEntry[];
}

export const getCategoryPageLink = (e: CategoryEntry) => `/games/${e.gameId}/categories/${e.id}`;
export const getEditCategoryPageLink = (e: CategoryEntry) => `/games/${e.gameId}/categories/${e.id}/edit`;
export const getCategoryModerationPageLink = (e: CategoryEntry) => `/games/${e.gameId}/categories/${e.id}/moderators`;

export const getRunsPageLink = (e: CategoryEntry) => `/games/${e.gameId}/categories/${e.id}/runs`;
export const getNewRunPageLink = (e: CategoryEntry) => `/games/${e.gameId}/categories/${e.id}/runs/new`;
