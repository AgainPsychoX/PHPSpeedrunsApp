import React, { useCallback, useContext, useState } from "react";
import { Button, Col, Container, Form, Row, Stack } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import API from "../API";
import SimpleAlert, { SimpleAlertData } from "../components/SimpleAlert";
import { currentUserPageLink, UserDetails } from "../models/User";
import AppContext from "../utils/contexts/AppContext";
import SoftRedirect from "./common/SoftRedirect";

const RemindPasswordPage = () => {
	const { currentUser } = useContext(AppContext);
	const navigate = useNavigate();
	const [validated, setValidated] = useState(false);
	const [alert, setAlert] = useState<SimpleAlertData>();

	const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(async (event) => {
		event.preventDefault();
		setValidated(false);
		const form = event.currentTarget;
		const formData = new FormData(form);
		if (form.checkValidity() === false) {
			event.stopPropagation();
			setValidated(true);
		}
		else {
			try {
				await API.remindPassword(formData);
				setAlert({
					variant: 'success',
					heading: 'Wysłano link do zresetowania hasła!',
					content: 'Sprawdź swoją skrzynkę e-mailową i kliknij link.',
				});
			}
			catch (error: any) {
				console.error(error);
				setAlert({
					variant: 'danger',
					heading: 'Wystąpił problem',
					content: error.message,
				});
			}
		}
	}, [navigate]);

	if (currentUser) {
		return <SoftRedirect to={currentUserPageLink} variant="warning" text="Jesteś już zalogowany!" />
	}

	return <main>
		<Container>
			<Row className="justify-content-center my-4">
				<Col xs={12} sm={10} md={7} xl={5}>
					<h2 className="text-center">Przypominanie hasła</h2>
					{alert && <SimpleAlert {...alert} />}
					<Form noValidate validated={validated} onSubmit={handleSubmit}>
						<Form.Group className="form-floating mb-3" controlId="name">
							<Form.Control type="text" name="email" placeholder="Podaj e-mail" required pattern="[\w.@+-]{3,255}" autoComplete="email" />
							<Form.Label>E-mail</Form.Label>
							<Form.Control.Feedback type="invalid">Proszę podać prawidłowy e-mail.</Form.Control.Feedback>
						</Form.Group>
						<Form.Group className="mb-3 hstack justify-content-center justify-content-lg-between flex-wrap gap-2" controlId="actions">
							<div>
							{/* <Stack direction={'horizontal'} > */}
								<span>Nie masz konta?</span>&nbsp;
								<Link className="" to={'/register'}>Zarejestruj się</Link>
							{/* </Stack> */}
							</div>
							<div className="hstack flex-wrap gap-2">
								<Button variant="secondary" className="px-4" onClick={() => navigate('/login')}>Wróć</Button>
								<Button variant="primary" type="submit" className="px-4">Wyślij</Button>
							</div>
						</Form.Group>
					</Form>
				</Col>
			</Row>
		</Container>
	</main>
}
export default RemindPasswordPage;
