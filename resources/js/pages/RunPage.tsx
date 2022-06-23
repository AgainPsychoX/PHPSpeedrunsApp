import React, { useCallback, useContext, useEffect, useState } from "react";
import { Button, Container } from "react-bootstrap";
import ReactPlayer from "react-player";
import { Link } from "react-router-dom";
import { fetchRunVerifications, voteVerifyRun } from "../API";
import { GenericLoadingPage } from "../components/GenericLoading";
import { getEditRunPageLink } from "../models/Run";
import { RunVerification, RunVerificationVote } from "../models/RunVerification";
import { getUserPageLink, ModeratorEntry } from "../models/User";
import AppContext from "../utils/contexts/AppContext";
import CategoryContext from "../utils/contexts/CategoryContext";
import GameContext from "../utils/contexts/GameContext";
import RunContext from "../utils/contexts/RunContext";
import { formatDurationHTML } from "../utils/DurationUtils";

const verificationStatusToString: Record<string, string> = {
	'verified': 'Zweryfikowany',
	'invalid': 'Nieprawidłowy',
	'pending': 'Oczekujący',
}

const RunPage = () => {
	const { currentUser } = useContext(AppContext);
	const { game } = useContext(GameContext);
	const { category, isModerator } = useContext(CategoryContext);
	const { run } = useContext(RunContext);

	const [verifications, setVerifications] = useState<RunVerification[]>([]);
	const [currentUserVote, setCurrentUserVote] = useState<RunVerificationVote>('abstain');

	useEffect(() => {
		if (!run) return;
		(async () => {
			try {
				const verifications = await fetchRunVerifications(run);
				setVerifications(verifications);
				if (currentUser) {
					setCurrentUserVote(verifications.find(v => v.userId == currentUser.id)?.vote || 'abstain');
				}
			}
			catch (error) {
				console.error(error);
				window.alert(`Wystąpił problem, przepraszamy.`);
				// TODO: generic error handling page
			}
		})();
	}, [run, currentUser]);

	const doVerify = useCallback((vote: RunVerificationVote) => {
		if (!run) return;
		(async () => {
			try {
				await voteVerifyRun(run, vote);
				setCurrentUserVote(vote);
			}
			catch (error) {
				console.error(error);
				window.alert(`Wystąpił problem, przepraszamy.`);
				// TODO: generic error handling page
			}
		})();
	}, [run]);

	if (!game || !category || !run) {
		return <GenericLoadingPage/>
	}

	const verifyCount   = verifications.filter(a => a.vote == 'yes').length;
	const unverifyCount = verifications.filter(a => a.vote == 'no').length;
	const verificationStatus = category.verificationRequirement >= (verifyCount - unverifyCount) ? 'verified' : unverifyCount > 1 ? 'invalid' : 'pending';

	return <main>
		<Container>
			<div className="hstack gap-2 flex-wrap">
				<Link to={`/games/${game.id}`} className="text-reset text-decoration-none">
					<small className="text-muted">Gra</small>
					<div className="h2">{game.name} <small className="text-muted">({game.publishYear})</small></div>
				</Link>
				{isModerator && <>
					<div className="ms-auto" />
					<Button variant="outline-secondary" as={Link} to={getEditRunPageLink(run)}>Edytuj lub usuń podejście</Button>
				</>}
			</div>

			<Link to={`/games/${game.id}/categories/${category.id}`} className="text-reset text-decoration-none">
				<small className="text-muted">Kategoria</small>
				<div className="h2">{category.name}</div>
			</Link>

			<small className="text-muted">Stan Weryfikacji</small>
			<div>{verificationStatusToString[verificationStatus]}</div>

			{category.scoreRule !== 'none' && <>
				<small className="text-muted">Punkty</small>
				<div className="h2">{run.score}</div>
			</>}

			<small className="text-muted">Czas</small>
			<div className="h2">{formatDurationHTML(run.duration)}</div>

			<small className="text-muted">Gracz</small>
			<div className="h2">{run.userName}</div>

			<small className="text-muted">Nagranie</small>
		</Container>
		<div className="ratio ratio-16x9 mb-2 container-xl">
			<ReactPlayer url={run.videoUrl} width="100%" height="100%" />
		</div>
		<Container>
			{run.notes.length > 0 && <>
				<small className="text-muted">Notatka</small>
				<p>{run.notes}</p>
			</>}

			<div className="hstack gap-2 flex-wrap">
				<h5>Weryfikacja podejścia</h5>
				<div className="ms-auto"></div>
				{isModerator && <>
					<Button variant="outline-secondary" size="sm" disabled={currentUserVote == 'yes'} onClick={() => doVerify('yes')}>Głosuj: Zweryfikowane</Button>
					<Button variant="outline-secondary" size="sm" disabled={currentUserVote == 'no'} onClick={() => doVerify('no')}>Głosuj: Nieprawidłowy</Button>
					<Button variant="outline-secondary" size="sm" disabled={currentUserVote == 'abstain'} onClick={() => doVerify('abstain')}>Anuluj głos</Button>
				</>}
			</div>
			<ul>
				{verifications.length > 0
					? verifications.map(verification => (
						<li className="mb-1" key={`${verification.runId}:${verification.userId}`}>
							{verification.vote == 'yes'
								? <span className="text-success fw-bold">Tak</span>
								: <span className="text-danger fw-bold">Nie</span>
							}
							<span> przez </span>
							<Link to={getUserPageLink(verification.moderator!)} className="text-decoration-none">{verification.moderator!.name}</Link>
						</li>
					))
					: <small>(podejście nie zostało jeszcze zweryfikowane)</small>
				}
			</ul>
		</Container>
	</main>
}
export default RunPage;
