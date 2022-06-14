import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { BrowserRouter, Routes, Route, NavLink, Link } from "react-router-dom";
import AboutPage from "./pages/AboutPage";
import GamePage from "./pages/GamePage";
import GamesPage from "./pages/GamesPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import GameProvider from "./utils/GameProvider";

export const App = () => {
	return (
		<BrowserRouter>
			<Navbar bg="light" expand="lg">
				<Container>
					<Navbar.Brand as={NavLink} to="/">SpeedrunsApp</Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="me-auto">
							<Nav.Link as={NavLink} to="/">Strona główna</Nav.Link>
							<Nav.Link as={NavLink} to="/games/">Katalog gier</Nav.Link>
							<Nav.Link as={NavLink} to="/players/">Gracze</Nav.Link>
							<Nav.Link as={NavLink} to="/about/">O speedranowaniu</Nav.Link>
						</Nav>
					</Navbar.Collapse>
				</Container>
			</Navbar>
			<Routes>
				<Route path="/">
					<Route index element={<HomePage/>} />
					<Route path="games">
						<Route path=":gameIdPart" element={<GameProvider>
							<GamePage/>
						</GameProvider>} />
						{/* <Route path="new" element={<NewGamePage />} /> */}
						<Route index element={<GamesPage />} />
					</Route>
					<Route path="about" element={<AboutPage/>} />
				</Route>
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
			<footer>
				<Container>
					<address className="text-center fw-light mb-0">
						Przygotowane przez <a href="mailto:patryk.ludwikowski.7@gmail.com" className="">Patryka Ludwikowskiego</a> w ramach zaliczenia przedmiotu Aplikacje Internetowe, Uniwersytet Rzeszowski 2022.
					</address>
				</Container>
			</footer>
		</BrowserRouter>
	)
};
export default App;
