import React from "react";
import { useContext } from "react"
import AppContext from "./contexts/AppContext"
import CategoryContext from "./contexts/CategoryContext";
import GameContext from "./contexts/GameContext";
import RunContext from "./contexts/RunContext";

export const DebugContexts = () => {
	const { currentUser } = useContext(AppContext);
	const isGlobalModerator = currentUser?.isAdmin!;

	const { game, isModerator: isGameModerator } = useContext(GameContext);
	const isDirectGameModerator = !!(game?.moderators.find(m => m.id == currentUser?.id));

	const { category, isModerator: isCategoryModerator } = useContext(CategoryContext);
	const isDirectCategoryModerator = !!(game?.moderators.find(m => m.id == currentUser?.id));

	const { run } = useContext(RunContext);

	console.groupCollapsed(`DebugContexts`);
	console.log(`Moderator? global: ${isGlobalModerator}, `+
		`game: ${isGameModerator} (direct: ${isDirectGameModerator}), ` +
		`category: ${isCategoryModerator} (direct: ${isDirectCategoryModerator}) `);
	console.log('game: ', game);
	console.log('category: ', category);
	console.log('run: ', run);
	console.groupEnd();

	return <></>
}
