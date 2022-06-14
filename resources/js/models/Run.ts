import { DateTime } from "luxon";

export interface RunEntry {
	id: number;
	categoryId: number;
	userId: number;
	userName: string;
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
