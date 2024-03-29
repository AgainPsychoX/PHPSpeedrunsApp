import React, { useCallback, useContext, useState } from "react";
import { Accordion, Button, Col, Container, Form, Modal, Row } from "react-bootstrap";
import ReactPlayer from "react-player";
import { Link } from "react-router-dom";
import { fetchRunVerifications, voteVerifyRun } from "../API";
import { GenericLoadingPage, GenericLoadingSection } from "../components/GenericLoading";
import { getCategoryPageLink } from "../models/Category";
import { getGamePageLink } from "../models/Game";
import { getEditRunPageLink, RunStatus } from "../models/Run";
import { RunVerification, RunVerificationVote } from "../models/RunVerification";
import { getUserPageLink, getUserPageLinkFromRun } from "../models/User";
import AppContext from "../utils/contexts/AppContext";
import CategoryContext from "../utils/contexts/CategoryContext";
import GameContext from "../utils/contexts/GameContext";
import RunContext from "../utils/contexts/RunContext";
import { formatDurationHTML } from "../utils/DurationUtils";

const verificationStatusToString: Record<RunStatus, string> = {
	'verified': 'Zweryfikowany',
	'invalid': 'Nieprawidłowy',
	'pending': 'Oczekujący',
}
const voteToString: Record<RunVerificationVote, string> = {
	'yes': 'tak (podejście zweryfikowane)',
	'no': 'nie (podejście nieprawidłowe)',
	'abstain': 'wstrzymany',
}

const voteButtons: { vote: RunVerificationVote, color: string, text: string }[] = [
	{vote: 'yes', color: 'success', text: 'Głosuj na zweryfikowany'},
	{vote: 'no', color: 'danger', text: 'Głosuj na nieprawidłowy'},
	{vote: 'abstain', color: 'secondary', text: 'Wstrzymaj głos'},
]

const RunPage = () => {
	const { currentUser } = useContext(AppContext);
	const { game } = useContext(GameContext);
	const { category, isModerator } = useContext(CategoryContext);
	const { run } = useContext(RunContext);

	const [verifications, setVerifications] = useState<RunVerification[]>([]);
	const [verificationsLoaded, setVerificationsLoaded] = useState(false);
	const [currentUserVote, setCurrentUserVote] = useState<RunVerificationVote>('abstain');

	const loadVerifications = useCallback(async () => {
		if (!run) return;
		setVerificationsLoaded(false);
		try {
			const verifications = await fetchRunVerifications(run);
			setVerifications(verifications);
			setVerificationsLoaded(true);
			if (currentUser) {
				setCurrentUserVote(verifications.find(v => v.userId == currentUser.id)?.vote || 'abstain');
			}
		}
		catch (error) {
			console.error(error);
			window.alert(`Wystąpił problem, przepraszamy.`);
			// TODO: generic error handling page
		}
	}, [run, currentUser]);

	const [proposedVote, setProposedVote] = useState<RunVerificationVote>();
	const submitVerification = useCallback<React.FormEventHandler<HTMLFormElement>>(async (event) => {
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);
		if (!run || !proposedVote || !currentUser) return;
		try {
			const note = formData.get('note') as string || '';
			const verification = await voteVerifyRun(run, proposedVote, note);
			setCurrentUserVote(proposedVote);
			setVerifications([...verifications.filter(v => v.userId != currentUser.id), verification])
		}
		catch (error) {
			console.error(error);
			window.alert(`Wystąpił problem, przepraszamy.`);
			// TODO: generic error handling page
		}
		finally {
			setProposedVote(undefined);
		}
	}, [run, proposedVote, currentUser, verifications]);

	if (!game || !category || !run) {
		return <GenericLoadingPage/>
	}

	const verifyYesCount = verifications.filter(a => a.vote == 'yes').length;
	const verifyNoCount  = verifications.filter(a => a.vote == 'no').length;
	const verificationStatus: RunStatus = verificationsLoaded
		? ((verifyYesCount - verifyNoCount) >= category.verificationRequirement ? 'verified' : verifyNoCount > 1 ? 'invalid' : 'pending')
		: run.state
	;

	const canEdit = isModerator || run.id == currentUser?.id;

	return <main>
		<Modal show={!!proposedVote} onHide={() => setProposedVote(undefined)}>
			<Form onSubmit={submitVerification}>
				<Modal.Header closeButton>
					<Modal.Title>Weryfikacja</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{proposedVote && <p>Czy na pewno chcesz ustawić swój głos jako {voteToString[proposedVote]}?</p>}
					<Form.Group>
						<Form.Label>Możesz także dodać notatkę:</Form.Label>
						<Form.Control as="textarea" name="note" autoComplete="none" rows={3} />
					</Form.Group>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setProposedVote(undefined)}>Anuluj</Button>
					<Button variant="primary" type="submit">Zapisz</Button>
				</Modal.Footer>
			</Form>
		</Modal>
		<Container>
			<Row>
				<Col xs={12} md={6}>
					<Link to={getGamePageLink(game)} className="link-muted">
						<small className="text-muted">Gra</small>
						<div className="h2">{game.name} <small className="text-muted">({game.publishYear})</small></div>
					</Link>

					<Link to={getCategoryPageLink(category)} className="link-muted">
						<small className="text-muted">Kategoria</small>
						<div className="h2">{category.name}</div>
					</Link>

					<small className="text-muted">Stan weryfikacji</small>
					<div className="h2">{verificationStatusToString[verificationStatus]}</div>
				</Col>
				<Col xs={12} md={6}>
					<Link to={getUserPageLinkFromRun(run)} className="link-muted">
						<small className="text-muted">Gracz</small>
						<div className="h2">{run.userName}</div>
					</Link>

					{category.scoreRule !== 'none' && <>
						<small className="text-muted">Punkty</small>
						<div className="h2">{run.score}</div>
					</>}

					<small className="text-muted">Czas</small>
					<div className="h2">{formatDurationHTML(run.duration)}</div>
				</Col>
			</Row>
			<Row>
				<small className="text-muted">Nagranie</small>
			</Row>
		</Container>
		<div className="ratio ratio-16x9 mb-2 container-xl">
			<ReactPlayer url={run.videoUrl} width="100%" height="100%" />
		</div>
		<Container>
			{run.notes.length > 0 && <>
				<small className="text-muted">Notatka</small>
				<p className="mb-4">{run.notes}</p>
			</>}
		</Container>
		<Container>
			<div className="hstack gap-2 justify-content-center mb-4">
				{canEdit && <Button variant="outline-secondary" as={Link} to={getEditRunPageLink(run)}>Edytuj lub usuń podejście</Button>}
			</div>
		</Container>
		<Container>
			<Accordion className="accordion-natural mb-4">
				<Accordion.Item eventKey="0">
					<Accordion.Header onClick={() => {
						if (!verificationsLoaded) loadVerifications();
					}}>Szczegóły weryfikacji podejścia</Accordion.Header>
					<Accordion.Body>
						{verificationsLoaded
							? <>
								{isModerator && <>
									<div className="hstack gap-2 flex-wrap mb-3">
										{voteButtons.map(def =>
											<Button
												key={def.vote}
												variant={`${currentUserVote == def.vote ? '' : 'outline-'}${def.color}`} size="sm"
												disabled={currentUserVote == def.vote} onClick={() => setProposedVote(def.vote)}
											>{def.text}</Button>
										)}
									</div>
								</>}
								{verifications.length > 0
									? <>
										<div>Głosy:</div>
										<ul className="mb-3">
											{verifications.map(verification => (
												<li className="mb-1" key={`${verification.runId}:${verification.userId}`}>
													{(() => {
														switch (verification.vote) {
															case 'yes':     return <><span className={`text-success fw-bold`}>Tak</span> przez </>
															case 'no':      return <><span className={`text-danger fw-bold`}>Nie</span> przez </>
															case 'abstain': return <><span>Wstrzymuje się</span> </>
														}
													})()}
													<Link to={getUserPageLink(verification.moderator)} className="text-decoration-none">{verification.moderator.name}</Link>
													<time className="text-muted" dateTime={verification.timestamp.toISO()}> ({verification.timestamp.toRelative()})</time>
													{verification.note && verification.note.length > 0 && <>
														<div><small className="text-muted">Notatka: </small> {verification.note}</div>
													</>}
												</li>
											))}
										</ul>
									</>
									: <p>Podejście nie zostało jeszcze zweryfikowane przez naszych moderatorów.</p>
								}
								<small>
									Sumy:
									<span className="text-success"> {verifyYesCount} na tak </span>
									i
									<span className="text-danger"> {verifyNoCount} na nie</span>
									.
									Różnica: {verifyYesCount - verifyNoCount}.
									Wymagane: {category.verificationRequirement}.
								</small>
							</>
							: <GenericLoadingSection/>
						}
					</Accordion.Body>
				</Accordion.Item>
			</Accordion>
		</Container>
	</main>
}
export default RunPage;
