import React, { useContext, useEffect, useState } from "react";
import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";
import { Variant } from "react-bootstrap/esm/types";
import { useNavigate } from "react-router-dom";
import API from "../API";
import GenericLoadingSection from "../components/GenericLoadingSection";
import { UserDetails } from "../models/User";
import AppContext from "../utils/AppContext";
import { formToValues } from "../utils/FormUtils";
import { parseBoolean } from "../utils/ParseUtils";
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
		return <main>
			<Container>
				<GenericLoadingSection/>
			</Container>
		</main>
	}

	return <SoftRedirect to="/" variant="success" text="Zostałeś wylogowany. Za chwilę nastąpi przekierowanie..." />
}
export default LogoutPage;
