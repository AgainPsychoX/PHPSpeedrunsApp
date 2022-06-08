
# Serwis do śledzenia rankingów speedrunów





## Założenia

#### Modele i ich przeznaczenie

+ Użytkownicy:
	+ Role:
		+ Duchy:
			+ Atrapa użytkownika, pozwalająca dodać moderatorom podejścia osób niekorzystających z platformy.
			+ Dane profilu (z możliwością edycji) i zbuforowane statystyki.
		+ Użytkownicy:
			+ Rejestrują i logują się.
			+ Dane profilu (z możliwością edycji) i zbuforowane statystyki.
			+ Dodają swoje podejścia.
			+ Usuwają swoje podejścia (jeśli jeszcze nie zweryfikowane).
			+ Edytować swoje podejścia (jeśli już zweryfikowane: tylko opis)
		+ Moderatorzy mogą:
			+ Moderatorzy są użytkownikami.
			+ Mogą dodawać podejścia w imieniu innych użytkowników (w tym duchy).
			+ Mogą weryfikować i edytować podejścia dodane przez innych użytkowników.
			+ Być ograniczeni do gry lub kategorii.
			+ Dany użytkownik może być moderatorem dla wielu gier i kategorii.
			+ Moderatorzy gier mogą dodawać kategorie i moderatorów kategorii.
			+ Mogą edytować szczegóły gry i kategorii.
			+ Przenosić podejścia między kategoriami (jeśli jest moderatorem gry lub obu kategorii).
		+ Administratorzy: 
			+ Mogą scalać konto ducha do konta użytkownika.
			+ Administratorzy są globalnymi moderatorami.
			+ Mogą dodawać/edytować/usuwać wszystko.
+ Role:
	+ Wskazują użytkownika, typ roli, powiązaną strukturę (jeśli jakaś), czas nadania, użytkownika nadającego.
+ Gry:
	+ Posiada powiązane kategorie.
	+ Może być zarządzane przez moderatorów gier.
	+ Zawiera informacje i zbuforowane statystyki.
	+ Może zawierać ikonę dla gry (w tym: przesłane przez moderatora).
+ Kategorie:
	+ Posiada powiązane podejścia.
	+ Może być zarządzane przez moderatorów kategorii (i gier).
	+ Zawiera informacje i zbuforowane statystyki.
	+ Może zawierać ikonę dla kategorii (w tym: przesłane przez moderatora).
+ Podejścia:
	+ Powiązane z właścicielem (użytkownikiem lub duchem).
	+ Zawiera informacje i statystyki o podejściu.
	+ Może zawierać uwagi moderatorów.
	+ Stany:
		+ Niezweryfikowane:
			+ Dodane przez użytkownika.
			+ Możliwe do w miarę swobodnej edycji.
			+ Widoczne tylko dla danego użytkownika i moderatorów.
		+ Zweryfikowane:
			+ Ustawiany stan przez wpływ moderatorów.
			+ Widoczne w oficjalnych rankingach.
			+ Ograniczona edycja i możliwość usuwania przez właściciela.
		+ Nieprawidłowe:
			+ Ustawiany stan przez wpływ moderatorów.
			+ Niewidoczne w oficjalnych rankingach.
			+ Ograniczona edycja i możliwość usuwania przez właściciela.
			+ Może służyć do ukrywania podejść podejrzanych o oszustwa w trakcie głębszej weryfikacji.

#### Inne funkcjonalności

+ Prowadzenie statystyk dla gier, kategorii i użytkowników.
+ Tworzenie rankingów dla kategorii.





## Struktura

#### Magazyn plików (`storage`)

Zdjęcia i grafiki powinny być przechowywane jako pliki PNG lub JPEG.

```
/images/games/{}/icon.XYZ           // Ikony dla gier
/images/categories/{}/icon.XYZ      // Ikony dla gier
```

