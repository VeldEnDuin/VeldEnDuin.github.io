# VeldEnDuin.github.io
Opbouw van de publieke Website voor camping Veld & Duin.
Onderbouw: jekyll en liquid.

# Onderhoud van de site
## menu en navigatie

De twee niveau's van het menu worden beheerd in het bestand [_data/menu.yml](./_data/menu.yml)

De structuur van dat bestand is deze:
```yml
- item:
    {iso taal code}:
        name: {label}
        link: {link}
    {iso taal code} ... // zelfde voor volgende taal
  submenu:
    - item:
        {iso taal code}:
            name: {label}
            link: {link voor dir menu}
    - item: ... // meer items zoals voorgaande
- item: ... // meer items zoals voorgaande
```
Daarin vervang je

{deze elementen} | door deze waarden | om dit te bereiken
-----------------|-------------------|-------------------
{iso taal code}  | nl, fr, de, en    | 2-letter taal code die naam en link beschrijven voor die taal
{label}          | bv. Mijn Tekst    | Het label dat in het menu zichtbaar zal zijn voor de eindgebruiker
{link}           | bv. /nl/link/pagina.html | De link naar de pagina die gevolgd wordt als deze menuoptie wordt gekozen

Je kunt zoveel ```-item``` lijnen invoeren als je wilt, er moet natuurlijk wel genoeg plaats zijn om alle menu-items te kunnen bevatten.

Door onder de sectie ```submenu:```  meer ```-items``` toe te voegen, maak je menu-items die zich op het tweede niveau bevinden (onder het huidige item dus). Items met een subniveau hebben geen ```{link}``` nodig, want als je er op klikt moet het subniveau opengaan, en dus wordt de link toch niet gevolgd.

Het niveau van 'inspringen' in dit bestand is cruciaal voor het gewenste effect.

## normale pagina's

- waar toevoegen? --> per taal
- welke structuren?

[Markdown syntyax help](https://help.github.com/articles/github-flavored-markdown/)

- prelude!!! --> layout zeker vermelden

## nieuws-articles


## "group" pagina's
### 'activity'