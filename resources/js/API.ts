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

const fetchAsJSONP = (url: string) => {
	return new Promise<any>((resolve, reject) => {
		const script = document.createElement('script');
		script.src = url;
		script.addEventListener('error', () => {
			reject();
			script.remove();
		});
		(globalThis as any).jsonp = (data: any) => {
			resolve(data);
			script.remove();
		};
		document.body.append(script);
	});
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
const delayed = (what: any, ms: number = 1) => delay(ms).then(() => what);

const createDownload = (filename: string, data: string) => {
	const blob = new Blob([data], { type: "application/json" });
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.style.display = 'none';
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	window.URL.revokeObjectURL(url);
	a.remove();
}

const simplyFetchJSON = async (url: string) => {
	const [root, what] = url.split('/api/');
	const fake = what.replace(/[\/?]/g, '_') + '.js';
	if (location.href.startsWith('file:')) {
		return fetchAsJSONP(`${root}/fake-api/${fake}`);
	}
	const data = await fetch(url, { headers: baseHeadersAnd() }).then(jsonOrThrowIfNotOk);
	// Remove duplicate downloads using PowerShell: ls | where { $_.Name -Like '*(*' } | rm
	const content = 'jsonp(' + JSON.stringify(data, undefined, '\t') + ');';
	createDownload(fake, content);
	return data;
}

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
	if (!location.href.startsWith('file:')) {
		await fetch(`${settings.authRoot}/sanctum/csrf-cookie`);
	}
	return {
		expectingLoggedIn: isExpectingLoggedIn(),
	};
}

export const login = async (formData: FormData) => {
	if (location.href.startsWith('file:')) {
		if (formData.get('name') == 'admin') {
			localStorage.setItem('expectLoggedIn', '1');
			return delayed({});
		}
		else {
			return delayed({
				message: "Nieprawidłowe dane logowania.",
				errors: {"name":["Nieprawidłowe dane logowania."]}
			});
		}
	}
	return fetch(`${settings.authRoot}/login`, {
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
	if (location.href.startsWith('file:'))
		return delayed({});
	return fetch(`${settings.authRoot}/logout`, {
		method: 'POST',
		headers: baseHeadersAnd(),
	}).then(throwIfNotOk);
}

export const fetchCurrentUser = async () => {
	if (location.href.startsWith('file:')) {
		if (isExpectingLoggedIn()) {
			const { data } = await simplyFetchJSON(`${settings.apiRoot}/user`);
			return convertDates(data, ['joinedAt']) as UserDetails;
		}
		return;
	}
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
	if (location.href.startsWith('file:')) {
		window.alert(`Nie ma możliwości rejestracji w wersji statycznej ;)`);
		return delayed({});
	}
	return fetch(`${settings.authRoot}/register`, {
		method: 'POST',
		headers: baseHeadersAnd(),
		body: formData
	}).then(throwIfNotOk);
}

export const remindPassword = async (formData: FormData) => {
	if (location.href.startsWith('file:')) {
		return delayed({
			message: "Nie ma możliwości przypominania hasła w wersji statycznej, ale można wejść na adres '/reset-password'.",
			errors: {"email":["Nie ma możliwości przypominania hasła w wersji statycznej, ale można wejść na adres '/reset-password'."]}
		});
	}
	return fetch(`${settings.authRoot}/forgot-password`, {
		method: 'POST',
		headers: baseHeadersAnd(),
		body: formData
	}).then(throwIfNotOk);
}

export const resetPassword = async (formData: FormData) => {
	if (location.href.startsWith('file:')) {
		window.alert(`Nie ma możliwości resetowania hasła w wersji statycznej, ale załóżmy, że się udało...`);
		return delayed({});
	}
	return fetch(`${settings.authRoot}/reset-password`, {
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
	if (location.href.startsWith('file:'))
		throw new Error(`Operacja nieobsługiwana w wersji statycznej.`);
	const { data } = await fetch(`${settings.apiRoot}/${moderationTargetToPath(where)}moderators/${who.id}`, {
		method: 'PUT',
		headers: baseHeadersAnd()
	}).then(jsonOrThrowIfNotOk);
	convertDates(data, ['joinedAt', 'assignedAt', 'revokedAt']);
	return data as ModeratorSummary;
}

export const removeModerator = async (who: ModeratorSummary) => {
	if (location.href.startsWith('file:'))
		throw new Error(`Operacja nieobsługiwana w wersji statycznej.`);
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
	if (location.href.startsWith('file:'))
		throw new Error(`Operacja nieobsługiwana w wersji statycznej.`);
	return receiveGameDetails(await fetch(`${settings.apiRoot}/games`, {
		method: 'POST',
		headers: baseHeadersAnd(),
		body: formData
	}).then(jsonOrThrowIfNotOk));
}

export const updateGame = async (formData: FormData) => {
	if (location.href.startsWith('file:'))
		throw new Error(`Operacja nieobsługiwana w wersji statycznej.`);
	formData.append('_method', 'PATCH');
	return receiveGameDetails(await fetch(`${settings.apiRoot}/games/${formData.get('id')}`, {
		method: 'POST',
		headers: baseHeadersAnd(),
		body: formData
	}).then(jsonOrThrowIfNotOk));
}

export const deleteGame = async (entryOrId: GameEntry | number) => {
	if (location.href.startsWith('file:'))
		throw new Error(`Operacja nieobsługiwana w wersji statycznej.`);
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
	if (location.href.startsWith('file:'))
		throw new Error(`Operacja nieobsługiwana w wersji statycznej.`);
	return receiveCategoryDetails(await fetch(`${settings.apiRoot}/games/${formData.get('gameId')}/categories`, {
		method: 'POST',
		headers: baseHeadersAnd(),
		body: formData
	}).then(jsonOrThrowIfNotOk));
}

export const updateCategory = async (formData: FormData) => {
	if (location.href.startsWith('file:'))
		throw new Error(`Operacja nieobsługiwana w wersji statycznej.`);
	formData.append('_method', 'PATCH');
	return receiveCategoryDetails(await fetch(`${settings.apiRoot}/categories/${formData.get('id')}`, {
		method: 'POST',
		headers: baseHeadersAnd(),
		body: formData
	}).then(jsonOrThrowIfNotOk));
}

export const deleteCategory = async (entryOrId: CategoryEntry | number) => {
	if (location.href.startsWith('file:'))
		throw new Error(`Operacja nieobsługiwana w wersji statycznej.`);
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

export type RunsOrderBy = 'latest';
export interface FetchRunsOptions {
	page?: number;
	perPage?: number;
	orderBy?: RunsOrderBy;
	direction?: 'asc' | 'desc' | undefined;
	user?: UserEntry | number;
}
export const fetchRuns = async (options: FetchRunsOptions) => {
	options.user = typeof options.user == 'number' ? options.user : options.user?.id;
	const params = prepareURLSearchParams(options as Record<string, string>);
	const json = await simplyFetchJSON(`${settings.apiRoot}/runs?${params.toString()}`);
	for (const run of json.data) convertDates(run);
	return json as { data: RunSummary[]; meta: PaginationMeta };
}

export const fetchRunDetails = async (entryOrId: RunEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	return receiveRunDetails(await simplyFetchJSON(`${settings.apiRoot}/runs/${id}`));
}

export const createRun = async (formData: FormData) => {
	if (location.href.startsWith('file:'))
		throw new Error(`Operacja nieobsługiwana w wersji statycznej.`);
	return receiveRunDetails(await fetch(`${settings.apiRoot}/games/${formData.get('gameId')}/categories/${formData.get('categoryId')}/runs`, {
		method: 'POST',
		headers: baseHeadersAnd(),
		body: formData
	}).then(jsonOrThrowIfNotOk));
}

export const updateRun = async (formData: FormData) => {
	if (location.href.startsWith('file:'))
		throw new Error(`Operacja nieobsługiwana w wersji statycznej.`);
	formData.append('_method', 'PATCH');
	return receiveRunDetails(await fetch(`${settings.apiRoot}/runs/${formData.get('id')}`, {
		method: 'POST',
		headers: baseHeadersAnd(),
		body: formData
	}).then(jsonOrThrowIfNotOk));
}

export const deleteRun = async (entryOrId: RunEntry | number) => {
	if (location.href.startsWith('file:'))
		throw new Error(`Operacja nieobsługiwana w wersji statycznej.`);
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
	if (location.href.startsWith('file:'))
		throw new Error(`Operacja nieobsługiwana w wersji statycznej.`);
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
	remindPassword,
	resetPassword,

	fetchUsers,
	fetchUserDetails,

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

	fetchRuns,
	fetchRunDetails,
	createRun,
	updateRun,
	deleteRun,

	fetchRunVerifications,
	voteVerifyRun,
}
