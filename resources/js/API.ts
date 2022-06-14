import { DateTime } from "luxon";
import { CategoryDetails, CategoryEntry } from "./models/Category";
import { GameDetails, GameEntry } from "./models/Game";
import settings from "./settings";

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
	const response = await fetch(`${settings.apiRoot}/games?orderBy=${orderBy}${direction ? '&' + direction : ''}&page=${page}`);
	const json = await response.json() as any as { data: GameEntry[]; meta: PaginationMeta };
	for (const o of json.data) convertDates(o, ['createdAt', 'updateAt', 'latestRunAt']);
	return json;
}
export const fetchGameDetails = async (entryOrId: GameEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	const response = await fetch(`${settings.apiRoot}/games/${id}`);
	const json = await response.json() as any as { data: GameDetails };
	for (const o of json.data.categories) convertDates(o);
	return convertDates(json.data) as GameDetails;
}

export const fetchCategoryDetails = async (entryOrId: CategoryEntry | number) => {
	const id = typeof entryOrId == 'number' ? entryOrId : entryOrId.id;
	const response = await fetch(`${settings.apiRoot}/categories/${id}`);
	const json = await response.json() as any as { data: CategoryDetails };
	for (const o of json.data.runs) convertDates(o);
	return convertDates(json.data) as CategoryDetails;
}
