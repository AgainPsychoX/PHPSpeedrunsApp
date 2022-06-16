import React, { useContext, useEffect } from "react";
import { Variant } from "react-bootstrap/esm/types";
import API from "../API";
import { GenericLoadingPage } from "../components/GenericLoading";
import AppContext from "../utils/contexts/AppContext";
import SoftRedirect from "./common/SoftRedirect";

interface AlertData {
	variant: Variant;
	heading?: string;
	text: string;
}

interface LoginPageProps {
	onLogout: () => void;
}
const LogoutPage = ({onLogout}: LoginPageProps) => {
	const { user } = useContext(AppContext);

	useEffect(() => {
		if (!user) return;
		API.logout().then(onLogout);
	}, [user]);

	if (user) {
		return <GenericLoadingPage/>
	}

	return <SoftRedirect to="/" variant="success" text="Zostałeś wylogowany. Za chwilę nastąpi przekierowanie..." />
}
export default LogoutPage;
