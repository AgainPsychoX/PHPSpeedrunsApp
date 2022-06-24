
# Serwis z rankingami speedrunów

Projekt zrealizowany przez Patryka Ludwikowskiego w ramach zaliczenia przedmiotu Aplikacje Internetowe, Uniwersytet Rzeszowski 2022.





## Założenia

Tematem projektu jest aplikacja-serwis do śledzenia rankingów [speedrunów](https://www.gry-online.pl/slownik-gracza-pojecie.asp?ID=399).

Back-end zrealizowany jest przy użyciu języka PHP w technologii [Laravel](https://laravel.com/) z bazą danych np. MySQL. Zarządza on zasobami aplikacji, pozwala na autoryzacje, rejestrowanie i logowanie się użytkowników. Dostarcza RESTful API przy użyciu JSONa w celu powiązania z front-endem.

Front-end zrealizowany jest jako aplikacja <abbr title="Single Page Application">SPA</abbr> przy użyciu języka TypeScript (nakładka na JavaScript) przy użyciu technologii [React](https://reactjs.org/) i stylów [Bootstrap](https://getbootstrap.com/). Używa API dostarczanego przez back-end, wyświetla zasoby, pozwala na interakcje użytkownika.





## Struktura



### Modele i ich przeznaczenie

+ Użytkownicy (tabela `users`) - zawiera dane użytkowników. Zapisane są dane do bezpiecznego logowania: Login, adres e-mail i hasło (które jest oczywiście zabezpieczone funkcją skrótu z solą). Każdy użytkownik może ustawić opis profilu i linki do profilu na serwisach YouTube, Twitch i Twitter, oraz nazwę konta Discord. Dane te wyświetlane są na podstronie dotyczącej użytkownika.
+ Gry (tabela `games`) - zawiera dane gier, dla których podejścia są agregowane przez serwis. Składają się na nie nazwa gry, rok wydania, teksty z opisem i zasadami oraz ikona (która jest przechowywana na serwerze).
+ Kategorie (tabela `categories`) - zawiera dane kategorii, czyli pomniejszych jednostek grupowania dodanych podejść w danej grze. Różne kategorie, poza nazwą, mogą mieć różne dodatkowe zasady, metodę oceny wyniku (tylko czas, najwyższa ilość punktów lub najniższa ilość punktów) oraz liczbę wymaganych weryfikacji, które dane podejście musi otrzymać, żeby było wyświetlane dla innych użytkowników (w tym niezalogowanych). Nazwy kategorii nie mogą się powtarzać wewnątrz gry (ale mogą nazywać się tak samo w różnych grach).
+ Podejścia (tabela `runs`) - zawiera dane o podejściach dodawanych przez użytkowników. Najważniejsze to powiązany użytkownik i kategoria, długość (w milisekundach), punkty (opcjonalnie, bo niektóre kategorie mogą respektować tylko czas) i URL nagrania wideo. Poza tym, dodane mogą być notatki w postaci tekstu. Każde podejście ma także stan - zweryfikowany, oczekujący na weryfikacje i nieprawidłowy. Mimo, że można wywnioskować stan gry z innej tabeli, nie jest to wydajne, dlatego jest to zapamiętywane razem z podejściem.
+ Weryfikacje (tabela `run_verifications`) - łączy podejścia z moderatorami wraz z ich oceną danego podejścia - głos za lub przeciw uznaniu podejście za zweryfikowane. Możliwe jest także dodanie notatki.
+ Przydziały moderatorów (tabela `moderator_assignments`) - służy do powiązania użytkownika z zasobem do moderowania: kategorią, grą lub globalnie wszystkimi zasobami (administrator). Zapamiętane są także czas dodania i usunięcia z danej roli.



### Użytkownicy

Można powiedzieć, że w systemie mamy różne rodzaje użytkowników:

+ Duchy:
	+ Dane profilu.
	+ Atrapy użytkowników, pozwalające dodać moderatorom podejścia osób niekorzystających z platformy.
+ Użytkownicy:
	+ Rejestracja i logowanie sie.
	+ Dane profilu.
	+ Dodawanie podejść.
	+ Usuwanie swoich podejść (jeśli jeszcze nie zweryfikowane).
	+ Edytowanie swoich podejść (jeśli już zweryfikowane: tylko opis).
+ Moderatorzy kategorii:
	+ Są także użytkownikami.
	+ Dodawanie podejść w imieniu innych użytkowników (w tym duchy).
	+ Weryfikacja (głosowanie) i edytowanie podejść dodane przez innych użytkowników.
	+ Edytowanie szczegółów danej kategorii.
	+ Dany użytkownik może być moderatorem dla wielu gier i kategorii.
+ Moderatorzy gry:
	+ Mogą edytować szczegóły danej gry.
	+ Mogą dodawać kategorie i moderatorów kategorii.
+ Administratorzy: 
	+ Administratorzy są globalnymi moderatorami.
	+ Mogą dodawać/edytować/usuwać wszystko, w tym innych moderatorów (w tym globalnych).
	+ Mogą scalać konto ducha do konta użytkownika.



### Ścieżki (routing)

#### Back-end

Routing użyty na back-endzie stara się podążać standardy RESTful API. Do głównych elementów zastosowany jest tzw. [`shallow nested routing` z Laravel](https://laravel.com/docs/9.x/controllers#shallow-nesting), w celu ułatwienia pracy z API (nie trzeba podawać ID gry/kategorii jeśli znamy już ID gry podrzędnego elementu).

```sh
################################################################################
# Model gry
GET|HEAD        api/games
POST            api/games
GET|HEAD        api/games/{game}
PUT|PATCH       api/games/{game}
DELETE          api/games/{game}

# Moderatorzy gier
GET|HEAD        api/games/{game}/moderators 
PUT             api/games/{game}/moderators/{user} 
DELETE          api/games/{game}/moderators/{user} 

################################################################################
# Model kategorii
GET|HEAD        api/games/{game}/categories
POST            api/games/{game}/categories
GET|HEAD        api/categories/{category}
PUT|PATCH       api/categories/{category}
DELETE          api/categories/{category}

# Moderatorzy kategorii
GET|HEAD        api/categories/{category}/moderators 
PUT             api/categories/{category}/moderators/{user} 
DELETE          api/categories/{category}/moderators/{user} 

################################################################################
# Model podejścia
GET|HEAD        api/games/{game}/categories/{category}/runs 
POST            api/games/{game}/categories/{category}/runs 
GET|HEAD        api/runs/{run} 
PUT|PATCH       api/runs/{run} 
DELETE          api/runs/{run} 
GET|HEAD        api/runs

# Weryfikacja podejścia
GET|HEAD        api/runs/{run}/verifiers 
POST            api/runs/{run}/voteVerify 

################################################################################
# Model użytkownika
GET|HEAD        api/users 
POST            api/users 
GET|HEAD        api/users/{user} 
PUT|PATCH       api/users/{user} 
DELETE          api/users/{user} 

# Aktywny użytkownik
GET|HEAD        user

# Logowanie, rejestracja
POST            login 
POST            logout 
POST            register 
POST            forgot-password 
POST            reset-password 

################################################################################
# Inne
GET|HEAD        sanctum/csrf-cookie 


# Moderatorzy globalni
GET|HEAD        api/moderator 
GET|HEAD        api/moderators 
PUT             api/moderators/{user} 
DELETE          api/moderators/{user} 

# Każda inna ścieżka ładuje aplikacje SPA (front-end)
GET|HEAD        {any} 
```

#### Front-end

```sh
# Gry
/games
/games/new
/games/{game} # *
/games/{game}/edit

# Kategorie
/games/{game}/categories # *
/games/{game}/categories/new
/games/{game}/categories/{category} # *
/games/{game}/categories/{category}/edit

# Podejścia
/games/{game}/categories/{category}/runs # *
/games/{game}/categories/{category}/runs/new
/games/{game}/categories/{category}/runs/{run}
/games/{game}/categories/{category}/runs/{run}/edit

# Użytkownicy
/users/current
/users/{user}
/users/{user}/edit

# Zarządzanie moderatorami
/moderators
/games/{game}/moderators
/games/{game}/categories/{category}/moderators

# Inne
/
/home
/login
/logout
/register

# Uwagi:
# * - jest pojedyncza strona gry z kartami kategorii z listą podejść.
```



### Magazyn plików

Laravel (back-end) dostarcza magazynu plików.

Struktura:
```sh
/images/games/{game_id}/icon.XYZ           # Ikony dla gier. Powinny być przechowywane jako pliki PNG, JPEG lub WEBP.
                                           # Przy usunięciu ikony z modelu (lub usunięciu modelu) powiązany plik zostanie usunięty.
/images/games/placeholder/icon.png         # Placeholder ikony gry (w przypadku nieustawienia żadnej).
```


