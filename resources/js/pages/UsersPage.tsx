import React from "react";
import { Container } from "react-bootstrap";
import UsersTable from "../components/UsersTable";

const UsersPage = () => {
	return <main>
		<Container>
			<UsersTable heading="Gracze" initialSorting="latestRun,desc" allowNavigateToLatestRun />
		</Container>
	</main>
};
export default UsersPage;
