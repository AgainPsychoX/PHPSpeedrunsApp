import React, { useContext, useState } from "react";
import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";
import { Variant } from "react-bootstrap/esm/types";
import { useNavigate } from "react-router-dom";
import API from "../API";
import { UserDetails } from "../models/User";
import AppContext from "../utils/AppContext";
import { parseBoolean, parseForm } from "../utils/ParseUtils";
import SoftRedirect from "./common/SoftRedirect";

interface AlertData {
	variant: Variant;
	heading?: string;
	text: string;
}

interface LoginPageProps {
	onLogin: (user: UserDetails) => void;
}
const LoginPage = ({onLogin}: LoginPageProps) => {
	const { user } = useContext(AppContext);
	const navigate = useNavigate();
	const [validated, setValidated] = useState(false);
	const [alert, setAlert] = useState<AlertData>();

	const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
		const form = event.currentTarget;
		setValidated(false);
		event.preventDefault();

		if (form.checkValidity() === false) {
			event.stopPropagation();
			setValidated(true);
		}
		else {
			const { login, password, remember } = parseForm(form);
			API.login(login, password, parseBoolean(remember, false))
				.then(async () => {
					const user = await API.fetchCurrentUser();
					onLogin(user);
					navigate('/');
				})
				.catch((error) => {
					setAlert({
						variant: 'danger',
						heading: 'Wystąpił problem',
						text: error.message,
					});
				})
			;
		}
	}

	if (user) {
		return <SoftRedirect to="/profile" variant="warning" text="Jesteś już zalogowany! " />
	}

	return <main>
		<Container>
			<Row className="justify-content-center my-4">
				<Col xs={12} sm={8} md={6} xl={5} xxl={4}>
					<h2 className="text-center">Logowanie</h2>
					{alert && <Alert variant={alert.variant}>
						{alert.heading && <Alert.Heading>{alert.heading}</Alert.Heading>}
						<p className="mb-0">{alert.text}</p>
					</Alert>}
					<Form noValidate validated={validated} onSubmit={handleSubmit}>
						<Form.Group className="form-floating mb-3" controlId="login">
							<Form.Control type="text" name="login" placeholder="Podaj login lub e-mail" required pattern="[\w.@+-]{3,}" autoComplete="username email" />
							<Form.Label>Login lub e-mail</Form.Label>
							<Form.Control.Feedback type="invalid">Proszę podać prawidłowy login lub e-mail.</Form.Control.Feedback>
						</Form.Group>
						<Form.Group className="form-floating mb-3" controlId="password">
							<Form.Control type="password" name="password" placeholder="Podaj hasło" required pattern=".{8,}" autoComplete="current-password" />
							<Form.Label>Hasło</Form.Label>
							<Form.Control.Feedback type="invalid">Nieprawidłowe hasło.</Form.Control.Feedback>
						</Form.Group>
						<Form.Group className="form-floating mb-3 hstack justify-content-between" controlId="rememberMe">
							<Form.Check type="checkbox" name="rememberMe" label="Pamiętaj mnie" />
							<Button variant="primary" type="submit" className="px-4">Zaloguj</Button>
						</Form.Group>
					</Form>
				</Col>
			</Row>
		</Container>
	</main>
}
export default LoginPage;
