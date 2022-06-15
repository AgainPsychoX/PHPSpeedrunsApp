import Cookies from "js-cookie";
import { DateTime } from "luxon";
import { CategoryDetails, CategoryEntry } from "./models/Category";
import { GameDetails, GameEntry } from "./models/Game";
import { UserDetails } from "./models/User";
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

export const customFetch = (input: RequestInfo, init?: RequestInit) => {
	init ||= {};
	init.headers = {
		'Accept': 'application/json',
		'Content-Type': 'application/json',
		...init.headers
	};
	const token = Cookies.get('XSRF-TOKEN');
	if (token) {
		(init.headers as Record<string, string>)['X-XSRF-TOKEN'] = token;
	}
	return fetch(input, init);
}



////////////////////////////////////////////////////////////////////////////////
// State

export const initialize = async () => {
	await customFetch(`${location.origin}/sanctum/csrf-cookie`);
}

export const login = async (login: string, password: string, remember  = false) => {
	await customFetch(`${location.origin}/login`, {
		method: 'POST',
		body: JSON.stringify({ name: login, password, remember })
	}).then(r => {
		localStorage.setItem('expectLoggedIn', r.ok ? '1' : '0');
		return r;
	}).then(throwIfNotOk);
	return true;
}

export const logout = async () => {
	localStorage.setItem('expectLoggedIn', '0');
	return customFetch(`${location.origin}/logout`, { method: 'POST' }).then(r => r.ok);
}

export const fetchCurrentUser = async () => {
	return customFetch(`${settings.apiRoot}/user`).then(jsonOrThrowIfNotOk) as Promise<UserDetails>;
}



////////////////////////////////////////////////////////////////////////////////
// Content

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

export type GamesDirectoryOrderBy = 'popularity' | 'alphanumeric' | 'activity' | 'year';

export const fetchGamesDirectory = async (
	page: number,
	orderBy: GamesDirectoryOrderBy = 'popularity',
	direction?: 'asc' | 'desc'
) => {
	const response = await customFetch(`${settings.apiRoot}/games?orderBy=${orderBy}${direction ? '&' + direction : ''}&page=${page}`);
	const json = await response.json() as any as { data: GameEntry[]; meta: PaginationMeta };
	for (const o of json.data) convertDates(o, ['createdAt', 'updateAt', 'latestRunAt']);
	return json;
}
export const fetchGameDetails = async (entryOrId: GameEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	const response = await customFetch(`${settings.apiRoot}/games/${id}`);
	const json = await response.json() as any as { data: GameDetails };
	for (const o of json.data.categories) convertDates(o);
	return convertDates(json.data) as GameDetails;
}

export const fetchCategoryDetails = async (entryOrId: CategoryEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	const response = await customFetch(`${settings.apiRoot}/categories/${id}`);
	const json = await response.json() as any as { data: CategoryDetails };
	for (const o of json.data.runs) convertDates(o);
	return convertDates(json.data) as CategoryDetails;
}



export default {
	customFetch,

	initialize,
	login,
	logout,
	fetchCurrentUser,

	fetchGamesDirectory,
	fetchGameDetails,
	fetchCategoryDetails,
}
