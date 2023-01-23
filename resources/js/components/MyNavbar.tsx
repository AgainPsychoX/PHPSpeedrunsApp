import React, { useContext, useState } from "react"
import { Button, ButtonGroup, Container, Dropdown, DropdownButton, Nav, Navbar } from "react-bootstrap"
import { Link, NavLink } from "react-router-dom";
import { Theme, themes } from "../utils/BootstrapThemes";
import AppContext from "../utils/contexts/AppContext";

const MyNavbar = ({
	setTheme = () => {},
}: {
	setTheme: (theme: Theme) => void;
}) => {
	const { currentUser, theme } = useContext(AppContext);
	const [expanded, setExpanded] = useState(false);

	const close = () => setTimeout(() => setExpanded(false), 150);

	return <Navbar expand="lg" expanded={expanded}>
		<Container>
			<Navbar.Brand as={NavLink} to="/">SpeedrunsApp</Navbar.Brand>
			<Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(!expanded)} />
			<Navbar.Collapse id="basic-navbar-nav">
				<Nav className="me-auto text-nowrap">
					<Nav.Link as={NavLink} onClick={close} to="/">Strona główna</Nav.Link>
					<Nav.Link as={NavLink} onClick={close} to="/games/">Katalog gier</Nav.Link>
					<Nav.Link as={NavLink} onClick={close} to="/users/">Gracze</Nav.Link>
					<Nav.Link as={NavLink} onClick={close} to="/about/">Kultura speedranów</Nav.Link>
				</Nav>
			</Navbar.Collapse>
			<Navbar.Collapse className="justify-content-end">
				{currentUser
					? <>
						<Navbar.Text className="mx-auto mx-lg-2 text-center d-block">
							Zalogowany jako <span className="fw-semibold text-break">{currentUser.name}</span>
						</Navbar.Text>
						<div className="hstack gap-3 gap-lg-1 my-1 text-nowrap">
							<Button size="sm" variant="outline-primary" className="flex-grow-1" onClick={close} as={Link} to="/users/current">Mój profil</Button>
							<Button size="sm" variant="outline-secondary" className="flex-grow-1" onClick={close} as={Link} to="/logout">Wyloguj</Button>
							<ThemeSelectDropdown theme={theme} setTheme={setTheme} />
						</div>
					</>
					:
					<>
						<div className="hstack gap-3 gap-lg-1 my-1 text-nowrap">
							<Button size="sm" variant="primary" className="flex-grow-1" onClick={close} as={Link} to="/login">Zaloguj się</Button>
							<Button size="sm" variant="outline-secondary" className="flex-grow-1" onClick={close} as={Link} to="/register">Zarejestruj się</Button>
							<ThemeSelectDropdown theme={theme} setTheme={setTheme} />
						</div>
					</>
				}
			</Navbar.Collapse>
		</Container>
	</Navbar>
}
export default MyNavbar;

const themeToName: Record<Theme, string> = {
	"light": "Jasny",
	"auto": "Auto",
	"dark": "Ciemny",
};
const themeToIcon: Record<Theme, string> = {
	"light": "sun-fill",
	"auto": "circle-half",
	"dark": "moon-stars-fill",
}

const ThemeSelectDropdown = ({
	theme,
	setTheme = () => {},
}: {
	theme: Theme;
	setTheme: (theme: Theme) => void;
}) => {
	return <Dropdown as={ButtonGroup}>
		<Dropdown.Toggle size="sm" variant="outline-secondary">
			<i className={`bi bi-${themeToIcon[theme]} me-2`}></i>
		</Dropdown.Toggle>
		<Dropdown.Menu align="end">
			{themes.map(x => (
				<Dropdown.Item key={x} active={theme == x} as={Button} onClick={() => setTheme(x)}>
					<i className={`bi bi-${themeToIcon[x]} me-2`}></i> {themeToName[x]}
				</Dropdown.Item>
			))}
		</Dropdown.Menu>
	</Dropdown>
}
