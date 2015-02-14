[Deze tekst op volle pagina](./README.md)

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
        linkby: {code voor links} // zie verder bij link-beheer
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

### todo
TODO uitleg ivm linkbeheer - effect via [{klikbare tekst}][{linkcode}.{taalcode}]

Voorbeeld: als je een menu-item een ```linkby: foo``` hebt gegeven, dan kun je in de ```*.md``` files daar een inline link naar leggen door deze tekst 

``` Hier is een [link][foo.nl] naar de nederlandse link van dit menu-element ```


## alle pagina's / default layout

### todo
- welke structuren?
[Markdown syntyax help](https://help.github.com/articles/github-flavored-markdown/)

- belangrijkste vermelden

- lege lijnen zijn belangrijk!

- links leggen --> link management en vertalingen

- prelude!!! --> layout zeker vermelden
- maar ook de andere elementen uit de prelude die door default worden opgepikt

- waar toevoegen? --> per taal
- toevoegen aan de menu-structuur
- pagina's die niet in de menu staan --> vertalingen linken


overzicht layouts
+ specifiek per layout: meer uitleg per layout

## nieuws-articles
### todo

- specifieke prelude elementen 


## "group" pagina's
### 'activity'
### todo

- specifieke prelude elementen 

## "landing" pagina's

### todo

Hoe delen (zie verder) selecteren en toevoegen.



## page-parts

Oplossing voor landing-pads en addons --> selecteerbare delen die je toevoegt.

### todo