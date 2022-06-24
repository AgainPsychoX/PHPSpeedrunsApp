import React, { useContext } from "react";
import { GenericLoadingPage } from "../components/GenericLoading";
import AppContext from "../utils/contexts/AppContext";
import GameContext from "../utils/contexts/GameContext";
import ModeratorsListSection from "./common/ModeratorsListSection";
import SoftRedirect from "./common/SoftRedirect";

const GameModerationPage = () => {
	const { currentUser } = useContext(AppContext);
	const isGlobalModerator = currentUser?.isAdmin;
	const { game, isModerator: isGameModerator } = useContext(GameContext);

	if (!game) {
		return <GenericLoadingPage/>
	}

	if (!isGameModerator) {
		return <SoftRedirect to="/login" variant="warning" text="Musisz być zalogowany jako moderator gry!" />
	}

	return <main>
		<ModeratorsListSection
			target={game}
			canView={isGameModerator}
			canAdd={isGlobalModerator!}
			canRemove={isGlobalModerator!}
			heading={<h2 title={`Gra #${game.id} '${game.name}' (${game.publishYear})`}>
				Moderatorzy gry {game.name}
			</h2>}
		/>
	</main>
}
export default GameModerationPage;
