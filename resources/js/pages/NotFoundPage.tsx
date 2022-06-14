import React from "react";
import { Alert, Button, Card, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export const NotFoundPage = () => {
	const navigate = useNavigate();

	return (
		<main>
			<Container>
				<Card body>
					<Card.Title>Nie znaleziono strony</Card.Title>
					<Card.Text>
						Coś poszło nie tak, przepraszamy.
					</Card.Text>
					<Card.Text>
						Jeśli myślisz, że to błąd, prosimy o <a href="#">kontakt</a>.
						{/* TODO: add contact page or valid link (mailto?) */}
					</Card.Text>
					<div className="d-flex flex-wrap" style={{gap: '0.5em'}}>
						<Button variant="outline-primary" onClick={() => navigate(-1)}>Wróć na poprzednią stronę</Button>
						<Button variant="outline-secondary" onClick={() => navigate('/')}>Wróć na stronę główną</Button>
					</div>
				</Card>
			</Container>
		</main>
	)
};
export default NotFoundPage;
