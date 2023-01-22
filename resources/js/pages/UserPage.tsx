import React, { useCallback, useContext, useEffect, useState } from "react";
import { Alert, Button, Col, Container, OverlayTrigger, Row, Table, Tooltip } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { fetchUserRuns, PaginationMeta } from "../API";
import { GenericLoadingPage, GenericLoadingSection } from "../components/GenericLoading";
import { getRunPageLink, RunSummary } from "../models/Run";
import UserContext from "../utils/contexts/UserContext";
import { formatDurationHTML } from "../utils/DurationUtils";
import { MyPagination } from "../components/MyPagination";
import AppContext from "../utils/contexts/AppContext";
import { getEditUserPageLink } from "../models/User";

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

const DiscordLink = (props: { id: string }) => {
	const [show, setShow] = useState(false);
	useEffect(() => {
		if (!show) return;
		const a = setTimeout(() => {
			setShow(false);
		}, 1000);
		return () => {
			clearTimeout(a);
			setShow(false);
		}
	}, [show]);

	return <>
		<OverlayTrigger
			trigger={'focus'}
			placement={'right'}
			overlay={<Tooltip id="tooltip-copied">Skopiowano!</Tooltip>}
			show={show}
		>
			<div
				className="h2 link-muted d-inline-block pe-2"
				style={{marginTop: '-0.25rem', paddingTop: '0.25rem'}} // Dirty fix for weird misalignment
				title="Kliknij, by skopiować"
				onClick={() => {
					setShow(true);
					window.navigator.clipboard.writeText(props.id);
				}}
			>
				<i className="bi bi-discord"></i> {props.id}
			</div>
		</OverlayTrigger>
	</>
}

const UserPage = () => {
	const { currentUser } = useContext(AppContext);
	const user = useContext(UserContext);

	if (!user) {
		return <GenericLoadingPage/>
	}

	const canEdit = user.id == currentUser?.id || currentUser?.isAdmin;

	return <main>
		<Container>
			<Row>
				<Col xs={12} md={6}>
					<small className="text-muted">Nazwa</small>
					<div className="h2">{user.name}</div>

					<small className="text-muted">Dołączył</small>
					<div className="h2">{user.joinedAt.toLocaleString({ year: 'numeric', month: 'long', day: 'numeric' })}</div>

					<small className="text-muted">Liczba podejść</small>
					<div className="h2">{user.runsCount}</div>
				</Col>
				<Col xs={12} md={6}>
					{user.email && <>
						<a href={`mailto:${user.email}`} className="link-muted">
							<small className="text-muted">E-mail</small>
							<div className="h2">{user.email}</div>
						</a>
					</>}

					{(user.youtubeUrl || user.twitchUrl || user.twitterUrl) && <>
						<small className="text-muted">Linki społecznościowe</small>
						<div className="mb-2">
							{user.youtubeUrl && <SocialLink name="YouTube" icon="youtube" url={user.youtubeUrl} />}
							{user.twitchUrl  && <SocialLink name="Twitch"  icon="twitch"  url={user.twitchUrl}  />}
							{user.twitterUrl && <SocialLink name="Twitter" icon="twitter" url={user.twitterUrl} />}
						</div>
					</>}

					{user.discord && <>
						<small className="text-muted">Tag Discord</small>
						<div className="mb-2">
							<DiscordLink id={user.discord} />
						</div>
					</>}
				</Col>
			</Row>
			<Container>
				<div className="hstack gap-2 justify-content-center mb-2">
					{canEdit && <Button variant="outline-secondary" as={Link} to={getEditUserPageLink(user)}>Edytuj profil</Button>}
				</div>
			</Container>
			<Row>
				<Col>
					{user.profileDescription.length > 0 && <>
						<small className="text-muted">Opis profilu</small>
						<p>{user.profileDescription}</p>
					</>}
				</Col>
			</Row>
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
