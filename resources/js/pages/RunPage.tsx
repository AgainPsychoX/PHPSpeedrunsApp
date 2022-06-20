import React, { useContext } from "react";
import { Container } from "react-bootstrap";
import ReactPlayer from "react-player";
import { Link } from "react-router-dom";
import { GenericLoadingPage } from "../components/GenericLoading";
import { getEditRunPageLink } from "../models/Run";
import CategoryContext from "../utils/contexts/CategoryContext";
import GameContext from "../utils/contexts/GameContext";
import RunContext from "../utils/contexts/RunContext";
import { formatDurationHTML } from "../utils/DurationUtils";

const RunPage = () => {
	const game = useContext(GameContext);
	const category = useContext(CategoryContext);
	const run = useContext(RunContext);

	const isModerator = true;

	if (!game || !category || !run) {
		return <GenericLoadingPage/>
	}

	return <main>
		<Container>
			<Link style={{color: 'initial', textDecoration: 'none' }} to={`/games/${game.id}`}>
				<small className="text-muted">Gra</small>
				<div className="h2">{game.name} <small className="text-muted">({game.publishYear})</small></div>
			</Link>

			<Link style={{color: 'initial', textDecoration: 'none' }} to={`/games/${game.id}/categories/${category.id}`}>
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
			{isModerator && <>
				<div className="h5">Moderacja</div>
				<div className="gap-2 hstack justify-content-center justify-content-lg-start">
					<Link className="btn btn-outline-secondary" role="button" to={getEditRunPageLink(run)}>Edytuj lub usuń grę</Link>
					{/* <Button variant="outline-secondary" onClick={}>Weryfikuj</Button> */}
				</div>
			</>}
		</Container>
	</main>
}
export default RunPage;
