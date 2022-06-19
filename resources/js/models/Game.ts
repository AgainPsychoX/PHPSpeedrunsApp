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

