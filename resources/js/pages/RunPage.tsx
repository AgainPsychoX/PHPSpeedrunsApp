import React, { useContext } from "react";
import { Button, Container } from "react-bootstrap";
import ReactPlayer from "react-player";
import { Link } from "react-router-dom";
import { GenericLoadingPage } from "../components/GenericLoading";
import CategoryContext from "../utils/contexts/CategoryContext";
import GameContext from "../utils/contexts/GameContext";
import RunContext from "../utils/contexts/RunContext";
import { formatDurationHTML } from "../utils/FormattingUtils";
import { getYoutubeVideoId } from "../utils/SomeUtils";

const RunPage = () => {
	const game = useContext(GameContext);
	const category = useContext(CategoryContext);
	const run = useContext(RunContext);

	if (!game || !category || !run) {
		return <GenericLoadingPage/>
	}

	return <main>
		<Container>
			<Link style={{color: 'initial', textDecoration: 'none' }} to={`/games/${game.id}`}>
				<small className="text-muted">Gra</small>
				<h2>{game.name} <small className="text-muted">({game.publishYear})</small></h2>
			</Link>

			<Link style={{color: 'initial', textDecoration: 'none' }} to={`/games/${game.id}/categories/${category.id}`}>
				<small className="text-muted">Kategoria</small>
				<h2>{category.name}</h2>
			</Link>

			{category.scoreRule !== 'none' && <>
				<small className="text-muted">Punkty</small>
				<h2>{run.score}</h2>
			</>}

			<small className="text-muted">Czas</small>
			<h2>{formatDurationHTML(run.duration)}</h2>

			<small className="text-muted">Gracz</small>
			<h2>{run.userName}</h2>

			<small className="text-muted">Nagranie</small>
		</Container>
		<div className="ratio ratio-16x9 mb-2">
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
