import React, { useContext } from "react";
import { Container, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { GenericLoadingPage } from "../components/GenericLoading";
import { getEditGamePageLink, getNewCategoryPageLink, isGameIconPlaceholder } from "../models/Game";
import GameContext from "../utils/contexts/GameContext";
import CategoriesTabs from "./CategoriesTabs";

export const GamePage = () => {
	const game = useContext(GameContext);

	const isGameModerator = true;

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
				<Col xs={12} md={7} className="">
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
				</Col>
			</Row>
		</Container>
		<Container>
			{isGameModerator && <Row className="mb-3">
				<div className="h5">Moderacja</div>
				<Col className="gap-2 hstack justify-content-center justify-content-lg-start">
					<Link className="btn btn-outline-secondary" role="button" to={getEditGamePageLink(game)}>Edytuj lub usuń grę</Link>
					<Link className="btn btn-outline-secondary" role="button" to={getNewCategoryPageLink(game)}>Dodaj kategorię</Link>
					{/* <Link className="btn btn-outline-secondary" role="button" to={getManageGameModeratorsPageLink(game)}>Zarządzaj moderatorami</Link> */}
				</Col>
			</Row>}
			<Row className="">
				<Col xs={12}>
					<h4>Kategorie</h4>
					{game.categories && game.categories.length > 0
						? <CategoriesTabs categories={game.categories}/>
						: <p>Na gra nie ma jeszcze kategorii.</p>
					}
				</Col>
			</Row>
		</Container>
	</main>
};
export default GamePage;
