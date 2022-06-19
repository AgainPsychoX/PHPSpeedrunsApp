import React, { useContext } from "react";
import { Container, Col, Row } from "react-bootstrap";
import { GenericLoadingSection } from "../components/GenericLoading";
import GameContext from "../utils/contexts/GameContext";
import CategoriesTabs from "./CategoriesTabs";

export const GamePage = () => {
	const game = useContext(GameContext);

	return <main>
		{game
			?
				<Container className="g-0 g-md-3">
					<Row className="mx-0">
						<Col xs={12} md={4} className="order-md-1 g-0 g-md-3">
							{game.icon && game.icon.includes('placeholder') ||
								<img src={game.icon} className="img-fluid rounded-sm" />
							}
						</Col>
						<Col xs={12} md={8} className="g-3 g-md-0">
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
					<Row>
						<Col xs={12}>
							<h4 className="px-2">Kategorie</h4>
							{game.categories && <CategoriesTabs categories={game.categories} />}
						</Col>
					</Row>
				</Container>
			:
				<Container>
					<GenericLoadingSection/	>
				</Container>
		}
	</main>
};
export default GamePage;
