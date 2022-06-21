import React, { useCallback, useContext, useEffect, useState } from "react";
import { Alert, Container, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { fetchUserRuns, PaginationMeta } from "../API";
import { GenericLoadingPage, GenericLoadingSection } from "../components/GenericLoading";
import { getRunPageLink, RunSummary } from "../models/Run";
import UserContext from "../utils/contexts/UserContext";
import { formatDurationHTML } from "../utils/DurationUtils";
import { buildPagination } from "../utils/Pagination";

const UserPage = () => {
	const user = useContext(UserContext);

	if (!user) {
		return <GenericLoadingPage/>
	}

	return <main>
		<Container>
			<small className="text-muted">Nazwa</small>
			<div className="h2">{user.name}</div>

			{user.email && <>
				<a style={{color: 'initial', textDecoration: 'none' }} href={`mailto:${user.email}`}>
					<small className="text-muted">E-mail</small>
					<div className="h2">{user.email}</div>
				</a>
			</>}

			<small className="text-muted">Dołączył</small>
			<div className="h2">{user.joinedAt.toLocaleString({ year: 'numeric', month: 'long', day: 'numeric' })}</div>

			<small className="text-muted">Liczba podejść</small>
			<div className="h2">{user.runsCount}</div>

			{(user.youtubeUrl || user.twitchUrl || user.twitterUrl) && <>
				<small className="text-muted">Linki społecznościowe</small>
				{user.youtubeUrl && <a href={user.youtubeUrl}><div className="h2">YouTube</div></a>}
				{user.twitchUrl && <a href={user.twitchUrl}><div className="h2">Twitch</div></a>}
				{user.twitterUrl && <a href={user.twitterUrl}><div className="h2">Twitter</div></a>}
			</>}

			{user.discord && <>
				<small className="text-muted">Tag Discord</small>
				<div className="h2">{user.discord}</div>
			</>}
			{/* <Link style={{color: 'initial', textDecoration: 'none' }} to={`/games/${game.id}/categories/${category.id}`}>
				<small className="text-muted">Kategoria</small>
				<h2>{category.name}</h2>
			</Link> */}

			{user.profileDescription.length > 0 && <>
				<small className="text-muted">Opis profilu</small>
				<p>{user.profileDescription}</p>
			</>}
		</Container>
		<UserRunsSection/>
	</main>
}
export default UserPage;

const UserRunsSection = ({
	initialPage = 1,
}: {
	initialPage?: number;
}) => {
	const navigate = useNavigate();
	const user = useContext(UserContext);
	const [runs, setRuns] = useState<RunSummary[]>();
	const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>();

	const onPage = useCallback((page: number) => {
		if (!user) return;
		(async () => {
			const { data, meta } = await fetchUserRuns(user.id, page);
			setRuns(data);
			setPaginationMeta(meta);
		})();
	}, [user]);

	useEffect(() => onPage(initialPage), [onPage, initialPage]);

	if (!user) {
		return <Container>
			<GenericLoadingSection/>
		</Container>
	}

	const anyRunWithScore = runs?.find(run => !!run.score);

	return <Container>
		<small className="text-muted">Ostatnie podejścia</small>
		{runs ?
			runs.length > 0
				? <>
					<Table striped hover>
						<thead>
							<tr>
								<th>Gra</th>
								<th>Kategoria</th>
								{anyRunWithScore && <th>Wynik</th>}
								<th>Czas</th>
								<th>Data</th>
							</tr>
						</thead>
						<tbody>
							{runs.map(run => (
								<tr
									key={run.id}
									style={{cursor: 'pointer'}}
									onClick={() => navigate(getRunPageLink(run))}
								>
									<td>{run.gameName}</td>
									<td>{run.categoryName}</td>
									{anyRunWithScore && <td>{run.score || '-'}</td>}
									<td>{formatDurationHTML(run.duration)}</td>
									<td>{run.createdAt.toRelative()}</td>
								</tr>
							))}
						</tbody>
					</Table>
					{paginationMeta && buildPagination(paginationMeta, onPage)}
				</>

				// Empty runs array
				: <Alert variant="secondary">Ten użytkownik nie dodał jeszcze żadnych podejść.</Alert>

			// Runs undefined (loading)
			: <GenericLoadingSection description="Ładowanie podejść..." />
		}
	</Container>
}
