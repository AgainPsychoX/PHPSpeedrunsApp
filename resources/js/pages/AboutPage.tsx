import React, { ReactNode } from "react";
import { Col, Container, Row } from "react-bootstrap";
import ReactPlayer from "react-player";

const AboutPage = () => {
	return <main>
		<TextSection>
			<h2>Kultura speedranów</h2>
		</TextSection>
		<ImageSection url={'https://www.xfire.com/wp-content/uploads/2021/01/sonic-768x434.png'} />
		<TextSection>
			<h4>Czym jest speedrunning?</h4>
			<p>Speedrunning, czyli ukończenie gry w jak najkrótszym czasie, stało się popularną rozrywką i hobby dla wielu graczy na całym świecie. Celem speedrunnerów jest ustanowienie rekordowych czasów i dzielenie się swoimi strategiami i wskazówkami z innymi graczami.</p>
			<p>Aby ukończyć grę jak najszybciej, speedrunnerzy często wykorzystują różne techniki i błędy w grze (tzw. <i>glitches</i>). Te metody pozwalają na ominięcie trudniejszych części gry lub skrócenie czasu potrzebnego na ukończenie gry.</p>
		</TextSection>
		<TextSection>
			<h4>Charytatywnie</h4>
			<p>Kultura speedrunnerów nie tylko dostarcza rozrywki i emocji, ale również wspiera ważne cele charytatywne. Wiele wydarzeń speedrunningowych, takich jak Games Done Quick, zbiera pieniądze na rzecz różnych organizacji charytatywnych, takich jak St. Jude Children's Research Hospital czy Doctors Without Borders.</p>
			<p>Speedrunnerzy również organizują własne zbiórki pieniędzy poprzez streamy na żywo na platformach takich jak Twitch, gdzie gracze mogą wpłacać darowizny podczas trwania transmisji. Społeczność ta pokazuje, że ich pasja do gier może przynieść pozytywny wpływ na świat i pomóc potrzebującym. Nie tylko dostarczają rozrywki, ale także pomagają zrobić dobry uczynek.</p>
		</TextSection>
		<VideoSection url={'https://www.youtube.com/watch?v=TCtbZQBJwgQ'} />
		<TextSection>
			<h4>Speedruny, a twórcy gier</h4>
			<p>Niektóre podejścia zadziwić i zszokują nawet samych twórców gier. Społeczność często odkrywa i wykorzystuje błędy lub mechanizmy w takich sposób, które nie były zamierzone przez twórców gier, ale pozwalają ukończyć grę o wiele szybciej. Te niespodziewane trasy i strategie mogą pozostawić widza w osłupieniu i zadziwić ich inwencją speedrunnerów. W niektórych przypadkach twórcy gier nawet włączają te błędy i wykorzystania do swoich własnych gier jako Easter eggs lub odniesienia do społeczności speedrunnerów.</p>
		</TextSection>
		<VideoSection url={'https://www.youtube.com/watch?v=ZqrmerjGZ14'} />
		<TextSection>
			<h4>Ciekawe artykuły</h4>
			<ul className="ms-4">
				<li><a href="https://antyweb.pl/speedruny-o-co-w-nich-chodzi" target={'_blank'}>"Speedruny - O co w nich chodzi?" na AntyWeb.pl</a></li>
				<li><a href="https://www.gry-online.pl/slownik-gracza-pojecie.asp?ID=399" target={'_blank'}>Pojęcie "speedrun" na GryOnline.pl</a></li>
				<li><a href="https://www.testergier.pl/2017/08/speedrun-rodzaje-czyli-powody-powtarzania-gry.html" target={'_blank'}>"Rodzaje speedranów - powody powtarzania gier" na TesterGier.pl</a></li>
				<li><a href="https://www.speedrun.com/" target={'_blank'}>Speedrun.com - Jedna z największych stron społeczności speedrunnerów</a></li>
			</ul>
		</TextSection>
	</main>
};
export default AboutPage;

const TextSection = (props: { children?: ReactNode }) => (
	<Container>
		<Row className="justify-content-center">
			<Col xs={12} lg={8}>
				{props.children}
			</Col>
		</Row>
	</Container>
);
const ImageSection = ({url}: {url: string}) => (
	<Container fluid={'md'}>
		<Row className="justify-content-center mb-4">
			<Col xs={12} lg={8} className="px-0">
				<img src={url} className="img-fluid" />
			</Col>
		</Row>
	</Container>
);
const VideoSection = ({url}: {url: string}) => (
	<Container fluid={'md'}>
		<Row className="justify-content-center mb-4">
			<Col xs={12} lg={8} className="px-0">
				<div className="ratio ratio-16x9 mb-4">
					<ReactPlayer url={url} width="100%" height="100%" />
				</div>
			</Col>
		</Row>
	</Container>
);
