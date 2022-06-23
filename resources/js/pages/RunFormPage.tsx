import React, { FormEventHandler, MouseEventHandler, useCallback, useContext, useEffect, useState } from "react";
import { useDebouncedCallback } from 'use-debounce';
import { Button, Col, Container, Form, Modal, Row } from "react-bootstrap";
import ReactPlayer from "react-player";
import { useNavigate } from "react-router-dom";
import { createRun, deleteRun, fetchUserDetails, updateRun } from "../API";
import { GenericLoadingPage } from "../components/GenericLoading";
import SimpleAlert, { SimpleAlertData } from "../components/SimpleAlert";
import { getCategoryPageLink } from "../models/Category";
import { getEditRunPageLink, getRunPageLink, RunDetails } from "../models/Run";
import { UserEntry } from "../models/User";
import AppContext from "../utils/contexts/AppContext";
import CategoryContext from "../utils/contexts/CategoryContext";
import RunContext from "../utils/contexts/RunContext";
import { formatDurationText, parseDuration } from "../utils/DurationUtils";
import SoftRedirect from "./common/SoftRedirect";
import UsersTable from "../components/UsersTable";

const negateDefined = (value: any) => {
	if (value === undefined) return undefined;
	return !value;
}

const RunFormPage = () => {
	const navigate = useNavigate();
	const { currentUser } = useContext(AppContext);

	const { category, isModerator } = useContext(CategoryContext);
	const { run } = useContext(RunContext);
	const isEditing = !!run;

	const [duration, setDuration] = useState<number>(0);
	const [videoUrl, setVideoUrl] = useState<string>();
	const [videoUrlValidated, setVideoUrlValidated] = useState<string | false | undefined>(undefined);
	const validateVideoUrl = useDebouncedCallback(() => {
		if (videoUrl && ReactPlayer.canPlay(videoUrl))
			setVideoUrlValidated(videoUrl);
		else
			setVideoUrlValidated(false);
	}, 1000);
	useEffect(() => {
		if (!run) return;
		setDuration(run.duration);
		setVideoUrl(run.videoUrl);
		setVideoUrlValidated(run.videoUrl);
	}, [run]);

	const [validated, setValidated] = useState<boolean>(false);
	const [alert, setAlert] = useState<SimpleAlertData>();

	const [player, setPlayer] = useState<UserEntry>();
	useEffect(() => {
		if (!currentUser) return;
		if (run) {
			fetchUserDetails(run.userId)
				.then(setPlayer)
				.catch(error => {
					console.error(error);
					window.alert(`Wystąpił problem, przepraszamy.`);
					navigate('/');
					// TODO: generic error handling page
				})
			;
		}
		else {
			setPlayer(currentUser);
		}
	}, [run, currentUser, navigate]);
	const [showUserSelectionModal, setShowUserSelectionModal] = useState<boolean>(false);

	const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(event => {
		const form = event.currentTarget;
		setValidated(false);
		event.preventDefault();

		if (form.checkValidity() === false) {
			event.stopPropagation();
			setValidated(true);
		}
		else {
			if (!category || !player) return;
			(() => {
				const formData = new FormData(form);
				formData.delete('durationInputText');
				formData.set('userId', player.id.toString());
				formData.set('duration', duration!.toString());
				formData.set('videoUrl', videoUrl!);
				if (run) {
					// Pass only changing things and ID
					for (const key in run)
						if (formData.get(key) == run[key as keyof RunDetails])
							formData.delete(key);
					// Return, as there was nothing to update.
					if (formData.entries().next().done) {
						return Promise.resolve(run);
					}
					// Make sure to include ID
					formData.set('id', run.id.toString());
					return updateRun(formData);
				}
				else {
					formData.set('categoryId', category.id.toString());
					formData.set('gameId', category.gameId.toString());
					return createRun(formData);
				}
			})()
				.then(run => navigate(getRunPageLink(run)))
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
	}, [category, player, run, duration, videoUrl, navigate]);

	const handleDelete = useCallback<MouseEventHandler<HTMLButtonElement>>(event => {
		event.preventDefault();
		event.stopPropagation();
		if (!category || !run) return;
		if (window.confirm(`Czy jesteś pewien, że chcesz usunąć wybrane podejście z bazy danych serwisu?`)) {
			deleteRun(run)
				.then(() => navigate(getCategoryPageLink(category)))
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
	}, [category, run, navigate]);

	if (!currentUser || !(isModerator || run?.userId == currentUser.id )) {
		return <SoftRedirect to="/login" variant="warning" text="Musisz być zalogowany jako moderator kategorii lub właściciel podejścia!" />
	}

	if (!category || !player) {
		return <GenericLoadingPage/>;
	}

	if (run && run.categoryId != category.id) {
		return <SoftRedirect to={getEditRunPageLink(run)} variant="danger" text="Podejście nie odpowiada do kontekstu kategorii." />
	}

	return <main>
		<Container>
			<Row className="justify-content-center my-4">
				<Col xs={12} sm={10} md={8} xl={6}>
					<h2>{isEditing ? 'Edytowanie podejścia' : 'Dodawanie podejścia'}</h2>
					{alert && <SimpleAlert {...alert} />}
					<Form noValidate validated={validated} onSubmit={handleSubmit}>
						<Form.Group className="mb-3 row g-1" controlId="userName">
							<Form.Label>Gracz</Form.Label>
							<Col xs={12} sm={9} md={10}>
								<Form.Control
									name="userName" type="text" pattern=".{3,64}" required
									value={player.name} readOnly
									className="cursor-pointer" onClick={() => setShowUserSelectionModal(true)}
								/>
							</Col>
							<Col xs={12} sm={3} md={2}>
								<Button variant="outline-secondary" className="w-100" onClick={() => setShowUserSelectionModal(true)}>Wybierz</Button>
							</Col>
							<Modal
								size={'xl'} fullscreen={'lg-down'}
								show={showUserSelectionModal} onHide={() => setShowUserSelectionModal(false)}
							>
								<Modal.Header className="fs-4">Wybór gracza</Modal.Header>
								<Modal.Body>
									<UsersTable
										heading=""
										sortingOptions={['alphanumeric', 'joined,asc', 'joined,desc']}
										userTooltip={"Kliknij, żeby wybrać gracza."}
										onUserClick={user => {
											setPlayer(user);
											setShowUserSelectionModal(false);
										}}
									/>
								</Modal.Body>
							</Modal>
						</Form.Group>
						<Form.Group className="mb-3" controlId="durationInputText">
							<Form.Label>Czas podejścia</Form.Label>
							<Form.Control
								name="durationInputText" type="text" required
								defaultValue={run ? formatDurationText(run.duration, 'm') : ''}
								isInvalid={duration < 0} onChange={(event) => setDuration(parseDuration(event.target.value))}
							/>
							<Form.Control.Feedback type="invalid">Czas musi być podany w postaci: <code>1h 23m 45s 678ms</code> lub <code>01:23:45,678</code> (i podobne).</Form.Control.Feedback>
						</Form.Group>
						<Form.Group className={"mb-3 " + (category.scoreRule == 'none' ? 'd-none' : '')} controlId="score">
							<Form.Label>Wynik podejścia</Form.Label>
							<Form.Control
								name="score" type="number" step={1} pattern="[0-9]+" required
								defaultValue={run?.score ?? 0}
							/>
							<Form.Control.Feedback type="invalid">Wynik musi być podany jako liczba nieujemna całkowita.</Form.Control.Feedback>
						</Form.Group>
						<Form.Group className="mb-3" controlId="videoUrl">
							<Form.Label>Nagranie</Form.Label>
							<Form.Control
								name="videoUrl" type="text" required
								placeholder="Wklej adres URL wideo"
								value={videoUrl} onChange={event => {
									setVideoUrl(event.target.value);
									validateVideoUrl();
								}} isInvalid={negateDefined(videoUrlValidated)}
							/>
							<Form.Control.Feedback type="invalid">Nieprawidłowy URL wideo. Wymagany jest link na platformę YouTube.</Form.Control.Feedback>
							{videoUrlValidated && <div>
								<div className="text-muted text-center mt-1">Podgląd</div>
								<div className="ratio ratio-16x9 mt-1">
									<ReactPlayer url={videoUrlValidated} width="100%" height="100%" />
								</div>
							</div>}
						</Form.Group>
						<Form.Group className="mb-3" controlId="notes">
							<Form.Label>Notatka</Form.Label>
							<Form.Control
								name="notes" as="textarea" maxLength={4000} style={{ height: '16em' }}
								placeholder="Podaj notatkę"
								defaultValue={run?.notes}
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
export default RunFormPage;
