import React, { createRef, FormEventHandler, MouseEventHandler, useCallback, useContext, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { createGame, deleteGame, updateGame } from "../API";
import SimpleAlert, { SimpleAlertData } from "../components/SimpleAlert";
import { GameDetails, getGamesDirectoryLink, getGamePageLink, isGameIconPlaceholder } from "../models/Game";
import AppContext from "../utils/contexts/AppContext";
import GameContext from "../utils/contexts/GameContext";
import SoftRedirect from "./common/SoftRedirect";

const GameFormPage = () => {
	const navigate = useNavigate();
	const { currentUser } = useContext(AppContext);

	const { game } = useContext(GameContext);
	const isEditing = !!game;

	const [validated, setValidated] = useState<boolean>(false);
	const [alert, setAlert] = useState<SimpleAlertData>();
	const [isIconFileSelected, setIsIconFileSelected] = useState(false);
	const [isIconBeingOverwritten, setIsIconBeingOverwritten] = useState(false);

	const iconFileInputRef = createRef<HTMLInputElement>();

	const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(event => {
		const form = event.currentTarget;
		setValidated(false);
		event.preventDefault();

		if (form.checkValidity() === false) {
			event.stopPropagation();
			setValidated(true);
		}
		else {
			(() => {
				const formData = new FormData(form);
				if (game) {
					// Pass only changing things and ID
					for (const key in game)
						if (formData.get(key) == game[key as keyof GameDetails])
							formData.delete(key);
					formData.set('id', game.id.toString());
					return updateGame(formData);
				}
				else {
					return createGame(formData);
				}
			})()
				.then(game => navigate(getGamePageLink(game)))
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
	}, [game, navigate]);

	const handleDelete = useCallback<MouseEventHandler<HTMLButtonElement>>(event => {
		event.preventDefault();
		event.stopPropagation();
		if (!game) return;
		if (window.confirm(`Czy jesteś pewien, że chcesz usunąć grę '${game.name}' (${game.publishYear}) z bazy danych serwisu?`)) {
			deleteGame(game)
				.then(() => navigate(getGamesDirectoryLink()))
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
	}, [game, navigate]);

	if (!currentUser) {
		return <SoftRedirect to="/login" variant="warning" text="Musisz być zalogowany jako moderator gry!" />
	}

	return <main>
		<Container>
			<Row className="justify-content-center my-4">
				<Col xs={12} sm={10} md={8} xl={6}>
					<h2>{isEditing ? 'Edytowanie gry' : 'Dodawanie gry'}</h2>
					{alert && <SimpleAlert {...alert} />}
					<Form noValidate validated={validated} onSubmit={handleSubmit}>
						<Form.Group className="mb-3" controlId="name">
							<Form.Label>Nazwa gry</Form.Label>
							<Form.Control
								name="name" type="text" pattern=".{3,64}" required
								placeholder="Podaj nazwę" autoComplete="none"
								defaultValue={game?.name}
							/>
							<Form.Control.Feedback type="invalid">Nazwa musi mieć od 3 do 64 znaków.</Form.Control.Feedback>
						</Form.Group>
						<Form.Group className="mb-3" controlId="publishYear">
							<Form.Label>Rok wydania</Form.Label>
							<Form.Control
								name="publishYear" type="number" step={1} min={1970} max={2200} pattern="\d+" required
								placeholder="Podaj rok" autoComplete="none"
								defaultValue={game?.publishYear ?? new Date().getFullYear()}
							/>
						</Form.Group>
						<Form.Group className="mb-3 row g-1" controlId="iconFile">
							<Form.Label>Miniaturka gry</Form.Label>
							<Col xs={12} sm={9} md={10}>
								<Form.Control
									name="iconFile" type="file" accept="image/*"
									onChange={(event) => {
										const selected = !!event.target.value;
										setIsIconFileSelected(selected);
										setIsIconBeingOverwritten(isEditing && !isGameIconPlaceholder(game) && selected);
									}}
									ref={iconFileInputRef}
								/>
							</Col>
							<Col xs={12} sm={3} md={2}>
								<Button variant="outline-secondary" className="w-100" onClick={() => {
									if (isIconBeingOverwritten) {
										iconFileInputRef.current!.value = '';
										setIsIconFileSelected(false);
										setIsIconBeingOverwritten(false);
									}
									else {
										setIsIconBeingOverwritten(true);
									}
								}}>
									{isIconBeingOverwritten ? 'Przywróć' : 'Usuń'}
								</Button>
							</Col>
							<input name="removeIcon" type="checkbox" readOnly checked={isIconBeingOverwritten && !isIconFileSelected} className="d-none" tabIndex={-1} />
							{isIconBeingOverwritten && !isIconFileSelected && <>
								<Col className="justify-content-center text-center mt-2">
									<small className="text-muted">Obecna miniaturka zostanie oznaczona do usunięcia.</small>
								</Col>
							</>}
							{isEditing && !isGameIconPlaceholder(game) && !isIconBeingOverwritten && <>
								<Col className="justify-content-center text-center mt-2 row">
									<Col xs={8} md={6}>
										<img src={game.icon} alt="Obecna miniaturka gry" className="rounded img-fluid" />
									</Col>
									<small className="text-muted">Obecna miniaturka (nie wybieraj pliku, jeśli nie chcesz zmieniać).</small>
								</Col>
							</>}
						</Form.Group>
						<Form.Group className="mb-3" controlId="description">
							<Form.Label>Opis gry</Form.Label>
							<Form.Control
								name="description" as="textarea" maxLength={4000} style={{ height: '12em' }}
								placeholder="Podaj opis profilu" autoComplete="none"
								defaultValue={game?.description}
							/>
							<Form.Control.Feedback type="invalid">Tekst jest zbyt długi lub zawiera nieprawidłowe znaki.</Form.Control.Feedback>
						</Form.Group>
						<Form.Group className="mb-3" controlId="rules">
							<Form.Label>Zasady gry</Form.Label>
							<Form.Control
								name="rules" as="textarea" maxLength={4000} style={{ height: '16em' }}
								placeholder="Podaj opis profilu" autoComplete="none"
								defaultValue={game?.rules}
							/>
							<Form.Control.Feedback type="invalid">Tekst jest zbyt długi lub zawiera nieprawidłowe znaki.</Form.Control.Feedback>
						</Form.Group>
						<Form.Group className="mb-3 hstack justify-content-end flex-wrap gap-2">
							<Button variant="primary" type="submit" className="px-4">Zapisz</Button>
							{isEditing && <Button variant="danger" className="px-4" onClick={handleDelete}>Usuń</Button>}
							<Button variant="secondary" className="px-4" onClick={() => navigate(-1)}>Wróć</Button>
						</Form.Group>
					</Form>
				</Col>
			</Row>
		</Container>
	</main>
}
export default GameFormPage;
