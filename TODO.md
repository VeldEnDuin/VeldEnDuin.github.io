TODO
====

/pics todo

- timing autoplay loopt fout --> stop player/controller/interval wanneer de tohome wordt gekozem!
- icoontje kalender bij witte overlay mag weg
- af en toe ontbreekt er een stuk hoofd als de foto's te hoog komen en/of staat de 'foto-afspeler' in de weg. Kan foto-afspeler boven de foto's gezet worden? 
- knop foto-archief mettekst (vertaald) zoals op landingspagina (is wellicht toch nog duidelijker dan het kodakicoontje)?
- herinner scroll-positie als je terugkomt --> msch best door playlist-div en player-div niet de hele tijd weg te gooien, maar te behouden en te disable/enablen?
- titels van albums moeten nog vertaalbaar worden via description blok!
- vanuit tijdslijn 1967-1985 klikken naar het betreffende album



- vormgeving foto's in nieuwsartikel anders -->  groter en bladerbaar!

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

- fotoalbum(s)
  - include one album
  - allow browsing all albums --> /pics <-- gefiltered op naam-patroon "YYYYMMDD (.*)" --> datum los van naam/title
  - preview en autoplay?
  
  - variant voor invoegen post-album --> typisch nieuws-artikel dat verwijst naar een nieuw aangemaakt fotoalbum
  
  - @/pics variant
  - tussenlijn per jaar --> doen grid behouden
  
  - detail van 1 pic --> makkelijk sharen via social media --> hyperlink met direct-access is nog nodig!  + meteen maken dat ook #! link voor album mogelijk is #!albumid,picsid #!albumid #!,picsid
  
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




LIJSTJE ELS

•inlassen plan: hoe? Kunnen wij dat zelf of te programmeren?
    • plan Brecht (pdf – mogelijk?) bij doorklik nieuw project
    • plan Joke bij verschillende verhuurtypes overnachtenpagina
    • bij praktisch

• onze troeven herwerken volgens voorstel Joke (accordeon met filter over voor meer samenhang)

• links site:
    ◦ vanuit 'doen' opent er een nieuw tabblad
    ◦ externe links openen in zelfde tabblad – minder goed, kan daar iets aan gedaan worden  --> vb deelnameformulier wedstrijd, NMBS

• facebook melding rechts die meeloopt

• kolommen uitlijnen thv stippen (niet zo ver laten inspringen)

• kolommen: bij inventaris hoofdding weg

• uitlijnen (prioriteit laag)

• herhaling foto's van imagestrips

• foto's oude doos: zijn opgeladen. Hoe zichtbaar: bezoekers gaan via 'klik hier' naar een onderdeel van de google pics?

• icoon google-plus: zinvol? Huidige googlepluspagina niet echt een meerwaarde / niet actueel.

• Landingspagina 'schrijf in op onze nieuwsbrief': moet daar nog iets voor gebeuren of werkt dit zodra de site live staat?

• Voorzieningen: achtergrondbeeld er meer laten doorkomen – nu teveel witgrijze vlakte

• Voorzieningen: icoontjes mogelijk / beter in lichtste kleur groen?

• Smartphone: foto's voorzieningen bovenaan gezet – idd visueler maar veel (sub)menu's vooraleer je tekst ziet.  Andere oplossingen / mogelijkheden?

• Pics: hoe integreren in site:
    ◦ link vanop animatie (meeste foto's gaan daarover)
    ◦ aparte tab?
    ◦ Andere oplossing dan link?

• Posts: mogelijk om foto's hiervan bovenaan te zetten?

• Imagestrips:
    • posts: subtiele slider voorzien
    • tijdslijn: slider laten stoppen aan laaste foto (idem posts – geen wit meer na laaste foto)
    • imgstrip rest pagina's inkorten tot laatste foto (geen witte band meer zichtbaar)

• Mobiele telefoon
    • als er kolommen zijn, worden die volledig getoond maar blijft de tekst smaller aangeduid (vb overnachten – appartementen)
    • tijdslijn: sliden is mogelijk maar er is geen aanduiding dat die mogelijkheid ook bestaat
    • 'onze troeven': er wordt maar een selectie van de troeven weergegeven wat niet ok is voor de wedstrijd (Mont Blanc wordt niet steeds getoond)
    • 'onze troeven': bij refresh pagina (wissel van afbeelding troeven) ga je automatisch terug naar boven met vermelding van de submenu's
    • menu en submenu komen telkens bovenaan te staan – zinvol maar het betekent ook veel scrollen voor je iets van de site te zien krijgt – mogelijk via dropbox of melding onderaan (cfr Centerparcs)


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