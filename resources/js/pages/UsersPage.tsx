import React, { useContext } from "react";
import { Container } from "react-bootstrap";
import UsersTable from "../components/UsersTable";
import AppContext from "../utils/contexts/AppContext";

const UsersPage = () => {
	const { currentUser } = useContext(AppContext);
	const showGhosts = currentUser?.isAnyModerator;

	return <main>
		<Container>
			<UsersTable heading="Gracze" initialSorting="latestRun,desc" allowNavigateToLatestRun ghosts={showGhosts ? 'marked' : 'silent'} />
		</Container>
	</main>
};
export default UsersPage;
