import { DateTime } from "luxon";
import { ModeratorEntry } from "./User";

export type RunVerificationVote = 'yes' | 'no' | 'abstain';
export interface RunVerification {
	runId: number;
	userId: number;
	moderator: ModeratorEntry;
	vote: RunVerificationVote
	note?: string;
	timestamp: DateTime;
}
