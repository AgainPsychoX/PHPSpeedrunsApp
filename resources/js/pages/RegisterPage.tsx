import React, { useCallback, useContext, useState } from "react";
import { Button, Col, Container, Form, Row, Accordion } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
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

interface RegisterPageProps {
	onLogin: (user: UserDetails) => void;
}
const RegisterPage = ({onLogin}: RegisterPageProps) => {
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
			if (formData.get('password') != formData.get('repeatPassword') || !parseBoolean(formData.get('agreement') as string)) return;

			API.registerUser(formData)
				.then(async () => {
					const user = await API.fetchCurrentUser();
					if (!user) throw new Error();
					onLogin(user);
					navigate('/');
				})
				.catch((error) => {
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
		return <SoftRedirect to={currentUserPageLink} variant="warning" text="Jesteś już zalogowany! " />
	}

	return <main>
		<Container>
			<Row className="justify-content-center my-4">
				<Col xs={12} sm={8} md={6} xl={5}>
					<h2 className="text-center">Rejestracja</h2>
					{alert && <SimpleAlert {...alert} />}
					<Form noValidate validated={validated} onSubmit={handleSubmit}>
						<Form.Group className="form-floating mb-3" controlId="name">
							<Form.Control type="text" name="name" required placeholder="Podaj login" pattern="[\w.+]{3,}" autoComplete="nickname username" />
							<Form.Label>Nazwa użytkownika</Form.Label>
							<Form.Control.Feedback type="invalid">Login musi składać się tylko z znaków alfanumerycznych i być co najmniej 3 znaki długi.</Form.Control.Feedback>
						</Form.Group>
						<Form.Group className="form-floating mb-3" controlId="email">
							<Form.Control type="email" name="email" required placeholder="Podaj e-mail" autoComplete="email" />
							<Form.Label>E-mail</Form.Label>
							<Form.Control.Feedback type="invalid">Podaj prawidłowy adres e-mail.</Form.Control.Feedback>
						</Form.Group>
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
						{/* <hr/> */}
						<Accordion defaultActiveKey={['0']} alwaysOpen className="accordion-natural mb-3">
							<Accordion.Item eventKey="0">
								<Accordion.Header>Dodatkowe informacje</Accordion.Header>
								<Accordion.Body>
									<Form.Group className="form-floating mb-3" controlId="youtubeUrl">
										<Form.Control type="text" name="youtubeUrl" placeholder="Wklej adres URL twojego kanału" pattern="https?:\/\/(www\.)?youtube\.com\/(channel\/UC[\w-]{21}[AQgw]|(c\/|user\/)?[\w-]+)" autoComplete="youtube-channel-url" />
										<Form.Label>Kanał YouTube</Form.Label>
										<Form.Control.Feedback type="invalid">Nieprawidłowy URL kanału YouTube.</Form.Control.Feedback>
									</Form.Group>
									<Form.Group className="form-floating mb-3" controlId="twitchUrl">
										<Form.Control type="text" name="twitchUrl" placeholder="Wklej adres URL twojego kanału" pattern="https?:\/\/(www\.)?twitch\.tv\/[\w-]+)" autoComplete="twitch-channel-url" />
										<Form.Label>Kanał Twitch</Form.Label>
										<Form.Control.Feedback type="invalid">Nieprawidłowy URL kanału Twitch.</Form.Control.Feedback>
									</Form.Group>
									<Form.Group className="form-floating mb-3" controlId="twitterUrl">
										<Form.Control type="text" name="twitterUrl" placeholder="Wklej adres URL twojego profilu" pattern="https:\/\/twitter.com\/([a-zA-Z0-9_]+)\/?" autoComplete="twitter-profile-url" />
										<Form.Label>Profil Twitter</Form.Label>
										<Form.Control.Feedback type="invalid">Nieprawidłowy URL profilu Twitter.</Form.Control.Feedback>
									</Form.Group>
									<Form.Group className="form-floating mb-3" controlId="discord">
										<Form.Control type="text" name="discord" placeholder="Podaj swój tag Discord " pattern=".{3,32}#[0-9]{4}" autoComplete="discord-tag" />
										<Form.Label>Tag Discord</Form.Label>
										<Form.Control.Feedback type="invalid">Nieprawidłowy tag Discord.</Form.Control.Feedback>
									</Form.Group>
									<Form.Group className="form-floating mb-3" controlId="profileDescription">
										<Form.Control as="textarea" name="profileDescription" placeholder="Podaj opis profilu" autoComplete="none" style={{ height: '8em' }} maxLength={4000} />
										<Form.Label>Opis profilu</Form.Label>
									</Form.Group>
								</Accordion.Body>
							</Accordion.Item>
						</Accordion>
						{/* <hr/> */}
						<Form.Group className="form-floating mb-3 hstack justify-content-center justify-content-lg-between flex-wrap gap-2" controlId="agreement">
							<Form.Check type="checkbox" name="agreement" required label="Zgoda na przetwarzanie danych i regulamin" />
							<Button variant="primary" type="submit" className="px-4 ms-auto">Zarejestruj</Button>
						</Form.Group>
					</Form>
				</Col>
			</Row>
		</Container>
	</main>
}
export default RegisterPage;
