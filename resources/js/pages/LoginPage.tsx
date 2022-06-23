import React, { useCallback, useContext, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import API from "../API";
import SimpleAlert, { SimpleAlertData } from "../components/SimpleAlert";
import { currentUserPageLink, UserDetails } from "../models/User";
import AppContext from "../utils/contexts/AppContext";
import SoftRedirect from "./common/SoftRedirect";

interface LoginPageProps {
	onLogin: (user: UserDetails) => void;
}
const LoginPage = ({onLogin}: LoginPageProps) => {
	const { currentUser } = useContext(AppContext);
	const navigate = useNavigate();
	const [validated, setValidated] = useState(false);
	const [alert, setAlert] = useState<SimpleAlertData>();

	const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(event => {
		const form = event.currentTarget;
		setValidated(false);
		event.preventDefault();

		if (form.checkValidity() === false) {
			event.stopPropagation();
			setValidated(true);
		}
		else {
			API.login(new FormData(form))
				.then(async () => {
					const user = await API.fetchCurrentUser();
					if (!user) throw new Error();
					onLogin(user);
					navigate('/');
				})
				.catch(error => {
					console.error(error);
					setAlert({
						variant: 'danger',
						heading: 'Wystąpił problem',
						content: error.message,
					});
				})
			;
		}
	}, [onLogin, navigate]);

	if (currentUser) {
		return <SoftRedirect to={currentUserPageLink} variant="warning" text="Jesteś już zalogowany!" />
	}

	return <main>
		<Container>
			<Row className="justify-content-center my-4">
				<Col xs={12} sm={8} md={6} xl={5} xxl={4}>
					<h2 className="text-center">Logowanie</h2>
					{alert && <SimpleAlert {...alert} />}
					<Form noValidate validated={validated} onSubmit={handleSubmit}>
						<Form.Group className="form-floating mb-3" controlId="name">
							<Form.Control type="text" name="name" placeholder="Podaj login lub e-mail" required pattern="[\w.@+-]{3,255}" autoComplete="username email" />
							<Form.Label>Login lub e-mail</Form.Label>
							<Form.Control.Feedback type="invalid">Proszę podać prawidłowy login lub e-mail.</Form.Control.Feedback>
						</Form.Group>
						<Form.Group className="form-floating mb-3" controlId="password">
							<Form.Control type="password" name="password" placeholder="Podaj hasło" required pattern=".{8,255}" autoComplete="current-password" />
							<Form.Label>Hasło</Form.Label>
							<Form.Control.Feedback type="invalid">Nieprawidłowe hasło.</Form.Control.Feedback>
						</Form.Group>
						<Form.Group className="form-floating mb-3 hstack justify-content-between" controlId="rememberMe">
							<Form.Check type="checkbox" name="remember" label="Pamiętaj mnie" />
							<Button variant="primary" type="submit" className="px-4">Zaloguj</Button>
						</Form.Group>
					</Form>
				</Col>
			</Row>
		</Container>
	</main>
}
export default LoginPage;
