import React, { useContext } from "react";
import AppContext from "../utils/contexts/AppContext";
import ModeratorsListSection from "./common/ModeratorsListSection";
import SoftRedirect from "./common/SoftRedirect";

const GlobalModerationPage = () => {
	const { currentUser } = useContext(AppContext);
	const isGlobalModerator = currentUser?.isAdmin;

	if (!isGlobalModerator) {
		return <SoftRedirect to="/login" variant="warning" text="Musisz być zalogowany jako moderator globalny!" />
	}

	return <main>
		<ModeratorsListSection
			target={'global'}
			canView={isGlobalModerator}
			canAdd={isGlobalModerator}
			canRemove={isGlobalModerator}
			heading={`Moderatorzy globalni`}
			note={null}
		/>
	</main>
}
export default GlobalModerationPage;
