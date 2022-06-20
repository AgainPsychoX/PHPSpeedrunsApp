import { DateTime } from "luxon";
import { CategoryEntry } from "./Category";

export interface GameEntry {
	id: number;
	name: string;
	icon: string;
	publishYear: string;
}

export interface GameSummary extends GameEntry {
	// Optional statistics (might be for sorting)
	runsCount?: number;
	latestRunAt?: DateTime;
}

export interface GameDetails extends GameSummary {
	description: string;
	rules: string;
	createdAt: DateTime;
	updatedAt: DateTime;
	categories: CategoryEntry[];
}

export const isGameIconPlaceholder = (entry: GameEntry) => entry.icon.includes('placeholder');

export const getGamesDirectoryLink = () => '/games';
export const getNewGamePageLink = () => `/games/new`;

export const getGamePageLink = (e: GameEntry) => `/games/${e.id}`;
export const getEditGamePageLink = (e: GameEntry) => `/games/${e.id}/edit`;

export const getCategoriesPageLink = (e: GameEntry) => `/games/${e.id}/categories`;
export const getNewCategoryPageLink = (e: GameEntry) => `/games/${e.id}/categories/new`;

