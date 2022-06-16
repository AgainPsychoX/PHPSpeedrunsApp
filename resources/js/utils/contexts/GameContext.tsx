import React, { createContext, useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { fetchGameDetails } from "../../API";
import { GenericLoadingSection } from "../../components/GenericLoading";
import { GameDetails } from "../../models/Game";

const GameContext = createContext<GameDetails | undefined>(undefined);
export default GameContext;

export const GameContextRouterOutlet = () => {
	const navigate = useNavigate();
	const { gameIdPart } = useParams<{gameIdPart: string}>();
	const [game, setGame] = useState<GameDetails>();

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
		<Outlet/>
	</GameContext.Provider>
}
