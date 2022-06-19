import React, { ChangeEventHandler, useCallback, useEffect, useState } from "react";
import { Container, Form, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { fetchPlayers, PlayersDirectoryOrderBy, PaginationMeta } from "../API";
import { GenericLoadingSection } from "../components/GenericLoading";
import { getRunPageLink } from "../models/Run";
import { getUserPageLink, UserSummary } from "../models/User";
import { buildPagination } from "../utils/Pagination";

type Sorting = `${PlayersDirectoryOrderBy},${'desc' | 'asc'}` | 'alphanumeric';

type PartialRecord<K extends keyof any, T> =  Partial<Record<K, T>>

const sortingToString: PartialRecord<Sorting, string> = {
	'alphanumeric': 'Alfabetyczne',
	'latestRun,asc': 'Ostatnie podejścia',
	'latestRun,desc': 'Najstarsze podejścia',
	'joined,asc': 'Najnowsi gracze',
	'joined,desc': 'Najstarsi gracze',
	'runsCount,desc': 'Najwięcej podejść',
	'runsCount,asc': 'Najmniej podejść',
};

export interface UsersPageProps {
	initialPage?: number;
}
const UsersPage = ({
	initialPage = 1,
}: UsersPageProps) => {
	const navigate = useNavigate();
	const [players, setPlayers] = useState<UserSummary[]>();
	const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>();
	const [sorting, setSorting] = useState<Sorting>('latestRun,asc');
	const [orderBy, direction] = sorting.split(',') as [PlayersDirectoryOrderBy, ('desc' | 'asc' | undefined)];
	const withLatestRun = orderBy == 'latestRun';

	const onPage = useCallback((page: number) => {
		(async () => {
			setPlayers(undefined);
			const { data, meta } = await fetchPlayers(page, orderBy, direction);
			setPlayers(data);
			setPaginationMeta(meta);
		})();
	}, [orderBy, direction]);

	const onSortingChange = useCallback<ChangeEventHandler<HTMLSelectElement>>(event => {
		if (!players) return;
		setSorting(event.target.value as Sorting);
	}, [players]);

	useEffect(() => onPage(initialPage), [onPage, initialPage]);

	return <main>
		<Container>
			<div className="hstack flex-wrap">
				<h2>Gracze</h2>
				<div className="ms-auto">
					<Form.Group className="m-auto" controlId="sortingSelection">
						<Form.Select
							aria-label="Sortowanie"
							value={sorting}
							onChange={onSortingChange}
						>
							{Object.entries(sortingToString).map(([key, text]) =>
								<option key={key} value={key}>{text}</option>
							)}
						</Form.Select>
					</Form.Group>
				</div>
			</div>
			{players
				?
					<Table striped hover>
						<thead>
							<tr>
								<th>Nazwa gracza</th>
								<th>Data dołączenia</th>
								<th>Liczba podejść</th>
								{withLatestRun && <th>Ostatnie podejście</th>}
							</tr>
						</thead>
						<tbody>
							{players.map(player => (
								<tr
									key={`${player.id}-${withLatestRun ? 'L' : 'x'}` /* Necessary to avoid duplicating when switching sorting mode fast I guess */}
									style={{cursor: 'pointer'}}
									title="Kliknij, by przejść do profilu gracza"
									onClick={() => navigate(getUserPageLink(player))}
								>
									<td>{player.name}</td>
									<td>{player.joinedAt.toLocaleString({ year: 'numeric', month: 'long', day: 'numeric' })}</td>
									<td className="text-center">{player.runsCount === undefined ? '?' : player.runsCount}</td>
									{withLatestRun && (
										player.latestRun === undefined
											? <td>-</td>
											: <td
												title="Kliknij, by przejść do szczegółów podejścia"
												onClick={event => {
													event.stopPropagation();
													navigate(getRunPageLink(player.latestRun!));
												}}
											>
												{player.latestRun.at.toRelative()} w {player.latestRun.gameName}, {player.latestRun.categoryName}
											</td>
									)}
								</tr>
							))}
						</tbody>
					</Table>
				:
					<GenericLoadingSection description="Ładowanie graczy..." />
			}
			{paginationMeta && buildPagination(paginationMeta, onPage)}
		</Container>
	</main>
};
export default UsersPage;
