import React, { useContext, useEffect } from "react";
import API from "../API";
import { GenericLoadingPage } from "../components/GenericLoading";
import AppContext from "../utils/contexts/AppContext";
import SoftRedirect from "./common/SoftRedirect";

interface LoginPageProps {
	onLogout: () => void;
}
const LogoutPage = ({onLogout}: LoginPageProps) => {
	const { currentUser } = useContext(AppContext);

	useEffect(() => {
		if (!currentUser) return;
		API.logout().then(onLogout);
	}, [currentUser]);

	if (currentUser) {
		return <GenericLoadingPage/>
	}

	return <SoftRedirect to="/" variant="success" text="Zostałeś wylogowany. Za chwilę nastąpi przekierowanie..." />
}
export default LogoutPage;
