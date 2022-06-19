import { DateTime } from "luxon";
import { GameEntry } from "./Game";
import { RunId } from "./Run";

export interface UserEntry {
	id: number;
	name: string;

	// Only displayed if logged in as the user or moderator
	email?: string;
}

interface LatestRunInfo extends RunId {
	at: DateTime;
	categoryName: string;
	gameName: string;
}

export interface UserSummary extends UserEntry {
	isGhost: boolean;

	joinedAt: DateTime;

	countryId?: string;

	// Optional statistics (sorting or details)
	runsCount?: number;

	latestRun?: LatestRunInfo;
}

export interface UserDetails extends UserSummary {
	// Only displayed if logged in as the user or moderator
	verified?: boolean;

	youtubeUrl?: string;
	twitchUrl?: string;
	twitterUrl?: string;
	discord?: string;

	profileDescription: string;
}

export const getUserPageLink = (e: UserEntry) => `/users/${e.id}`;
