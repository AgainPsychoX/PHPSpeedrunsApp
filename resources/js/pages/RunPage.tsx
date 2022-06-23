import React, { useContext } from "react";
import { Button, Container } from "react-bootstrap";
import ReactPlayer from "react-player";
import { Link } from "react-router-dom";
import { GenericLoadingPage } from "../components/GenericLoading";
import { getEditRunPageLink } from "../models/Run";
import AppContext from "../utils/contexts/AppContext";
import CategoryContext from "../utils/contexts/CategoryContext";
import GameContext from "../utils/contexts/GameContext";
import RunContext from "../utils/contexts/RunContext";
import { formatDurationHTML } from "../utils/DurationUtils";

const RunPage = () => {
	const { game } = useContext(GameContext);
	const { category, isModerator } = useContext(CategoryContext);
	const { run } = useContext(RunContext);

	if (!game || !category || !run) {
		return <GenericLoadingPage/>
	}

	return <main>
		<Container>
			<div className="hstack gap-2 flex-wrap">
				<Link to={`/games/${game.id}`} className="text-reset text-decoration-none">
					<small className="text-muted">Gra</small>
					<div className="h2">{game.name} <small className="text-muted">({game.publishYear})</small></div>
				</Link>
				{isModerator && <>
					<div className="ms-auto" />
					<Button variant="outline-secondary" onClick={() => window.confirm()}>Weryfikuj</Button>
					<Button variant="outline-secondary" as={Link} to={getEditRunPageLink(run)}>Edytuj lub usuń podejście</Button>
				</>}
			</div>

			<Link to={`/games/${game.id}/categories/${category.id}`} className="text-reset text-decoration-none">
				<small className="text-muted">Kategoria</small>
				<div className="h2">{category.name}</div>
			</Link>

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
		</Container>
	</main>
}
export default RunPage;
