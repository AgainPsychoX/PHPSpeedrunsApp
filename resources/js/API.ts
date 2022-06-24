import Cookies from "js-cookie";
import { DateTime } from "luxon";
import { CategoryDetails, CategoryEntry } from "./models/Category";
import { GameDetails, GameEntry, GameSummary } from "./models/Game";
import { RunDetails, RunEntry, RunSummary } from "./models/Run";
import { RunVerification, RunVerificationVote } from "./models/RunVerification";
import { ModeratorSummary, UserDetails, UserEntry, UserSummary } from "./models/User";
import settings from "./settings";
import { parseBoolean } from "./utils/SomeUtils";



////////////////////////////////////////////////////////////////////////////////
// Utils

const throwIfNotOk = async (response: Response) => {
	if (!response.ok) {
		const json = await response.json();
		throw new Error(json.message);
	}
	return response;
}
const jsonOrThrowIfNotOk = async (response: Response) => throwIfNotOk(response).then(r => r.json());

const baseHeadersAnd = (other: Record<string, string> = {}): Record<string, string> => ({
	'Accept': 'application/json',
	'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN') || '',
	...other
});

const simplyFetchJSON = (url: string) => fetch(url, { headers: baseHeadersAnd() }).then(jsonOrThrowIfNotOk);

const prepareURLSearchParams = (data: Record<string, string>) => {
	for (const [key, value] of Object.entries(data))
		if (value === undefined)
			delete data[key];
	const params = new URLSearchParams(data);
	// for (const [key, value] of Object.entries(data))
	// 	if (value === undefined)
	// 		params.delete(key);
	return params;
}

export interface PaginationMeta {
	current_page: number;
	last_page: number;

	from: number;
	to: number;
	total: number;
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const convertDates = (o: any, fields: string[] = ['createdAt', 'updateAt']) => {
	for (const field of fields) {
		if (o[field]) {
			o[field] = DateTime.fromISO(o[field]);
		}
	}
	return o;
}



////////////////////////////////////////////////////////////////////////////////
// State

export const isExpectingLoggedIn = () => parseBoolean(localStorage.getItem('expectLoggedIn'));

export const initialize = async () => {
	await fetch(`${settings.authRoot}/sanctum/csrf-cookie`);
	return {
		expectingLoggedIn: isExpectingLoggedIn(),
	};
}

export const login = async (formData: FormData) => {
	await fetch(`${settings.authRoot}/login`, {
		method: 'POST',
		headers: baseHeadersAnd(),
		body: formData
	}).then(r => {
		localStorage.setItem('expectLoggedIn', r.ok ? '1' : '0');
		return r;
	}).then(throwIfNotOk);
}

export const logout = async () => {
	localStorage.setItem('expectLoggedIn', '0');
	await fetch(`${settings.authRoot}/logout`, {
		method: 'POST',
		headers: baseHeadersAnd(),
	}).then(throwIfNotOk);
}

export const fetchCurrentUser = async () => {
	try {
		const { data } = await simplyFetchJSON(`${settings.apiRoot}/user`);
		localStorage.setItem('expectLoggedIn', '1');
		return convertDates(data, ['joinedAt']) as UserDetails;
	}
	catch {
		localStorage.setItem('expectLoggedIn', '0');
	}
}

export const registerUser = async (formData: FormData) => {
	await fetch(`${settings.authRoot}/register`, {
		method: 'POST',
		headers: baseHeadersAnd(),
		body: formData
	}).then(throwIfNotOk);
}



////////////////////////////////////////////////////////////////////////////////
// Content

////////////////////////////////////////
// Users

export type UsersOrderBy = 'alphanumeric' | 'joined' | 'latestRun' | 'runsCount';
export interface FetchUsersOptions {
	page?: number;
	orderBy?: UsersOrderBy;
	direction?: 'asc' | 'desc' | undefined;
	search?: string;
	ghosts?: 'exclude' | 'only' | 'silent' | 'marked' | 'any';
}
export const fetchUsers = async (options: FetchUsersOptions) => {
	const params = prepareURLSearchParams(options as Record<string, string>);
	const json = await simplyFetchJSON(`${settings.apiRoot}/users?${params.toString()}`);
	for (const user of json.data) {
		convertDates(user, ['joinedAt']);
		if (user.latestRun) {
			convertDates(user.latestRun, ['at']);
		}
	}
	return json as { data: UserSummary[]; meta: PaginationMeta };
}

export const fetchUserDetails = async (entryOrId: UserEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	const { data } = await simplyFetchJSON(`${settings.apiRoot}/users/${id}`);
	return convertDates(data, ['joinedAt']) as UserDetails;
}

export type UserRunsOrderBy = 'latest'
export const fetchUserRuns = async (
	entryOrId: UserEntry | number,
	page: number,
	orderBy: UserRunsOrderBy = 'latest',
	direction?: 'asc' | 'desc'
) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	const json = await simplyFetchJSON(`${settings.apiRoot}/runs?player=${id}&orderBy=${orderBy}${direction ? '&' + direction : ''}&page=${page}`);
	for (const run of json.data) convertDates(run);
	return json as { data: RunSummary[]; meta: PaginationMeta };
}

////////////////////////////////////////
// Moderators

export type ModerationTarget = GameEntry | CategoryEntry | 'global';
const moderationTargetToPath = (target: ModerationTarget) => {
	if (target == 'global') return '';
	if ((target as GameEntry).publishYear) return `games/${target.id}/`;
	if ((target as CategoryEntry).gameId) return `categories/${target.id}/`
	throw new Error();
}

export const fetchModerators = async (where: ModerationTarget) => {
	const json = await simplyFetchJSON(`${settings.apiRoot}/${moderationTargetToPath(where)}moderators`)
	for (const moderator of json.data) {
		convertDates(moderator, ['joinedAt', 'assignedAt', 'revokedAt']);
	}
	return json as { data: ModeratorSummary[] };
}

export const addModerator = async (who: UserEntry, where: ModerationTarget) => {
	const { data } = await fetch(`${settings.apiRoot}/${moderationTargetToPath(where)}moderators/${who.id}`, {
		method: 'PUT',
		headers: baseHeadersAnd()
	}).then(jsonOrThrowIfNotOk);
	convertDates(data, ['joinedAt', 'assignedAt', 'revokedAt']);
	return data as ModeratorSummary;
}

export const removeModerator = async (who: ModeratorSummary) => {
	const path = who.scope == 'global' ? '' :
		who.scope == 'game' ? `games/${who.targetId}/` :
		who.scope == 'category' ? `categories/${who.targetId}/` : 'wtf?';
	await fetch(`${settings.apiRoot}/${path}moderators/${who.id}`, {
		method: 'DELETE',
		headers: baseHeadersAnd(),
	}).then(throwIfNotOk);
}

////////////////////////////////////////
// Games

export type GamesDirectoryOrderBy = 'popularity' | 'alphanumeric' | 'activity' | 'year';
export const fetchGamesDirectory = async (
	page: number,
	orderBy: GamesDirectoryOrderBy = 'popularity',
	direction?: 'asc' | 'desc'
) => {
	const json = await simplyFetchJSON(`${settings.apiRoot}/games?orderBy=${orderBy}${direction ? '&' + direction : ''}&page=${page}`)
	for (const game of json.data) convertDates(game, ['createdAt', 'updateAt', 'latestRunAt']);
	return json as { data: GameSummary[]; meta: PaginationMeta };
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const receiveGameDetails = async (json: any) => {
	for (const category of json.data.categories) {
		convertDates(category);
	}
	return convertDates(json.data) as GameDetails;
}

export const fetchGameDetails = async (entryOrId: GameEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	return receiveGameDetails(await simplyFetchJSON(`${settings.apiRoot}/games/${id}`));
}

export const createGame = async (formData: FormData) => {
	return receiveGameDetails(await fetch(`${settings.apiRoot}/games`, {
		method: 'POST',
		headers: baseHeadersAnd(),
		body: formData
	}).then(jsonOrThrowIfNotOk));
}

export const updateGame = async (formData: FormData) => {
	formData.append('_method', 'PATCH');
	return receiveGameDetails(await fetch(`${settings.apiRoot}/games/${formData.get('id')}`, {
		method: 'POST',
		headers: baseHeadersAnd(),
		body: formData
	}).then(jsonOrThrowIfNotOk));
}

export const deleteGame = async (entryOrId: GameEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	await fetch(`${settings.apiRoot}/games/${id}`, {
		method: 'DELETE',
		headers: baseHeadersAnd(),
	}).then(throwIfNotOk);
}

////////////////////////////////////////
// Categories

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const receiveCategoryDetails = async (json: any) => {
	if (!json.data.runs) json.data.runs = [];
	for (const run of json.data.runs) {
		run.gameId = json.data.gameId;
		convertDates(run);
	}
	return convertDates(json.data) as CategoryDetails;
}

export const fetchCategoryDetails = async (entryOrId: CategoryEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	return receiveCategoryDetails(await simplyFetchJSON(`${settings.apiRoot}/categories/${id}`));
}

export const createCategory = async (formData: FormData) => {
	return receiveCategoryDetails(await fetch(`${settings.apiRoot}/games/${formData.get('gameId')}/categories`, {
		method: 'POST',
		headers: baseHeadersAnd(),
		body: formData
	}).then(jsonOrThrowIfNotOk));
}

export const updateCategory = async (formData: FormData) => {
	formData.append('_method', 'PATCH');
	return receiveCategoryDetails(await fetch(`${settings.apiRoot}/categories/${formData.get('id')}`, {
		method: 'POST',
		headers: baseHeadersAnd(),
		body: formData
	}).then(jsonOrThrowIfNotOk));
}

export const deleteCategory = async (entryOrId: CategoryEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	await fetch(`${settings.apiRoot}/categories/${id}`, {
		method: 'DELETE',
		headers: baseHeadersAnd(),
	}).then(throwIfNotOk);
}

////////////////////////////////////////
// Runs

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const receiveRunDetails = async (json: any) => {
	return convertDates(json.data) as RunDetails;
}

export const fetchRunDetails = async (entryOrId: RunEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	return receiveRunDetails(await simplyFetchJSON(`${settings.apiRoot}/runs/${id}`));
}

export const createRun = async (formData: FormData) => {
	return receiveRunDetails(await fetch(`${settings.apiRoot}/games/${formData.get('gameId')}/categories/${formData.get('categoryId')}/runs`, {
		method: 'POST',
		headers: baseHeadersAnd(),
		body: formData
	}).then(jsonOrThrowIfNotOk));
}

export const updateRun = async (formData: FormData) => {
	formData.append('_method', 'PATCH');
	return receiveRunDetails(await fetch(`${settings.apiRoot}/runs/${formData.get('id')}`, {
		method: 'POST',
		headers: baseHeadersAnd(),
		body: formData
	}).then(jsonOrThrowIfNotOk));
}

export const deleteRun = async (entryOrId: RunEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	await fetch(`${settings.apiRoot}/runs/${id}`, {
		method: 'DELETE',
		headers: baseHeadersAnd(),
	}).then(throwIfNotOk);
}

////////////////////////////////////////
// Verifications

export const fetchRunVerifications = async (entryOrId: RunEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	const json = await simplyFetchJSON(`${settings.apiRoot}/runs/${id}/verifiers`);
	for (const entry of json.data) convertDates(entry, ['timestamp']);
	return json.data as RunVerification[];
}

export const voteVerifyRun = async (entryOrId: RunEntry | number, vote: RunVerificationVote, note = '') => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	const json = await fetch(`${settings.apiRoot}/runs/${id}')}/voteVerify`, {
		method: 'POST',
		headers: baseHeadersAnd({
			'Content-Type': 'application/json',
		}),
		body: JSON.stringify({vote, note})
	}).then(jsonOrThrowIfNotOk);
	return convertDates(json.data, ['timestamp']) as RunVerification;
}




////////////////////////////////////////////////////////////////////////////////

export default {
	initialize,
	isExpectingLoggedIn,
	login,
	logout,
	fetchCurrentUser,
	registerUser,

	fetchUsers,
	fetchUserDetails,
	fetchUserRuns,

	fetchModerators,
	addModerator,
	removeModerator,

	fetchGamesDirectory,
	fetchGameDetails,
	createGame,
	updateGame,
	deleteGame,

	fetchCategoryDetails,
	createCategory,
	updateCategory,
	deleteCategory,

	fetchRunDetails,
	createRun,
	updateRun,
	deleteRun,
}
