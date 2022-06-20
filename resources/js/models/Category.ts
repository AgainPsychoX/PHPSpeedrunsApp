import { DateTime } from "luxon";
import { GameEntry } from "./Game";
import { RunEntry } from "./Run";

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
	runs: RunEntry[];
}

export const getCategoryPageLink = (e: CategoryEntry) => `/games/${e.gameId}/categories/${e.id}`;
export const getEditCategoryPageLink = (e: CategoryEntry) => `/games/${e.gameId}/categories/${e.id}/edit`;

export const getRunsPageLink = (e: CategoryEntry) => `/games/${e.gameId}/categories/${e.id}/runs`;
export const getNewRunPageLink = (e: CategoryEntry) => `/games/${e.gameId}/categories/${e.id}/runs/new`;
