import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, Col, Container, Form, Row } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { fetchGamesDirectory, GamesDirectoryOrderBy, PaginationMeta } from "../API";
import { GenericLoadingSection } from "../components/GenericLoading";
import { GameEntryWithSortingInfo } from "../models/Game";
import { buildPagination } from "../utils/Pagination";

type Sorting = `${GamesDirectoryOrderBy},${'desc' | 'asc'}` | 'alphanumeric';

type PartialRecord<K extends keyof any, T> =  Partial<Record<K, T>>

const sortingToString: PartialRecord<Sorting, string> = {
	'popularity,asc': 'Najmniej popularne',
	'popularity,desc': 'Najpopularniejsze',
	'alphanumeric': 'Alfabetyczne',
	'year,asc': 'Najstarsze (rok wydania)',
	'year,desc': 'Najnowsze (rok wydania)',
	'activity,asc': 'Brak aktywności',
	'activity,desc': 'Ostatnia aktywność',
};

export interface GamesPageProps {
	initialPage?: number;
}
export const GamesPage = ({
	initialPage = 1,
}: GamesPageProps) => {
	const [games, setGames] = useState<GameEntryWithSortingInfo[]>();
	const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>();
	const [sorting, setSorting] = useState<Sorting>('popularity,desc');
	const [orderBy, direction] = sorting.split(',') as [GamesDirectoryOrderBy, ('desc' | 'asc' | undefined)];

	const onPage = useCallback((page: number) => {
		(async () => {
			const { data, meta } = await fetchGamesDirectory(page, orderBy, direction);
			setGames(data);
			setPaginationMeta(meta);
		})();
	}, [sorting]);

	useEffect(() => onPage(initialPage), [sorting]);

	return <main>
		<Container>
			<div className="hstack flex-wrap">
				<h2>Katalog gier</h2>
				<div className="ms-auto">
					<Form.Group className="m-auto" controlId="sortingSelection">
						<Form.Select aria-label="Sortowanie" onChange={event => setSorting(event.target.value as Sorting)} value={sorting}>
							{Object.entries(sortingToString).map(([key, text], i) =>
								<option key={key} value={key}>{text}</option>
							)}
						</Form.Select>
					</Form.Group>
				</div>
			</div>
			{games
				?
					<Row xs={1} md={2} lg={4} className="g-2 py-2">
						{games.map(game => (
							<Col key={game.id}>
								<NavLink to={`/games/${game.id}`} className="text-decoration-none text-reset">
									<Card>
										<Card.Img variant="top" src={game.icon} />
										<Card.Body>
											<Card.Title>{game.name} <small className="text-muted">({game.publishYear})</small></Card.Title>
											{game.latestRunAt && <Card.Subtitle>aktywność {game.latestRunAt.toRelative()}</Card.Subtitle>}
											{game.runsCount && <Card.Subtitle>{game.runsCount} podejść</Card.Subtitle>}
										</Card.Body>
									</Card>
								</NavLink>
							</Col>
						))}
					</Row>
				:
					<GenericLoadingSection description="Ładowanie gier..." />
			}
			{paginationMeta && buildPagination(paginationMeta, onPage)}
		</Container>
	</main>
};
export default GamesPage;
