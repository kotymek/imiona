# Imiona w rejestrze PESEL

Statyczna wyszukiwarka pierwszych imion osób żyjących w rejestrze PESEL,
publikowana przez GitHub Pages. Dane: https://dane.gov.pl/pl/dataset/1667.

## Funkcje

- Stałe miejsce w rankingu ogólnym, zachowane przy wyszukiwaniu, sortowaniu i filtrowaniu.
- Remisy mają miejsca 1, 1, 3. Karta imienia zawiera także miejsce wśród danej płci.
- Wyszukiwanie bez polskich znaków, z zachowaniem osobnych zapisów imion.
- Karta imienia z adresem URL, sąsiednimi pozycjami i udziałem w całym zestawieniu.
- Porównanie maksymalnie czterech pozycji, filtry litery, do 100 osób i do 4 znaków.
- Wybór 25/50/100 wyników na stronę i przejście do wskazanej strony.
- Historia liczebności według zachowanych dat publikacji, bez utożsamiania jej z liczbą urodzeń.

## Dane i historia

`python scripts/update_data.py` pobiera dane i waliduje komplet obu płci,
unikalność par imię–płeć oraz dodatnie liczebności przed zastąpieniem bieżącego pliku.
`date` oznacza stan danych źródłowych, a `updated` czas pomyślnego pobrania.

Każda data publikacji ma plik `data/history/YYYY-MM-DD.json`; indeks jest w
`data/history/index.json`. Ponowne pobranie tej samej daty aktualizuje jej plik,
a nowa data dodaje kolejny stan. Pierwszy zachowany stan to 2026-01-20.
Brak pozycji w archiwalnym pliku jest wyświetlany jako brak danych, nie zero.
Widok zmian pojawia się, gdy dostępne są przynajmniej dwa stany.

Cotygodniowy workflow sprawdza źródło, zapisuje bieżące dane i archiwum.
Udane zakończenie aktualizacji uruchamia publikację Pages także wtedy, gdy
commit został utworzony przez `GITHUB_TOKEN`.

## Podgląd i testy

Wymagania: Python 3.12, pakiety z `requirements.txt`, Node.js 22 do testów.

```sh
pip install -r requirements.txt
python -m http.server 8000
node --check app.js
node --test tests/core.test.cjs
python -m unittest discover -s tests -p 'test_*.py'
```

Otwórz http://localhost:8000. Testy obejmują zachowanie miejsca na rzeczywistych
danych, polskie znaki, remisy, filtry, odmianę wyników oraz zapis i walidację archiwum.
