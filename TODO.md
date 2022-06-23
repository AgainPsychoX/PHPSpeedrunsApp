
# TODO



### Main

+ Profile editing.
+ Change/forget password.
+ Proper Add/edit/delete users (by admin; incl. ghosts)
+ Ghosts will have predefined email: `${username}@gho.st`.
+ Roles management: 
	+ List mods in games/categories, button to edit the list, search/form in modal.
	+ Global administrators as separate admin panel.



### Secondary

+ Update contexts after modified.
+ Make `RunPage` links to game/category/user highlight on hover.
+ Merging ghosts (from ghost profile).
+ Docs/user guide.
+ Home page (incl. featured runs/games/players)
+ More dynamic coded `HomePage` carousel.
+ Add small bar between navbar and content on pages, possibly related to the content.
+ Pagination for runs.
+ Better profile page, country table and flags.
+ Search user runs for specific game (and category).



### Ideas

+ Use own modal in place of `window.alert` and `window.confirm`.
+ Make horizontal scrollable panes to have scrolls both on top and bottom ([simulate second one](https://stackoverflow.com/questions/3934271/horizontal-scrollbar-on-top-and-bottom-of-table)).
+ Fortify is obstacle...
	+ Rename `name` param of `POST /login` to `login`. 
	+ Localize login error messages.
+ Smooth placeholders when loading, try prevent content jumping too.
+ Add animation and some buttons for `SoftRedirect`.
+ Prevent navbar mobile-like mode when on half screen.
+ Add small icons next to Youtube/Twitch/Twitter/Discord links/inputs.
+ Make outside website links have special icon next to them (maybe on hover only?).
+ Disable green border (valid) on empty optional text inputs (see register page).
+ Bootstrap text-areas with floating labels are buggy sometimes.
+ Text-areas should inform how much characters used up.
+ Create separate duration input component, with working key UP/DOWN controls and spinner-like buttons.
+ File inputs should have clear button nearby, without it you need to click to select and press cancel.
+ Validate selected file (game icon) on client side somehow.
+ Avoid relative path in imports.
+ Make errors logs (from 'npm run watch') point right TypeScript source files.
+ TypeScript source maps working with webpack, to improve debugging.
+ Use ESLint, especially for React early bug detection (like conditional hooks).
	+ Include it in Webpack, so it's automatic.
	+ Fix all errors and possible warnings.
+ Context loading could maybe use `AbortController` to avoid double requests when failing to expect logged in, but its edge case.
+ Keep sorting mode and pagination in URL (querystring), allow faster coming back to the result
+ Implement entry/summary/details model options on backend (save bandwidth).
+ After adding/editing/deleting which results in navigation, there could be toast/notification/alert with information about success.
+ When using relative dates/time, show actual date/timestamp on hover.
+ Consider allowing duplicate game names, unique key should be both game and publish year (i.e. NFS: Most Wanted).
+ Front-end API layer code should cache some data:
	+ If time Only asking using `HEAD` method whenever it was changed, then actually request.
	+ After creating/updating resource, its first `GET` request (which happens after redirect) should be omitted, as REST API returns updated resource immediately.


