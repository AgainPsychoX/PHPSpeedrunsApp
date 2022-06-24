import React, { useCallback, useEffect, useState } from "react";
import { Button, Container, Modal, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { addModerator, fetchModerators, ModerationTarget, removeModerator } from "../../API";
import { GenericLoadingPage } from "../../components/GenericLoading";
import UsersTable from "../../components/UsersTable";
import { CategoryEntry } from "../../models/Category";
import { GameEntry } from "../../models/Game";
import { getUserPageLink, ModeratorSummary, UserEntry } from "../../models/User";

type ModerationScope = 'global' | 'game' | 'category';
const moderationTargetToScope = (target: ModerationTarget): ModerationScope => {
	if (target == 'global') return 'global';
	if ((target as GameEntry).publishYear) return `game`;
	if ((target as CategoryEntry).gameId) return `category`
	throw new Error();
}

const ModeratorsListSection = ({
	target,
	canView,
	canAdd,
	canRemove,
	heading = 'Moderatorzy',
	note,
	addModalHeading = 'Wybór nowego moderatora',
}: {
	target: ModerationTarget;
	canView: boolean;
	canAdd: boolean;
	canRemove: boolean;
	heading?: string | JSX.Element;
	note?: string | JSX.Element;
	addModalHeading?: string | JSX.Element;
}) => {
	const navigate = useNavigate();
	const scope = moderationTargetToScope(target);

	const [moderators, setModerators] = useState<ModeratorSummary[]>([]);
	const [ready, setReady] = useState(false);
	useEffect(() => {
		if (!target) return;
		(async () => {
			try {
				const { data: moderators } = await fetchModerators(target);
				setModerators(moderators);
				setReady(true);
			}
			catch (error) {
				console.error(error);
				window.alert(`Wystąpił problem, przepraszamy.`);
				// TODO: generic error handling page
			}
		})();
	}, [target]);

	const [showUserSelectionModal, setShowUserSelectionModal] = useState<boolean>(false);
	const onAdd = useCallback((user: UserEntry) => {
		if (!target) return;
		(async () => {
			try {
				const moderator = await addModerator(user, target);
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
	}, [target]);

	const onRemove = useCallback((moderator: ModeratorSummary) => {
		if (!target) return;
		const outsideScopeNote = moderator.scope == scope ? '' : `Ten użytkownik jest moderatorem gry pośrednio.\n\n`;
		switch (moderator.scope) {
			case 'global':
				if (!window.confirm(`${outsideScopeNote}Czy na pewno chcesz usunąć '${moderator.name}' z pozycji moderatora globalnego?`)) return;
				break;
			case 'game':
				if (!window.confirm(`${outsideScopeNote}Czy na pewno chcesz usunąć '${moderator.name}' z pozycji moderatora gry?`)) return;
				break;
			case 'category':
				if (!window.confirm(`${outsideScopeNote}Czy na pewno chcesz usunąć '${moderator.name}' z pozycji moderatora kategorii?`)) return;
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
	}, [target, scope]);

	if (!ready || !canView) return <GenericLoadingPage/>

	note ||= <>
		Wyróżnione <span className="text-primary fw-bold">kolorem</span> nazwy użytkownika oznaczają, że dany użytkownik jest moderatorem pośrednim, więc nie można go usunąć bez usuwania go z pozycji moderatora szerszego stopnia.
	</>

	return <>
		<Container>
			<div className="hstack gap-2 flex-wrap">
				{typeof heading == 'string' ? <h2>{heading}</h2> : heading}
				<div className="ms-auto"/>
				<Button variant="outline-secondary" className="px-4" onClick={() => navigate(-1)}>Wróć</Button>
				{canAdd && <>
					<Button variant="outline-primary" className="px-4" onClick={() => setShowUserSelectionModal(true)}>Dodaj</Button>
				</>}
			</div>
			{note && <p className="text-muted my-2">{note}</p>}
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
							.map(user => <ModeratorRow key={user.id} user={user} currentScope={scope} remove={canRemove && onRemove}/>)
						}
						{moderators
							.filter(m => m.scope == 'game')
							.map(user => <ModeratorRow key={user.id} user={user} currentScope={scope} remove={canRemove && onRemove}/>)
						}
						{moderators
							.filter(m => m.scope == 'category')
							.map(user => <ModeratorRow key={user.id} user={user} currentScope={scope} remove={canRemove && onRemove}/>)
						}
					</tbody>
				</Table>
			</div>
		</Container>
		<Modal
			size={'xl'} fullscreen={'lg-down'}
			show={showUserSelectionModal} onHide={() => setShowUserSelectionModal(false)}
		>
			<Modal.Header className="fs-4">{addModalHeading}</Modal.Header>
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
	</>
}
export default ModeratorsListSection;

const ModeratorRow = ({
	user,
	currentScope,
	remove = false,
}: {
	user: ModeratorSummary;
	currentScope: ModerationScope;
	remove?: false | ((user: ModeratorSummary) => void);
}) => {
	return <tr>
		<td><Link to={getUserPageLink(user)} className={`text-decoration-none ${user.scope == currentScope ? 'text-reset' : 'text-primary fw-bold'}`}>{user.name}</Link></td>
		<td>{user.email}</td>
		<td className="text-nowrap">{user.assignedAt.toLocaleString({ year: 'numeric', month: 'long', day: 'numeric' })}</td>
		<td><Link to={getUserPageLink(user.assignedBy)} className="text-reset text-decoration-none">{user.assignedBy.name}</Link></td>
		<th>
			{remove && <>
				<Button variant={user.scope == currentScope ? "outline-danger" : "outline-warning"} size="sm" onClick={() => remove(user)} title="Usuń moderatora">
					<i className="bi-x-lg" role="img" aria-label="Usuń"></i>
				</Button>
			</>}
		</th>
	</tr>
}
