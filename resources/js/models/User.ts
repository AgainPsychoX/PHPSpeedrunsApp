import { DateTime } from "luxon";

export interface UserEntry {
	name: string;
	email: string;
}

export interface UserDetails extends UserEntry {
	verified: boolean;
	joinedAt: DateTime;

	countryId?: string;
	youtubeUrl?: string;
	twitchUrl?: string;
	twitterUrl?: string;
	discord?: string;

	profileDescription: string;
}
