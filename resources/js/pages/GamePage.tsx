import React, { useContext, useEffect, useMemo, useState } from "react";
import { Container, Col, Row, Tabs, Tab, Table, Button, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { GenericLoadingPage, GenericLoadingSection } from "../components/GenericLoading";
import { CategoryDetails, getCategoryModerationPageLink, getCategoryPageLink, getEditCategoryPageLink, getNewRunPageLink } from "../models/Category";
import { getEditGamePageLink, getGameModerationPageLink, getNewCategoryPageLink, isGameIconPlaceholder } from "../models/Game";
import { getRunPageLink, RunSummary } from "../models/Run";
import { getUserPageLink } from "../models/User";
import CategoryContext from "../utils/contexts/CategoryContext";
import GameContext from "../utils/contexts/GameContext";
import { formatDurationHTML } from "../utils/DurationUtils";
import { MyPagination } from "../components/MyPagination";

export const GamePage = () => {
	const navigate = useNavigate();
	const { game, isModerator: isGameModerator } = useContext(GameContext);
	const { category: categoryDetails } = useContext(CategoryContext);
	const [activeKey, setActiveKey] = useState<string>('');

	useEffect(() => {
		if (!game) return;
		if (categoryDetails) {
			if (!activeKey) setActiveKey(categoryDetails.id.toString());
		}
		else {
			if (game.categories.length > 0) {
				navigate(getCategoryPageLink(game.categories[0]), { replace: true });
			}
		}
	}, [game, categoryDetails, activeKey, navigate])

	if (!game) {
		return <GenericLoadingPage />
	}

	const gameHasIcon = game.icon && !isGameIconPlaceholder(game);

	return <main>
		<Container className="mb-4">
			{gameHasIcon && <>
				<div className="escape-container float-md-end">
					<Col xs={12} md={5} className="mb-2 mb-md-0 mt-0 px-0 px-sm-half-gutter">
						<div className="ps-md-3 pb-md-3">
							<img src={game.icon} className="rounded-sm-3 w-100" />
						</div>
					</Col>
				</div>
			</>}
			<div className="hstack gap-2 flex-wrap">
				<div>
					<small>Tytuł i rok wydania</small>
					<h1>{game.name} <small className="text-muted">({game.publishYear})</small></h1>
				</div>
				<div className="ms-auto">
					{isGameModerator && <Button variant="outline-secondary" size="sm" as={Link} to={getEditGamePageLink(game)}>Edytuj lub usuń grę</Button>}
				</div>
			</div>
			{game.description && <>
				<h5>Opis</h5>
				<p className="text-justify">{game.description}</p>
			</>}
			{game.rules && <>
				<h5>Zasady gry</h5>
				<p className="text-justify">{game.rules}</p>
			</>}
			<div className="hstack gap-2 flex-wrap align-items-end mb-2">
				<h5 className="mb-0">Moderatorzy</h5>
				<div className="ms-auto">
					{isGameModerator && <Button variant="outline-secondary" size="sm" as={Link} to={getGameModerationPageLink(game)}>Zarządzaj moderatorami</Button>}
				</div>
			</div>
			<ul className="row" style={{listStylePosition: 'inside'}}>
				{game.moderators.length > 0
					? game.moderators.map(user =>
						<li className="col-10 col-sm-6 col-md-3" key={user.id}>
							<Link to={getUserPageLink(user)} className="link-muted">{user.name}</Link>
						</li>
					)
					: <small>(brak bezpośrednich moderatorów)</small>
				}
			</ul>
		</Container>
		<Container className="mb-4" style={{clear: 'both'}}>
			<Row>
				<Col xs={12}>
					<div className="hstack gap-2 flex-wrap align-items-end mb-2">
						<h4 className="mb-0">Kategorie</h4>
						<div className="ms-auto">
							{isGameModerator && <Button variant="outline-secondary" size="sm" as={Link} to={getNewCategoryPageLink(game)}>Dodaj kategorię</Button>}
						</div>
					</div>
				</Col>
				<Col xs={12} className="px-0 px-sm-half-gutter">
					{categoryDetails
						?
							<Tabs
								className="px-1 px-sm-2 mx-0 mx-sm-1 border-0"
								transition={false}
								activeKey={activeKey}
								onSelect={(key: string | null) => {
									setActiveKey(key || categoryDetails.id.toString());
									const id = parseInt(key || '0');
									const entry = game.categories.find(e => e.id == id)!;
									navigate(getCategoryPageLink(entry));
								}}
							>
								{game.categories.map(category =>
									<Tab
										key={category.id} eventKey={category.id.toString()}
										title={category.name}
										tabClassName="h3" className="p-2 rounded-sm-3 border-top category-tab-custom"
									>
										{categoryDetails.id == category.id
											? <CategoryTabContent/>
											: <GenericLoadingSection divStyle={{paddingBottom: '80vh'}} />
										}
									</Tab>
								)}
							</Tabs>
						:
							<p>Na gra nie ma jeszcze kategorii.</p>
					}
				</Col>
			</Row>
		</Container>
	</main>
};
export default GamePage;



const CategoryTabContent = () => {
	const { category, isModerator } = useContext(CategoryContext);
	const [onlyVerified, setOnlyVerified] = useState<boolean>(!isModerator);

	const filteredRuns = useMemo(() => {
		if (!category) return [];
		return category.runs.filter(run => onlyVerified ? (run.state === 'verified') : (run.state !== 'invalid'));
	}, [category]);

	// Fake paging for runs
	const runsPerPage = 30;
	const [page, setPage] = useState<number>(1);
	const paginationMeta = useMemo(() => ({
		current_page: page,
		from: 1 + (page - 1) * runsPerPage,
		to: Math.min(filteredRuns.length, page * runsPerPage),
		total: filteredRuns.length,
		last_page: Math.ceil(filteredRuns.length / runsPerPage),
	}), [filteredRuns, page]);
	const runsChunked = useMemo(() => {
		const pages = [];
		for (let i = 0; i < filteredRuns.length; i += runsPerPage) {
			const chunk = filteredRuns.slice(i, i + runsPerPage);
			pages.push(chunk);
		}
		return pages;
	}, [filteredRuns]);

	if (!category) {
		return <GenericLoadingSection/>
	}

	const runsOnPage = runsChunked[page - 1];

	return <>
		{category.rules && <>
			<h5>Zasady kategorii</h5>
			<p className="text-justify">{category.rules}</p>
		</>}
		<div className="hstack gap-2 flex-wrap align-items-end mb-2">
			<h5 className="mb-0">Moderatorzy</h5>
			<div className="ms-auto"/>
			{isModerator && <Button variant="outline-secondary" size="sm" as={Link} to={getCategoryModerationPageLink(category)}>Zarządzaj moderatorami</Button>}
		</div>
		<ul className="row" style={{listStylePosition: 'inside', maxWidth: '100%'}}>
			{category.moderators.length > 0
				? category.moderators.map(user =>
					<li className="col-10 col-sm-6 col-md-3" key={user.id}>
						<Link to={getUserPageLink(user)} className="link-muted">{user.name}</Link>
					</li>
				)
				: <small>(brak bezpośrednich moderatorów)</small>
			}
		</ul>
		<div className="gap-2 hstack justify-content-center mb-2">
			{isModerator && <>
				<Button variant="outline-secondary" as={Link} to={getEditCategoryPageLink(category)}>Edytuj lub usuń kategorię</Button>
			</>}
			<Button variant="outline-secondary" as={Link} to={getNewRunPageLink(category)}>Dodaj podejście</Button>
		</div>
		{(runsOnPage && runsOnPage.length > 0)
			? <>
				<div className="hstack gap-2 flex-wrap">
					<h5 className="mb-0">Podejścia</h5>
					<div className="ms-auto">
						<Form.Check type="checkbox" label="Tylko zweryfikowane" id="only-verified-switch" onChange={event => setOnlyVerified(event.target.checked)} checked={onlyVerified} />
					</div>
				</div>
				<Table hover>
					<thead>
						<tr>
							<th>#</th>
							<th>Gracz</th>
							{category.scoreRule != 'none' && <th>Wynik</th>}
							<th>Czas</th>
							<th>Data</th>
						</tr>
					</thead>
					<tbody>
						{runsOnPage.map((run, i) => <RunRow key={run.id} place={paginationMeta.from + i} category={category} run={run} />)}
					</tbody>
				</Table>
				<MyPagination meta={paginationMeta} onSelected={setPage} className="justify-content-center mb-0" />
			</>
			: <div className="h6">Brak podejść w bazie danych</div>
		}
	</>;
};

/// Adapted from https://stackoverflow.com/a/13627586/4880243
function ordinalSuffixed(i: number) {
	const j = i % 10, k = i % 100;
	if (j == 1 && k != 11) return i + "st";
	if (j == 2 && k != 12) return i + "nd";
	if (j == 3 && k != 13) return i + "rd";
	return i + "th";
}

const RunRow = ({place, category, run}: { place: number, category: CategoryDetails, run: RunSummary }) => {
	const navigate = useNavigate();
	const onClick = () => navigate(getRunPageLink(run));
	return <tr
		key={run.id}
		className={`cursor-pointer run-row place-${ordinalSuffixed(place)}`}
		onClick={onClick}
		tabIndex={0} onKeyDown={event => event.key == 'Enter' && onClick()}
	>
		<td>{place}</td>
		<td>{run.userName}</td>
		{category.scoreRule != 'none' && <td>{run.score}</td>}
		<td>{formatDurationHTML(run.duration)}</td>
		<td>{run.createdAt.toRelative()}</td>
	</tr>
}
