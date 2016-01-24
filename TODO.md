TODO
====

- later accordeon hernemen
    - vertikale tekst
    - variabel aantal slides
    - overlay meer dekkend groen --> voorstel Joke
    - terug activeren met prelude: 
        insert:
            - level3-accordeon
            
    ik heb gevonden hoe ik tekst kan laten draaien
    https://css-tricks.com/snippets/css/text-rotation/

    mogelijks kan ik dat makkelijk combineren met een groenig-transparante achtergrond die samen over de foto gaat liggen in 'dichtgeklapte'  toestand
    en die dan ook kantelt naar horizontaal als je over de accordeon komt...


- default style ==> responsiveness
  1. menu smaller font or faster collapse variant
  2. padding when banner is gone --> sowieso marge wat ruimer nemen!
  
- nadenken over rechtsuitlijnen van teksten
  zie http://generatedcontent.org/post/44751461516/finer-grained-control-of-hyphenation-with-css4
  
  - css attrs: (heeft html lang attribuut nodig --> dat staat al)
        p {
            text-align: justify;
            -webkit-hyphens: auto;
            -moz-hyphens: auto;
            -ms-hyphens: auto;
            hyphens: auto;
        }

- facebook tag-button-verticaal aan rechterkant die meeloopt en een fb-iframe opent/toont


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