import React, { useCallback, useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { fetchGamesDirectory, GamesDirectoryOrderBy, PaginationMeta } from "../API";
import { GenericLoadingSection } from "../components/GenericLoading";
import { GameSummary, getNewGamePageLink } from "../models/Game";
import { buildPagination } from "../utils/Pagination";

type Sorting = `${GamesDirectoryOrderBy},${'desc' | 'asc'}` | 'alphanumeric';

type PartialRecord<K extends keyof any, T> =  Partial<Record<K, T>>

const sortingToString: PartialRecord<Sorting, string> = {
	'alphanumeric': 'Alfabetyczne',
	'popularity,desc': 'Najpopularniejsze',
	'popularity,asc': 'Najmniej popularne',
	'year,desc': 'Najnowsze (rok wydania)',
	'year,asc': 'Najstarsze (rok wydania)',
	'activity,desc': 'Ostatnia aktywność',
	'activity,asc': 'Brak aktywności',
};

const formatRunsCountString = (n: number) => `${n} ${n == 0 || n > 5 ? 'podejść' : n == 1 ? 'podejście' : 'podejścia'}`;

export interface GamesPageProps {
	initialPage?: number;
}
const GamesPage = ({
	initialPage = 1,
}: GamesPageProps) => {
	const [games, setGames] = useState<GameSummary[]>();
	const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>();
	const [sorting, setSorting] = useState<Sorting>('popularity,desc');
	const [sortingDebounced] = useDebounce(sorting, 500);
	const [orderBy, direction] = sortingDebounced.split(',') as [GamesDirectoryOrderBy, ('desc' | 'asc' | undefined)];

	const onPage = useCallback((page: number) => {
		(async () => {
			const { data: games, meta } = await fetchGamesDirectory(page, orderBy, direction);
			setGames(games);
			setPaginationMeta(meta);
		})();
	}, [orderBy, direction]);

	useEffect(() => onPage(initialPage), [onPage, initialPage]);

	return <main>
		<Container>
			<div className="hstack gap-2 flex-wrap">
				<h2>Katalog gier</h2>
				<div className="ms-auto">
					<Form.Group className="m-auto" controlId="sortingSelection">
						<Form.Select aria-label="Sortowanie" onChange={event => setSorting(event.target.value as Sorting)} value={sorting}>
							{Object.entries(sortingToString).map(([key, text]) =>
								<option key={key} value={key}>{text}</option>
							)}
						</Form.Select>
					</Form.Group>
				</div>
				<div>
					<Button variant="outline-secondary" as={Link} to={getNewGamePageLink()}>Dodaj grę</Button>
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
											{game.runsCount !== undefined && <Card.Subtitle>{formatRunsCountString(game.runsCount)}</Card.Subtitle>}
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
