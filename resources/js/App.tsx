import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import API from "./API";
import AppContext from "./utils/contexts/AppContext";
import { GameContextRouterOutlet } from "./utils/contexts/GameContext";
import { CategoryContextRouterOutlet } from "./utils/contexts/CategoryContext";
import { RunContextRouterOutlet } from "./utils/contexts/RunContext";
import { parseBoolean } from "./utils/SomeUtils";
import { GenericLoadingPage } from "./components/GenericLoading";
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
import RegisterPage from "./pages/RegisterPage";
import RunPage from "./pages/RunPage";
import UsersPage from "./pages/UsersPage";

const App = () => {
	const [ready, setReady] = useState<boolean>(false);
	const [user, setUser] = useState<UserDetails>();

	useEffect(() => {
		API.initialize().then(() => {
			let ready = Promise.resolve();
			if (parseBoolean(localStorage.getItem('expectLoggedIn'))) {
				ready = ready.then(() => {
					API.fetchCurrentUser()
						.then(details => {
							localStorage.setItem('expectLoggedIn', '1');
							setUser(details);
						})
						.catch(() => {
							localStorage.setItem('expectLoggedIn', '0')
						})
					})
				;
			}
			ready.finally(() => setReady(true))
		});
	}, [])

	if (!ready) {
		return <GenericLoadingPage/>
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
							{/* <Route path="new" element={<NewGamePage />} /> */}
							<Route index element={<GamesPage />} />
							<Route path=":gameIdPart" element={<GameContextRouterOutlet/>}>
								<Route index element={<GamePage/>} />
								<Route path="categories">
									<Route index element={<Navigate to={`/games`}/>} />
									<Route path=":categoryIdPart" element={<CategoryContextRouterOutlet/>}>
										{/* TODO: index should redirect to GamePage with category selected */}
										<Route index element={<Navigate to={`/games`}/>} />
										<Route path="runs">
											{/* TODO: index should redirect to GamePage with category selected and run highlighted */}
											<Route index element={<Navigate to={`/games`}/>} />
											<Route path=":runIdPart" element={<RunContextRouterOutlet/>}>
												<Route index element={<RunPage/>} />
											</Route>
										</Route>
									</Route>
								</Route>
							</Route>
						</Route>
						<Route path="users">
							<Route index element={<UsersPage />} />
						</Route>
						<Route path="about" element={<AboutPage/>} />
						<Route path="login" element={<LoginPage onLogin={(user) => setUser(user)}/>} />
						<Route path="logout" element={<LogoutPage onLogout={() => setUser(undefined)}/>} />
						<Route path="register" element={<RegisterPage onLogin={(user) => setUser(user)}/>} />
					</Route>
					<Route path="*" element={<NotFoundPage />} />
				</Routes>
				<MyFooter/>
			</BrowserRouter>
		</AppContext.Provider>
	)
};
export default App;
