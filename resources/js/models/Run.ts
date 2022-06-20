import { DateTime } from "luxon";

export interface RunId {
	id: number;
	gameId: number;
	categoryId: number;
}

export interface RunEntry extends RunId {
	id: number;
	gameId: number;
	gameName?: string;
	categoryId: number;
	categoryName?: string;
	userId: number;
	userName?: string;
	duration: number;
	score: number;
	videoUrl: string;
	createdAt: DateTime;
}

export interface RunDetails extends RunEntry {
	notes: string;
	state: 'pending' | 'verified' | 'invalid';
	updatedAt: DateTime;
}

export const getRunPageLink = (e: RunId) => `/games/${e.gameId}/categories/${e.categoryId}/runs/${e.id}`;
export const getEditRunPageLink = (e: RunId) => `/games/${e.gameId}/categories/${e.categoryId}/runs/${e.id}/edit`;
