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

Opstarten Brackets + terminalvenster (voor detecteren fouten):
* ALT F2 of typ 'terminalvenster' in zoekscherm
* terminalvenster opent zich
* typ: 'startsite'

# Beheer site via Github - Brackets

De nieuwe site www.veldenduin.be wordt beheerd in Github - Brackets.

## Achtergrond en begrippen

### Git / Github

Git is een lokaal versiebeheersysteem. Het wordt gebruikt om alle code (techniek / stijl / teksten) van de site te beheren. Om die versies publiek te maken, wordt github gebruikt. 
Git en github worden aangestuurd vanuit brackets.

### Brackets

- wordt gebruikt voor het tekstbeheer en de opmaak maw hier worden de teksten van de site ingevoerd.
- in brackets wordt gebruik gemaakt van:
    - md: om teksten te schrijven met een minimale formatering (= vereenvoudigde html). Via de markdown (= icoontje rechts met M + pijl naar beneden) krijg je een ingebouwde preview van de tekst zodat je meteen kunt checken hoe ingegeven tekst er ongeveer zal uitzien.
    
    - yml: om data (waarden, lijsten, geneste structuren zoals adressen) vereenvoudigd in een structuur te steken (= vereenvoudigde xml). Alle yml-files zijn terug te vinden onder de folder _data.

In brackets worden door de receptie enkel aan volgende bestanden en folders aanpassingen aangebracht:
    - _data --> linkcode.yml: om links te definiëren
    - _data --> menu.yml: beheer talen en (sub)menu's
    - nl, fr, de, en: beheer van teksten in bepaalde taal
    - img: foto's
    - posts
    

#### iconen (extenties) in brackets

rechts bovenaan (van boven naar onder):
- platte bliksemschicht (live voorbeeld): niet gebruiken. 
- legosteentje (extensiebeheer): als er updates zijn die nog niet geïnstalleerd werden, wordt dit legosteentje groen. Updaten kan dan door te klikken op de betreffende knop + sluiten.
- kadosymbool met pijltje naar beneden (nieuwe versie): staat er enkel als er een nieuwe versie is - te installeren door Marc
- blokje met 'M' en pijltje naar beneden (markdown): ingebouwde preview van tekst zodat je meteen kunt checken hoe ingegeven tekst eruit zal zien. Blokje is enkel zichtbaar als je met md-file aan het werken bent. Kleur (blauw of grijs) geeft aan of de preview al dan niet actief is.
- proefbuisje (run jekyll serve): voorlopig niet gebruiken.
- wegsplitsing: geeft zicht en controle op het versiebeheer via git en github. Alle verdere info hierover onder commit / push / pull.


## Aanmaken nieuwe webpagina

Bij aanmaak van een nieuwe webpagina moeten steeds een aantal stappen gerespecteerd worden. 

**Belangrijk**:
gebruik geen spaties, in plaats daarvan:
- in bestandsnamen: gebruik minteken '-'
- in linkcodes: gebruik underscore '_' 

### Stap 1: nieuwe webpagina maken

- Maak nieuwe *md-file aan (info over lay-out volgt verder).
- Van zodra je een nieuwe *md-file bewaart, wordt er - achter de schermen - automatisch meteen ook een html webpagina aangemaakt.

Voorbeeld:

```nl/overnachten/verhuur/appartement.md``` wordt dan ```http://.../nl/overnachten/verhuur/appartement.html```

! *md-files worden in brackets alfabetisch getoond. De volgorde die je op je site wil, wordt vastgelegd in de _data menu.yml.

### Stap 2: aanmaken linkcodes

Linkcodes worden aangemaakt in _data --> linkcode.yml. 
Hierin vind je het overzicht van alle mogelijke linkbare webpagina's waarnaar je kunt linken.

Voor elke webpagina die je maakt, moet een unieke link-code aangemaakt worden. 
- Eerst komt een **taal-onafhankelijke ** linkcode maw 1 code voor de verschillende taalvarianten. Kies hiervoor een zinvolle en herkenbare naam.
- Daaronder volgen dan de links naar de verschillende talen.

Voorbeeld:

```yml
verhuur_appartement: (= taalonafhankelijke code)
    nl: /nl/overnachten/verhuur/appartement.html (= nederlandse link)
    fr: /fr/séjourner/location/appartement.html (= franse link)
```
  
**Belangrijk**:
- In de linkcodes enkel kleine letters gebruiken.
- De volgorde van de linkcodes is vrij maar best groeperen per submenu. 

### Stap 3: navigatie bepalen

Met navigatie bedoelen we die set van links die op verschillende pagina's (en verschillende niveaus) terugkomen.
De verschillende niveaus van het menu (hoofdmenu - submenu - subsubmenu...) worden beheerd via _data --> menu.yml.

Hier vind je de boomstructuur en namen zoals ze ook op de site terug te vinden zijn.

De structuur van dat bestand is als volgt:
```yml
- linkcode: {link-code}
  menutekst:
    {taal-code}: {label}
    {taal-code} ... // zelfde voor volgende taal
  submenu:
    - linkcode: {link-code} 
      menutekst:
        {taal code}:{label}
```   
Je kunt zoveel menu/submenu lijnen invoeren als je wilt.

De vermelde ```{link-code}``` code is een verwijzing naar de oplijsting van alle beschikbare "links"  binnen de website zoals je ze vindt onder linkcode.yml.

Het niveau van 'inspringen' in deze bestanden is cruciaal voor het gewenste effect. Inspringen kan met tab of spatie.

##### Tips & tricks

- CTRL SHFT pijltje omhoog: geselecteerde tekst naar boven verschuiven
- CTRL SHFT pijltje omlaag: geselecteerde tekst naar beneden verschuiven
- CTRL D: dupliceren van huidige lijn of selectie
- CLTL SHFT D: verwijderen
- CTRL Z: undo

## Md-file maken

Om nieuw bestand te maken in een bepaalde taalfolder:
op taal staan - rechtermuisklik - nieuw bestand.

Elke md-file moet starten met prelude (cfr verder voor meer detail over inhoud prelude) die minmaal bestaat uit
2 lijnen met 3 streepjes, gevolgd door 1 blanco lijn
```md
---
---
```
Vanaf hier begint je echte tekst.


Deze pagina's worden best per taal georganiseerd. Deze site bevat reeds specifieke folders voor volgende talen: [nl], [fr], [en], [de].  Speciale types tekst die ook als onderdeel op andere pagina's moeten verschijnen (voornamelijk de nieuws-artikels) krijgen een andere locatie (zie verder) 

Om een taal toe te voegen kun je een nieuwe folder beginnen, en ze uitwerken in het [langs.yml] bestand.

### Opmaak

Opmaak kan door de zogenaamde [Markdown notatie](https://help.github.com/articles/github-flavored-markdown/) te gebruiken. Hieronder een opsomming van de meest nuttige mogelijkheden:

**bold:** 
tekst in **vetjes** krijg je door dubbele sterren ```**``` voor en achter toe te voegen

**italic:**
tekst in *cursief* krijg je door enkele sterren ```*``` voor en achter toe te voegen

**lijstjes:**
door een ```-``` of ```*``` teken met spatie aan het begin van een lijn te gebruiken:
* item 1
* item 2
- topic 3

**speciale tekens**
via de charactermap:
* typ in zoekscherm 'tekenset'
* van hieruit kun je de gewenste tekens knippen en plakken


**gescheiden paragrafen:**
lege lijnen zijn belangrijk om gescheiden paragrafen te maken.
Zonder de lege tussenlijn worden teksten aan dezelfde paragraaf toegevoegd. 


**lijnen:** vier opeenvolgende ```----``` op een verder lege lijn voorafgegaan door een lege lijn zal resulteren in een horizontale lijn

----

**titels:** Door een aantal ```#``` tekens aan het begin van de lijn te hanteren (een lege lijn vooraf is nodig!) bouw je een hoofding van een bepaald niveau (het aantal ```#``` bepaalt het niveau)

# titel 1

## titel 2

### titel 3 (enz.)

**tabellen:** kun je aanmaken door de kolommen met ```|``` tekens te scheiden en (belangrijk) ook de eerste rij van de volgende te scheiden met ```---|---``` lijnen.

Belangrijk: De scheidingslijnen moeten minstens 3 mintekens lang zijn

Kolommen kunnen gealligneerd worden dmv het toevoegen van ```:``` tekens in de scheidingslijnen:
* links ```:---```
* rechts ```---:```
* centreer ```:---:```

Resultaat:

 rechts     | center            | links
-----------:|:-----------------:|:-----
hallo       | ik ben            | een zanger 
een muziek- | behanger          | die dooie melodietjes<br>
levend      | maakt. Coupletjes | en refreintjes


Door:
```md
 rechts     | center            | links
-----------:|:-----------------:|:-----
hallo       | ik ben            | een zanger 
een muziek- | behanger          | die dooie melodietjes
levend      | maakt. Coupletjes | en refreintjes
```
! Combinatie van soorten centrering niet mogelijk vb titel links gecentreerd en info in de kolommen rechts gecentreerd.


**harde splitsing binnenin een tabel:**

Indien je tekst wil samenhouden binnen een bepaalde kolom, moet je gebruik maken van ```<br>``` na het woord waar een harde splitsing moet komen.

Resultaat:

LAAGSEIZOEN           |TUSSENSEIZOEN      |    HOOGSEIZOEN|
:--------------------:|:-----------------:|:-------------:|
november - maart<br>uitgezonderd schoolvakanties <br>en verlengde weekends | april - juni, <br>september, oktober, <br>paas, herfst, krokus, <br>kerstvakantie | juli - augustus


Door:
```md
Resultaat:
LAAGSEIZOEN           |TUSSENSEIZOEN      |    HOOGSEIZOEN|
:--------------------:|:-----------------:|:-------------:|
november - maart<br>uitgezonderd schoolvakanties <br>en verlengde weekends | april - juni, <br>september, oktober, <br>paas, herfst, krokus, <br>kerstvakantie | juli - augustus
```

### Links leggen en beheren - nog te bekijken

In de ```*.md``` bestanden kun je ook makkelijk links naar andere web-pagina's leggen.

Voor alle pagina's waarnaar je wilt linken (vanuit menu of vanuit tekst) is het best vooraf een zogenaamde ```{link-code}``` te voorzien.  Dit doe je door ze toe te voegen aan de [linkcode.yml].  De layout van dat bestand is zo:

```yml
{linkcode}: 
    {iso-taal-code}: {de effectieve link}
```

**voorbeeld:**

```yml
sauna: 
    nl: /nl/voorzieningen/sauna.html
    
kusttram:
    nl: http://www.delijn.be/nl/kusttram
```


Het invoegen in de tekst van het ```*.md``` bestand volgt dan deze formatering.
```[klikbare tekst][{linkcode}.{iso taal code}]```

Een voorbeeld:
```md
{% include links.md %}

De link via [klikbaar woord][sauna.nl] naar de nederlandse link van dit menu-element en [linktekst naar de kusttram][kusttram.nl]
```

**Belangrijk**: Deze links werken alleen als: 
* de ```{%include links.md%}``` is opgenomen in de tekst
* de betrokken linkcode ```foo``` is gedefinieerd in het bestand [linkcode.yml]

**Nuttig om weten**: Via de [linkcode.yml] worden de verschillende taalvarianten van een bepaalde 'link' aan dezelfde ```{link-code}``` gekoppeld.  Op basis van deze koppeling zal de taal-keuze in de menu-balk bij het bekijken van één van deze pagina's rechtstreekse links bevatten naar de gekoppelde taalvarianten.  De taal-menu op de pagina werkt dan dus bijna als een "vertaal deze pagina in &laquo;aangeklikte taalcode&raquo;"
Voor pagina's waar de linkcode en taal-koppeling niet is gemaakt kan dat niet - daar werkt het taalmenu als "breng mee naar de hoofdpagina van &laquo;aangeklikte taalcode&raquo;"

#### Losse links (zonder verder beheer)

Tenslotte kun je ook losse links invoegen zonder dat je ze vooraf toevoegt aan de [menu.yml] of [linkcode.yml].

Daarvoor gebruik je dit formaat in de ```*.md``` bestanden:

```md
De link via [klikbaar woord](http://anderewebsite.be) naar de andere site. 
```

## Banner - callout - imagestrip

### Banner

- standaard staat de banner uit (uitgezonderd bij de landingspagina, daar staat banner automatisch aan)
- banner toevoegen kan in de prelude:

```yml
insert:
  - banner
```

- het beeld in de banner wijst voor elke pagina naar ```/img/style/banner.jpg```, maar kan voor specifieke pagina anders ingesteld worden door de prelude:

```yml
bannerimg: /img/other/image.png
```

Let er wel op dat dit beeld breed genoeg is, en ook centraal-onderaan het meest belangrijke element bevat aangezien het automatisch op dat punt zal inzoomen op smallere schermen.


### Callout

- standaard bevat de banner een callout (= witte balk met reservatie aanvraag knop). 
- de callout kun je verbergen:

```yml
remove:
  - callout
```

- de tekst in de callout wordt standaard ingevuld (per taal) met de tekst die je vindt in _data / langs.yml (te vinden onder taal / dict / callout)
- als je de callout tekst op een bepaalde pagina wil laten afwijken, kan dat in de prelude via

```yml
callout: "dit is de andere tekst"  
```


### Imagestrip

Staat standaard aan. Indien je wil dat die op een bepaalde pagina uit staat, pas je dit aan in de prelude:

```yml
remove:
  - imgstrip
```

De beelden voor de imgstrip worden opgehaald uit een google plus album. De naam van het album wordt bepaald in _config.yml:

```yml
strip-album: "www-footer-imgstrip"
```
Als je de imgstrip op een bepaalde pagina wilt laten afwijken, moet je allereerst een nieuwe google plus pagina aanmaken. In de prelude moet je dan verwijzen naar dat dat andere google plus album vb:

```yml
strip-album: "www-footerresidentieel-imgstrip"
```



## Prelude

De ```*.md``` bestanden laten toe om specifieke pagina-instellingen te bepalen.  Deze instellingen worden vastgelegd in de zogenaamde 'prelude'. Dit is het gedeelte bovenaan de file dat wordt afgelijnd door een lijntje met ```---``` (drie mintekens) boven en onder de prelude.

In de prelude staat ook de metadata die gebruikt wordt om andere pagina's te voeden. Voorbeeld: in de prelude van 'overnachten / verhuur / appartementen' staan de kenmerken die op de hoofdpagina 'overnachten / verhuur' komen.

Voorbeeld structuur prelude:

```md
---
code: value (vb layout: page)
code2: (vb images:)
    - eerste (bv /img/foto10.jpg)
    - tweede (...)
code3: (vb preview)
    sub-a: waarde (vb: description: een beschrijvende tekst)
    sub-b: waarde
---
```

Na een lege lijn, begint dan de eigenlijke tekst...

In deze prelude kunnen volgende instellingen gemaakt worden die door deze site worden opgepikt:

  {code}   |   type |    voorbeeld          | gebruik
-----------|--------|-----------------------|--------------------
layout     | tekst  | layout:&nbsp;landing  | **verplicht** Wijst naar een beschikbare layout voor deze pagina (mogelijke opties: cfr verder).
title      | tekst  | title:&nbsp;Mijn&nbsp;Titel| **verplicht** De vrij gekozen titel van de pagina.
images     | lijst  | images:<br>&nbsp;&nbsp;-&nbsp;/img/een.jpg<br>&nbsp;&nbsp;-&nbsp;/img/twee.jpg | De oplijsting van beelden die aan dit artikel worden ge-associeerd (cfr verdere info over imgs)
insert     | lijst  | insert:<br>&nbsp;&nbsp;- virtualtour | Gekozen specifieke scherm-elementen zijn vanzelf uitgeschakeld, maar worden hiermee expliciet aangezet. (Zie hieronder voor de opties.)
remove     | lijst  | remove:<br>&nbsp;&nbsp;- callout | Gekozen specifieke scherm-elementen zijn vanzelf beschikbaar, maar kunnen hiermee worden afgezet.  (Zie hieronder voor de opties.)
icon       | tekst  | info-sign             | associeert een glyphicon met de pagina voor gebruik in links. Zie [lijst](http://getbootstrap.com/components/#glyphicons-glyphs) met ondersteunde iconen.

### Prelude: layout

De beschikbare layouts in de prelude zijn:

layout  | gebruikt voor
--------|--------------
default | Standaard pagina lay-out, dit voegt de algemene vormgeving toe aan de pagina.
page    | Een meer specifieke layout voor de opmaak van tekstuele pagina's --> ondersteund ook een niveau 3 menu aan de rechterkant
post    | Specifiekere vormgeving voor Nieuws-artikel. 
group   | Specifiekere vormgeving voor Groepering van meerdere data-elementen (bv. doen-pagina en tijdslijn).
landing | Specifiekere vormgeving voor Pagina waarop mensen de site binnenkomen. Home page, maar ook specifieke campagne-pagina's vallen hieronder. --> bevat oa nieuws-overzicht en zogenaamde "landing-pads" == links met previews naar andere geselecteerde pagina's


### Prelude: title

De titel van de pagina


### Prelude: insert

De mogelijke inserts die in de prelude kunnen aangegeven worden:

insert      | mogelijk in layout  | acitveert
------------|---------------------|--------------
virtualtour | alle layouts        | google-virtual-tour
banner      | alle layouts        | de banner onder hoofdmenu
play-album  | alle layouts        | foto-album
level3-tiles| alle layouts        | klikbare tegels van level3 menu = blokken in je derde niveau van navigatie vb de blokken bij verhuuritems / residentieel / arrangementen
newsfeed    | landing             | lijst met recente nieuws-artikels
page-images-top | alle layouts        | band bovenaan de pagina met de lijst van beelden die gedeclareerd staan in de images: sectie van de prelude
page-images-bottom | alle layouts        | dezelfde soort band met beelden, maar dan onder de tekst

### Prelude: remove

De beschikbare elmenten die kunnen afgezet worden met 'remove' in de prelude zijn:

remove      | mogelijk in layout  | dit verwijdert 
------------|---------------------|----------------
callout     | alle layouts        | de link voor de reservatie-aanvraag in de banner
imgstrip    | alle layouts        | de strip met foto's onderaan


### Prelude: preview

In de sectie preview van de prelude geef je aan hoe een pagina in preview als link-pad zal vorm gegeven worden.

Deze elementen (en niet de tekst van de pagina zelf) worden op die andere pagina's geplaatst als preview van waarnaar gekinkt wordt.

De sectie bevat volgende elementen:

```yml
preview:
    button:
        price: 123
        for:   "waarover de prijs gaat"
    list:
        - "topic 1"
        - "topic 2"
    
    title: "title in de preview"
    text:  "korte paragraaf tekst"
    
images:
    - /img/paht/file.jpg
```



### Andere 

## Banner - callout - imagestrip

### Banner

- standaard staat de banner uit (uitgezonderd bij de landingspagina, daar staat banner automatisch aan)
- banner toevoegen kan in de prelude:

```yml
insert:
  - banner
```
### Callout

- standaard bevat de banner een callout (= witte balk met reservatie aanvraag knop). 
- de callout kun je verbergen:

```yml
remove:
  - callout
```

- de tekst in de callout wordt standaard ingevuld (per taal) met de tekst die je vindt in _data / langs.yml (te vinden onder taal / dict / callout)
- als je de callout tekst op een bepaalde pagina wil laten afwijken, kan dat in de prelude via

```yml
callout: "dit is de andere tekst"  
```


### Imagestrip

Staat standaard aan. Indien je wil dat die op een bepaalde pagina uit staat, pas je dit aan in de prelude:

```yml
remove:
  - imgstrip
```

De beelden voor de imgstrip worden opgehaald uit een google plus album. De naam van het album wordt bepaald in _config.yml:

```yml
strip-album: "www-footer-imgstrip"
```
Als je de imgstrip op een bepaalde pagina wilt laten afwijken, moet je allereerst een nieuwe google plus pagina aanmaken. In de prelude moet je dan verwijzen naar dat dat andere google plus album vb:

```yml
strip-album: "www-footerresidentieel-imgstrip"
```

Nieuwsartikels, landingspagina's en grouppagina's omvatten specifieke prelude-elementen. Deze worden verder beschreven in de betreffende secties.

## Nieuwsartikels

De 'nieuws' artikels worden allemaal ondergebracht in de ```_posts/``` folder, meer bepaald in een subfolder per taal: [_posts/nl], [_posts/fr], [_posts/en], [_posts/de].

Er is ook een overzichtspagina per taal (die dus het archief omvat van alle berichten). Deze vind je onder nl/nieuws.md (en dan ook een versie voor het frans/duits/engels).

De naam van de posts volgt een zeer specifiek naamgevingspatroon dat de titel en de datum bevat:
```
    {YYYY}-{MM}-{DD}-{woorden-van-de-titel}.md
```
voorbeelden:
```
    2015-02-09-een-behoorlijke-test.md
    2015-02-10-zomaar-een-naam.md
```

### Specifieke Prelude elementen bij de nieuwsartikels 

Ook in deze ```*.md``` files is er weer plaats voor een prelude. Voor nieuws-artikels zijn er een aantal specifiek van belang:

  {code}   |   type |    voorbeeld          | gebruik
-----------|--------|-----------------------|--------------------
description| tekst  | V&D maakt animatie-programma voor dit jaar bekend!  | Wervende krachtige korte introductie. Deze wordt gebruikt in de overzichten op de landingspagina's
permalink  | tekst  | /nl/2015-04-12-animatie-2015.html | Onder welke naam (adres) je wil dat dit nieuwsartikel wordt gepubliceerd op de website. Maw: de link die zal worden gebruikt voor dit artikel. **Zeer belangrijk** Dit is ook de link die voor vertalingen in het bestand [linkcode.yml] wordt toegevoegd.

**Tips:** 
* vergeet niet in de prelude de ```layout```  in te stellen op 'post'
* vergeet niet in de prelude ook een duidelijke ```title```  op te geven
* vergeet niet in de prelude een aantal ```images``` in te stellen: ook deze kunnen dan in het overzicht worden gebruikt naast de ```description```

### Taalvarianten en links

Bij vertaalde nieuws-artikels wordt ook aangeraden om de koppeling tussen de permalinks in te geven in het [linkcode.yml] bestand.

Stel: je hebt een "post" in volgende talen toegevoegd, met de permalinks zoals in de preludes.
(De echte preludes zullen meer instellingen bevatten)

```
/_posts/nl/2015-12-26-glühwein.md
    ---
    permalink: /nl/2015-12-26-glühwein.html
    ---
    
    Tekst in nl
    
    
/_posts/fr/2015-12-26-soirée-vin-chaud.md
    ---
    permalink: /fr/2015-12-26-soirée-vin-chaud.html
    ---
    
    Texte en fr
```

Dan ziet de juiste toevoeging in [linkcode.yml] er zo uit:
(De gekozen link-code is ```2015_glühwein```)

```
2015_glühwein:
    nl: {link: /nl/2015-12-26-glühwein.html}
    fr: {link: /fr/2015-12-26-soirée-vin-chaud.html}
```

Hierdoor zal het taal-menu werken als een "vertaal-deze-pagina" optie en directe links bevatten tussen de ```nl | fr``` varianten.

Hierdoor kun je ook in andere pagina's een verwijzing naar deze varianten maken door (bv voor fr variant) deze notatie te gebruiken:
```
[linktekst][2015_glühwein.fr]
```

## Landingspagina's

Dit is standaaard de pagina waarom bezoekers terechtkomen. In de meeste gevallen is dit de homepage. In de toekomst voorzien we ook specifieke landingspagina's rond bepaalde campagnes vb jubileum, bepaalde arrangementen,...

### Specifieke prelude voor landingspagina's - verder uit te werken

todo: 
- select
- preview
  - title
  - text
  - button
   - price
  - list
- imgs


## Group pagina's - nog verder uit te werken 

De "group" layout pagina's worden aangestuurd door de gegevens in de bijhorende ```data/{name}.yml``` file.
Een voorbeeld hiervan is de doen-pagina en de tijdslijn.

Een dergelijke "group" verzamelpagina maak je vooral door de gegevens in de prelude.

```
/nl/in-de-buurt.html
    ---
    title: Doen en Beleven nabij Veld & Duin
    layout: group
    data: doen
    ---
```

Deze geven aan dat de layout 'group' word geactiveerd, en zegt ook welke 'group' gegevens worden verzameld. 

In dit geval wijst die naar de groeps-naam ```doen```. Dit verondersteld dat er gegevens beschikbaar zijn in de bijhorende file ```data/doen.yml```

Dat bestand heeft de volgende vorm:
```
data/{name}.yml

    class:
        list:
        item:
    subgroups:
        {lang}:
            {name}: {vertaling voor deze subgroup-naam}
    img-in-background: true
    sort: 
        key: ranking
    items:
        -
            link:   {link horende bij dit item}
            rating: {getal 1 <-> 10 dat het belang aangeeft 
                     --> sortering is hierop gebaseerd}
            location: {lat}, {lon}
            images:      
                - {pad naar bijhorende beelden 
                   bv. /img/activity/bellewaerde-roetsjbaan.jpg}
            subgroups:  
                - {name #1 van de subgroup waar dit item toe behoort}
                - {name #2 van de subgroup waar dit item toe behoort}
                - ...
            title:
                {lang}: {naam van het titem}
            caption: 
                {lang}: {kernwoord}
        -
            {volgende item ...}
            
```
## Commit / Push / Pull

Als je aanpassingen gedaan hebt, moet dit ook doorgevoerd worden zodat het 'definitief' wordt. Dit gebeurt in 3 stappen:

### Commit

= aangeven dat iets afgewerkt is, bevestigen dat je klaar bent met een bepaalde wijziging.

Hoe?

Via het speciale tekentje in de rechterkolom (wegsplitsing - onderaan) wordt er een scherm onderaan geopend. Hier kun je de commitknop gebruiken.
Er wordt aangegeven welke wijzigingen er zijn. Door op het +/- teken te klikken zie je meer detail van de wijzigingen. Rood is wat gewijzigd/verwijderd werd, groen is het nieuwe resultaat.

Als je het item dat gewijzigd werd aanvinkt, kun je ofwel committen ofwel 'discard changes' (wijzigingen verwerpen). Nadat je gecommit hebt, opmerkingen ingeven waarom je bepaalde wijziging aangebracht hebt.

Om te committen is er geen internetverbinding nodig.

### push / pull

= synchroniseren van de gecommitte elementen met de server. 

Pull: binnentrekken van de wijzingen die anderen hebben aangebracht.

Push: buitenduwen van de wijzigingen die je zelf hebt aangebracht.

Hoe?

Via het icoontje met de pijl naar buiten (pull) of naar binnen (push). Bij de pushicoon staat ook aangegeven hoeveel commits nog niet gepusht werden. Dit aantal beperken door vlot wijzigingen te pushen.

\! Bij begin werk begin je met een pull, op het einde van je werk commit + push.

\! Als je met 2 aan het werk bent en één persoon al eerder gepusht heeft, krijg je mededeling dat iemand al gewijzigd heeft.


