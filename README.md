[langs.yml]:     ./_data/langs.yml
[menu.yml]:      ./_data/menu.yml
[linkcode.yml]:  ./_data/linkcode.yml
[README.md]:     ./README.md
[nl]:            ./nl/
[fr]:            ./fr/
[de]:            ./de/
[en]:            ./en/
[_posts/nl]:     ./_posts/nl/
[_posts/fr]:     ./_posts/fr/
[_posts/en]:     ./_posts/en/
[_posts/de]:     ./_posts/de/


[Deze tekst op volle pagina][README.md]


# VeldEnDuin.github.io
Opbouw van de publieke Website voor camping Veld & Duin.

Onderbouw: jekyll en liquid.

# Onderhoud van de site
## menu en navigatie

De twee niveau's van het menu worden beheerd in het bestand [menu.yml]

De structuur van dat bestand is deze:
```yml
- menu:
    {taal-code}:
        name: {label}
        link: {link}
    {taal-code} ... // zelfde voor volgende taal
    linkcode: {link-code}
  submenu:
    - item:
        {iso taal code}:
            name: {label}
            link: {link voor dir menu}
      linkcode: {link-code} 
    - item: ... // meer items zoals voorgaande
- menu: ... // meer menu-items zoals voorgaande
```

Daarin vervang je

{deze elementen} | door deze waarden | om dit te bereiken
-----------------|-------------------|-------------------
{taal-code}      | nl, fr, de, en    | 2-letter taal code die naam en link beschrijven voor die taal
{label}          | bv. Mijn Tekst    | Het label dat in het menu zichtbaar zal zijn voor de eindgebruiker
{link}           | bv. /nl/link/pagina.html | De link naar de pagina die gevolgd wordt als deze menuoptie wordt gekozen

Je kunt zoveel ```-menu``` lijnen invoeren als je wilt, er moet natuurlijk wel genoeg plaats zijn om alle menu-items te kunnen bevatten.

Door onder de sectie ```submenu:```  meer ```-item```s toe te voegen, maak je submenu-items die zich op het tweede niveau bevinden (onder het huidige menu dus). Menu's met een subniveau hebben geen ```{link}``` nodig, want als je er op klikt moet het subniveau opengaan, en dus wordt de link toch niet gevolgd.

Je kunt elk item ook voorzien van een ```linkcode``` code waardoor de menu-link ook beschikbaar wordt om vanuit de tekst links te leggen naar deze items.  Zie sectie over linkbeheer.

Het niveau van 'inspringen' in dit bestand is cruciaal voor het gewenste effect. Inspringen kan met tab of spatie.

## Alle pagina's / ongeacht layout

Deze website laat toe de web-pagina's en de elementen erin te noteren in zogenaamde *markdown* notatie.  Deze betanden zijn te herkennen aan hun ```*.md``` extensie.  Hieronder beschrijven we wat je in deze site met deze bestanden kunt doen.

### Locatie van de bestanden

In het algemeen worden deze pagina's best per taal georganizeerd. Deze site bevat reeds specifieke folders voor volgende talen: [nl], [fr], [en], [de].  Speciale types tekst die ook als onderdeel op andere pagina's moeten verschijnen (voornamelijk de nieuws-artikels) krijgen een andere locatie (zie verder) 

Om een taal toe te voegen kun je een nieuwe folder beginnen, en ze uitwerken in het [langs.yml] bestand.

**Tip:** De hier beschreven locaties voor de pagina.md bestanden zijn **niet** strikt vereist om een werkend systeem te krijgen.  De juiste aanduiding van de paden in de [linkcode.yml] en [menu.yml] is eigenlijk het enige wat echt telt.  Toch is de voorgestelde opdeling hanteren vooral nuttig om te blijven alles vlot terug te vinden.  Indien nuttig mogen dus ook naar believen verdere onderverdelingen gemaakt door het toevoegen van subfolders.

### Grafische elementen
Verschillende grafische effecten kunnen op makkelijke manier ingegeven worden.
Dit door de zogenaamde [Markdown notatie](https://help.github.com/articles/github-flavored-markdown/) te hanteren. We vermelden hier de voor deze site meest nuttige elementen daaruit:

**bold:** 
tekst in **vetjes** krijg je door dubbele sterren ```**``` voor en achter toe te voegen

**italic:**
tekst in *cursief* krijg je door enkele sterren ```*``` voor en achter toe te voegen

**lijstjes:**
door een ```-``` of ```*``` teken met spatie aan het begin van een lijn te gebruiken kun je makkelijk lijstjes aanmaken:
* item 1
* item 2
- topic 3


**gescheiden paragrafen:**
Lege lijnen zijn in dit formaat belangrijk om gescheiden paragrafen te maken.
Zonder de lege tussenlijn worden teksten aan dezelfde paragraaf toegevoegd. 


**lijnen:** vier opeenvolgende ```----``` op een verder lege lijn voorafgegaan door een lege lijn zal resulteren in een horizontale lijn

----

**hoofdingen:** Door een aantal ```#``` tekens aan het begin van de lijn te hanteren (een lege lijn vooraf is nodig!) bouw je een hoofding van een bepaald niveau (het aantal ```#``` bepaalt het niveau)

# hoofd 1
## hoofd 2
### hoofd 3 (enz.)

**tabellen:** Kun je aanmaken door de kolommen met ```|``` tekens te scheiden en (belangrijk) ook de eerste rij van de volgende te scheiden met ```---|---``` lijnen waar het aantal kolommen in terugkomt

Belangrijk: De scheidingslijnen moeten minstens 3 mintekens lang zijn

Kolommen kunnen gealligneerd worden dmv het toevoegen van ```:``` tekens in de scheidingslijnen:
* links ```:---```
* rechts ```---:```
* centreer ```:---:```

Resultaat:

 rechts     | center            | links
-----------:|:-----------------:|:-----
hallo       | ik ben            | een zanger 
een muziek- | behanger          | die dooie melodietjes
levend      | maakt. Coupletjes | en refreintjes


Door:
```md
 rechts     | center            | links
-----------:|:-----------------:|:-----
hallo       | ik ben            | een zanger 
een muziek- | behanger          | die dooie melodietjes
levend      | maakt. Coupletjes | en refreintjes
```

### Links leggen en beheren

In de ```*.md``` bestanden kun je ook makkelijk links naar andere web-pagina's leggen.
Hiervoor zijn een aantal mogelijkheden.

#### Links uit de menu met verschillende talen

Pagina's die in het menu opgenomen zijn (via de [menu.yml] zie hierboven) kunnen via een link-code makkelijk gelinkt worden vanuit de tekst.

Dit gebeurt door het toevoegen van een "linkcode" aan het menuitem.
Dit doe je door in [menu.yml] aan het item een ```linkcode``` toe te voegen:

```yml
    - item:
        nl:
            name: tekst-nl
            link: /nl/link-naar-foo.html
        fr:
            name: texte-fr
            link: /fr/lien-a-foo.html
        linkcode: foo
```
In dit geval kun je naar het menu-item linken in de ```*.md``` files via een inline link die er zo uitziet:

```md
{% include links.md %}

De link via [klikbaar woord][foo.nl] naar de nederlandse link van dit menu-element 
```

#### Links in verschillende talen (maar niet in de menu)

Ook voor pagina's die niet aanwezig zijn in de menu, kunnen we dergelijke link-codes aanwenden door ze toe te voegen aan de [linkcode.yml].  De layout van dat bestand is zo:

```yml
{linkcode}: 
    {iso-taal-code}: { link: {de effectieve link}   }
```

Het invoegen in de tekst van het ```*.md``` bestand volgt dan dezelfde formatering als bij menu-links.  ```[klikbare tekst][{linkcode}.{iso taal code}]```

**Belangrijk**: Deze links werken alleen als: 
* de ```{%include links.md%}``` is opgenomen in de tekst
* de betrokken linkcode ```foo``` is gedefinieerd in de [menu.yml] of [linkcode.yml]

**Nuttig om weten**: Via de [menu.yml] of [linkcode.yml] worden de verschillende taalvarianten van een bepaalde 'link' aan dezelfde 'linkcode' gekoppeld.  Op basis daarvan zal de taal-keuze in de menu-balk bij het bekijken van één van deze pagina's rechtstreekse links bevatten naar de gekoppelde taalvarianten.

#### Losse links (zonder verder beheer)

Tenslotte kun je ook losse links invoegen zonder dat je ze vooraf toevoegt aan de [menu.yml] of [linkcode.yml].

Daarvoor gebruik je dit formaat in de ```*.md``` bestanden:

```md
De link via [klikbaar woord](http://anderewebsite.be) naar de andere site. 
```


### Pagina-Instellingen in de prelude

De ```*.md``` bestanden laten toe om specifieke pagina-instellingen te maken.  Deze instellingen worden gemaakt in de zogenaamde 'prelude' : een sectie bovenaan de file die wordt afgelijnd door een lijntje met ```---``` (drie mintekens) boven en onder de prelude.  De gegevens in prelude zelf volgen de [yaml](http://en.wikipedia.org/wiki/YAML) notatie

```md
---
code: value
lijstcode:
    - eerste
    - tweede
---

De rest van de tekst komt dan onder de prelude, een lege lijn ertussen wordt aangeraden.
```

In deze prelude kunnen volgende instellingen gemaakt worden die door deze site worden opgepikt:

  {code}   |   type |    voorbeeld          | gebruik
-----------|--------|-----------------------|--------------------
layout     | tekst  | layout:&nbsp;landing  | Wijst naar een beschikbare layout voor deze pagina. (Zie hieronder voor de opties.)
title      | tekst  | title:&nbsp;Mijn&nbsp;Titel| De vrij gekozen titel van de pagina.
images     | lijst  | images:<br>&nbsp;&nbsp;-&nbsp;/img/een.jpg<br>&nbsp;&nbsp;-&nbsp;/img/twee.jpg | De oplijsting van beelden die aan dit artikel worden ge-associeerd.
insert     | lijst  | insert:<br>&nbsp;&nbsp;- virtualtour | Gekozen specifieke scherm-elementen zijn vanzelf uitgeschakeld, maar worden hiermee expliciet aangezet. (Zie hieronder voor de opties.)
remove     | lijst  | remove:<br>&nbsp;&nbsp;- socialshare | Gekozen specifieke scherm-elementen zijn vanzelf beschikbaar, maar kunnen hiermee worden afgezet.  (Zie hieronder voor de opties.)

#### Prelude :: layout
De beschikbare layouts in de prelude zijn:

layout  | gebruikt voor
--------|--------------
default | Standaard pagina. Bevat alle gemeenschappelijke elementen
post    | Nieuws-artikel. 
group   | Groep van filterbare elementen. (zie activiteiten)
landing | Pagina waarop mensen de site binnenkomen. Home page, maar ook specifieke campagne-pagina's vallen hieronder


#### Prelude :: insert

De beschikbare elmenten die kunnen aangezet worden met 'insert' in de prelude zijn:

insert      | beperkt tot layout  | acitveert
------------|---------------------|--------------
virtualtour | alle layouts        | de google-virtual-tour
newsfeed    | landing             | de lijst met recente nieuws-artikels

#### Prelude :: remove

De beschikbare elmenten die kunnen afgezet worden met 'remove' in de prelude zijn:

remove      | beperkt tot layout  | verwijdert 
------------|---------------------|----------------
socialshare | alle layouts        | de knoppen voor 'delen' op de sociale media

## Nieuws Articles
### Locatie en bestandsnaam

De 'nieuws' artikels dienen allemaal ondergebracht worden in de ```_posts/``` folder, meer bepaald in een subfolder per taal: [_posts/nl], [_posts/fr], [_posts/en], [_posts/de]

De naam van deze bestanden volgt een zeer specifiek naamgevingspatroon dat de titel en de datum bevat:
```
    {YYYY}-{MM}-{DD}-{woorden-van-de-titel}.md
```
voorbeelden:
```
    2015-02-09-een-behoorlijke-test.md
    2015-02-10-zomaar-een-naam.md
```


### Specifieke Pre-lude elementen 

Ook in deze ```*.md``` files is er weer plaats voor een prelude. Voor nieuws-artikels zijn er een aantal specifiek van belang:

  {code}   |   type |    voorbeeld          | gebruik
-----------|--------|-----------------------|--------------------
description| tekst  | V&D maakt animatie-programma voor dit jaar bekend!  | Wervende krachtige korte introductie. Deze wordt gebruikt in de overzichten op de landingspagina's
permalink  | tekst  | /nl/2015-04-12-animatie-2015.html | De link die zal worden gebruikt voor dit artikel. **Zeer belangrijk** Dit is ook de link die voor vertalingen in het bestand [linkcode.yml] wordt toegevoegd.

**Tips:** 
* vergeet niet in de prelude de ```layout```  in te stellen op 'post'
* vergeet niet in de prelude ook een duidelijke ```title```  op te geven
* vergeet niet in de prelude een aantal ```images``` in te stellen: ook deze kunnen dan in het overzicht worden gebruikt naast de ```description```

### Taalvarianten en links

Bij vertaalde nieuws-artikels wordt ook aangeraden om de koppeling tussen de permalinks in te geven in het [linkcode.yml] bestand.

Stel je hebt een "post" in volgende talen toegevoegd, met de permalinks zoals in de preludes.
(De echte preludes zullen meer instellingen bevatten.)

```
/_posts/nl/2015-06-06-artikel.html
    ---
    permalink: /nl/2015-06-06-foo.html
    ---
    
    Tekst in nl
    
    
/_posts/fr/2015-06-06-article.html
    ---
    permalink: /nl/2015-06-06-bar.html
    ---
    
    Texte en fr
```

Dan ziet de juiste toevoeging in [linkcode.yml] er zo uit:
(De gekozen link-code is ```foobar```)

```
foobar:
    nl: {link: /nl/2015-06-06-foo.html}
    fr: {link: /nl/2015-06-06-bar.html}
```

Hierdoor zal er in de menu een directe link bestaan tussen de ```nl | fr``` varianten.

Hierdoor kun je ook in andere pagina's een verwijzing naar deze varainten maken door (bv voor fr variant) deze notatie te gebruiken:
```
[linktekst][foobar.fr]
```

## "insets"

Oplossing voor landing-pads en addons --> selecteerbare delen die je toevoegt.
- aanduiden in de prelude van de pagina's die deze insets moeten bevatten

## "group" en "item" pagina's

Hoe werkt het
- specifieke prelude elementen ?

### Voorbeeld 'activity'


