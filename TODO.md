TODO
====
- mailchimp styling 
    - tuning en testing    
    - fixes (input van Els en Joke nodig)
      4/ sig.png --> handtekening met transp back ipv patroon 
    - probleem met de dubbele titel boven/onder logo --> qwerken met 2 rijen in tabel?
    
- Fix -1 : tijdslijn
  - resize timing + masonery --> fail met images!! timing? img loaded?
    >> https://github.com/desandro/imagesloaded
    >> http://stackoverflow.com/questions/910727/jquery-event-for-images-loaded
  - indien beschikbaar link naar /pics album
  - eventueel custom scroll-bar styling voor imgstrip
- Fix -2 : fotos (nog zonder pics)
  - strip - hoofdalbum - cacheerror

- vormgeving foto's in nieuwsartikel anders -->  groter en bladerbaar!

- tekst uitsplitsen naar include-secties
  
- vertaal ondersteuning met Els

- later accordeon hernemen
    - vertikale tekst
    - variabel aantal slides
    - overlay meer dekkend groen --> voorstel Joke
    - terug activeren met prelude: 
        insert:
            - level3-accordeon
    

- imgstrip size calculator ==> nu 200%, zou moeten gereduceerd worden door script zodat de scrollbar niet eindeloos blijft lopen (dus start 1000%, check height as parent, grab width --> set width)
  * op de tijdlijn --> scroll beter afgemeten
  * op de detail-pages --> geen overblijvende balk


- responsive style voor de submenu ==> sneller onder elkaar zetten --> dan opletten voor tussenlijntjes horizontaal ipv verticaal!

- default style ==> responsiveness
  1. menu smaller font or faster collapse variant
  2. padding when banner is gone --> sowieso marge wat ruimer nemen!
  
- nakijken sync picasa ==> wat als beeld wordt verwijderd?  

- faq sectie op de search


- joke: plan varianten met highlights

- uitleg: hoe beelden inlassen?


- fotoalbum(s)
  - include one album
  - allow browsing all albums --> /pics <-- gefiltered op naam-patroon "YYYYMMDD (.*)" --> datum los van naam/title
  - preview en autoplay?
  
  - variant voor invoegen post-album --> typisch nieuws-artikel dat verwijst naar een nieuw aangemaakt fotoalbum
  
  - @/pics variant
  - tussenlijn per jaar --> doen grid behouden
  
  - detail van 1 pic --> makkelijk sharen via social media --> hyperlink met direct-access is nog nodig!
  
  - joke: maakt link-back icon om van 1 album terug te keren naar browse van alle albums
  
  - nog nadenken over linken naar de /pics --> mijn Veld & Duin
  

- nadenken over rechtsuitlijnen van teksten
  zie http://generatedcontent.org/post/44751461516/finer-grained-control-of-hyphenation-with-css4
  
  - lang en xml:lang attribuut
  - css attrs: 
        p {
            text-align: justify;

            -webkit-hyphens: auto;
            -moz-hyphens: auto;
            -ms-hyphens: auto;
            hyphens: auto;
        }
  
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