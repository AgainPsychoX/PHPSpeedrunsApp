import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import API from "./API";
import GenericLoadingSection from "./components/GenericLoadingSection";
import MyFooter from "./components/MyFooter";
import MyNavbar from "./components/MyNavbar";
import { UserDetails } from "./models/User";
import AboutPage from "./pages/AboutPage";
import GamePage from "./pages/GamePage";
import GamesPage from "./pages/GamesPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import LogoutPage from "./pages/LogoutPage";
import NotFoundPage from "./pages/NotFoundPage";
import AppContext from "./utils/AppContext";
import GameProvider from "./utils/GameProvider";

const App = () => {
	const [ready, setReady] = useState<boolean>(false);
	const [user, setUser] = useState<UserDetails>();

	useEffect(() => {
		API.initialize().then(() => {
			API.fetchCurrentUser()
				.then(details => {
					localStorage.setItem('expectLoggedIn', '1');
					setUser(details);
				})
				.catch(() => {
					localStorage.setItem('expectLoggedIn', '0')
				})
				.finally(() => setReady(true))
			;
		});
	}, [])

	if (!ready) {
		return <div>
			<GenericLoadingSection/>
		</div>;
	}

	return (
		<AppContext.Provider value={{
			user
		}}>
			<BrowserRouter>
				<MyNavbar/>
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
						<Route path="login" element={<LoginPage onLogin={(user) => setUser(user)}/>} />
						<Route path="logout" element={<LogoutPage onLogout={() => setUser(undefined)}/>} />
					</Route>
					<Route path="*" element={<NotFoundPage />} />
				</Routes>
				<MyFooter/>
			</BrowserRouter>
		</AppContext.Provider>
	)
};
export default App;
