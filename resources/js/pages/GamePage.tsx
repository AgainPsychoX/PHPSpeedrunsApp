import React, { useContext, useEffect, useState } from "react";
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
		<Container>
			<Row className="mb-3">
				{gameHasIcon && <>
					<Col xs={12} md={5} className="order-md-1 px-0 p-md-2 mb-2 mb-md-0 mt-0">
						<img src={game.icon} className="rounded-sm w-100" />
					</Col>
				</>}
				<Col xs={12} md={gameHasIcon ? 7 : 12}>
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
						<p>{game.description}</p>
					</>}
					{game.rules && <>
						<h5>Zasady gry</h5>
						<p>{game.rules}</p>
					</>}
					<div className="hstack gap-2 flex-wrap">
						<h5>Moderatorzy</h5>
						<div className="ms-auto">
							{isGameModerator && <Button variant="outline-secondary" size="sm" as={Link} to={getGameModerationPageLink(game)}>Zarządzaj moderatorami</Button>}
						</div>
					</div>
					<ul>
						{game.moderators.length > 0
							? game.moderators.map(user =>
								<li className="mb-1" key={user.id}>
									<Link to={getUserPageLink(user)} className="text-decoration-none">{user.name}</Link>
								</li>
							)
							: <small>(brak bezpośrednich moderatorów)</small>
						}
					</ul>
				</Col>
			</Row>
		</Container>
		<Container>
			<Row>
				<Col xs={12}>
					<div className="hstack gap-2 flex-wrap">
						<h4>Kategorie</h4>
						<div className="ms-auto">
							{isGameModerator && <Button variant="outline-secondary" size="sm" as={Link} to={getNewCategoryPageLink(game)}>Dodaj kategorię</Button>}
						</div>
					</div>
					{categoryDetails
						?
							<Tabs
								className="px-2"
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
										tabClassName="h3" className="p-2 shadow-sm"
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

	if (!category) {
		return <GenericLoadingSection/>
	}

	const filteredRuns = category.runs.filter(run => onlyVerified ? (run.state === 'verified') : (run.state !== 'invalid'));

	return <>
		{category.rules && <>
			<h5>Zasady kategorii</h5>
			<p>{category.rules}</p>
		</>}
		<div className="hstack gap-2 flex-wrap">
			<h5>Moderatorzy</h5>
			<div className="ms-auto"/>
			{isModerator && <Button variant="outline-secondary" size="sm" as={Link} to={getCategoryModerationPageLink(category)}>Zarządzaj moderatorami</Button>}
		</div>
		<ul>
			{category.moderators.length > 0
				? category.moderators.map(user =>
					<li className="mb-1" key={user.id}>
						<Link to={getUserPageLink(user)} className="text-decoration-none">{user.name}</Link>
					</li>
				)
				: <small>(brak bezpośrednich moderatorów)</small>
			}
		</ul>
		<div className="gap-2 hstack justify-content-center mb-3">
			{isModerator && <>
				<Button variant="outline-secondary" as={Link} to={getEditCategoryPageLink(category)}>Edytuj lub usuń kategorię</Button>
			</>}
			<Button variant="outline-secondary" as={Link} to={getNewRunPageLink(category)}>Dodaj podejście</Button>
		</div>
		{(filteredRuns && filteredRuns.length > 0)
			? <>
				<div className="hstack gap-2 flex-wrap mb-2">
					<h5 className="mb-0">Podejścia</h5>
					<div className="ms-auto">
						<Form.Check type="checkbox" label="Tylko zweryfikowane" id="only-verified-switch" onChange={event => setOnlyVerified(event.target.checked)} checked={onlyVerified} />
					</div>
				</div>
				<Table hover className="mb-0">
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
						{filteredRuns.map((run, i) => <RunRow key={run.id} place={i + 1} category={category} run={run} />)}
					</tbody>
				</Table>
			</>
			: <div className="h6">Brak podejść w bazie danych</div>
		}
	</>;
};

const RunRow = ({place, category, run}: { place: number, category: CategoryDetails, run: RunSummary }) => {
	const navigate = useNavigate();
	const onClick = () => navigate(getRunPageLink(run));
	return <tr
		key={run.id}
		className="cursor-pointer"
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
