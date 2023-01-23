import React, { useContext, useEffect, useState } from "react";
import { Alert, Button, Carousel, Col, Container, Row, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { fetchRuns } from "../API";
import { GenericLoadingSection } from "../components/GenericLoading";
import { getRunPageLink, RunSummary } from "../models/Run";
import AppContext from "../utils/contexts/AppContext";

const images = [
	'1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.png', '8.jpg', '9.jpg',
	'10.png', '11.jpg', '12.jpg', '13.jpg', '14.png', '15.webp', '16.jpeg', '17.jpg', '18.jpeg', '19.png',
	'20.jpg', '21.jpg', '22.jpg',
].map(filename => ({ url: `/storage/images/home/carousel/${filename}` }));

export const HomePage = () => {
	const { currentUser } = useContext(AppContext);
	const isGlobalModerator = currentUser?.isAdmin;

	const [latestRuns, setLatestRuns] = useState<RunSummary[]>();
	useEffect(() => {
		(async () => {
			const { data, meta } = await fetchRuns({
				orderBy: 'latest',
				perPage: 20
			});
			setLatestRuns(data);
		})();
	}, []);

	return <main>
		<Carousel indicators={false} fade style={{height: '66vh'}} className="overflow-hidden mb-3" id="home">
			{images.map(image =>
				<Carousel.Item key={image.url}>
					<img src={image.url} />
				</Carousel.Item>
			)}
		</Carousel>
		{isGlobalModerator && <Container>
			<div className="hstack gap-2 justify-content-center mb-2">
				<Button variant="outline-secondary" as={Link} to={'/moderators'}>Zarządzanie moderatorami globalnymi</Button>
			</div>
		</Container>}
		<Container>
			<Row>
				<Col xs={12} lg={4}>
					<h2>Czym jest speedrunning?</h2>
					<p>Speedrunning, czyli ukończenie gry w jak najkrótszym czasie, stało się popularną rozrywką i hobby dla wielu graczy na całym świecie. Celem speedrunnerów jest ustanowienie rekordowych czasów i dzielenie się swoimi strategiami i wskazówkami z innymi graczami.</p>
					<p>Aby ukończyć grę jak najszybciej, speedrunnerzy często wykorzystują różne techniki i błędy w grze (tzw. <i>glitches</i>). Te metody pozwalają na ominięcie trudniejszych części gry lub skrócenie czasu potrzebnego na ukończenie gry.</p>
					<p>Speedrunning ma również swoją społeczność, z wieloma graczami rywalizującymi o najszybsze czasy i organizującymi wydarzenia, takie jak <a href="https://gamesdonequick.com/" target={'_blank'}>Games Done Quick</a>, które zbierają pieniądze na cele charytatywne.</p>
					<p>Wiele gier jest popularnych wśród speedrunnerów, takich jak serie gier <i>"Super Mario"</i>, <i>"Portal"</i> i <i>"The Legend of Zelda"</i>, a także pojedyncze perełki, takie jak <i>"Minecraft"</i>, <i>"Doom"</i> czy <i>"Quake"</i>.</p>
					<Button variant="secondary" as={Link} to={'/games'} className="mb-4">Sprawdź nasz katalog gier</Button>
					<p>Speedrunning staje się coraz bardziej popularny, a wiele gier oferuje również wbudowane rankingi speedrun, które umożliwiają graczom konkurowanie już w grze. Dobrym przykładem może być np. "Trackmania".</p>
					<p>Ogólnie rzecz biorąc, speedrunning to zabawny i ekscytujący sposób na granie w gry, a dzięki społeczności graczy i różnym wydarzeniom, jest to również sposób na wsparcie dobrych celów.</p>
					<Button variant="secondary" as={Link} to={'/about'} className="mb-4">Czytaj więcej</Button>
				</Col>
				<Col xs={12} lg={8}>
					<h2>Ostatnie podejścia</h2>
					{latestRuns ?
						latestRuns.length > 0
							? <Table hover>
								<thead>
									<tr>
										<th>Gracz</th>
										<th>Data</th>
										<th>Gra</th>
										<th>Kategoria</th>
									</tr>
								</thead>
								<tbody>
									{latestRuns.map(run => <LatestRunRow key={run.id} run={run}/>)}
								</tbody>
							</Table>
							// Empty runs array
							: <Alert variant="secondary">Brak podejść w bazie danych.</Alert>
						// Runs undefined (loading)
						: <GenericLoadingSection description="Ładowanie podejść..." />
					}
				</Col>
			</Row>
		</Container>
	</main>
};
export default HomePage;

const LatestRunRow = ({run}: {run: RunSummary}) => {
	const navigate = useNavigate();
	const onClick = () => navigate(getRunPageLink(run));
	return <tr
		key={run.id}
		className="cursor-pointer"
		onClick={onClick}
		tabIndex={0} onKeyDown={event => event.key == 'Enter' && onClick()}
	>
		<td>{run.userName}</td>
		<td>{run.createdAt.toRelative()}</td>
		<td>{run.gameName}</td>
		<td>{run.categoryName}</td>
	</tr>
}
