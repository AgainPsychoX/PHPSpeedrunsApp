import { DateTime } from "luxon";
import { CategoryEntry } from "./Category";

export interface GameEntry {
	id: number;
	name: string;
	icon: string;
	publishYear: string;
}

export interface GameEntryWithSortingInfo extends GameEntry {
	runsCount?: number;
	latestRunAt?: DateTime;
}

export interface GameDetails extends GameEntry {
	description: string;
	rules: string;
	createdAt: DateTime;
	updatedAt: DateTime;
	categories: CategoryEntry[];
}

