import React, { useContext, useState } from "react"
import { Container, Nav, Navbar } from "react-bootstrap"
import { Link, NavLink } from "react-router-dom";
import AppContext from "../utils/contexts/AppContext";

const MyNavbar = () => {
	const { currentUser } = useContext(AppContext);
	const [expanded, setExpanded] = useState(false);

	const close = () => setTimeout(() => setExpanded(false), 150);

	return <Navbar bg="light" expand="lg" expanded={expanded}>
		<Container>
			<Navbar.Brand as={NavLink} to="/">SpeedrunsApp</Navbar.Brand>
			<Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(!expanded)} />
			<Navbar.Collapse id="basic-navbar-nav">
				<Nav className="me-auto text-nowrap">
					<Nav.Link as={NavLink} onClick={close} to="/">Strona główna</Nav.Link>
					<Nav.Link as={NavLink} onClick={close} to="/games/">Katalog gier</Nav.Link>
					<Nav.Link as={NavLink} onClick={close} to="/users/">Gracze</Nav.Link>
					<Nav.Link as={NavLink} onClick={close} to="/about/">O speedranowaniu</Nav.Link>
				</Nav>
			</Navbar.Collapse>
			<Navbar.Collapse className="justify-content-end">
				{currentUser
					? <>
						<Navbar.Text className="mx-auto mx-lg-2 text-center d-block">
							Zalogowany jako <span className="fw-semibold text-break">{currentUser.name}</span>
						</Navbar.Text>
						<div className="hstack gap-3 gap-lg-1 my-1 text-nowrap">
							<Link className="btn btn-sm btn-outline-primary flex-grow-1" role="button" onClick={close} to="/users/current">Mój profil</Link>
							<Link className="btn btn-sm btn-outline-secondary flex-grow-1" role="button" onClick={close} to="/logout">Wyloguj</Link>
						</div>
					</>
					:
					<>
						<div className="hstack gap-3 gap-lg-1 my-1 text-nowrap">
							<Link className="btn btn-sm btn-outline-primary flex-grow-1" role="button" onClick={close} to="/login">Zaloguj się</Link>
							<Link className="btn btn-sm btn-outline-secondary flex-grow-1" role="button" onClick={close} to="/register">Zarejestruj się</Link>
						</div>
					</>
				}
			</Navbar.Collapse>
		</Container>
	</Navbar>
}
export default MyNavbar;
