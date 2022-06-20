
# TODO



### Main

+ Simple profile page.
+ Better profile page, country table and flags.
+ Profile editing.
+ Users picker (will come useful for adding runs and roles)
+ Proper Add/edit/delete game.
+ Proper Add/edit/delete category.
+ Proper Add/edit/delete run (incl. ghosts)
+ Proper Add/edit/delete users (by admin; incl. ghosts)
+ Roles management: 
	+ List mods in games/categories, button to edit the list, search/form in modal.
	+ Global administrators as separate admin panel.
+ Better checking permissions.
+ Change/forget password.



### Secondary

+ Accordions for rules.
+ Make `RunPage` links to game/category/user highlight on hover.
+ Pagination for runs.
+ Merging ghosts (from ghost profile).
+ Home page (incl. featured runs/games/players)
+ Docs/user guide.
+ More dynamic coded `HomePage` carousel.
+ Add small bar between navbar and content on pages, possibly related to the content.
+ Countries.
+ Search user runs for specific game (and category).



### Ideas

+ Fortify is obstacle...
	+ Rename `name` param of `POST /login` to `login`. 
	+ Localize login error messages.
+ Add animation and some buttons for `SoftRedirect`.
+ Prevent navbar mobile-like mode when on half screen.
+ Add small icons next to Youtube/Twitch/Twitter/Discord links/inputs.
+ Make outside website links have special icon next to them (maybe on hover only?).
+ Disable green border (valid) on empty optional text inputs (see register page).
+ Bootstrap text-areas with floating labels are buggy sometimes.
+ Text-areas should inform how much characters used up.
+ File inputs should have clear button nearby, without it you need to click to select and press cancel.
+ Validate selected file (game icon) on client side somehow.
+ Avoid relative path in imports.
+ Make errors logs (from 'npm run watch') point right TypeScript source files.
+ TypeScript source maps working with webpack, to improve debugging.
+ Use ESLint, especially for React early bug detection (like conditional hooks).
	+ Include it in Webpack, so it's automatic.
	+ Fix all errors and possible warnings.
+ Use `AbortController` to cancel some requests if necessary (i.e. when switching sorting method fast).
+ Keep sorting mode and pagination in URL (querystring), allow faster coming back to the result
+ Implement entry/summary/details model options on backend (save bandwidth).
+ After adding/editing/deleting which results in navigation, there could be toast/notification/alert with information about success.
+ When using relative dates/time, show actual date/timestamp on hover.
+ Consider allowing duplicate game names, unique key should be both game and publish year (i.e. NFS: Most Wanted).
+ Front-end API layer code should cache some data:
	+ If time Only asking using `HEAD` method whenever it was changed, then actually request.
	+ After creating/updating resource, its first `GET` request (which happens after redirect) should be omitted, as REST API returns updated resource immediately.


