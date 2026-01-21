# BookNest

BookNest je web aplikacija za kupovinu i razmjenu polovnih knjiga. Korisnici mogu pregledati katalog, filtrirati knjige, dodavati u korpu, praviti narudžbe, započeti chat sa prodavcem, te ostavljati ocjene i komentare nakon završene kupovine. Sistem uključuje i prijave (reports), notifikacije, te admin dio za moderaciju i upravljanje.

## Dodatne stavke

- **Postavni prodavac** - dodana mogucnost prijave za prodavaca.

## Tehnologije

- **Node.js + Express.js** (backend)
- **PostgreSQL** (baza podataka)
- **Sequelize ORM** (modeli, migracije, upiti)
- **EJS** (server-side render view)
- **Express-session** (sesije / login)
- **bcryptjs** (hashiranje lozinki)

## Funkcionalnosti

### Korisnici / Auth
- Registracija i login
- Role sistem: **Kupac**, **Prodavac**, **Admin**
- Statusi korisnika (aktiviran/blokiran itd.)

### Katalog i knjige
- Katalog sa pretragom i filtrima (žanr, jezik, stanje, cijena, razmjena)
- Detalji knjige sa komentarima i ocjenama
- Popularne knjige (popularnost na osnovu ocjena i završenih narudžbi)

### Korpa i narudžbe
- Dodavanje knjiga u korpu
- Checkout iz korpe (kreiranje narudžbi po prodavcu)
- Otkazivanje narudžbi uz vraćanje knjiga na stanje

### Razmjene
- Kreiranje zahtjeva za razmjenu (tražena knjiga + ponuđene knjige)
- Prihvatanje / odbijanje / završavanje razmjene
- Automatsko ažuriranje statusa knjiga (rezervisano, prodano/razmijenjeno)

### Chat
- Direktni chat kupac ↔ prodavac
- Lista razgovora, detalji razgovora, slanje poruka
- Evidencija pročitanih poruka (unread count)

### Notifikacije i prijave (Reports)
- Notifikacije za: novu poruku, novu narudžbu, novu razmjenu, promjenu statusa, nove komentare/ocjene, report prijem itd.
- Prijava knjige (report) i admin obrada

### Admin
- Dashboard overview (npr. pending seller zahtjevi, otvoreni reportovi, broj usera, broj knjiga)
- Upravljanje korisnicima (role/status, blokiranje)
- Obrada reportova (statusi, arhiviranje/aktiviranje knjiga)
- Odobravanje prodavaca

## Pokretanje projekta (lokalno)

1. Instaliraj dependencije:
   ```bash
   npm install

2. Postavi .env fajl

3. Pokreni aplikaciju
    ```bash
    npm start