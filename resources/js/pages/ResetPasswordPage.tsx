import React, { useCallback, useContext, useState } from "react";
import { Button, Col, Container, Form, Row, Accordion } from "react-bootstrap";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import API from "../API";
import SimpleAlert, { SimpleAlertData } from "../components/SimpleAlert";
import { currentUserPageLink, UserDetails } from "../models/User";
import AppContext from "../utils/contexts/AppContext";
import { parseBoolean } from "../utils/SomeUtils";
import SoftRedirect from "./common/SoftRedirect";

const negateDefined = (value: unknown | undefined) => {
	if (value === undefined) return undefined;
	return !value;
}

const ResetPasswordPage = () => {
	const { currentUser } = useContext(AppContext);
	const navigate = useNavigate();
	const [validated, setValidated] = useState<boolean>(false);
	const [alert, setAlert] = useState<SimpleAlertData>();

	const [repeatSuccess, setRepeatSuccess] = useState<boolean | undefined>();
	const validateRepeat: React.ChangeEventHandler<HTMLInputElement>  = (event) => {
		const form = event.target.closest('form')!;
		if (form.repeatPassword.value) {
			setRepeatSuccess(form.repeatPassword.value == form.password.value);
		}
		else {
			setRepeatSuccess(undefined);
		}
	}

	const [searchParams] = useSearchParams();
	const token = searchParams.get('token');
	const email = searchParams.get('email');

	const [redirectToLogin, setRedirectToLogin] = useState(false);
	const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(event => {
		setValidated(false);
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);
		if (form.checkValidity() === false) {
			event.stopPropagation();
			setValidated(true);
		}
		else {
			if (formData.get('password') != formData.get('repeatPassword')) return;

			API.resetPassword(formData)
				.then(() => setRedirectToLogin(true))
				.catch((error: any) => {
					setAlert({
						variant: 'danger',
						heading: 'Wystąpił problem',
						content: error.message,
					});
				})
			;
		}
	}, [navigate]);

	if (currentUser) {
		return <SoftRedirect to={currentUserPageLink} variant="warning" text="Jesteś już zalogowany! " />
	}

	if (redirectToLogin) {
		return <SoftRedirect to={'/login'} variant="success" text="Hasło zmienione, możesz się teraz zalogować!" />
	}

	return <main>
		<Container>
			<Row className="justify-content-center my-4">
				<Col xs={12} sm={8} md={6} xl={5}>
					<h2 className="text-center">Resetowanie hasła</h2>
					{alert && <SimpleAlert {...alert} />}
					<Form noValidate validated={validated} onSubmit={handleSubmit}>
						<input type="hidden" hidden name="token" value={token || ''} />
						<input type="hidden" hidden name="email" value={email || ''} />
						<Form.Group className="form-floating mb-3" controlId="password">
							<Form.Control type="password" name="password" required placeholder="Podaj hasło" pattern=".{8,}" autoComplete="new-password" onChange={validateRepeat} />
							<Form.Label>Hasło</Form.Label>
							<Form.Control.Feedback type="invalid">Nieprawidłowe hasło.</Form.Control.Feedback>
						</Form.Group>
						<Form.Group className="form-floating mb-3" controlId="repeatPassword">
							<Form.Control type="password" name="repeatPassword" required placeholder="Powtórz hasło" pattern=".{8,}" autoComplete="new-password"
								isInvalid={negateDefined(repeatSuccess)} onChange={validateRepeat} />
							<Form.Label>Powtórz hasło</Form.Label>
							<Form.Control.Feedback type="invalid">Hasła nie zgadzają się.</Form.Control.Feedback>
						</Form.Group>
						<Form.Group className="form-floating mb-3 hstack justify-content-center justify-content-lg-end flex-wrap gap-2" controlId="agreement">
							<Button variant="primary" type="submit" className="px-4 ms-auto">Zmień hasło</Button>
						</Form.Group>
					</Form>
				</Col>
			</Row>
		</Container>
	</main>
}
export default ResetPasswordPage;
