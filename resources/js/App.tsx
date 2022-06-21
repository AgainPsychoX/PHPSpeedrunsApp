import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import API from "./API";
import AppContext from "./utils/contexts/AppContext";
import { GameContextRouterOutlet } from "./utils/contexts/GameContext";
import { CategoryContextRouterOutlet } from "./utils/contexts/CategoryContext";
import { RunContextRouterOutlet } from "./utils/contexts/RunContext";
import { UserContextRouterOutlet } from "./utils/contexts/UserContext";
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
import NotFoundPage from "./pages/common/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";
import RunPage from "./pages/RunPage";
import UsersPage from "./pages/UsersPage";
import UserPage from "./pages/UserPage";
import GameFormPage from "./pages/GameFormPage";
import CategoryFormPage from "./pages/CategoryFormPage";
import RunFormPage from "./pages/RunFormPage";

const App = () => {
	const [ready, setReady] = useState<boolean>(false);
	const [user, setUser] = useState<UserDetails>();

	useEffect(() => {
		API.initialize().then(async () => {
			if (parseBoolean(localStorage.getItem('expectLoggedIn'))) {
				await API.fetchCurrentUser()
					.then(details => {
						localStorage.setItem('expectLoggedIn', '1');
						setUser(details);
					})
					.catch(() => {
						localStorage.setItem('expectLoggedIn', '0')
					})
				;
			}
			setReady(true);
		});
	}, [])

	if (!ready) {
		return <GenericLoadingPage/>
	}

	return (
		<AppContext.Provider value={{
			currentUser: user
		}}>
			<BrowserRouter>
				<MyNavbar/>
				<Routes>
					<Route path="/">
						<Route index element={<HomePage/>} />
						<Route path="games">
							<Route index element={<GamesPage />} />
							<Route path="new" element={<GameFormPage/>} />
							<Route path=":gameIdPart" element={<GameContextRouterOutlet/>}>
								<Route index element={<GamePage/>} />
								<Route path="edit" element={<GameFormPage/>} />
								<Route path="categories">
									<Route index element={<GamePage/>} />
									<Route path="new" element={<CategoryFormPage/>} />
									<Route path=":categoryIdPart" element={<CategoryContextRouterOutlet/>}>
										<Route index element={<GamePage/>} />
										<Route path="edit" element={<CategoryFormPage/>} />
										<Route path="runs">
											<Route index element={<GamePage/>} />
											<Route path="new" element={<RunFormPage/>} />
											<Route path=":runIdPart" element={<RunContextRouterOutlet/>}>
												<Route path="edit" element={<RunFormPage/>} />
												<Route index element={<RunPage/>} />
											</Route>
										</Route>
									</Route>
								</Route>
							</Route>
						</Route>
						<Route path="users">
							<Route index element={<UsersPage />} />
							<Route path=":userIdPart" element={<UserContextRouterOutlet/>}>
								<Route index element={<UserPage/>} />
							</Route>
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
