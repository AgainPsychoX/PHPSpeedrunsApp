import React, { ChangeEventHandler, useCallback, useEffect, useState } from "react";
import { Button, Form, InputGroup, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { fetchUsers, UsersOrderBy, PaginationMeta } from "../API";
import { GenericLoadingSection } from "../components/GenericLoading";
import { getRunPageLink } from "../models/Run";
import { getUserPageLink, UserSummary } from "../models/User";
import { MyPagination } from "./MyPagination";

type Sorting = `${Exclude<UsersOrderBy, 'alphanumeric'>},${'desc' | 'asc'}` | 'alphanumeric';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>

const sortingToString: PartialRecord<Sorting, string> = {
	'alphanumeric': 'Alfabetyczne',
	'latestRun,asc': 'Najstarsze podejścia',
	'latestRun,desc': 'Ostatnie podejścia',
	'joined,asc': 'Starszy gracze',
	'joined,desc': 'Nowi gracze',
	'runsCount,desc': 'Najwięcej podejść',
	'runsCount,asc': 'Najmniej podejść',
};

const UsersTable = ({
	heading = 'Użytkownicy',
	sortingOptions = Object.keys(sortingToString) as Sorting[],
	initialSorting = 'joined,desc',
	allowSearch = true,
	initialSearch = '',
	initialPage = 1,
	userTooltip = 'Kliknij, by przejść do profilu użytkownika',
	onUserClick,
	allowNavigateToLatestRun = false,
	ghosts = 'marked',
}: {
	heading?: string;
	sortingOptions?: Sorting[],
	initialSorting?: Sorting,
	allowSearch?: boolean;
	initialSearch?: string;
	initialPage?: number;
	userTooltip?: string | ((user: UserSummary) => string) | undefined;
	onUserClick?: (user: UserSummary) => void;
	allowNavigateToLatestRun?: boolean;
	ghosts?: 'exclude' | 'only' | 'silent' | 'marked';
}) => {
	const navigate = useNavigate();
	const [users, setUsers] = useState<UserSummary[]>();
	const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>();

	const showEmails = users && users[0] && !!users[0].email;

	const [searchText, setSearchText] = useState<string>(initialSearch);
	const [searchTextDebounced, { flush: searchNow }] = useDebounce(searchText, 1000);

	const [sorting, setSorting] = useState<Sorting>(initialSorting);
	const [sortingDebounced] = useDebounce(sorting, 500);
	const [orderBy, direction] = sortingDebounced.split(',') as [UsersOrderBy, ('desc' | 'asc' | undefined)];
	const withLatestRun = orderBy == 'latestRun';

	const onClick = useCallback((user: UserSummary) => {
		if (onUserClick) onUserClick(user);
		else navigate(getUserPageLink(user));
	}, [onUserClick, navigate]);

	const onPage = useCallback((page: number) => {
		(async () => {
			setUsers(undefined);
			const { data, meta } = await fetchUsers({page, orderBy, direction, search: searchTextDebounced, ghosts });
			setUsers(data);
			setPaginationMeta(meta);
		})();
	}, [orderBy, direction, searchTextDebounced, ghosts]);

	const onSortingChange = useCallback<ChangeEventHandler<HTMLSelectElement>>(event => {
		if (!users) return;
		setSorting(event.target.value as Sorting);
	}, [users]);

	useEffect(() => onPage(initialPage), [onPage, initialPage]);

	return <>
		<div className="hstack flex-wrap">
			{heading && <h2>{heading}</h2>}
			<Form className="ms-auto hstack gap-2" onSubmit={event => {
				event.preventDefault();
				if (allowSearch) searchNow();
			}}>
				<InputGroup className="m-auto">
					<Form.Control
						type="text"
						aria-label="Szukaj" aria-describedby="searchUsersButton"
						placeholder="Szukaj"
						value={searchText} onChange={(event) => setSearchText(event.target.value)}
					/>
					<Button variant="outline-secondary" id="searchUsersButton" onClick={() => searchNow()}>
						Szukaj
					</Button>
				</InputGroup>
				<InputGroup className="m-auto">
					<Form.Select
						aria-label="Sortowanie"
						value={sorting}
						onChange={onSortingChange}
					>
						{sortingOptions.map(key => <option key={key} value={key}>{sortingToString[key]}</option>)}
					</Form.Select>
				</InputGroup>
			</Form>
		</div>
		<div className="overflow-auto">
		{users
			?
				<Table hover>
					<thead>
						<tr className="text-nowrap">
							{ghosts == 'marked' && <td></td>}
							<th>Nazwa użytkownika</th>
							{showEmails && <th>E-mail</th>}
							<th>Data dołączenia</th>
							<th>Liczba podejść</th>
							{withLatestRun && <th>Ostatnie podejście</th>}
						</tr>
					</thead>
					<tbody>
						{users.map(user => (
							<tr
								key={user.id}
								className="cursor-pointer"
								title={typeof userTooltip === 'string' ? userTooltip || undefined : userTooltip(user)}
								onClick={() => onClick(user)}
								tabIndex={0} onKeyDown={event => event.key == 'Enter' && onClick(user)}
							>
								{ghosts == 'marked' && <td className="p-1 pb-0">
									{user.isGhost && <i className="bi-balloon fs-5" role="img" aria-label="Duch" title="Ten gracz to duch - niezarejestrowany użytkownik, którego podejścia są dodawane z zewnątrz (np. przez moderatorów)."></i>}
								</td>}
								<td>{user.name}</td>
								{showEmails && <td>{user.email}</td>}
								<td className="text-nowrap text-center">{user.joinedAt.toLocaleString({ year: 'numeric', month: 'long', day: 'numeric' })}</td>
								<td className="text-center">{user.runsCount === undefined ? '?' : user.runsCount}</td>
								{withLatestRun && (
									user.latestRun === undefined
										? <td>-</td>
										: <td
											title={allowNavigateToLatestRun ? "Kliknij, by przejść do szczegółów podejścia" : undefined}
											onClick={event => {
												if (allowNavigateToLatestRun && user.latestRun) {
													event.stopPropagation();
													navigate(getRunPageLink(user.latestRun));
												}
											}}
										>
											{user.latestRun.at.toRelative()}<br/>
											<small>
												w {user.latestRun.gameName}, {user.latestRun.categoryName}
											</small>
										</td>
								)}
							</tr>
						))}
						{users.length == 0 && <tr>
							<td colSpan={42} className="text-center text-muted">
								Nie znaleziono żadnych wyników.
							</td>
						</tr>}
					</tbody>
				</Table>
			:
				<GenericLoadingSection description="Ładowanie graczy..." />
		}
		</div>
		{paginationMeta && <MyPagination meta={paginationMeta} onSelected={onPage} />}
	</>
};
export default UsersTable;
