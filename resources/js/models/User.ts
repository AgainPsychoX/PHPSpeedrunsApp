import { DateTime } from "luxon";
import { RunEntry, RunId } from "./Run";

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
	joinedAt: DateTime;
	countryId?: string;

	isAdmin?: boolean;
	isAnyModerator?: boolean;
	isGhost: boolean;

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

	// Only on details page
	latestRuns?: RunEntry[];
}

export const currentUserPageLink = '/users/current';
export const getUserPageLink = (e: UserEntry) => `/users/${e.id}`;
export const getUserPageLinkFromRun = (e: RunId) => `/users/${e.userId}`;
export const getEditUserPageLink = (e: UserEntry) => `/users/${e.id}/edit`;

export type ModeratorScope = 'global' | 'game' | 'category';
export interface ModeratorEntry extends UserEntry {
	scope: ModeratorScope;
}

export interface ModeratorSummary extends ModeratorEntry {
	joinedAt: DateTime;

	targetId: number;

	assignedAt: DateTime;
	assignedBy: UserEntry;
}
