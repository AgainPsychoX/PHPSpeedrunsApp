import React, { useCallback, useContext, useEffect, useState } from "react";
import { Alert, Container, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { fetchUserRuns, PaginationMeta } from "../API";
import { GenericLoadingPage, GenericLoadingSection } from "../components/GenericLoading";
import { getRunPageLink, RunSummary } from "../models/Run";
import UserContext from "../utils/contexts/UserContext";
import { formatDurationHTML } from "../utils/DurationUtils";
import { MyPagination } from "../components/MyPagination";

interface SocialLinkProps {
	name: string;
	url: string;
	icon?: string;
}
const SocialLink = ({ name, url, icon }: SocialLinkProps) => {
	return <a href={url} target="_blank" className="link-muted">
		<div className="h2">{icon && <i className={`bi bi-${icon}`}></i>} {name}</div>
	</a>
}

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
				<a href={`mailto:${user.email}`} className="link-muted">
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
				{user.youtubeUrl && <SocialLink name="YouTube" icon="youtube" url={user.youtubeUrl} />}
				{user.twitchUrl  && <SocialLink name="Twitch"  icon="twitch"  url={user.twitchUrl}  />}
				{user.twitterUrl && <SocialLink name="Twitter" icon="twitter" url={user.twitterUrl} />}
			</>}

			{user.discord && <>
				<small className="text-muted">Tag Discord</small>
				<div className="h2">{user.discord}</div>
			</>}

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

	const anyRunWithScore = !!(runs?.find(run => !!run.score));

	return <Container>
		<small className="text-muted">Ostatnie podejścia</small>
		{runs ?
			runs.length > 0
				? <>
					<Table hover>
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
							{runs.map(run => <UserRunRow key={run.id} run={run} anyRunWithScore={anyRunWithScore} />)}
						</tbody>
					</Table>
					{paginationMeta && <MyPagination meta={paginationMeta} onSelected={onPage} />}
				</>

				// Empty runs array
				: <Alert variant="secondary">Ten użytkownik nie dodał jeszcze żadnych podejść.</Alert>

			// Runs undefined (loading)
			: <GenericLoadingSection description="Ładowanie podejść..." />
		}
	</Container>
}

const UserRunRow = ({run, anyRunWithScore}: {run: RunSummary, anyRunWithScore: boolean}) => {
	const navigate = useNavigate();
	const onClick = () => navigate(getRunPageLink(run));
	return <tr
		key={run.id}
		className="cursor-pointer"
		onClick={onClick}
		tabIndex={0} onKeyDown={event => event.key == 'Enter' && onClick()}
	>
		<td>{run.gameName}</td>
		<td>{run.categoryName}</td>
		{anyRunWithScore && <td>{run.score || '-'}</td>}
		<td>{formatDurationHTML(run.duration)}</td>
		<td>{run.createdAt.toRelative()}</td>
	</tr>
}
