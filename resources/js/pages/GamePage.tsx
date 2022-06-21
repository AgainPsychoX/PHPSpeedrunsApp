import React, { useContext, useEffect, useState } from "react";
import { Container, Col, Row, Tabs, Tab, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { GenericLoadingPage, GenericLoadingSection } from "../components/GenericLoading";
import { CategoryDetails, getCategoryPageLink, getEditCategoryPageLink, getNewRunPageLink } from "../models/Category";
import { getEditGamePageLink, getNewCategoryPageLink, isGameIconPlaceholder } from "../models/Game";
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
	}, [game, categoryDetails])

	if (!game) {
		return <GenericLoadingPage />
	}

	return <main>
		<Container>
			<Row className="mb-3">
				<Col xs={12} md={5} className="order-md-1 px-0 p-md-2 mb-2 mt-0 mt-md-3">
					{game.icon && isGameIconPlaceholder(game) ||
						<img src={game.icon} className="rounded-sm w-100" />
					}
				</Col>
				<Col xs={12} md={7}>
					<small>Tytuł i rok wydania</small>
					<h1>{game.name} <small className="text-muted">({game.publishYear})</small></h1>
					{game.description && <>
						<h5>Opis</h5>
						<p>{game.description}</p>
					</>}
					{game.rules && <>
						<h5>Zasady gry</h5>
						<p>{game.rules}</p>
					</>}
					<h5>Moderatorzy</h5>
					<ul>
						{game.moderators.length > 0
							? game.moderators.map(user => <li className="mb-1" key={user.id}><Link to={getUserPageLink(user)}>{user.name}</Link></li>)
							: <small>(brak bezpośrednich moderatorów)</small>
						}
					</ul>
				</Col>
			</Row>
		</Container>
		<Container>
			{isGameModerator && <Row className="mb-3">
				<Col className="gap-2 hstack justify-content-center justify-content-lg-start">
					<Link className="btn btn-outline-secondary" role="button" to={getEditGamePageLink(game)}>Edytuj lub usuń grę</Link>
					<Link className="btn btn-outline-secondary" role="button" to={getNewCategoryPageLink(game)}>Dodaj kategorię</Link>
					{/* <Link className="btn btn-outline-secondary" role="button" to={getManageGameModeratorsPageLink(game)}>Zarządzaj moderatorami</Link> */}
				</Col>
			</Row>}
			<Row className="">
				<Col xs={12}>
					<h4>Kategorie</h4>
					{categoryDetails
						?
							<Tabs
								className="mb-3 px-2"
								activeKey={activeKey}
								onSelect={(key: string | null) => {
									setActiveKey(key || categoryDetails.id.toString());
									const id = parseInt(key || '0');
									const entry = game.categories.find(e => e.id == id)!;
									navigate(getCategoryPageLink(entry));
								}}
							>
								{game.categories.map(category =>
									<Tab key={category.id} eventKey={category.id.toString()} title={category.name} className="px-2">
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
	if (!category) {
		return <GenericLoadingSection/>
	}

	return <>
		{category.rules && <>
			<h5>Zasady kategorii</h5>
			<p>{category.rules}</p>
		</>}
		<div className="gap-2 hstack justify-content-center mb-3">
			{isModerator && <>
				<Link className="btn btn-outline-secondary" role="button" to={getEditCategoryPageLink(category)}>Edytuj lub usuń kategorię</Link>
				{/* <Link className="btn btn-outline-secondary" role="button" to={getManageCategoryModeratorsPageLink(category)}>Edytuj lub usuń kategorię</Link> */}
			</>}
			<Link className="btn btn-outline-secondary" role="button" to={getNewRunPageLink(category)}>Dodaj podejście</Link>
		</div>
		<h5>Moderatorzy</h5>
		<ul>
			{category.moderators.length > 0
				? category.moderators.map(user => <li className="mb-1" key={user.id}><Link to={getUserPageLink(user)}>{user.name}</Link></li>)
				: <small>(brak bezpośrednich moderatorów)</small>
			}
		</ul>
		{(category.runs && category.runs.length > 0)
			? <>
				<h5>Podejścia</h5>
				<Table striped hover>
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
						{category.runs.map((run, i) => <RunRow key={run.id} place={i + 1} category={category} run={run} />)}
					</tbody>
				</Table>
			</>
			: <div className="h6">Brak podejść w bazie danych</div>
		}
	</>;
};

const RunRow = ({place, category, run}: { place: number, category: CategoryDetails, run: RunSummary }) => {
	const navigate = useNavigate();
	return <tr
		key={run.id}
		style={{cursor: 'pointer'}}
		onClick={() => navigate(getRunPageLink(run))}
	>
		<td>{place}</td>
		<td>{run.userName}</td>
		{category.scoreRule != 'none' && <td>{run.score}</td>}
		<td>{formatDurationHTML(run.duration)}</td>
		<td>{run.createdAt.toRelative()}</td>
	</tr>
}
