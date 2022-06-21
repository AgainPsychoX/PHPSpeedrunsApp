import { DateTime } from "luxon";

export interface RunId {
	id: number;
	gameId: number;
	categoryId: number;

	userId: number;
}

export interface RunEntry extends RunId {
	gameName?: string;
	categoryName?: string;
	userName?: string;

	createdAt: DateTime;
}

export interface RunSummary extends RunEntry {
	duration: number;
	score: number;
	videoUrl: string;

	state: 'pending' | 'verified' | 'invalid';
}

export interface RunDetails extends RunSummary {
	notes: string;
	updatedAt: DateTime;
}

export const getRunPageLink = (e: RunId) => `/games/${e.gameId}/categories/${e.categoryId}/runs/${e.id}`;
export const getEditRunPageLink = (e: RunId) => `/games/${e.gameId}/categories/${e.categoryId}/runs/${e.id}/edit`;
