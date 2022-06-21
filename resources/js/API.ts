import Cookies from "js-cookie";
import { DateTime } from "luxon";
import { CategoryDetails, CategoryEntry } from "./models/Category";
import { GameDetails, GameEntry, GameSummary } from "./models/Game";
import { RunDetails, RunEntry, RunSummary } from "./models/Run";
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

export type UsersOrderBy = 'alphanumeric' | 'joined' | 'latestRun' | 'runsCount';
export interface FetchUsersOptions {
	page?: number;
	orderBy?: UsersOrderBy;
	direction?: 'asc' | 'desc' | undefined;
	search?: string;
}
export const fetchUsers = async (options: FetchUsersOptions) => {
	const params = new URLSearchParams(options as Record<string, string>);
	const response = await simplyFetchJSON(`${settings.apiRoot}/users?${params.toString()}`);
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
	const json = await response.json() as any as { data: RunSummary[]; meta: PaginationMeta };
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
	const response = await simplyFetchJSON(`${settings.apiRoot}/games?orderBy=${orderBy}${direction ? '&' + direction : ''}&page=${page}`).then(throwIfNotOk);
	const { data: games, meta } = await response.json() as { data: GameSummary[]; meta: PaginationMeta };
	for (const game of games) convertDates(game, ['createdAt', 'updateAt', 'latestRunAt']);
	return { games, meta };
}

const receiveGameDetails = async (response: Response) => {
	const { data: game } = await response.json();
	if (!game.categories) game.categories = [];
	for (const category of game.categories) {
		convertDates(category);
	}
	return convertDates(game) as GameDetails;
}

export const fetchGameDetails = async (entryOrId: GameEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	const response = await simplyFetchJSON(`${settings.apiRoot}/games/${id}`).then(throwIfNotOk);
	return receiveGameDetails(response);
}

export const createGame = async (formData: FormData) => {
	const response = await fetch(`${settings.apiRoot}/games`, {
		method: 'POST',
		headers: baseHeadersAnd(),
		body: formData
	}).then(throwIfNotOk);
	return receiveGameDetails(response);
}

export const updateGame = async (formData: FormData) => {
	const response = await fetch(`${settings.apiRoot}/games/${formData.get('id')}`, {
		method: 'PATCH',
		headers: baseHeadersAnd(),
		body: formData
	}).then(throwIfNotOk);
	return receiveGameDetails(response);
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

const receiveCategoryDetails = async (response: Response) => {
	const { data: category } = await response.json();
	if (!category.runs) category.runs = [];
	for (const run of category.runs) {
		run.gameId = category.gameId;
		convertDates(run);
	}
	return convertDates(category) as CategoryDetails;
}

export const fetchCategoryDetails = async (entryOrId: CategoryEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	const response = await simplyFetchJSON(`${settings.apiRoot}/categories/${id}`).then(throwIfNotOk);
	return receiveCategoryDetails(response);
}

export const createCategory = async (formData: FormData) => {
	const response = await fetch(`${settings.apiRoot}/categories`, {
		method: 'POST',
		headers: baseHeadersAnd(),
		body: formData
	}).then(throwIfNotOk);
	return receiveCategoryDetails(response);
}

export const updateCategory = async (formData: FormData) => {
	const response = await fetch(`${settings.apiRoot}/categories/${formData.get('id')}`, {
		method: 'PATCH',
		headers: baseHeadersAnd(),
		body: formData
	}).then(throwIfNotOk);
	return receiveCategoryDetails(response);
}

export const deleteCategory = async (entryOrId: CategoryEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	return fetch(`${settings.apiRoot}/categories/${id}`, {
		method: 'DELETE',
		headers: baseHeadersAnd(),
	}).then(throwIfNotOk);
}

////////////////////////////////////////
// Runs

const receiveRunDetails = async (response: Response) => {
	const { data: run } = await response.json();
	return convertDates(run) as RunDetails;
}

export const fetchRunDetails = async (entryOrId: RunEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	const response = await simplyFetchJSON(`${settings.apiRoot}/runs/${id}`).then(throwIfNotOk);
	return receiveRunDetails(response);
}

export const createRun = async (formData: FormData) => {
	const response = await fetch(`${settings.apiRoot}/runs`, {
		method: 'POST',
		headers: baseHeadersAnd(),
		body: formData
	}).then(throwIfNotOk);
	return receiveRunDetails(response);
}

export const updateRun = async (formData: FormData) => {
	const response = await fetch(`${settings.apiRoot}/runs/${formData.get('id')}`, {
		method: 'PATCH',
		headers: baseHeadersAnd(),
		body: formData
	}).then(throwIfNotOk);
	return receiveRunDetails(response);
}

export const deleteRun = async (entryOrId: RunEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	return fetch(`${settings.apiRoot}/runs/${id}`, {
		method: 'DELETE',
		headers: baseHeadersAnd(),
	}).then(throwIfNotOk);
}



////////////////////////////////////////////////////////////////////////////////

export default {
	initialize,
	login,
	logout,
	fetchCurrentUser,
	registerUser,

	fetchPlayers: fetchUsers,
	fetchUserDetails,
	fetchUserRuns,

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
