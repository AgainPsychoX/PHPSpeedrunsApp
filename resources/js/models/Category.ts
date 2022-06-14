import { DateTime } from "luxon";
import { RunEntry } from "./Run";

export interface CategoryEntry {
	id: number;
	gameId: number;
	name: string;
}

export interface CategoryDetails extends CategoryEntry {
	rules: string;
	scoreRule: 'none' | 'high' | 'low';
	createdAt: DateTime;
	updatedAt: DateTime;
	runs: RunEntry[];
}
