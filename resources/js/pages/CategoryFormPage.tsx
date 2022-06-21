import React, { FormEventHandler, MouseEventHandler, useCallback, useContext, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { createCategory, deleteCategory, updateCategory } from "../API";
import { GenericLoadingPage } from "../components/GenericLoading";
import SimpleAlert, { SimpleAlertData } from "../components/SimpleAlert";
import { CategoryDetails, getCategoryPageLink, getEditCategoryPageLink } from "../models/Category";
import { getCategoriesPageLink } from "../models/Game";
import AppContext from "../utils/contexts/AppContext";
import CategoryContext from "../utils/contexts/CategoryContext";
import GameContext from "../utils/contexts/GameContext";
import SoftRedirect from "./common/SoftRedirect";

const CategoryFormPage = () => {
	const navigate = useNavigate();
	const { currentUser } = useContext(AppContext);

	const { game } = useContext(GameContext);
	const { category } = useContext(CategoryContext);
	const isEditing = !!category;

	const [validated, setValidated] = useState<boolean>(false);
	const [alert, setAlert] = useState<SimpleAlertData>();

	const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(event => {
		const form = event.currentTarget;
		setValidated(false);
		event.preventDefault();

		if (form.checkValidity() === false) {
			event.stopPropagation();
			setValidated(true);
		}
		else {
			if (!game) return;
			(() => {
				const formData = new FormData(form);
				if (category) {
					// Pass only changing things and ID
					for (const key in category)
						if (formData.get(key) == category[key as keyof CategoryDetails])
							formData.delete(key);
					formData.set('id', category.id.toString());
					formData.set('gameId', game.id.toString());
					return updateCategory(formData);
				}
				else {
					formData.set('gameId', game.id.toString());
					return createCategory(formData);
				}
			})()
				.then(category => navigate(getCategoryPageLink(category)))
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
	}, [game, category, navigate]);

	const handleDelete = useCallback<MouseEventHandler<HTMLButtonElement>>(event => {
		event.preventDefault();
		event.stopPropagation();
		if (!game || !category) return;
		if (window.confirm(`Czy jesteś pewien, że chcesz usunąć kategorię '${category.name}' z gry '${game.name}' z bazy danych serwisu?`)) {
			deleteCategory(category)
				.then(() => navigate(getCategoriesPageLink(game)))
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
	}, [game, category, navigate]);

	if (!game) {
		return <GenericLoadingPage/>;
	}

	if (!currentUser) {
		return <SoftRedirect to="/login" variant="warning" text="Musisz być zalogowany jako moderator kategorii!" />
	}

	if (category && category.gameId != game.id) {
		return <SoftRedirect to={getEditCategoryPageLink(category)} variant="danger" text="Kategoria nie odpowiada do kontekstu gry." />
	}

	return <main>
		<Container>
			<Row className="justify-content-center my-4">
				<Col xs={12} sm={10} md={8} xl={6}>
					<h2>{isEditing ? 'Edytowanie kategorii' : 'Dodawanie kategorii'}</h2>
					{alert && <SimpleAlert {...alert} />}
					<Form noValidate validated={validated} onSubmit={handleSubmit}>
						<Form.Group className="mb-3" controlId="name">
							<Form.Label>Nazwa kategorii</Form.Label>
							<Form.Control
								name="name" type="text" pattern=".{3,64}" required
								placeholder="Podaj nazwę" autoComplete="none"
								defaultValue={category?.name}
							/>
							<Form.Control.Feedback type="invalid">Nazwa musi mieć od 3 do 64 znaków.</Form.Control.Feedback>
						</Form.Group>
						<Form.Group className="mb-3" controlId="rules">
							<Form.Label>Zasady gry</Form.Label>
							<Form.Control
								name="rules" as="textarea" maxLength={4000} style={{ height: '16em' }}
								placeholder="Podaj zasady kategorii" autoComplete="none"
								defaultValue={category?.rules}
							/>
							<Form.Control.Feedback type="invalid">Tekst jest zbyt długi lub zawiera nieprawidłowe znaki.</Form.Control.Feedback>
						</Form.Group>
						<Form.Group className="mb-3" controlId="scoreRule">
							<Form.Label>Zasada oceniania</Form.Label>
							<Form.Select
								name="scoreRule" required
								defaultValue={category?.scoreRule ?? 'none'}
							>
								<option value="none">Tylko czas</option>
								<option value="high">Najwyższa ilość punktów, później czas</option>
								<option value="low">Najniższa ilość punktów, później czas</option>
							</Form.Select>
						</Form.Group>
						<Form.Group className="mb-3" controlId="verificationRequirement">
							<Form.Label>Wymagana liczba weryfikujących dla każdego podejścia</Form.Label>
							<Form.Control
								name="verificationRequirement" type="number" step={1} min={1} max={10} pattern="\d+" required
								defaultValue={category?.verificationRequirement ?? 1}
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
export default CategoryFormPage;
