import Cookies from "js-cookie";
import { DateTime } from "luxon";
import { CategoryDetails, CategoryEntry } from "./models/Category";
import { GameDetails, GameEntry, GameSummary } from "./models/Game";
import { RunDetails, RunEntry } from "./models/Run";
import { UserDetails, UserEntry, UserSummary } from "./models/User";
import settings from "./settings";



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

const simplyFetchJSON = (url: string) => fetch(url, { headers: baseHeadersAnd() });

export interface PaginationMeta {
	current_page: number;
	last_page: number;

	from: number;
	to: number;
	total: number;
}

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

export const initialize = async () => {
	await fetch(`${settings.authRoot}/sanctum/csrf-cookie`);
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
	return true;
}

export const logout = async () => {
	localStorage.setItem('expectLoggedIn', '0');
	return fetch(`${settings.authRoot}/logout`, {
		method: 'POST',
		headers: baseHeadersAnd(),
	}).then(r => r.ok);
}

export const fetchCurrentUser = async () => {
	return simplyFetchJSON(`${settings.apiRoot}/user`)
		.then(jsonOrThrowIfNotOk)
		.then(({ data }: { data: UserDetails }) => convertDates(data, ['joinedAt']))
	;
}

export const registerUser = async (formData: FormData) => {
	await fetch(`${settings.authRoot}/register`, {
		method: 'POST',
		headers: baseHeadersAnd(),
		body: formData
	}).then(throwIfNotOk);
	return true;
}



////////////////////////////////////////////////////////////////////////////////
// Content

////////////////////////////////////////
// Users

export type PlayersDirectoryOrderBy = 'alphanumeric' | 'joined' | 'latestRun' | 'runsCount';
export const fetchPlayers = async (
	page: number,
	orderBy: PlayersDirectoryOrderBy = 'latestRun',
	direction?: 'asc' | 'desc',
) => {
	const response = await simplyFetchJSON(`${settings.apiRoot}/users?players&orderBy=${orderBy}${direction ? '&' + direction : ''}&page=${page}`);
	const { data, meta } = await response.json() as any as { data: UserSummary[]; meta: PaginationMeta };
	for (const user of data) {
		convertDates(user, ['joinedAt']);
		if (user.latestRun) {
			convertDates(user.latestRun, ['at']);
		}
	}
	return { data, meta };
}

export const fetchUserDetails = async (entryOrId: UserEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	const response = await simplyFetchJSON(`${settings.apiRoot}/users/${id}`);
	const { data } = await response.json() as any as { data: UserDetails };
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
	const response = await simplyFetchJSON(`${settings.apiRoot}/runs?player=${id}&orderBy=${orderBy}${direction ? '&' + direction : ''}&page=${page}`);
	const json = await response.json() as any as { data: RunEntry[]; meta: PaginationMeta };
	for (const run of json.data) convertDates(run);
	return json;
}

////////////////////////////////////////
// Games

export type GamesDirectoryOrderBy = 'popularity' | 'alphanumeric' | 'activity' | 'year';
export const fetchGamesDirectory = async (
	page: number,
	orderBy: GamesDirectoryOrderBy = 'popularity',
	direction?: 'asc' | 'desc'
) => {
	const response = await simplyFetchJSON(`${settings.apiRoot}/games?orderBy=${orderBy}${direction ? '&' + direction : ''}&page=${page}`);
	const json = await response.json() as any as { data: GameSummary[]; meta: PaginationMeta };
	for (const o of json.data) convertDates(o, ['createdAt', 'updateAt', 'latestRunAt']);
	return json;
}

export const fetchGameDetails = async (entryOrId: GameEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	const response = await simplyFetchJSON(`${settings.apiRoot}/games/${id}`);
	const json = await response.json() as { data: GameDetails };
	for (const o of json.data.categories) convertDates(o);
	return convertDates(json.data) as GameDetails;
}

export const createGame = async (formData: FormData) => {
	const { data } = await fetch(`${settings.apiRoot}/games`, {
		method: 'POST',
		headers: baseHeadersAnd(),
		body: formData
	}).then(jsonOrThrowIfNotOk) as { data: GameDetails };
	return convertDates(data);
}

export const updateGame = async (formData: FormData) => {
	const { data } = await fetch(`${settings.apiRoot}/games/${formData.get('id')}`, {
		method: 'PATCH',
		headers: baseHeadersAnd(),
		body: formData
	}).then(jsonOrThrowIfNotOk) as { data: GameDetails };
	return convertDates(data);
}

export const deleteGame = async (entryOrId: GameEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	return fetch(`${settings.apiRoot}/games/${id}`, {
		method: 'DELETE',
		headers: baseHeadersAnd(),
	}).then(throwIfNotOk);
}

////////////////////////////////////////
// Categories

export const fetchCategoryDetails = async (entryOrId: CategoryEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	const response = await simplyFetchJSON(`${settings.apiRoot}/categories/${id}`);
	const { data } = await response.json() as any as { data: CategoryDetails };
	for (const run of data.runs) {
		run.gameId = data.gameId;
		convertDates(run);
	}
	return convertDates(data) as CategoryDetails;
}

////////////////////////////////////////
// Runs

export const fetchRunDetails = async (entryOrId: RunEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	const response = await simplyFetchJSON(`${settings.apiRoot}/runs/${id}`);
	const json = await response.json() as any as { data: RunDetails };
	return convertDates(json.data) as RunDetails;
}




////////////////////////////////////////////////////////////////////////////////

export default {
	initialize,
	login,
	logout,
	fetchCurrentUser,
	registerUser,

	fetchPlayers,
	fetchUserDetails,
	fetchUserRuns,

	fetchGamesDirectory,
	fetchGameDetails,
	createGame,
	updateGame,
	deleteGame,

	fetchCategoryDetails,

	fetchRunDetails,
}
