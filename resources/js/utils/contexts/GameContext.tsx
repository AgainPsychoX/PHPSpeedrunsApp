import React, { createContext, useContext, useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { fetchGameDetails } from "../../API";
import { GenericLoadingSection } from "../../components/GenericLoading";
import { GameDetails } from "../../models/Game";
import AppContext from "./AppContext";

interface GameContextData {
	game?: GameDetails;
	isModerator: boolean;
}

const GameContext = createContext<GameContextData>({
	isModerator: false
});
export default GameContext;

export const GameContextRouterOutlet = () => {
	const navigate = useNavigate();
	const { currentUser } = useContext(AppContext);
	const { gameIdPart } = useParams<{gameIdPart: string}>();
	const [game, setGame] = useState<GameDetails>();
	const [isModerator, setIsModerator] = useState<boolean>(false);

	useEffect(() => {
		if (!gameIdPart) return;
		const gameId = parseInt(gameIdPart);
		if (game?.id == gameId) return;
		fetchGameDetails(gameId)
			.then(game => {
				setGame(game);
				setIsModerator(!!(currentUser && game.moderators.find(e => e.id === currentUser.id)));
			})
			.catch(error => {
				console.error(error);
				alert(`Wystąpił problem, przepraszamy.`);
				navigate('/');
				// TODO: generic error handling page
			})
		;
	}, [gameIdPart, game, currentUser, navigate]);

	if (!game) {
		return <GenericLoadingSection/>
	}

	return <GameContext.Provider value={{
		game,
		isModerator,
	}}>
		<Outlet/>
	</GameContext.Provider>
}
