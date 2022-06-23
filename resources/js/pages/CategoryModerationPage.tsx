import React, { useContext } from "react";
import { GenericLoadingPage } from "../components/GenericLoading";
import CategoryContext from "../utils/contexts/CategoryContext";
import GameContext from "../utils/contexts/GameContext";
import ModeratorsListSection from "./common/ModeratorsListSection";
import SoftRedirect from "./common/SoftRedirect";

const CategoryModerationPage = () => {
	const { isModerator: isGameModerator } = useContext(GameContext);
	const { game } = useContext(GameContext);
	const { category, isModerator: isCategoryModerator } = useContext(CategoryContext);

	if (!game || !category) {
		return <GenericLoadingPage/>
	}

	if (!isCategoryModerator) {
		return <SoftRedirect to="/login" variant="warning" text="Musisz być zalogowany jako moderator gry!" />
	}

	return <main>
		<ModeratorsListSection
			target={category}
			canView={isCategoryModerator}
			canAdd={isGameModerator}
			canRemove={isGameModerator}
			heading={<h2 title={`Gra #${game.id} '${game.name}' (${game.publishYear}), Kategoria #${category.id} '${category.name}'`}>
				Moderatorzy kategorii {category.name}
			</h2>}
		/>
	</main>
}
export default CategoryModerationPage;
