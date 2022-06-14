import React, { FunctionComponent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchGameDetails } from "../API";
import GenericLoadingSection from "../components/GenericLoadingSection";
import { GameDetails } from "../models/Game";
import GameContext from "./GameContext";

const GameProvider: FunctionComponent<{ children: React.ReactNode }> = (props) => {
	const { gameIdPart } = useParams<{gameIdPart: string}>();
	const [game, setGame] = useState<GameDetails>();
	const navigate = useNavigate();

	useEffect(() => {
		if (!gameIdPart) return;
		const gameId = parseInt(gameIdPart);
		if (game && game.id == gameId) return;
		fetchGameDetails(gameId)
			.then(setGame)
			.catch(error => {
				console.error(error);
				alert(`Wystąpił problem, przepraszamy.`);
				navigate('/');
				// TODO: generic error handling page
			})
		;
	}, [gameIdPart]);

	if (!game) {
		return <GenericLoadingSection/>
	}

	return <GameContext.Provider value={game}>
		{props.children}
	</GameContext.Provider>
}

export default GameProvider;
