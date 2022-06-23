import React, { useCallback, useContext, useEffect, useState } from "react";
import { Button, Container, Modal, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { addModerator, fetchModerators, removeModerator } from "../API";
import { GenericLoadingPage } from "../components/GenericLoading";
import UsersTable from "../components/UsersTable";
import { getUserPageLink, ModeratorSummary, UserEntry } from "../models/User";
import AppContext from "../utils/contexts/AppContext";
import GameContext from "../utils/contexts/GameContext";
import SoftRedirect from "./common/SoftRedirect";

const GameModerationPage = () => {
	const navigate = useNavigate();
	const { currentUser } = useContext(AppContext);
	const { game, isModerator: isGameModerator } = useContext(GameContext);

	const [moderators, setModerators] = useState<ModeratorSummary[]>([]);
	const [ready, setReady] = useState(false);
	useEffect(() => {
		if (!game) return;
		(async () => {
			try {
				const { data: moderators } = await fetchModerators(game);
				setModerators(moderators);
				setReady(true);
			}
			catch (error) {
				console.error(error);
				window.alert(`Wystąpił problem, przepraszamy.`);
				// TODO: generic error handling page
			}
		})();
	}, [game]);

	const [showUserSelectionModal, setShowUserSelectionModal] = useState<boolean>(false);
	const onAdd = useCallback((user: UserEntry) => {
		if (!game) return;
		(async () => {
			try {
				const moderator = await addModerator(user, game);
				setModerators(moderators => [...moderators, moderator]);
			}
			catch (error) {
				console.error(error);
				window.alert(`Wystąpił problem, przepraszamy.`);
				// TODO: generic error handling page
			}
			finally {
				setShowUserSelectionModal(false);
			}
		})();
	}, [game]);

	const onRemove = useCallback((moderator: ModeratorSummary) => {
		if (!game) return;
		switch (moderator.scope) {
			case 'global':
				if (!window.confirm(`Ten użytkownik jest moderatorem gry pośrednio.\n\nCzy na pewno chcesz usunąć '${moderator.name}' z pozycji moderatora globalnego?`)) return;
				break;
			case 'game':
				if (!window.confirm(`Czy na pewno chcesz usunąć '${moderator.name}' z pozycji moderatora gry?`)) return;
				break;
			default:
				return;
		}
		(async () => {
			try {
				await removeModerator(moderator);
				setModerators(moderators => moderators.filter(m => m.id != moderator.id));
			}
			catch (error) {
				console.error(error);
				window.alert(`Wystąpił problem, przepraszamy.`);
				// TODO: generic error handling page
			}
			finally {
				setShowUserSelectionModal(false);
			}
		})();
	}, [game]);

	if (!currentUser || !isGameModerator) {
		return <SoftRedirect to="/login" variant="warning" text="Musisz być zalogowany jako moderator gry!" />
	}
	const isGlobalModerator = currentUser.isAdmin;

	if (!game || !ready) {
		return <GenericLoadingPage/>
	}

	return <main>
		<Container>
			<div className="hstack gap-2 flex-wrap">
				<h2>Moderatorzy gry <span>{game.name}</span></h2>
				<div className="ms-auto"/>
				<Button variant="outline-secondary" className="px-4" onClick={() => navigate(-1)}>Wróć</Button>
				{isGlobalModerator && <>
					<Button variant="outline-primary" className="px-4" onClick={() => setShowUserSelectionModal(true)}>Dodaj</Button>
				</>}
			</div>
			<p className="text-muted my-2">
				Wyróżnione <span className="text-primary fw-bold">kolorem</span> nazwy użytkownika oznaczają, że dany użytkownik jest moderatorem pośrednim, więc nie można go usunąć bez usuwania go z pozycji moderatora globalnego.
			</p>
			<div className="overflow-auto">
				<Table hover className="align-middle">
					<thead>
						<tr className="text-nowrap">
							<th>Nazwa użytkownika</th>
							<th>E-mail</th>
							<th>Data dodania</th>
							<th>Dodany przez</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{moderators
							.filter(m => m.scope == 'global')
							.map(user => <ModeratorRow key={user.id} user={user} remove={isGlobalModerator && onRemove} />)
						}
						{moderators
							.filter(m => m.scope == 'game')
							.map(user => <ModeratorRow key={user.id} user={user} remove={isGlobalModerator && onRemove} />)
						}
					</tbody>
				</Table>
			</div>
		</Container>
		<Modal
			size={'xl'} fullscreen={'lg-down'}
			show={showUserSelectionModal} onHide={() => setShowUserSelectionModal(false)}
		>
			<Modal.Header className="fs-4">Wybór nowego moderatora dla gry {game.name}</Modal.Header>
			<Modal.Body>
				<UsersTable
					heading=""
					sortingOptions={['alphanumeric', 'joined,asc', 'joined,desc']}
					userTooltip={"Kliknij, żeby wybrać gracza."}
					onUserClick={onAdd}
					ghosts="exclude"
				/>
			</Modal.Body>
		</Modal>
	</main>
}
export default GameModerationPage;

const ModeratorRow = ({
	user,
	remove = false,
}: {
	user: ModeratorSummary;
	remove?: false | ((user: ModeratorSummary) => void);
}) => {
	return <tr>
		<td><Link to={getUserPageLink(user)} className={`text-decoration-none ${user.scope == 'global' ? 'text-primary fw-bold' : 'text-reset'}`}>{user.name}</Link></td>
		<td>{user.email}</td>
		<td className="text-nowrap">{user.assignedAt.toLocaleString({ year: 'numeric', month: 'long', day: 'numeric' })}</td>
		<td><Link to={getUserPageLink(user.assignedBy)} className="text-reset text-decoration-none">{user.assignedBy.name}</Link></td>
		<th>
			{remove && <>
				<Button variant={user.scope == 'game' ? "outline-danger" : "outline-warning"} size="sm" onClick={() => remove(user)} title="Usuń moderatora">
					<i className="bi-x-lg" role="img" aria-label="Usuń"></i>
				</Button>
			</>}
		</th>
	</tr>
}
