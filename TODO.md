TODO
====
- mailchimp styling 
    - tuning en testing
    - vertaling
    
    - fixes (input van Els en Joke nodig)
      1/ text preheader + spelling on-line
      2/ text buttons in utility / footer
      3/ kleuren voro utility/footer (kleuren achtergrond strip & buttons)
      4/ sig.png --> handtekening met transp back ipv patroon 
    

- voorzieningen overzicht
    - lege blokken invoegen --> ruimte zie mail voor truuk/algoritme

- responsive style voor de submenu ==> sneller onder elkaar zetten --> dan opletten voor tussenlijntjes horizontaal ipv verticaal!

- default style ==> responsiveness
  1. menu smaller font or faster collapse variant
  2. padding when banner is gone --> sowieso marge wat ruimer nemen!
  
- allow different banner-images for different pages --> default in style
  via prelude banner: {text:  , image: }

- imgstrip size calculator ==> nu 200%, zou moeten gereduceerd worden door script zodat de scrollbar niet eindeloos blijft lopen (dus start 1000%, check height as parent, grab width --> set width)
  * op de tijdlijn --> scroll beter afgemeten
  * op de detail-pages --> geen overblijvende balk

- nakijken sync picasa ==> wat als beeld wordt verwijderd?

- tijdslijn
  - resize timing + masonery --> fail met images!! timing? img loaded?
  - indien beschikbaar link naar /pics album
  - eventueel custom scroll-bar styling voor imgstrip

- news overview page styling // archive
  - tussenlijn per jaar
  - simple list per jaar
  - zijkant van deze bevat 'select sectie' --> die voorlopig herbruikbaar maken op de search page als faq?
  
- news detail --> page layout 2/3 -1/3 zijblok bevat latest items zoals op landing
  + knop naar news-archive

- styling level3-tiles tussenpagina --> variabel aantal kolommen afhankelijk van aantal items 
   - 3 -> 3, 4 -> 4, 5+6 -> 3, 7+8 -> 4, 9 -> 3, 10+ --> 4 voor md en lg style, sm en xs altijd 2



- faq sectie op de search

- shake up design voor "waar staan we voor"

- joke: plan varianten met highlights

- uitleg: hoe beelden inlassen?


- fotoalbum(s)
  - include one album
  - allow browsing all albums --> /pics <-- gefiltered op naam-patroon "YYYYMMDD (.*)" --> datum los van naam/title
  - preview en autoplay?
  
  - tussenlijn per jaar --> doen grid behouden
  
  - detail van 1 pic --> makkelijk sharen via social media --> hyperlink met direct-access is nog nodig!
  
  - joke: maakt link-back icon om van 1 album terug te keren naar browse van alle albums
  
  - nog nadenken over linken naar de /pics --> mijn Veld & Duin
  
  
  
- infomuur ?!
  - weerbericht
  - prentjes van recente albums
  - info-slides


- print.css elementen! (doet bootstrap al iets?)
  
- GOING LIVE 
  - robots.txt
        User-agent: *
        Disallow:
  - enable ga in _includes/ga.html
  - search versus oude site --> index-request at google!
  - CNAME file
  - dns settings